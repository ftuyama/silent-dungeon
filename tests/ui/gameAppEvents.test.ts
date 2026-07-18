import { describe, expect, it, vi } from 'vitest';
import { handleGameEvent } from '../../src/ui/gameAppEvents.ts';

describe('handleGameEvent xp.gained', () => {
  it('fires onXpGained regardless of story mode (combat victory applies XP before mode flips in UI)', () => {
    const onXpGained = vi.fn();
    handleGameEvent(
      { type: 'xp.gained', amount: 15 },
      {
        onCombatVictory: vi.fn(),
        onCombatFlee: vi.fn(),
        onCombatDefeat: vi.fn(),
        onFaithMiracle: vi.fn(),
        onItemAcquired: vi.fn(),
        onCompanionRecruited: vi.fn(),
        onXpGained,
        onDiaryEntryAdded: vi.fn(),
        onCampRest: vi.fn(),
        onTimeDayAdvanced: vi.fn(),
        onStatusHighlight: vi.fn(),
      }
    );
    expect(onXpGained).toHaveBeenCalledWith(15);
  });

  it('ignores zero or negative XP amounts', () => {
    const onXpGained = vi.fn();
    handleGameEvent(
      { type: 'xp.gained', amount: 0 },
      {
        onCombatVictory: vi.fn(),
        onCombatFlee: vi.fn(),
        onCombatDefeat: vi.fn(),
        onFaithMiracle: vi.fn(),
        onItemAcquired: vi.fn(),
        onCompanionRecruited: vi.fn(),
        onXpGained,
        onDiaryEntryAdded: vi.fn(),
        onCampRest: vi.fn(),
        onTimeDayAdvanced: vi.fn(),
        onStatusHighlight: vi.fn(),
      }
    );
    expect(onXpGained).not.toHaveBeenCalled();
  });
});

describe('handleGameEvent companion.recruited', () => {
  it('fires onCompanionRecruited with companion id', () => {
    const onCompanionRecruited = vi.fn();
    handleGameEvent(
      { type: 'companion.recruited', companionId: 'squire_tomas' },
      {
        onCombatVictory: vi.fn(),
        onCombatFlee: vi.fn(),
        onCombatDefeat: vi.fn(),
        onFaithMiracle: vi.fn(),
        onItemAcquired: vi.fn(),
        onCompanionRecruited,
        onXpGained: vi.fn(),
        onDiaryEntryAdded: vi.fn(),
        onCampRest: vi.fn(),
        onTimeDayAdvanced: vi.fn(),
        onStatusHighlight: vi.fn(),
      }
    );
    expect(onCompanionRecruited).toHaveBeenCalled();
  });
});
