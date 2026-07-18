import { getCurrentDialogueContext, resolveDialogueChoice } from '../engine/combat/index.ts';
import type { DialogueChoice, DialogueCombatLogEntry, GameState } from '../engine/schema/index.ts';
import type { ContentRegistry } from '../content/registry.ts';
import type { EventBus } from '../engine/core/index.ts';
import type { GameData } from '../engine/data/index.ts';
import { getEffectiveLuck } from '../engine/progression/index.ts';
import { formatDiceAscii } from './diceAscii.ts';
import { escHtml } from './gameAppUtils.ts';
import {
  appendCombatLogMessageWithBoldNames,
  appendCombatSectionHeader,
  appendEnemyFloatingDamage,
  createCombatQuickNavDecorator,
  floatingEnemyDamageDurationMs,
  rollFloatingDmgAnchor,
} from './gameAppCombat.ts';
import { dialogueVerbalHitFxClass, getMeleeFxStyleForCharacter } from './combatFx.ts';
import type { GameAudio } from './sound/index.ts';
import { getLocale, pickLocalized, t } from '../i18n/index.ts';

type PendingDialogueEnemyFloat = {
  encId: string;
  amount: number;
  kind: 'crit' | 'normal';
  startMs: number;
  anchorLeftPct: number;
  anchorTopPct: number;
};

let pendingDialogueEnemyFloatingDamage: PendingDialogueEnemyFloat[] = [];

function playDialogueCombatLogSound(entry: DialogueCombatLogEntry, audio: GameAudio): void {
  if (entry.kind === 'leader_damage') {
    audio.playDamageTaken();
    return;
  }
  if (entry.kind === 'roll') {
    audio.playDice();
  }
}

function dialogueAttrAbbrev(attr: 'str' | 'agi' | 'mind'): string {
  return attr === 'str' ? t('engine.attrStr') : attr === 'agi' ? t('engine.attrAgi') : t('engine.attrMind');
}

function dialogueAttrMod(
  lead: GameState['party'][0] | undefined,
  attr: 'str' | 'agi' | 'mind'
): number {
  if (!lead) return 0;
  const v = attr === 'str' ? lead.str : attr === 'agi' ? lead.agi : lead.mind;
  return Math.floor((v - 6) / 2);
}

function formatDialogueChoicePreview(
  state: GameState,
  data: GameData,
  choice: DialogueChoice
): { primary: string | null } {
  const res = choice.resolution;

  if (res.kind === 'fixed') {
    return { primary: null };
  }

  const lead = state.party[0];
  if (res.kind === 'skill') {
    const mod = dialogueAttrMod(lead, res.attr);
    const ab = dialogueAttrAbbrev(res.attr);
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
    return {
      primary: t('dialogueCombat.skillPreview', { attr: ab, mod: modStr, tn: String(res.tn) }),
    };
  }

  const effLuck = lead ? getEffectiveLuck(lead, data, state) : 8;
  const mod = Math.floor((effLuck - 6) / 2);
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
  const pen = res.luckPenalty ?? 0;
  const penBit = pen > 0 ? t('story.cursePenalty', { penalty: String(pen) }) : '';
  return {
    primary: t('dialogueCombat.luckPreview', {
      mod: modStr,
      curse: penBit,
      tn: String(res.tn),
    }),
  };
}

