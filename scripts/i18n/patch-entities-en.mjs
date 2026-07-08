#!/usr/bin/env node
/**
 * Apply English display strings to locales/en-US/entities.json (overlay merge).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enPath = path.join(__dirname, '../../src/campaigns/calvario/locales/en-US/entities.json');

/** @type {Record<string, Record<string, { name?: string; description?: string; lorePt?: string }>>} */
const EN = {
  spells: {
    warriors_focus: { name: "Warrior's Focus" },
    iron_ward: { name: 'Iron Wall' },
    arcane_bolt: { name: 'Arcane Bolt' },
    ember_spark: { name: 'Ember Spark' },
    lesser_heal: { name: 'Lesser Heal' },
    merciful_light: { name: 'Merciful Light' },
    silver_bolt: { name: 'Silver Bolt' },
    whisper_cache: { name: 'Whisper Cache' },
    pilgrims_benediction: { name: "Pilgrim's Staff" },
    silent_arrow: { name: 'Silent Arrow' },
  },
  enemies: {
    rat_swarm: {
      name: 'Rat Swarm',
      abilities: { venom_bite: { name: 'Filthy Bite' } },
    },
    skeleton: { name: 'Skeleton' },
    cultist: {
      name: 'Cultist',
      abilities: {
        dread_whisper: {
          name: 'Whisper of Dread',
          linePt: 'The cultist chants low — the liturgy seeks cracks in your courage.',
        },
      },
    },
    frost_cultist: {
      name: 'Frost Cultist',
      abilities: {
        frost_lash: {
          name: 'Frost Lash',
          linePt: 'The incense freezes in the air — the frost hunts your blood.',
        },
      },
    },
    stone_guard: {
      name: 'Stone Guardian',
      abilities: {
        granite_slam: {
          name: 'Granite Slam',
          linePt: 'The guardian raises a stone arm — the whole hall seems to weigh on the blow.',
        },
      },
    },
    elemental_golem: {
      name: 'Elemental Golem',
      abilities: {
        seismic_wave: {
          name: 'Seismic Wave',
          linePt: 'The colossus strikes the floor — stone ripples like water held still too long.',
        },
      },
    },
    morvayn_p1: {
      name: 'Morvayn, the Necromancer',
      abilities: {
        bone_needles: {
          name: 'Bone Needles',
          linePt: 'Morvayn opens his hand — bone shards spin and point at you.',
        },
        dread_liturgy: {
          name: 'Liturgy of Dread',
          linePt: "The necromancer's voice drops an octave; the dead listen with you.",
        },
      },
    },
    morvayn_p2: {
      name: 'Morvayn (Throne of Bones)',
      abilities: {
        throne_grasp: {
          name: 'Throne Grasp',
          linePt: 'Bones burst from the dais and seize — the throne fights too.',
        },
        marrow_curse: {
          name: 'Marrow Curse',
          linePt: 'Morvayn whispers to the bone inside you — and the bone answers.',
        },
      },
    },
    fallen_angel: {
      name: 'Fallen Angel, Voice of the Veil',
      abilities: {
        veil_verdict: {
          name: 'Veil Verdict',
          linePt: 'The severed wings unfold — what light remains becomes sentence.',
        },
      },
    },
    vigil_hunter: {
      name: 'Vigil Hunter',
      abilities: {
        pinning_shot: {
          name: 'Pinning Shot',
          linePt: 'The hunter locks on the wounded — the Vigil does not waste arrows.',
        },
      },
    },
    rival_kael_i: { name: 'Kael, the Grey Tracker' },
    rival_kael_ii: {
      name: 'Kael, the Grey Tracker',
      abilities: {
        gray_focus: {
          name: 'Grey Focus',
          linePt: 'Kael breathes deep and reads your guard like a fresh trail.',
        },
      },
    },
    rival_kael_iii: {
      name: 'Kael, the Grey Tracker',
      abilities: {
        gray_focus: {
          name: 'Grey Focus',
          linePt: 'Kael breathes deep and reads your guard like a fresh trail.',
        },
        tracker_lunge: {
          name: "Tracker's Lunge",
          linePt: 'Grey steel closes the distance in a single step.',
        },
      },
    },
    rival_kael_iv: {
      name: 'Kael, the Grey Tracker',
      abilities: {
        gray_focus: {
          name: 'Grey Focus',
          linePt: 'Kael breathes deep and reads your guard like a fresh trail.',
        },
        tracker_lunge: {
          name: "Tracker's Lunge",
          linePt: 'Grey steel closes the distance in a single step.',
        },
      },
    },
    frost_whelp: {
      name: 'Frost Whelp',
      abilities: { frost_nip: { name: 'Frost Nip' } },
    },
    frost_reaver: {
      name: 'Frost Reaver',
      abilities: {
        glacial_cleave: {
          name: 'Glacial Cleave',
          linePt: 'The axe sweeps wide — frost follows the edge.',
        },
      },
    },
    ice_dragon_p1: {
      name: "Vetrnax, the Wind's Edge",
      abilities: {
        frost_breath: {
          name: 'Frost Breath',
          linePt: 'Vetrnax inhales — the air around you surrenders first.',
        },
        wind_shear: {
          name: 'Wind Shear',
          linePt: 'The wings beat once; the wind cuts what will not bow.',
        },
      },
    },
    ice_dragon_p2: {
      name: 'Vetrnax (Frozen Heart)',
      abilities: {
        deep_freeze: {
          name: 'Deep Freeze',
          linePt: 'The frozen heart pulses — deep cold does not scream; it occupies.',
        },
        avalanche_wing: {
          name: 'Avalanche Wing',
          linePt: 'Snow and thunder in the same wingbeat.',
        },
      },
    },
    summit_fallen_god: {
      name: 'Echoes of the Broken Pantheon',
      abilities: {
        hymn_of_ruin: {
          name: 'Hymn of Ruin',
          linePt: 'The broken choir sings backwards — each note steals ground.',
        },
        shattered_verdict: {
          name: 'Shattered Verdict',
          linePt: 'Fragments of the pantheon converge in a single pointing finger.',
        },
      },
    },
    act6_veil_herald: {
      name: 'Herald of the Veil',
      abilities: {
        unveiling: {
          name: 'Unveiling',
          linePt: 'The herald pulls an invisible seam — reality groans where you stand.',
        },
        seam_dread: {
          name: 'Dread of the Seams',
          linePt: 'For an instant, everyone sees the invisible walls of their own certainty.',
        },
      },
    },
    act6_echo_chorus: {
      name: 'Chorus of Echoes',
      abilities: {
        chorus_of_you: {
          name: 'Chorus of You',
          linePt: 'The chorus repeats your words — in the tone you swore you never used.',
        },
        dissonant_echo: {
          name: 'Dissonant Echo',
          linePt: 'A wrong note, tuned on purpose, crosses your temple.',
        },
      },
    },
    act6_penitent_blade: {
      name: 'Faceless Penitent',
      abilities: {
        penitent_vice: {
          name: "Penitent's Vice",
          linePt: 'The blade descends slowly — penance is never in a hurry.',
        },
      },
    },
    act6_shadow_self: {
      name: 'Sovereign Reflection',
      abilities: {
        sovereign_poise: {
          name: 'Sovereign Poise',
          linePt: 'The reflection adjusts its stance — yours, without hesitation.',
        },
        mirror_edge: {
          name: "Mirror's Edge",
          linePt: 'The blow comes from the exact angle you would strike.',
        },
        guiltless_verdict: {
          name: 'Guiltless Verdict',
          linePt: 'The reflection decides for you — and the decision hurts.',
        },
      },
    },
    act6_shade_fragment: { name: 'Shade Fragment' },
    act6_wild_splinter: { name: 'Wandering Splinter' },
    act6_wild_veil_scribe: {
      name: 'Veil Scribe',
      abilities: {
        binding_clause: {
          name: 'Binding Clause',
          linePt: 'The pen scores the air — the text demands your signature, still.',
        },
      },
    },
    act6_wild_murmur_host: {
      name: 'Host of Murmurs',
      abilities: {
        murmur_swell: {
          name: 'Murmur Swell',
          linePt: 'Mouths open at once — none of them says your name right.',
        },
      },
    },
    act6_wild_chain_penitent: {
      name: 'Penitent of Links',
      abilities: {
        chain_bind: {
          name: 'Chain Bind',
          linePt: 'The chain sings and seeks a pulse — the link learns your weight.',
        },
      },
    },
    act6_wild_glass_regent: {
      name: 'Regent of Broken Glass',
      abilities: {
        crown_of_shards: {
          name: 'Crown of Shards',
          linePt: 'The crown spins — each shard picks a face to reflect and cut.',
        },
        regent_composure: {
          name: "Regent's Composure",
          linePt: 'The regent straightens the broken throne beneath them.',
        },
      },
    },
    act6_wild_stain_preacher: {
      name: 'Preacher of the Stain',
      abilities: {
        stain_sermon: {
          name: 'Stain Sermon',
          linePt: 'The preacher reads aloud — and the stain on you answers the call.',
        },
      },
    },
  },
  passives: {
    knight: { name: 'Relentless Steel', description: '+3% critical hit chance.' },
    cleric: {
      name: 'Devout Pulse',
      description: 'At the start of your turn, regenerate 1% of max HP (rounded up).',
    },
    mage: {
      name: 'Arcane Thread',
      description: 'At the start of your turn, regenerate 1% of max mana (rounded up).',
    },
  },
  leadStoryPassives: {
    monk_inner_peace: {
      name: 'Inner Peace',
      description:
        '+1 permanent LCK — blessing of the snow monk: luck as discipline, not trickery.',
    },
  },
  journeyMarks: {
    act1_surface_whisper_intel: {
      name: 'Rumor That Pays',
      description:
        'In the city underworld you heard what matters: names, hours, routes — intelligence worth gold, without asking for a miracle.',
    },
    act1_surface_whisper_taint: {
      name: 'Laughter on the Tongue',
      description:
        'Something on the surface returned a laugh that was not yours; the echo stayed in your mouth like old metal, and the depths remembered your taste.',
    },
    act3_cult_flight: {
      name: 'Flight Under Hoods',
      description:
        'You ran from the ambush with the Third Bell at your neck: supply lost, the Vigil suspicious, and a shard of shadow added to corruption.',
    },
    act3_well_truth: {
      name: 'Truth in the Well',
      description:
        'You saw the mirror trick: the reflection lied, the real path opened to the left. You know how to read traps that pretend to be clarity.',
    },
    act3_well_snare: {
      name: 'Deceiving Reflection',
      description:
        'You believed what the well showed; the map lied. The next room holds the surprise you chose not to see in time.',
    },
    act3_rune_tuned: {
      name: 'Stone Rhythm Tamed',
      description:
        'You tuned the pulse of the runes; for moments the tomb obeyed your attention, and thought rises cleaner.',
    },
    act3_rune_jarred: {
      name: 'Echo in the Runes',
      description:
        'The runes\' compass denied you; a dry shock in the tendons, steps half a beat late — the wall reminded you that rushing is not mastery.',
    },
    act6_memory_kept: {
      name: 'Memory Intact',
      description:
        'In the veil\'s judgment you chose not to bleed what you guard; the price was another, but the core stayed yours.',
    },
    act6_memory_spoiled: {
      name: 'Stained Memory',
      description:
        'You let the trial tear what you were; the memory came out contaminated — useful perhaps, but no longer innocent.',
    },
    act6_shadow_faced: {
      name: 'Shadow Faced',
      description:
        'In the final mirror you did not flee the double; naming the reflection cost you, but you wrested presence from the void.',
    },
    act6_veil_aligned: {
      name: 'Veil Aligned',
      description:
        'At the drumhead of the real you chose focus over flight; the world still lies, but you learned where it steps.',
    },
    act6_veil_broken: {
      name: 'Veil in Shards',
      description:
        'You preferred to shatter the curtain; the noise you let in filters poorly — you see too much or too little, but no longer as before.',
    },
    act6_void_pact_mark: {
      name: 'Mark of the Void Pact',
      description:
        'You claimed the Void\'s secret by name; signature without ink, but the narrative remembers who surrendered the last grain.',
    },
    act6_will_direct: {
      name: 'Will Forward',
      description:
        'In the trial of will you cut in a straight line; little dance, much impact — your path did not ask permission.',
    },
    act6_will_measured: {
      name: 'Measured Will',
      description:
        'You traded iron for calculation; clean duel, counted steps — victory that tastes of discipline, not luck.',
    },
    act6_will_scattered: {
      name: 'Will in Flight',
      description:
        'The horde split your concentration into shreds; you survived in dispersion — honor of one who crosses chaos without pretending order.',
    },
    act7_bell_ate_promise: {
      name: 'Promise Digested',
      description:
        'The silent bell offered a pact in whisper; you chose to swallow the promise — taste of a future you do not describe in words.',
    },
    act7_bell_paid_faith: {
      name: 'Bell Paid in Faith',
      description:
        'You paid the bell with what cannot be weighed; the clapper changed owners and you kept the echo in conscience.',
    },
    act7_broke_hollow_line: {
      name: 'Hollow Line Broken',
      description:
        'You broke the armed void formation; what was wall became breach — witness of one who did not yield to the parade.',
    },
    act7_cinder_burned: {
      name: 'Mark of Ash',
      description:
        'The ash tithe demanded more than you gave; you burned in refusal or failure — skin remembers the furnace that measured you.',
    },
    act7_cinder_favored: {
      name: 'Favored by Ash',
      description:
        'The tithe accepted your tribute; favored by the consuming current — not a clean blessing, recognition of one who pays.',
    },
    act7_ember_witness: {
      name: 'Witness of the Brazier',
      description:
        'You followed the brazier-devourer where the narrative burns; you witnessed the end without turning to ash — fright that stays on the retina.',
    },
    act7_heard_ash_sermon: {
      name: 'Ash Sermon',
      description:
        'You heard the verses of the last ash preacher; the homily does not ask amen, it asks silence — and you kept both.',
    },
    act7_last_train_rider: {
      name: 'Last Train',
      description:
        'You boarded the rumor of the last train; passenger on a line that does not exist on the map — arrival where the calendar gives up.',
    },
    act7_paid_sky_in_faith: {
      name: 'Sky Paid in Faith',
      description:
        'Before the final horizon you offered conviction to the lying ceiling; the sky kept the debt and you the scratch of the trade.',
    },
    act7_sealed_in_ember: {
      name: 'Sealed in the Brazier',
      description:
        'You chose to close the cycle in heat that does not forgive; seal of embers — less word, more living scar.',
    },
    act7_sky_stitch_torn: {
      name: 'Sky Stitch Torn',
      description:
        'The stitch failed; the fabric of the firmament slipped between your fingers — shame of one who tried to mend the impossible and heard the tear.',
    },
    act7_sky_stitch_true: {
      name: 'True Stitch',
      description:
        'You pulled the thread until it obeyed; the sky did not become perfect, but stopped bleeding on that front — craft of one who did not quit.',
    },
    act7_walked_bare: {
      name: 'Bare Step',
      description:
        'You refused narrative armor before the end; you walked bare of metaphors — exposure that is courage or madness, and perhaps both.',
    },
    calvario_sealed: {
      name: 'Dungeon Sealed',
      description:
        'You carried the seal\'s weight in you; the depths fall silent — silence of stone — because you assumed the cost in faith and scar, instead of borrowing the rumor.',
    },
    fled_rats: {
      name: 'Retreat from the Rats',
      description:
        'You chose not to measure strength against the tide of teeth; you survived at the cost of pride — whoever flees today tells the story tomorrow.',
    },
    act2_brazier_scar: {
      name: 'Brazier Scar',
      description:
        'You tore the hot seal for provisions and left faith in the wax. Proof that survival also charges devotion.',
    },
    mira_camp_shadows: {
      name: 'Shadows with Mira',
      description:
        'At camp Mira shared what she hides under laughter; trust of one who sees in the dark without asking for a lantern.',
    },
    mira_cruzeiro_confidencia: {
      name: 'Confession at the Crossroads',
      description:
        'You traded weak truths at the hub; she keeps a place on your emotional map that the stone map does not have.',
    },
    mira_frost_pact: {
      name: 'Frost Pact',
      description:
        'On the ice Mira bound word with you; promise that freezes before it leaves — loyalty that does not melt at the first sun.',
    },
    mira_void_endtalk: {
      name: 'Last Talk in the Void',
      description:
        'At the arc\'s end she spoke as one who had already said goodbye to the body; you kept the sentence that does not fit in inventory.',
    },
    monk_inner_peace: {
      name: 'Inner Peace',
      description:
        'In the snow above the storm, a faceless monk left you a silence that asks no name — closure, not promise; the chest learned to breathe without trickery.',
    },
    morvayn_slain: {
      name: 'Morvayn Slain',
      description:
        'Iron on the throne; Morvayn fell by your hand. You carry the dirty cleanup of one who kills to silence a name too loud.',
    },
    pact_bound: {
      name: 'Pact of the Third Bell',
      description:
        'You signed silence on skin; the Cult inscribed itself in corruption that rises like interest on what you asked in the city\'s name.',
    },
    soul_scarred_by_seal: {
      name: 'Soul Scar of the Seal',
      description:
        'The seal broke badly; the soul kept the stitching showing. Who fights with you notices the echo that does not close.',
    },
    title_fallen_god: {
      name: 'Title: Fallen God',
      description:
        'You witnessed or consumed the title the summit denies; name that weighs like a crown of black stone — glory and curse at once.',
    },
    tomas_camp_oath: {
      name: 'Oath with Tomás',
      description:
        'By camp fire the squire bound word with you; mutual duty that smells of iron and broken bread.',
    },
    tomas_void_duty: {
      name: 'Duty in the Void',
      description:
        'In the final desert Tomás named obligation without fanfare; you carry duty that asks no applause, only fulfillment.',
    },
    vetrnax_slain: {
      name: 'Vetrnax Slain',
      description:
        'The ice lost its titan; the range remembers who closed the name in snow with blade or ritual.',
    },
    wound_mire_leg: {
      name: 'Mire Bite',
      description:
        'Luck failed in the mire; the leg remembers teeth that are not yours — rudder that lags a second when danger demands two.',
    },
  },
};

const entities = JSON.parse(fs.readFileSync(enPath, 'utf8'));

for (const [section, records] of Object.entries(EN)) {
  entities[section] ??= {};
  for (const [id, patch] of Object.entries(records)) {
    entities[section][id] = { ...entities[section][id], ...patch };
  }
}

fs.writeFileSync(enPath, JSON.stringify(entities, null, 2) + '\n');
console.log('Patched en-US entities.json');
