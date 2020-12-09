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
  0: 'Fast',
  1: 'Medium Fast',
  2: 'Medium Slow',
  3: 'Slow',
};

const MOVE_CATEGORY = {
  0: 'Physical',
  1: 'Special',
  2: 'Status',
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

    this.tableIndex = 0;
  }

  create() {
    const mon = this.mons[0];

    const {
      speciesId: id,
      species: { name },
    } = mon;

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
      this.scale.width * 0.75,
      this.scale.height * 0.5,
      hightlightColor
    );
    // dataBox.setStrokeStyle(4, 0x000000);
    Phaser.Display.Align.To.BottomCenter(dataBox, monImage, 0, -20);

    const {
      IVs,
      EVs,
      stats,
      species,
      currentHealth,
      maxHealth,
      nature,
      experience,
      level,
      moves,
      canLevel,
      eligibleLevel,
      eligibleEvolutions,
      canEvolve,
    } = mon;

    const {
      type1,
      type2,
      levelingRate,
      baseAttack,
      baseDefense,
      baseSpeed,
      baseSpecialAttack,
      baseSpecialDefense,
      baseHealth,
    } = species;

    const tables = [
      new GridTable(this, dataBox.x, dataBox.y, dataBox.width, dataBox.height, {
        columns: 2,
        cellsCount: 6,
        cellWidth: dataBox.width / 2,
        cellHeight: dataBox.height / 3,
        cellVisibleCallback: onCellVisibleWith(this, [
          `Health: ${currentHealth}/${maxHealth}`,
          `Nature: ${NATURE[nature]}`,
          `Types: ${TYPES[type1]}, ${TYPES[type2]}`,
          `Lvl: ${level}`,
          `Lvling Rate: ${LEVELING_RATE[levelingRate]}`,
          `Experience: ${experience}`,
        ]),
        mask: {
          padding: 2,
        },
      }),

      new GridTable(this, dataBox.x, dataBox.y, dataBox.width, dataBox.height, {
        columns: 5,
        cellsCount: 35,
        cellWidth: dataBox.width / 5,
        cellHeight: dataBox.height / 7,
        cellVisibleCallback: onCellVisibleWith(this, [
          '',
          'Base',
          'IV',
          'EV',
          'Stat',
          'Attk',
          baseAttack,
          IVs.attack,
          EVs.attack,
          stats.attack,
          'Def',
          baseDefense,
          IVs.defense,
          EVs.defense,
          stats.defense,
          'Speed',
          baseSpeed,
          IVs.speed,
          EVs.speed,
          stats.speed,
          'Sp. Attk',
          baseSpecialAttack,
          IVs.specialAttack,
          EVs.specialAttack,
          stats.specialAttack,
          'Sp. Def',
          baseSpecialDefense,
          IVs.specialDefense,
          EVs.specialDefense,
          stats.specialDefense,
          'Health',
          baseHealth,
          IVs.health,
          EVs.health,
          stats.health,
        ]),
        mask: {
          padding: 2,
        },
      }),

      new GridTable(this, dataBox.x, dataBox.y, dataBox.width, dataBox.height, {
        columns: 7,
        cellsCount: 7 * (1 + moves.length),
        cellWidth: dataBox.width / 7,
        cellHeight: dataBox.height / (1 + moves.length),
        cellVisibleCallback: onCellVisibleWith(
          this,
          ['MOVE', 'CAT', 'TYPE', 'POW', 'ACC', 'PP', 'MAX PP'].concat(
            moves
              .map(
                ({
                  name,
                  category,
                  type,
                  power,
                  accuracy,
                  powerPoints,
                  maxPowerPoints,
                }) => [
                  name.toUpperCase(),
                  MOVE_CATEGORY[category],
                  TYPES[type],
                  power,
                  accuracy,
                  powerPoints,
                  maxPowerPoints,
                ]
              )
              .flat()
          )
        ),
        mask: {
          padding: 2,
        },
      }),
    ];

    tables.forEach((table) => {
      table.setVisible(false);
      this.add.existing(table);
    });

    tables[0].setVisible(true);

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
      if (this.switchingBusy) {
        return;
      }

      this.switchingBusy = true;

      const oldIndex = this.tableIndex;

      const newIndex = this.tableIndex - 1;

      this.tableIndex = newIndex < 0 ? tables.length - 1 : newIndex;

      tables[oldIndex].setVisible(false);

      tables[this.tableIndex].setVisible(true);

      this.switchingBusy = false;
    });

    const nextButton = this.add.triangle(0, 0, 0, 0, 0, 30, 30, 15, 0xffffff);
    Phaser.Display.Align.To.RightCenter(nextButton, dataBox, ARROW_GAP);
    nextButton.setInteractive();

    nextButton.on('pointerdown', () => {
      if (this.switchingBusy) {
        return;
      }

      this.switchingBusy = true;

      const oldIndex = this.tableIndex;

      const newIndex = this.tableIndex + 1;

      this.tableIndex = newIndex >= tables.length ? 0 : newIndex;

      tables[oldIndex].setVisible(false);

      tables[this.tableIndex].setVisible(true);

      this.switchingBusy = false;
    });

    const backButton = this.add
      .rectangle(10, 10, 100, 25, 0xffffff)
      .setOrigin(0);
    backButton.setInteractive();

    const backTextOptions = { fontSize: '15px', fill: '#000000' };
    const backText = this.add
      .text(0, 0, 'BACK', backTextOptions)
      .setOrigin(0.5);
    Phaser.Display.Align.In.Center(backText, backButton);

    backButton.once('pointerdown', () => {
      nextButton.removeAllListeners();
      previousButton.removeAllListeners();
      this.scene.start('Menu');
    });

    const replenishOptions = { fontSize: '15px', fill: '#000000' };
    const replenishText = this.add
      .text(0, 0, 'Replenish', replenishOptions)
      .setOrigin(0.5)
      .setDepth(1);

    const replenishButton = this.add
      .rectangle(
        0,
        0,
        replenishText.width + 10,
        replenishText.height + 10,
        0xffffff
      )
      .setOrigin(0);
    replenishButton.setInteractive();

    Phaser.Display.Align.To.RightCenter(replenishButton, monImage);
    Phaser.Display.Align.In.Center(replenishText, replenishButton);

    replenishButton.once('pointerdown', () => {
      console.log('replenish');
      window.optimisticMonMon.replenish(0);
      nextButton.removeAllListeners();
      previousButton.removeAllListeners();
      this.scene.restart();
    });

    if (canLevel) {
      const levelTextOptions = { fontSize: '15px', fill: '#000000' };
      const levelText = this.add
        .text(0, 0, `Level up to ${eligibleLevel}`, levelTextOptions)
        .setOrigin(0.5)
        .setDepth(1);

      const levelButton = this.add
        .rectangle(0, 0, levelText.width + 10, levelText.height + 10, 0xffffff)
        .setOrigin(0);
      levelButton.setInteractive();

      Phaser.Display.Align.To.RightCenter(levelButton, monImage, 0, -40);
      Phaser.Display.Align.In.Center(levelText, levelButton);

      levelButton.once('pointerdown', () => {
        console.log('level');
        nextButton.removeAllListeners();
        previousButton.removeAllListeners();
        window.optimisticMonMon.levelUp(0);
        this.scene.restart();
      });
    }

    if (canEvolve) {
      const evolveTextOptions = { fontSize: '15px', fill: '#000000' };
      const evolveText = this.add
        .text(0, 0, `Evolve to ${eligibleEvolutions[0]}`, evolveTextOptions)
        .setOrigin(0.5)
        .setDepth(1);

      const evolveButton = this.add
        .rectangle(
          0,
          0,
          evolveText.width + 10,
          evolveText.height + 10,
          0xffffff
        )
        .setOrigin(0);
      evolveButton.setInteractive();

      Phaser.Display.Align.To.RightCenter(evolveButton, monImage, 0, 40);
      Phaser.Display.Align.In.Center(evolveText, evolveButton);

      evolveButton.once('pointerdown', () => {
        console.log('evolve');
        nextButton.removeAllListeners();
        previousButton.removeAllListeners();
        window.optimisticMonMon.evolve(0);
        this.scene.restart();
      });
    }
  }
}
