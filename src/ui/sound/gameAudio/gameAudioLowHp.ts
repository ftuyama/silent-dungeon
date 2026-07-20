import { triggerPluck } from '../primitives.ts';
import { HP_CRITICAL_RATIO, isHpCritical } from '../../gameAppUtils.ts';
import type { GameAudioHost } from './gameAudioHost.ts';

/** Boost da camada (transientes curtos vs. ambiente contínua). */
const LAYER_GAIN = 5;

/**
 * Camada de perigo quando o herói está com PV críticos:
 * batimento cardíaco rítmico (lub-dub) — silêncio entre os pulsos, sem drone contínuo.
 */
export class GameLowHpPlayer {
  private cleanup: (() => void) | null = null;
  private beatTimer: ReturnType<typeof setTimeout> | null = null;
  private hpRatio = 1;
  private master: GainNode | null = null;
  private starting = false;

  private readonly host: GameAudioHost;

  constructor(host: GameAudioHost) {
    this.host = host;
  }

  sync(hp: number, maxHp: number): void {
    if (!isHpCritical(hp, maxHp)) {
      this.stop();
      return;
    }
    this.hpRatio = hp / maxHp;
    if (this.cleanup) return;
    this.startWhenReady();
  }

  stop(): void {
    this.starting = false;
    if (this.beatTimer) {
      clearTimeout(this.beatTimer);
      this.beatTimer = null;
    }
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.master = null;
  }

  private intensity(): number {
    const t = (HP_CRITICAL_RATIO - this.hpRatio) / HP_CRITICAL_RATIO;
    return 0.55 + t * 0.35;
  }

  /** Volume do ciclo — `host.gain` aplicado uma vez só (master fica linear). */
  private beatVolume(): number {
    return this.host.gain(this.intensity() * LAYER_GAIN);
  }

  private beatIntervalMs(): number {
    return Math.round(520 + this.hpRatio * 2000);
  }

  /** Primeira batida (lub) — grave + corpo médio (ouve-se em laptop). */
  private playLub(ctx: AudioContext, dest: AudioNode, t: number, vol: number): void {
    if (vol <= 0) return;
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(92, t);
    thump.frequency.exponentialRampToValueAtTime(48, t + 0.1);
    thumpGain.gain.setValueAtTime(vol * 1.15, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    thump.connect(thumpGain);
    thumpGain.connect(dest);
    thump.start(t);
    thump.stop(t + 0.19);

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(168, t);
    body.frequency.exponentialRampToValueAtTime(95, t + 0.08);
    bodyGain.gain.setValueAtTime(vol * 0.62, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    body.connect(bodyGain);
    bodyGain.connect(dest);
    body.start(t);
    body.stop(t + 0.15);

    triggerPluck(ctx, dest, t + 0.015, 130, vol * 0.58, 'triangle', 0.22);
  }

  /** Segunda batida (dub) — mais curta e abafada. */
  private playDub(ctx: AudioContext, dest: AudioNode, t: number, vol: number): void {
    if (vol <= 0) return;
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(72, t);
    thump.frequency.exponentialRampToValueAtTime(38, t + 0.07);
    thumpGain.gain.setValueAtTime(vol * 0.95, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    thump.connect(thumpGain);
    thumpGain.connect(dest);
    thump.start(t);
    thump.stop(t + 0.14);

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.value = 132;
    bodyGain.gain.setValueAtTime(vol * 0.38, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    body.connect(bodyGain);
    bodyGain.connect(dest);
    body.start(t);
    body.stop(t + 0.11);
  }

  /** Sussurro tenso entre batidas — curto, não contínuo. */
  private playTensionSting(ctx: AudioContext, dest: AudioNode, t: number, vol: number): void {
    if (vol <= 0) return;
    triggerPluck(ctx, dest, t + 0.28, 220, vol * 0.38, 'sine', 0.38);
    triggerPluck(ctx, dest, t + 0.34, 207, vol * 0.26, 'sine', 0.42);
  }

  private playBeatCycle(ctx: AudioContext): void {
    if (!this.master) return;
    const vol = this.beatVolume();
    if (vol <= 0) return;
    const tNow = ctx.currentTime + 0.01;
    this.playLub(ctx, this.master, tNow, vol);
    this.playDub(ctx, this.master, tNow + 0.13, vol * 0.78);
    this.playTensionSting(ctx, this.master, tNow, vol);
  }

  private scheduleBeat(): void {
    if (!this.cleanup || !this.master) return;
    const ctx = this.host.getAudioContext() ?? this.host.ensureContext();
    this.playBeatCycle(ctx);
    this.beatTimer = setTimeout(() => this.scheduleBeat(), this.beatIntervalMs());
  }

  private startWhenReady(): void {
    if (this.cleanup || this.starting) return;
    this.starting = true;
    const ctx = this.host.ensureContext();
    const run = (): void => {
      this.starting = false;
      if (this.cleanup) return;
      this.startInternal(ctx);
    };
    if (ctx.state === 'running') {
      run();
      return;
    }
    void ctx.resume().then(() => {
      if (ctx.state === 'running') run();
      else this.starting = false;
    });
  }

  private startInternal(ctx: AudioContext): void {
    if (this.cleanup) return;
    const master = ctx.createGain();
    master.gain.value = 1;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 4;
    comp.ratio.value = 6;
    comp.attack.value = 0.002;
    comp.release.value = 0.12;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;

    this.playBeatCycle(ctx);
    this.beatTimer = setTimeout(() => this.scheduleBeat(), this.beatIntervalMs());

    this.cleanup = () => {
      try {
        master.disconnect();
        comp.disconnect();
      } catch {
        /* noop */
      }
    };
  }
}
