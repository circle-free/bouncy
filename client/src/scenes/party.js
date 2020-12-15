import Phaser from 'phaser';
import GridTable from 'phaser3-rex-plugins/plugins/gridtable.js';

import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS, NATURES, TYPES, LEVELING_RATES, MOVE_CATEGORIES } from '../enums';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;
const ARROW_GAP = 30;
const GRID_WIDTH_SCALE = 0.75;
const GRID_HEIGHT_SCALE = 0.5;

const onCellVisibleWith = (scene, data) => (cell) => {
  const bg = scene.add.rectangle(0, 0, cell.width, cell.height).setStrokeStyle(2, 0x000000).setOrigin(0);

  const txtOptions = { fontSize: '15px', fill: '#000000' };
  const txt = scene.add.text(cell.width >> 1, cell.height >> 1, data[cell.index], txtOptions).setOrigin(0.5);

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
      this.load.image(getSpeciesImageName(speciesId), `src/assets/images/species/${speciesId}.png`);
    });

    this.tableIndex = 0;
  }

  async create() {
    const screenCenterX = this.scale.width >> 1;

    this.mon = this.mons[0];

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
      eligibleLevel,
      canLearnWithLevel,
      eligibleEvolutions,
      canLearnWithEvolve,
    } = this.mon;

    const {
      id: speciesId,
      name: speciesName,
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

    const { lo, hi } = SPECIES_COLORS[speciesId];

    this.cameras.main.setBackgroundColor(lo);

    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add.text(screenCenterX, NAME_Y, speciesName.toUpperCase(), nameTextOptions).setOrigin(0.5);

    const monImage = this.add.image(screenCenterX, MON_Y, getSpeciesImageName(speciesId));
    monImage.setScale(MON_SCALE);

    const dataBoxWidth = this.scale.width * GRID_WIDTH_SCALE;
    const dataBoxHeight = this.scale.height * GRID_HEIGHT_SCALE;
    const dataBox = this.add.rectangle(0, 0, dataBoxWidth, dataBoxHeight, Number('0x' + hi.slice(1)));

    // dataBox.setStrokeStyle(4, 0x000000);
    Phaser.Display.Align.To.BottomCenter(dataBox, monImage, 0, -20);

    this.tables = [
      new GridTable(this, dataBox.x, dataBox.y, dataBox.width, dataBox.height, {
        columns: 2,
        cellsCount: 6,
        cellWidth: dataBox.width / 2,
        cellHeight: dataBox.height / 3,
        cellVisibleCallback: onCellVisibleWith(this, [
          `Health: ${currentHealth}/${maxHealth}`,
          `Nature: ${NATURES[nature]}`,
          `Types: ${TYPES[type1]}${type2 < 18 ? `, ${TYPES[type2]}` : ''}`,
          `Level: ${level}`,
          `Leveling Rate: ${LEVELING_RATES[levelingRate]}`,
          `Experience: ${experience}`,
        ]),
        mask: { padding: 2 },
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
          'Att',
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
          'Sp. Att',
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
        mask: { padding: 2 },
      }),

      new GridTable(this, dataBox.x, dataBox.y, dataBox.width, dataBox.height, {
        columns: 7,
        cellsCount: 7 * (1 + moves.length),
        cellWidth: dataBox.width / 7,
        cellHeight: dataBox.height / (1 + moves.length),
        cellVisibleCallback: onCellVisibleWith(
          this,
          ['Move', 'Cat', 'Type', 'Power', 'Acc', 'PP', 'Max PP'].concat(
            moves
              .map(({ name, category, type, power, accuracy, powerPoints, maxPowerPoints }) => [
                name.toUpperCase(),
                MOVE_CATEGORIES[category],
                TYPES[type],
                power,
                accuracy,
                powerPoints,
                maxPowerPoints,
              ])
              .flat()
          )
        ),
        mask: {
          padding: 2,
        },
      }),
    ];

    this.tables.forEach((table) => {
      table.setVisible(false);
      this.add.existing(table);
    });

    this.tables[0].setVisible(true);

    this.switchingBusy = false;

    this.previousButton = this.add.triangle(0, 0, 0, 15, 30, 0, 30, 30, 0xffffff);
    this.previousButton.setInteractive();
    this.previousButton.on('pointerdown', () => this.prevInfo());
    Phaser.Display.Align.To.LeftCenter(this.previousButton, dataBox, ARROW_GAP);

    this.nextButton = this.add.triangle(0, 0, 0, 0, 0, 30, 30, 15, 0xffffff);
    this.nextButton.setInteractive();
    this.nextButton.on('pointerdown', () => this.nextInfo());
    Phaser.Display.Align.To.RightCenter(this.nextButton, dataBox, ARROW_GAP);

    this.backButton = this.add.rectangle(10, 10, 100, 25, 0xffffff).setOrigin(0);
    this.backButton.setInteractive();
    this.backButton.once('pointerdown', () => this.exit());
    const backTextOptions = { fontSize: '15px', fill: '#000000' };
    const backText = this.add.text(0, 0, 'BACK', backTextOptions).setOrigin(0.5);
    Phaser.Display.Align.In.Center(backText, this.backButton);

    const replenishOptions = { fontSize: '15px', fill: '#000000' };
    const replenishText = this.add.text(0, 0, 'Replenish', replenishOptions).setOrigin(0.5).setDepth(1);

    const replenishButton = this.add
      .rectangle(0, 0, replenishText.width + 10, replenishText.height + 10, 0xffffff)
      .setOrigin(0);

    replenishButton.setInteractive();
    replenishButton.once('pointerdown', () => this.replenish());
    Phaser.Display.Align.To.RightCenter(replenishButton, monImage);
    Phaser.Display.Align.In.Center(replenishText, replenishButton);

    if (eligibleLevel > level) {
      const levelTextOptions = { fontSize: '15px', fill: '#000000' };
      const levelText = this.add
        .text(0, 0, `Level up to ${eligibleLevel}${canLearnWithLevel ? ' (new moves)' : ''}`, levelTextOptions)
        .setOrigin(0.5)
        .setDepth(1);

      const levelButton = this.add.rectangle(0, 0, levelText.width + 10, levelText.height + 10, 0xffffff).setOrigin(0);
      levelButton.setInteractive();
      levelButton.once('pointerdown', () => this.levelUp());
      Phaser.Display.Align.To.RightCenter(levelButton, monImage, 0, -40);
      Phaser.Display.Align.In.Center(levelText, levelButton);
    }

    if (eligibleEvolutions.length) {
      const evolveTextOptions = { fontSize: '15px', fill: '#000000' };
      const evolveText = this.add
        .text(
          0,
          0,
          `Evolve to ${eligibleEvolutions[0].name}${canLearnWithEvolve ? ' (new moves)' : ''}`,
          evolveTextOptions
        )
        .setOrigin(0.5)
        .setDepth(1);

      const evolveButton = this.add
        .rectangle(0, 0, evolveText.width + 10, evolveText.height + 10, 0xffffff)
        .setOrigin(0);
      evolveButton.setInteractive();
      evolveButton.once('pointerdown', () => this.evolve());
      Phaser.Display.Align.To.RightCenter(evolveButton, monImage, 0, 40);
      Phaser.Display.Align.In.Center(evolveText, evolveButton);
    }
  }

  prevInfo() {
    if (this.switchingBusy) return;

    this.switchingBusy = true;
    const oldIndex = this.tableIndex;
    const newIndex = this.tableIndex - 1;
    this.tableIndex = newIndex < 0 ? this.tables.length - 1 : newIndex;
    this.tables[oldIndex].setVisible(false);
    this.tables[this.tableIndex].setVisible(true);
    this.switchingBusy = false;
  }

  nextInfo() {
    if (this.switchingBusy) return;

    this.switchingBusy = true;
    const oldIndex = this.tableIndex;
    const newIndex = this.tableIndex + 1;
    this.tableIndex = newIndex >= this.tables.length ? 0 : newIndex;
    this.tables[oldIndex].setVisible(false);
    this.tables[this.tableIndex].setVisible(true);
    this.switchingBusy = false;
  }

  exit() {
    this.nextButton.removeAllListeners();
    this.previousButton.removeAllListeners();
    this.scene.start('Menu');
  }

  replenish() {
    window.optimisticMonMon.replenish(0);
    this.nextButton.removeAllListeners();
    this.previousButton.removeAllListeners();
    this.scene.restart();
  }

  levelUp() {
    const { canLevel } = this.mon;

    if (!canLevel) return;

    this.scene.start('MonGrow', { mode: 'level', monIndex: 0 });
  }

  evolve() {
    const { canEvolve, evolveLearnableMoves } = this.mon;

    if (!canEvolve) return;

    this.scene.start('MonGrow', { mode: 'evolve', monIndex: 0 });
  }
}