function appendDialogueChatLog(
  parent: HTMLElement,
  log: DialogueCombatLogEntry[],
  combatantNames: readonly string[],
  meta: { npcLabel: string; heroLabel: string; firstNewIndex: number }
): void {
  let i = 0;
  while (i < log.length) {
    const e = log[i]!;
    if (e.kind === 'interlocutor_line') {
      const row = document.createElement('div');
      row.className = 'combat-dialogue-chat-row combat-dialogue-chat-row--npc';
      const bubble = document.createElement('div');
      bubble.className = 'combat-dialogue-bubble combat-dialogue-bubble--npc';
      bubble.setAttribute('role', 'article');
      const who = document.createElement('div');
      who.className = 'combat-dialogue-bubble__who';
      who.textContent = meta.npcLabel;
      const text = document.createElement('div');
      text.className = 'combat-dialogue-bubble__text combat-log-msg';
      appendCombatLogMessageWithBoldNames(text, e.message, combatantNames);
      bubble.appendChild(who);
      bubble.appendChild(text);
      row.appendChild(bubble);
      parent.appendChild(row);
      i += 1;
      continue;
    }

    if (e.kind === 'info') {
      const row = document.createElement('div');
      row.className = 'combat-dialogue-chat-row combat-dialogue-chat-row--system';
      const strip = document.createElement('div');
      strip.className = 'combat-dialogue-system-strip combat-log-msg';
      appendCombatLogMessageWithBoldNames(strip, e.message, combatantNames);
      row.appendChild(strip);
      parent.appendChild(row);
      i += 1;
      continue;
    }

    if (e.kind === 'player_choice') {
      const cluster: DialogueCombatLogEntry[] = [e];
      const clusterStart = i;
      i += 1;
      while (i < log.length) {
        const n = log[i]!;
        if (n.kind === 'roll' || n.kind === 'tension_shift' || n.kind === 'leader_damage') {
          cluster.push(n);
          i += 1;
        } else {
          break;
        }
      }
      appendPlayerDialogueCluster(parent, cluster, combatantNames, meta, clusterStart);
      continue;
    }

    const row = document.createElement('div');
    row.className = 'combat-dialogue-chat-row combat-dialogue-chat-row--system';
    const strip = document.createElement('div');
    strip.className = 'combat-dialogue-system-strip combat-log-msg';
    strip.textContent = e.message;
    row.appendChild(strip);
    parent.appendChild(row);
    i += 1;
  }
}

function appendPlayerDialogueCluster(
  parent: HTMLElement,
  cluster: DialogueCombatLogEntry[],
  combatantNames: readonly string[],
  meta: { npcLabel: string; heroLabel: string; firstNewIndex: number },
  clusterStartIndex: number
): void {
  const choiceEntry = cluster[0];
  if (!choiceEntry || choiceEntry.kind !== 'player_choice') return;

  const row = document.createElement('div');
  row.className = 'combat-dialogue-chat-row combat-dialogue-chat-row--player';
  const col = document.createElement('div');
  col.className = 'combat-dialogue-player-stack';

  const choiceBubble = document.createElement('div');
  choiceBubble.className = 'combat-dialogue-bubble combat-dialogue-bubble--player';
  choiceBubble.setAttribute('role', 'article');
  const who = document.createElement('div');
  who.className = 'combat-dialogue-bubble__who';
  who.textContent = meta.heroLabel;
  const text = document.createElement('div');
  text.className = 'combat-dialogue-bubble__text combat-log-msg';
  appendCombatLogMessageWithBoldNames(text, choiceEntry.message, combatantNames);
  choiceBubble.appendChild(who);
  choiceBubble.appendChild(text);
  col.appendChild(choiceBubble);

  const chips = document.createElement('div');
  chips.className = 'combat-dialogue-fx-chips';

  for (let k = 1; k < cluster.length; k++) {
    const sub = cluster[k]!;
    const globalIdx = clusterStartIndex + k;
    const isNew = globalIdx >= meta.firstNewIndex;

    if (sub.kind === 'roll') {
      const rollBubble = document.createElement('div');
      rollBubble.className = 'combat-dialogue-bubble combat-dialogue-bubble--roll';
      if (sub.message.includes(`→ ${t('combatLog.success')}`)) {
        rollBubble.classList.add('combat-dialogue-bubble--roll-ok');
      } else if (sub.message.includes(`→ ${t('combatLog.failure')}`)) {
        rollBubble.classList.add('combat-dialogue-bubble--roll-fail');
      }
      if (isNew) {
        rollBubble.classList.add('combat-dialogue-bubble--enter');
      }
      const rWho = document.createElement('div');
      rWho.className = 'combat-dialogue-bubble__who combat-dialogue-bubble__who--muted';
      rWho.textContent = t('dialogueCombat.roll');
      const rText = document.createElement('div');
      rText.className = 'combat-dialogue-bubble__text combat-log-msg';
      appendCombatLogMessageWithBoldNames(rText, sub.message, combatantNames);
      rollBubble.appendChild(rWho);
      rollBubble.appendChild(rText);
      if (sub.dice?.length) {
        const diceWrap = document.createElement('div');
        diceWrap.className = 'combat-dialogue-log-dice';
        if (isNew) {
          diceWrap.classList.add('combat-dialogue-log-dice--enter');
        }
        const pre = document.createElement('pre');
        pre.className = 'dice-ascii-block';
        pre.textContent = formatDiceAscii(sub.dice);
        diceWrap.appendChild(pre);
        rollBubble.appendChild(diceWrap);
      }
      col.appendChild(rollBubble);
      continue;
    }

    if (sub.kind === 'tension_shift' && sub.hostilityDelta != null) {
      const chip = document.createElement('span');
      const up = sub.hostilityDelta > 0;
      chip.className = `combat-dialogue-chip combat-dialogue-chip--hostility${up ? ' combat-dialogue-chip--host-up' : ' combat-dialogue-chip--host-down'}`;
      chip.textContent = up
        ? t('dialogueCombat.hostilityUp', { delta: sub.hostilityDelta })
        : t('dialogueCombat.hostilityDown', { delta: sub.hostilityDelta });
      chip.title = sub.message;
      chips.appendChild(chip);
      continue;
    }

    if (sub.kind === 'leader_damage') {
      const chip = document.createElement('span');
      chip.className = 'combat-dialogue-chip combat-dialogue-chip--wound';
      chip.textContent = t('dialogueCombat.wounded');
      chip.title = sub.message;
      chips.appendChild(chip);
    }
  }

  if (chips.childElementCount > 0) {
    col.appendChild(chips);
  }

  row.appendChild(col);
  parent.appendChild(row);
}

