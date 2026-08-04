import { describe, expect, it } from 'vitest';
import { loadCalvarioContent } from '../../src/campaigns/calvario/bundle.ts';
import { loadParsedCampaignContent } from '../../src/campaigns/registry.ts';
import { applyEffects, buildStoryChoiceRows, EventBus } from '../../src/engine/core/index.ts';
import { computeCombatXp } from '../../src/engine/progression/index.ts';
import { isBattleEncounter, isDialogueEncounter } from '../../src/engine/schema/index.ts';
import { createStateWithHero } from '../helpers/engineTestData.ts';

const HUB_IDS = ['act5/frost_hub', 'act5/frost_hub_pact', 'act5/frost_hub_sealed'] as const;
const CONTRAWIND_SCENE_IDS = [
  'act5/frost_contrawind/intro',
  'act5/frost_contrawind/horde',
  'act5/frost_contrawind/horde_victory',
  'act5/frost_contrawind/parley',
  'act5/frost_contrawind/accepted',
  'act5/frost_contrawind/rejected',
  'act5/frost_contrawind/merchant',
] as const;

const PURCHASE_FLAGS = {
  colossus_pulse: 'contrawind_colossus_pulse_purchased',
  inner_lumen: 'contrawind_inner_lumen_purchased',
  apex_eye: 'contrawind_apex_eye_purchased',
} as const;

const CONTRAWIND_HUB_TARGETS = new Set([
  'act5/frost_contrawind/intro',
  'act5/frost_contrawind/horde_victory',
  'act5/frost_contrawind/merchant',
  'act5/frost_contrawind/rejected',
]);

describe('Contravento sidequest combat data', () => {
  it('defines the four-cultist horde and awards 64 total XP', () => {
    const { data } = loadCalvarioContent('pt-BR');
    const cultist = data.enemies.contrawind_cultist;
    expect(cultist).toMatchObject({
      id: 'contrawind_cultist',
      hp: 18,
      maxHp: 18,
      str: 10,
      agi: 8,
      mind: 9,
      armor: 0,
      type: 'cultist',
      xp: 14,
      attackStrategy: 'random',
      behavior: { rotation: ['attack', 'attack', 'contrawind_pressure'] },
    });
    expect(cultist?.abilities).toEqual([
      expect.objectContaining({ id: 'contrawind_pressure', kind: 'stress_wave' }),
    ]);

    const encounter = data.encounters.act5_contrawind_horde;
    expect(isBattleEncounter(encounter)).toBe(true);
    if (!isBattleEncounter(encounter)) return;
    expect(encounter.enemies).toEqual([
      'contrawind_cultist',
      'contrawind_cultist',
      'contrawind_cultist',
      'contrawind_cultist',
    ]);
    expect(encounter.playerAdvantage).toBe(true);
    expect(encounter.fleeRate).toBe(0.65);
    expect(encounter.xpReward).toBe(8);
    expect(computeCombatXp(encounter, data)).toBe(64);
  });

  it('localizes the Contrawind cultist and its combat ability in en-US', () => {
    const cultist = loadCalvarioContent('en-US').data.enemies.contrawind_cultist;
    const pressure = cultist?.abilities?.find((ability) => ability.id === 'contrawind_pressure');

    expect(cultist?.name).toBe('Contrawind Cultist');
    expect(pressure).toMatchObject({
      name: 'Contrawind Pressure',
      linePt: 'The wind changes sides — the pressure hunts for fear behind your eyes.',
    });
  });

  it('registers Edras dialogue encounter', () => {
    const { data } = loadCalvarioContent('pt-BR');
    const encounter = data.encounters.act5_edras_parley_dialogue;
    expect(isDialogueEncounter(encounter)).toBe(true);
    if (!isDialogueEncounter(encounter)) return;
    expect(encounter.dialogueEnemyId).toBe('act5_edras_contrawind');
    expect(encounter.xpReward).toBe(0);
  });

  it('overlays every Edras node line and choice in en-US', () => {
    const pt = loadCalvarioContent('pt-BR').data.dialogueEnemies.act5_edras_contrawind;
    const en = loadCalvarioContent('en-US').data.dialogueEnemies.act5_edras_contrawind;
    expect(en.name).toBe('Edras of the Contrawind');

    for (const [nodeId, ptNode] of Object.entries(pt.graph.nodes)) {
      const enNode = en.graph.nodes[nodeId];
      expect(enNode?.line, `${nodeId}:line`).not.toBe(ptNode.line);
      expect(enNode?.choices?.length ?? 0, `${nodeId}:choice count`).toBe(
        ptNode.choices?.length ?? 0
      );
      for (let index = 0; index < (ptNode.choices?.length ?? 0); index += 1) {
        expect(enNode?.choices?.[index]?.text, `${nodeId}:choice ${index}`).not.toBe(
          ptNode.choices?.[index]?.text
        );
      }
    }
  });
});

