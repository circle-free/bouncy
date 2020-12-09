import Phaser from 'phaser';
import { getSpeciesImageName } from '../utils';
import GridTable from 'phaser3-rex-plugins/plugins/gridtable.js';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;
const ARROW_GAP = 30;

const NATURE = {
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

const TYPES = {
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

const LEVELING_RATE = {
  0: 'fast',
  1: 'medium fast',
  2: 'medium slow',
  3: 'slow',
};

// const MON_STATS_Y = 60;
// const SELECTION_GAP = 80;

const getBackgroundColor = (speciesId) => {
  switch (speciesId) {
    case 1:
      return 0x48685a; // from 0x91d1b4
    case 4:
      return 0x795842; // from 0xf3b084
    case 7:
      return 0x42636b; // from 0x84C6D6
    default:
      return 0x000000;
  }
};

const getHighlightColor = (speciesId) => {
  switch (speciesId) {
    case 1:
      return 0xc8e8d9; // from 0x91d1b4
    case 4:
      return 0xf9d7c1; // from 0xf3b084
    case 7:
      return 0xc1e2ea; // from 0x84C6D6
    default:
      return 0x000000;
  }
};

var onCellVisibleWith = (scene, data) => (cell) => {
  const bg = scene.add
    .rectangle(0, 0, cell.width, cell.height)
    .setStrokeStyle(2, 0x000000)
    .setOrigin(0);

  const txtOptions = { fontSize: '15px', fill: '#000000' };
  const txt = scene.add
    .text(cell.width / 2, cell.height / 2, data[cell.index], txtOptions)
    .setOrigin(0.5);

  const container = scene.add.container(0, 0, [bg, txt]);

  cell.setContainer(container);
};

export default class PartyScene extends Phaser.Scene {
  constructor() {
    super('Party');
  }

  preload() {
    this.mons = window.optimisticMonMon.party.mons;

    this.mons.forEach(({ speciesId }) => {
      this.load.image('mon', `src/assets/images/species/${speciesId}.png`);
    });

    this.dataIndex = 0;
  }

  create() {
    const mon = this.mons[0];

    const {
      speciesId: id,
      species: { name },
    } = mon;

    const data = [
      [
        `Health: ${mon.currentHealth}/${mon.maxHealth}`,
        `Nature: ${NATURE[mon.nature]}`,
        `Types: ${TYPES[mon.species.type1]}, ${TYPES[mon.species.type2]}`,
        `Lvl: ${mon.level}`,
        `Lvling Rate: ${LEVELING_RATE[mon.species.levelingRate]}`,
        `Experience: ${mon.experience}`,
      ],
    ];

    this.cameras.main.setBackgroundColor(getBackgroundColor(id));

    const screenCenterX = this.scale.width >> 1;

    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add
      .text(screenCenterX, NAME_Y, name.toUpperCase(), nameTextOptions)
      .setOrigin(0.5);

    const monImage = this.add.image(
      screenCenterX,
      MON_Y,
      getSpeciesImageName(id)
    );
    monImage.setScale(MON_SCALE);

    const hightlightColor = getHighlightColor(id);

    const dataBox = this.add.rectangle(
      0,
      0,
      this.scale.width * 0.66,
      this.scale.height * 0.45,
      hightlightColor
    );
    // dataBox.setStrokeStyle(4, 0x000000);
    Phaser.Display.Align.To.BottomCenter(dataBox, monImage);

    this.switchingBusy = false;

    const previousButton = this.add.triangle(
      0,
      0,
      0,
      15,
      30,
      0,
      30,
      30,
      0xffffff
    );
    Phaser.Display.Align.To.LeftCenter(previousButton, dataBox, ARROW_GAP);
    previousButton.setInteractive();

    previousButton.on('pointerdown', () => {
      const newIndex = this.dataIndex - 1;

      if (newIndex <  0) 
    });

    const nextButton = this.add.triangle(0, 0, 0, 0, 0, 30, 30, 15, 0xffffff);
    Phaser.Display.Align.To.RightCenter(nextButton, dataBox, ARROW_GAP);
    nextButton.setInteractive();

    const table = new GridTable(
      this,
      dataBox.x,
      dataBox.y,
      dataBox.width,
      dataBox.height,
      {
        columns: 2,
        cellsCount: 6,
        cellWidth: dataBox.width / 2,
        cellHeight: dataBox.height / 3,
        cellVisibleCallback: onCellVisibleWith(this, [
          `Health: ${mon.currentHealth}/${mon.maxHealth}`,
          `Nature: ${NATURE[mon.nature]}`,
          `Types: ${TYPES[mon.species.type1]}, ${TYPES[mon.species.type2]}`,
          `Lvl: ${mon.level}`,
          `Lvling Rate: ${LEVELING_RATE[mon.species.levelingRate]}`,
          `Experience: ${mon.experience}`,
        ]),
        mask: {
          padding: 2,
        },
      }
    );

    this.add.existing(table);
  }
  // const screenCenterX = this.scale.width >> 1;

  // const {
  //   species,
  //   level,
  //   nature,
  //   experience,
  //   IVs,
  //   EVs,
  //   currentHealth,
  //   maxHealth,
  //   moves,
  // } = this.mon;

  // const {
  //   id: speciesId,
  //   name: speciesName,
  //   levelingRate,
  //   type1,
  //   type2,
  //   baseAttack,
  //   baseDefense,
  //   baseSpeed,
  //   baseSpecialAttack,
  //   baseSpecialDefense,
  //   baseHealth,
  // } = species;

  // this.cameras.main.setBackgroundColor(getBackgroundColor(speciesId));

  // const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
  // this.nameLabel = this.add
  //   .text(screenCenterX, NAME_Y, speciesName.toUpperCase(), nameTextOptions)
  //   .setOrigin(0.5);

  // const currentMonImage = this.add.image(
  //   screenCenterX,
  //   MON_Y,
  //   getSpeciesImageName(speciesId)
  // );
  // currentMonImage.setScale(MON_SCALE);

  // Current Health
  // Nature
  // Types
  // Level (with evolve indicator/button)
  // Leveling Rate
  // Experience (with level up indicator/button)
  // Bases
  // IVs
  // EVs
  // Stats
  // Moves (with learn indicator)

  // replenish button

  //   const textOptions = { fontSize: '28px', fill: '#ffffff' };

  //   const monStatsButton = this.add
  //     .text(screenCenterX, MON_STATS_Y, 'MON STATS', textOptions)
  //     .setOrigin(0.5);
  //   monStatsButton.setInteractive();
  //   monStatsButton.on('pointerdown', () => this.showMonStats());

  //   const levelUpButton = this.add
  //     .text(
  //       screenCenterX,
  //       MON_STATS_Y + 2 * SELECTION_GAP,
  //       'LEVEL UP MON',
  //       textOptions
  //     )
  //     .setOrigin(0.5);
  //   levelUpButton.setInteractive();
  //   levelUpButton.on('pointerdown', () => this.levelUp());

  //   const levelUpAndTeachButton = this.add
  //     .text(
  //       screenCenterX,
  //       MON_STATS_Y + 3 * SELECTION_GAP,
  //       'LEVEL UP AND TEACH MON',
  //       textOptions
  //     )
  //     .setOrigin(0.5);
  //   levelUpAndTeachButton.setInteractive();
  //   levelUpAndTeachButton.on('pointerdown', () => this.levelUpAndTeach());

  //   const evolveButton = this.add
  //     .text(
  //       screenCenterX,
  //       MON_STATS_Y + 4 * SELECTION_GAP,
  //       'EVOLVE MON',
  //       textOptions
  //     )
  //     .setOrigin(0.5);
  //   evolveButton.setInteractive();
  //   evolveButton.on('pointerdown', () => this.evolve());

  //   const evolveAndTeachButton = this.add
  //     .text(
  //       screenCenterX,
  //       MON_STATS_Y + 5 * SELECTION_GAP,
  //       'EVOLVE AND TEACH MON',
  //       textOptions
  //     )
  //     .setOrigin(0.5);
  //   evolveAndTeachButton.setInteractive();
  //   evolveAndTeachButton.on('pointerdown', () => this.evolveAndTeach());
  // }

  // showMonStats() {
  //   console.log('showMonStats');
  // }

  // levelUp() {
  //   console.log('levelUp');
  // }

  // levelUpAndTeach() {
  //   console.log('levelUpAndTeach');
  // }

  // evolve() {
  //   console.log('evolve');
  // }

  // evolveAndTeach() {
  //   console.log('evolveAndTeach');
  // }

  // update() {}
}