export type DialogueCombatRenderContext = {
  state: GameState;
  registry: ContentRegistry;
  bus: EventBus;
  audio: GameAudio;
  dialogueLog: {
    soundCursor: { encounterId: string; index: number };
    setSoundCursor: (v: { encounterId: string; index: number }) => void;
  };
  lifecycle: {
    unlockAudio: () => void;
    stabilize: (s: GameState) => GameState;
    commitState: (s: GameState) => void;
  };
};

export function renderDialogueCombatInto(
  shell: HTMLElement,
  ctx: DialogueCombatRenderContext
): void {
  const d = ctx.state.dialogueCombat;
  if (!d) return;
  const enc = ctx.registry.data.encounters[d.encounterId];
  if (!enc || enc.combatType !== 'dialogue') return;
  const dlgDef = ctx.registry.data.dialogueEnemies[enc.dialogueEnemyId];
  if (!dlgDef) return;
  const dlgCtx = getCurrentDialogueContext(ctx.state, ctx.registry.data);
  const encId = d.encounterId;
  const cur = ctx.dialogueLog.soundCursor;
  let firstNewLogIndex = d.log.length;
  let newLogEntries: DialogueCombatLogEntry[] = [];
  if (cur.encounterId !== encId) {
    ctx.dialogueLog.setSoundCursor({ encounterId: encId, index: d.log.length });
  } else if (cur.index < d.log.length) {
    firstNewLogIndex = cur.index;
    newLogEntries = d.log.slice(cur.index);
    for (const e of newLogEntries) {
      playDialogueCombatLogSound(e, ctx.audio);
    }
    ctx.dialogueLog.setSoundCursor({ encounterId: encId, index: d.log.length });
  }

  const floatNow = Date.now();
  const floatDurMs = floatingEnemyDamageDurationMs();
  pendingDialogueEnemyFloatingDamage = pendingDialogueEnemyFloatingDamage.filter(
    (p) => p.encId === encId && floatNow - p.startMs < floatDurMs
  );
  const reducedMotionFloat =
    typeof document !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  let verbalHitFxClass: string | null = null;
  let verbalSpriteCrit = false;
  for (const e of newLogEntries) {
    if (e.kind !== 'tension_shift' || e.hostilityDelta == null || e.hostilityDelta >= 0) continue;
    const drop = -e.hostilityDelta;
    const big = drop >= 6;
    const atkLead = ctx.state.party[0];
    const style = getMeleeFxStyleForCharacter(atkLead);
    if (style === 'slash') {
      ctx.audio.playSwordSlash();
    } else if (style === 'blunt') {
      ctx.audio.playBluntImpact();
    } else {
      ctx.audio.playStaffWhoosh();
    }
    if (big) {
      ctx.audio.playCritImpact();
    }
    verbalHitFxClass = dialogueVerbalHitFxClass(atkLead, big);
    if (big) {
      verbalSpriteCrit = true;
    }
    const anchor = rollFloatingDmgAnchor(reducedMotionFloat);
    pendingDialogueEnemyFloatingDamage.push({
      encId,
      amount: drop,
      kind: big ? 'crit' : 'normal',
      startMs: floatNow,
      anchorLeftPct: anchor.leftPct,
      anchorTopPct: anchor.topPct,
    });
  }

  const inner = document.createElement('div');
  inner.className = 'shell combat-shell';
  inner.innerHTML = `<h1>${escHtml(t('dialogueCombat.title'))}</h1>`;

  const combatantNames = [...ctx.state.party.map((m) => m.name), dlgDef.name];

  const layout = document.createElement('div');
  layout.className = 'combat-layout combat-layout--verbal';

  const mainCol = document.createElement('div');
  mainCol.className = 'combat-log-column combat-log-column--verbal';

  const sideCol = document.createElement('div');
  sideCol.className = 'combat-enemies-column combat-enemies-column--verbal';
  const panel = document.createElement('div');
  panel.className = 'enemy-panel enemy-panel--verbal';
  const hpPct = Math.max(0, Math.min(100, Math.round((d.tensionHp / d.tensionMax) * 100)));
  panel.innerHTML = `<div class="enemy-panel-header enemy-panel-header--verbal-only"><strong>${escHtml(dlgDef.name)}</strong></div>`;
  const stack = document.createElement('div');
  stack.className = 'enemy-sprite-stack enemy-sprite-stack--verbal';
  const pre = document.createElement('pre');
  pre.className = 'enemy-sprite enemy-sprite--verbal';
  if (verbalSpriteCrit) {
    pre.classList.add('crit-flash');
  }
  pre.textContent = dlgDef.sprite;
  const fxLayer = document.createElement('div');
  fxLayer.className = 'enemy-fx-layer';
  fxLayer.setAttribute('aria-hidden', 'true');
  if (verbalHitFxClass) {
    fxLayer.classList.add(verbalHitFxClass);
  }
  stack.appendChild(pre);
  stack.appendChild(fxLayer);
  const dmgFloatRoot = document.createElement('div');
  dmgFloatRoot.className = 'enemy-dmg-float-root';
  dmgFloatRoot.setAttribute('aria-hidden', 'true');
  for (const p of pendingDialogueEnemyFloatingDamage) {
    if (p.encId !== encId) continue;
    const elapsed = floatNow - p.startMs;
    if (elapsed >= floatDurMs) continue;
    appendEnemyFloatingDamage(dmgFloatRoot, p.amount, p.kind, elapsed, {
      leftPct: p.anchorLeftPct,
      topPct: p.anchorTopPct,
    });
  }
  stack.appendChild(dmgFloatRoot);
  panel.appendChild(stack);
  const hostilityBlock = document.createElement('div');
  hostilityBlock.className = 'enemy-verbal-hostility';
  const hpLabel = document.createElement('span');
  hpLabel.className = 'enemy-hp-text enemy-hp-text--verbal-hostility';
  hpLabel.textContent = t('dialogueCombat.hostility', {
    current: d.tensionHp,
    max: d.tensionMax,
  });
  const hpTrack = document.createElement('div');
  hpTrack.className = 'enemy-hp-track enemy-hp-track--verbal-below-sprite';
  hpTrack.title = t('dialogueCombat.hostility', { current: d.tensionHp, max: d.tensionMax });
  hpTrack.innerHTML = `<div class="enemy-hp-fill" style="width:${hpPct}%"></div>`;
  hostilityBlock.appendChild(hpLabel);
  hostilityBlock.appendChild(hpTrack);
  panel.appendChild(hostilityBlock);
  sideCol.appendChild(panel);

  const lead = ctx.state.party[0];

  const decorateCombatQuickNav = createCombatQuickNavDecorator();

  const logOuter = document.createElement('div');
  logOuter.className = 'combat-log-outer combat-log-outer--verbal';
  const logPanel = document.createElement('div');
  logPanel.className = 'dice-panel combat-dialogue-log-panel combat-dialogue-log-panel--verbal';
  const logHdr = document.createElement('div');
  logHdr.className = 'dice-panel-header';
  logHdr.textContent = t('dialogueCombat.conversation');
  logHdr.title = t('dialogueCombat.logHeaderHint');
  logPanel.appendChild(logHdr);

  const logScroll = document.createElement('div');
  logScroll.className = 'combat-log-scroll combat-log-scroll--verbal';
  logScroll.title = logHdr.title;
  logScroll.setAttribute('role', 'log');
  logScroll.setAttribute('aria-live', 'polite');
  logScroll.setAttribute('aria-relevant', 'additions text');
  const logStack = document.createElement('div');
  logStack.className = 'combat-log-stack combat-dialogue-log-stack';
  appendDialogueChatLog(logStack, d.log, combatantNames, {
    npcLabel: dlgDef.name,
    heroLabel: lead?.name ?? t('dialogueCombat.you'),
    firstNewIndex: firstNewLogIndex,
  });
  logScroll.appendChild(logStack);
  logPanel.appendChild(logScroll);

  if (dlgCtx && lead) {
    const choices = dlgCtx.node.choices ?? [];
    if (choices.length > 0) {
      const dialogueBar = document.createElement('div');
      dialogueBar.className = 'combat-dialogue-composer';
      dialogueBar.setAttribute('aria-label', t('dialogueCombat.replicasAria'));
      appendCombatSectionHeader(
        dialogueBar,
        'combat-dialogue-hdr',
        t('dialogueCombat.replicasLabel'),
        t('dialogueCombat.replicasHelp'),
        t('dialogueCombat.replicasHelpTitle')
      );
      const btnRow = document.createElement('div');
      btnRow.className = 'combat-dialogue-choices combat-dialogue-choices--composer';
      for (let ci = 0; ci < choices.length; ci++) {
        const ch = choices[ci]!;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'combat-dialogue-choice combat-dialogue-choice--composer';
        const labelMain = document.createElement('span');
        labelMain.className = 'combat-dialogue-choice-label';
        btn.appendChild(labelMain);
        const previewBits = formatDialogueChoicePreview(ctx.state, ctx.registry.data, ch);
        if (previewBits.primary) {
          btn.classList.add('combat-dialogue-choice--with-preview');
        }
        if (previewBits.primary) {
          const line = document.createElement('span');
          line.className = 'combat-dialogue-choice-preview-line';
          line.textContent = previewBits.primary;
          btn.appendChild(line);
        }
        decorateCombatQuickNav(btn, (key) => {
          labelMain.textContent =
            key != null
              ? `${key} — ${pickLocalized(ch.text, getLocale())}`
              : pickLocalized(ch.text, getLocale());
        });
        btn.addEventListener('click', () => {
          ctx.lifecycle.unlockAudio();
          ctx.audio.playDice();
          ctx.lifecycle.commitState(
            resolveDialogueChoice(ctx.state, ci, ctx.registry.data, ctx.bus)
          );
        });
        btnRow.appendChild(btn);
      }
      dialogueBar.appendChild(btnRow);
      logPanel.appendChild(dialogueBar);
    }
  }

  logOuter.appendChild(logPanel);
  mainCol.appendChild(logOuter);

  layout.appendChild(sideCol);
  layout.appendChild(mainCol);
  inner.appendChild(layout);
  shell.appendChild(inner);

  const scrollVerbalLogToBottom = (): void => {
    logScroll.scrollTop = logScroll.scrollHeight;
  };
  scrollVerbalLogToBottom();
  window.requestAnimationFrame(() => {
    scrollVerbalLogToBottom();
    window.requestAnimationFrame(scrollVerbalLogToBottom);
  });
}
