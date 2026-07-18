# ASCII Art in The Silent Dungeon

This document describes how ASCII art is implemented and used in The Silent Dungeon.

## Overview

The game uses ASCII art extensively to create atmosphere and visual storytelling. ASCII art is used for:
- **Scene backgrounds** - landscapes, environments, and atmospheric backdrops
- **Enemy sprites** - visual representations of monsters and foes
- **Item sprites** - icons for weapons, armor, and objects

## Technical Implementation

### File Organization

ASCII art files are stored as `.txt` files in the campaign directory structure:

```
src/campaigns/calvario/ascii/
├── scenes/           # Background art for narrative scenes
│   ├── act1/        # Act 1 scenes (dungeon mouth, character selection)
│   ├── act2/        # Act 2 scenes (catacombs, camp, merchant)
│   ├── act3/        # Act 3 scenes (depths, shrines, corridors)
│   ├── act4/        # Act 4 scenes (throne room, endings)
│   ├── act5/        # Act 5 scenes (summit, dragon encounters)
│   ├── act6/        # Act 6 scenes (void, mirror realm)
│   └── act8/        # Act 8 scenes (forge, final battles)
├── sprites/
│   ├── enemies/     # Enemy combat sprites
│   └── items/       # Item icons
├── art.ts           # Scene art loader
├── enemySprites.ts  # Enemy sprite loader
└── itemSprites.ts   # Item sprite loader
```

### Loading System

ASCII art is loaded using Vite's `import.meta.glob` feature, which allows dynamic importing of all `.txt` files in a directory:

```typescript
const sceneArtRaw = import.meta.glob<string>('./scenes/**/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
```

The filename (without `.txt` extension) becomes the key used to reference the art in the game's frontmatter and data files.

### Usage in Game

- **Scene art**: Referenced via `artKey` in scene frontmatter
- **Enemy sprites**: Referenced by enemy ID in enemy data files
- **Item sprites**: Referenced by item ID in item data files

## Braille ASCII Conversion

The game includes a custom Braille ASCII conversion system adapted from [Braille-ASCII-Art](https://github.com/LachlanArthur/Braille-ASCII-Art) (MIT license).

### Features

- Converts images to Braille Unicode characters (U+2800 range)
- Multiple dithering algorithms: threshold, Floyd-Steinberg, Stucki, Atkinson
- Configurable width, threshold, and inversion
- Preserves aspect ratio through proper canvas sizing

### Implementation

The conversion system is in `src/dev/brailleAsciiFromImage.ts` and includes:
- Greyscale conversion using luminosity
- Dithering for better detail preservation
- Braille pattern generation (2×4 dots per character)

### Dithering Algorithms

- **threshold**: Simple binary threshold
- **floydSteinberg**: Classic error diffusion dithering
- **stucki**: More precise error diffusion
- **atkinson**: Balanced error diffusion

## Current ASCII Art Collection

### Scene Art (44+ files)

Examples include:
- `dungeon_mouth.txt` - The iconic dungeon entrance
- `pick_archer.txt`, `pick_cleric.txt`, `pick_knight.txt`, `pick_mage.txt` - Character selection
- `catacomb.txt` - Catacomb environments
- `vigilia_camp.txt` - Camp/rest scenes
- `throne.txt` - Throne room scenes
- `game_over.txt` - Game over screen
- `victory_peace.txt` - Victory ending

### Enemy Sprites (30+ files)

Examples include:
- `act1_mirror_twin.txt` - Mirror Twin boss
- `act1_rat_swarm.txt` - Rat Swarm enemy
- `act2_skeleton.txt` - Skeleton enemy
- `act3_stone_guard.txt` - Stone Guard
- `act4_morvayn_p1.txt`, `act4_morvayn_p2.txt` - Morvayn boss phases
- `act5_ice_dragon_p1.txt`, `act5_ice_dragon_p2.txt` - Ice Dragon boss
- `act6_shadow_self.txt` - Shadow Self enemy
- `act8_forge_colossus.txt` - Final boss

### Item Sprites (10+ files)

Examples include:
- `chain_shirt.txt` - Chain shirt armor
- `cult_sickle.txt` - Cult sickle weapon
- `depths_chart.txt` - Map item
- `ash_veil.txt` - Ash veil accessory

## Creating New ASCII Art

### Manual Creation

1. Create a new `.txt` file in the appropriate directory
2. Use the filename as the reference key (e.g., `new_scene.txt` → key: `new_scene`)
3. Use Braille characters or standard ASCII characters
4. Test in-game by referencing the key in scene/enemy/item data

### Using the Braille Converter

The game includes a development tool for converting images to Braille ASCII:

```typescript
import { brailleAsciiFromImageSource, BrailleAsciiOptions } from './src/dev/brailleAsciiFromImage';

const options: BrailleAsciiOptions = {
  asciiWidth: 80,        // Character width
  ditherer: 'floydSteinberg',  // Dithering algorithm
  threshold: 128,        // Binarization threshold (0-255)
  invert: false,         // Invert black/white
};

const ascii = brailleAsciiFromImageSource(imageElement, options);
```

## Best Practices

- **Width**: Keep scene art around 80-100 characters wide for optimal display
- **Aspect ratio**: Maintain proper aspect ratio (Braille cells are 2×4, making them taller than wide)
- **Contrast**: Ensure high contrast for better readability
- **Consistency**: Match the dark fantasy aesthetic of the game
- **Testing**: Always test ASCII art in the actual game interface

## External Tools and Resources

### ASCII Art Generators
- [Emoji Combos - Monster](https://emojicombos.com/monster) - Monster-themed ASCII art
- [Bejamas AI ASCII Art Generator](https://bejamas.com/tools/ai-ascii-art-generator) - AI-powered ASCII generation
- [Braille-ASCII-Art](https://lachlanarthur.github.io/Braille-ASCII-Art/) - Braille pattern converter

### Reference Material
- [Braille Patterns Unicode Block](https://en.wikipedia.org/wiki/Braille_Patterns) - U+2800 to U+28FF
- [ASCII Art History](https://en.wikipedia.org/wiki/ASCII_art) - Background on ASCII art

## Technical Notes

- **File encoding**: All `.txt` files should use UTF-8 encoding
- **Line endings**: Use LF (Unix-style) line endings
- **Character set**: Primarily Braille Unicode (U+2800+) for density, with standard ASCII for accents
- **Performance**: All ASCII art is loaded eagerly at build time for runtime performance

## Future Enhancements

Potential improvements to the ASCII art system:
- Animated ASCII art sequences
- Dynamic ASCII generation based on game state
- Color support for terminal-based interfaces
- Procedural ASCII generation for infinite variety