describe('Contravento sidequest scene state', () => {
  it('declares separate rumor and post-horde resumption choices in every throne hub', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');

    for (const hubId of HUB_IDS) {
      const hub = scenes.get(hubId);
      const intro = hub?.frontmatter.choices.find(
        (choice) => choice.next === 'act5/frost_contrawind/intro'
      );
      expect(intro, `${hubId}: intro choice`).toMatchObject({
        visibleWhen: {
          all: [
            { noFlag: 'contrawind_horde_defeated' },
            { noFlag: 'contrawind_parley_attempted' },
          ],
        },
        condition: {
          all: [
            { level: { gte: 18 } },
            { noFlag: 'contrawind_horde_defeated' },
            { noFlag: 'contrawind_parley_attempted' },
          ],
        },
        showWhenLocked: true,
      });
      expect(intro?.lockedHint, `${hubId}: level hint`).toContain('18');

      expect(
        hub?.frontmatter.choices.find(
          (choice) => choice.next === 'act5/frost_contrawind/horde_victory'
        ),
        `${hubId}: post-horde resumption`
      ).toMatchObject({
        visibleWhen: {
          all: [
            { flag: 'contrawind_horde_defeated' },
            { noFlag: 'contrawind_parley_attempted' },
          ],
        },
      });

      expect(
        hub?.frontmatter.choices.find(
          (choice) => choice.next === 'act5/frost_contrawind/merchant'
        )?.visibleWhen,
        `${hubId}: merchant state`
      ).toEqual({ flag: 'contrawind_merchant_unlocked' });

      expect(
        hub?.frontmatter.choices.find(
          (choice) => choice.next === 'act5/frost_contrawind/rejected'
        )?.visibleWhen,
        `${hubId}: rejected state`
      ).toEqual({ flag: 'contrawind_parley_failed' });
    }
  });

  it('distinguishes blocked, rumor, post-horde, attempted, accepted, and rejected hub states', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');

    for (const hubId of HUB_IDS) {
      const choices = scenes.get(hubId)?.frontmatter.choices ?? [];
      const rowsFor = (level: number, flags: Record<string, boolean>) => {
        const base = createStateWithHero({ level });
        return buildStoryChoiceRows(choices, { ...base, flags }).filter((row) =>
          row.choice.next ? CONTRAWIND_HUB_TARGETS.has(row.choice.next) : false
        );
      };
      const summary = (rows: ReturnType<typeof rowsFor>) =>
        rows.map((row) => [row.kind, row.choice.next]);

      expect(summary(rowsFor(17, {})), `${hubId}: blocked`).toEqual([
        ['locked', 'act5/frost_contrawind/intro'],
      ]);
      expect(summary(rowsFor(18, {})), `${hubId}: rumor`).toEqual([
        ['enabled', 'act5/frost_contrawind/intro'],
      ]);
      expect(
        summary(rowsFor(18, { contrawind_horde_defeated: true })),
        `${hubId}: post-horde`
      ).toEqual([['enabled', 'act5/frost_contrawind/horde_victory']]);
      expect(
        summary(
          rowsFor(18, {
            contrawind_horde_defeated: true,
            contrawind_parley_attempted: true,
          })
        ),
        `${hubId}: attempted`
      ).toEqual([]);
      expect(
        summary(
          rowsFor(18, {
            contrawind_horde_defeated: true,
            contrawind_parley_attempted: true,
            contrawind_merchant_unlocked: true,
          })
        ),
        `${hubId}: accepted`
      ).toEqual([['enabled', 'act5/frost_contrawind/merchant']]);
      expect(
        summary(
          rowsFor(18, {
            contrawind_horde_defeated: true,
            contrawind_parley_attempted: true,
            contrawind_parley_failed: true,
          })
        ),
        `${hubId}: rejected`
      ).toEqual([['enabled', 'act5/frost_contrawind/rejected']]);
    }
  });

  it('localizes a throne-specific post-horde resumption in every hub', () => {
    const pt = loadParsedCampaignContent('calvario', 'pt-BR');
    const en = loadParsedCampaignContent('calvario', 'en-US');
    const expected = {
      'act5/frost_hub': {
        pt: 'Voltar à capela — a horda caiu, Edras ainda espera',
        en: 'Return to the chapel — the horde fell, Edras still waits',
      },
      'act5/frost_hub_pact': {
        pt: 'Voltar à capela — o Sino não respondeu por você',
        en: 'Return to the chapel — the Bell did not answer for you',
      },
      'act5/frost_hub_sealed': {
        pt: 'Voltar à capela — o selo não encerrou a conversa',
        en: 'Return to the chapel — the seal did not end the conversation',
      },
    } as const;

    for (const hubId of HUB_IDS) {
      const resume = (locale: typeof pt) =>
        locale.scenes
          .get(hubId)
          ?.frontmatter.choices.find(
            (choice) => choice.next === 'act5/frost_contrawind/horde_victory'
          );
      expect(resume(pt)?.text, `${hubId}:pt-BR`).toBe(expected[hubId].pt);
      expect(resume(en)?.text, `${hubId}:en-US`).toBe(expected[hubId].en);
      expect(resume(en)?.preview, `${hubId}:en-US preview`).not.toBe(resume(pt)?.preview);
    }
  });

  it('records horde victory and consumes the parley attempt before dialogue combat starts', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');
    const horde = scenes.get('act5/frost_contrawind/horde');
    const hordeVictory = scenes.get('act5/frost_contrawind/horde_victory');
    const parley = scenes.get('act5/frost_contrawind/parley');

    expect(
      horde?.frontmatter.choices.find((choice) =>
        choice.effects.some((effect) => effect.op === 'startCombat')
      )?.effects
    ).toContainEqual({
      op: 'startCombat',
      encounterId: 'act5_contrawind_horde',
      onVictory: 'act5/frost_contrawind/horde_victory',
      onFlee: 'act5/frost_hub',
      onDefeat: 'shared/game_over',
    });
    expect(hordeVictory?.frontmatter.onEnter).toContainEqual({
      op: 'setFlag',
      key: 'contrawind_horde_defeated',
      value: true,
    });

    const confrontation = parley?.frontmatter.choices.find((choice) =>
      choice.effects.some((effect) => effect.op === 'startCombat')
    );
    expect(confrontation?.effects).toEqual([
      { op: 'setFlag', key: 'contrawind_parley_attempted', value: true },
      {
        op: 'startCombat',
        encounterId: 'act5_edras_parley_dialogue',
        onVictory: 'act5/frost_contrawind/accepted',
        onDefeat: 'act5/frost_contrawind/rejected',
      },
    ]);
  });

  it('unlocks Edras and awards the student mark only on acceptance', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');
    const accepted = scenes.get('act5/frost_contrawind/accepted');
    const rejected = scenes.get('act5/frost_contrawind/rejected');

    expect(accepted?.frontmatter.onEnter).toEqual(
      expect.arrayContaining([
        { op: 'setFlag', key: 'contrawind_merchant_unlocked', value: true },
        { op: 'addMark', mark: 'contrawind_student' },
      ])
    );
    expect(rejected?.frontmatter.onEnter).toContainEqual({
      op: 'setFlag',
      key: 'contrawind_parley_failed',
      value: true,
    });
    expect(rejected?.frontmatter.onEnter).not.toContainEqual({
      op: 'addMark',
      mark: 'contrawind_student',
    });

    const rejectedEffects = [
      ...(rejected?.frontmatter.onEnter ?? []),
      ...(rejected?.frontmatter.choices.flatMap((choice) => choice.effects) ?? []),
    ];
    expect(rejectedEffects.some((effect) => effect.op === 'startCombat')).toBe(false);
    expect(
      rejected?.frontmatter.choices.some(
        (choice) => choice.next === 'act5/frost_contrawind/parley'
      )
    ).toBe(false);
  });

  it('sells each lesson independently for exactly 12 gold and never offers it twice', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');
    const merchant = scenes.get('act5/frost_contrawind/merchant');
    const purchaseChoices = merchant?.frontmatter.choices.filter((choice) =>
      choice.effects.some((effect) => effect.op === 'learnSpell')
    );
    expect(purchaseChoices).toHaveLength(3);

    for (const [spellId, purchaseFlag] of Object.entries(PURCHASE_FLAGS)) {
      const choice = purchaseChoices?.find((candidate) =>
        candidate.effects.some(
          (effect) => effect.op === 'learnSpell' && effect.spellId === spellId
        )
      );
      expect(choice, spellId).toMatchObject({
        next: 'act5/frost_contrawind/merchant',
        visibleWhen: {
          all: [{ noFlag: purchaseFlag }, { noKnownSpell: spellId }],
        },
        condition: {
          all: [
            { resource: { gold: { gte: 12 } } },
            { noFlag: purchaseFlag },
            { noKnownSpell: spellId },
          ],
        },
        showWhenLocked: true,
      });
      expect(choice?.effects).toEqual([
        { op: 'addResource', resource: 'gold', delta: -12 },
        { op: 'learnSpell', spellId },
        { op: 'setFlag', key: purchaseFlag, value: true },
      ]);
    }
  });

  it('does not offer or charge for a lesson already known by an old save without its purchase flag', () => {
    const { data } = loadCalvarioContent('pt-BR');
    const merchant = loadParsedCampaignContent('calvario', 'pt-BR').scenes.get(
      'act5/frost_contrawind/merchant'
    );
    expect(merchant).toBeDefined();
    if (!merchant) return;

    const base = createStateWithHero({ level: 18 });
    const knownWithoutFlag = {
      ...base,
      knownSpells: ['colossus_pulse'],
      resources: { ...base.resources, gold: 12 },
    };
    const rows = buildStoryChoiceRows(merchant.frontmatter.choices, knownWithoutFlag);
    const purchase = rows.find((row) =>
      row.choice.effects.some(
        (effect) => effect.op === 'learnSpell' && effect.spellId === 'colossus_pulse'
      )
    );
    const afterSelection =
      purchase?.kind === 'enabled'
        ? applyEffects(knownWithoutFlag, purchase.choice.effects, {
            sceneId: merchant.id,
            data,
            bus: new EventBus(),
          })
        : knownWithoutFlag;

    expect(purchase).toBeUndefined();
    expect(afterSelection.resources.gold).toBe(12);
    expect(afterSelection.knownSpells).toEqual(['colossus_pulse']);
  });

  it('keeps conversation and return enabled after all three lessons are bought', () => {
    const { scenes } = loadParsedCampaignContent('calvario', 'pt-BR');
    const merchant = scenes.get('act5/frost_contrawind/merchant');
    expect(merchant).toBeDefined();
    if (!merchant) return;

    const base = createStateWithHero();
    const rows = buildStoryChoiceRows(merchant.frontmatter.choices, {
      ...base,
      resources: { ...base.resources, gold: 0 },
      flags: {
        ...base.flags,
        contrawind_colossus_pulse_purchased: true,
        contrawind_inner_lumen_purchased: true,
        contrawind_apex_eye_purchased: true,
      },
    });

    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.kind === 'enabled')).toBe(true);
    expect(rows.map((row) => row.choice.next)).toEqual([
      'act5/frost_contrawind/merchant',
      'act5/frost_hub',
    ]);
    expect(rows.flatMap((row) => row.choice.effects)).toEqual([]);
  });

  it('provides complete en-US overlays for every new scene and entity', () => {
    const pt = loadParsedCampaignContent('calvario', 'pt-BR');
    const en = loadParsedCampaignContent('calvario', 'en-US');

    for (const sceneId of CONTRAWIND_SCENE_IDS) {
      const ptScene = pt.scenes.get(sceneId);
      const enScene = en.scenes.get(sceneId);
      expect(enScene?.frontmatter.title, `${sceneId}:title`).not.toBe(
        ptScene?.frontmatter.title
      );
      expect(enScene?.bodyRaw, `${sceneId}:body`).not.toBe(ptScene?.bodyRaw);
      expect(enScene?.frontmatter.choices).toHaveLength(
        ptScene?.frontmatter.choices.length ?? -1
      );
      for (let index = 0; index < (ptScene?.frontmatter.choices.length ?? 0); index += 1) {
        expect(enScene?.frontmatter.choices[index]?.text, `${sceneId}:choice ${index}`).not.toBe(
          ptScene?.frontmatter.choices[index]?.text
        );
      }
    }

    expect(en.data.spells.colossus_pulse?.name).toBe('Colossus Pulse');
    expect(en.data.spells.inner_lumen?.name).toBe('Inner Lumen');
    expect(en.data.spells.apex_eye?.name).toBe('Apex Eye');
    expect(en.data.journeyMarks.contrawind_student).toMatchObject({
      name: 'Contrawind Student',
    });
  });
});
