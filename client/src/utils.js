export function getSpeciesImageName(speciesId) {
  return `species-${speciesId}`;
}

export function getBackgroundColor(speciesId) {
  switch (speciesId) {
    case 1:
      return 0x48685a; // from 0x91d1b4
    case 4:
      return 0x795842; // from 0xf3b084
    case 7:
      return 0x42636b; // from 0x84C6D6
    case 25:
      return 0x7b7242; // from 0xF6E484
    default:
      return 0x000000;
  }
};

export function getHighlightColor(speciesId) {
  switch (speciesId) {
    case 1:
      return 0xc8e8d9; // from 0x91d1b4
    case 4:
      return 0xf9d7c1; // from 0xf3b084
    case 7:
      return 0xc1e2ea; // from 0x84C6D6
    case 25:
      return 0xfaf1c1; // from 0xF6E484
    default:
      return 0x000000;
  }
};

export const NATURE = {
  0: 'Hardy',
  1: 'Lonely',
  2: 'Brave',
  3: 'Adamant',
  4: 'Naughty',
  5: 'Bold',
  6: 'Docile',
  7: 'Relaxed',
  8: 'Impish',
  9: 'Lax',
  10: 'Timid',
  11: 'Hasty',
  12: 'Serious',
  13: 'Jolly',
  14: 'Naive',
  15: 'Modest',
  16: 'Mild',
  17: 'Quiet',
  18: 'Bashful',
  19: 'Rash',
  20: 'Calm',
  21: 'Gentle',
  22: 'Sassy',
  23: 'Careful',
  24: 'Quirky',
};

export const TYPES = {
  0: 'Normal',
  1: 'Fighting',
  2: 'Flying',
  3: 'Poison',
  4: 'Ground',
  5: 'Rock',
  6: 'Bug',
  7: 'Ghost',
  8: 'Steel',
  9: 'Fire',
  10: 'Water',
  11: 'Grass',
  12: 'Electric',
  13: 'Psychic',
  14: 'Ice',
  15: 'Dragon',
  16: 'Dark',
  17: 'Fairy',
  18: '',
};

export const LEVELING_RATE = {
  0: 'Fast',
  1: 'Medium Fast',
  2: 'Medium Slow',
  3: 'Slow',
};

export const MOVE_CATEGORY = {
  0: 'Physical',
  1: 'Special',
  2: 'Status',
};
