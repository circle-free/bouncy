import Phaser from 'phaser';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;
const LEFT_COLUMN_X = 100;
const LEFT_COLUMN_Y = 240;



const MON_STATS_Y = 60;
const SELECTION_GAP = 80;

const getBackgroundColor = (speciesId) => {
  switch(speciesId) {
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
  switch(speciesId) {
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

const getSpeciesImageName = (speciesId) => `species-${speciesId}`;

export default class PartyScene extends Phaser.Scene {
  constructor() {
    super('Party');
  }

  preload() {
    this.mon = window.optimisticMonMon.party.mons[0];
    this.load.image('mon', `src/assets/images/species/${this.mon.speciesId}.png`);
  }

  create() {
    const screenCenterX = this.scale.width >> 1;

    const {
      species,
      level,
      nature,
      experience,
      IVs,
      EVs,
      currentHealth,
      maxHealth,
      moves,
    } = this.mon;

    const {
      id: speciesId,
      name: speciesName,
      levelingRate,
      type1,
      type2,
      baseAttack,
      baseDefense,
      baseSpeed,
      baseSpecialAttack,
      baseSpecialDefense,
      baseHealth,
    } = species;

    this.cameras.main.setBackgroundColor(getBackgroundColor(speciesId));

    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add.text(screenCenterX, NAME_Y, speciesName.toUpperCase(), nameTextOptions).setOrigin(0.5);

    const currentMonImage = this.add.image(screenCenterX, MON_Y, getSpeciesImageName(speciesId));
    currentMonImage.setScale(MON_SCALE);

    const textOptions = { fontSize: '28px', fill: '#ffffff' };

    // Current Health
    const monStatsButton = this.add.text(LEFT_COLUMN_X, LEFT_COLUMN_Y, 'Health', textOptions).setOrigin(0.5);
    // monStatsButton.setInteractive();
    // monStatsButton.on('pointerdown', () => this.showMonStats());

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

    

    // const monStatsButton = this.add.text(screenCenterX, MON_STATS_Y, 'MON STATS', textOptions).setOrigin(0.5);
    // monStatsButton.setInteractive();
    // monStatsButton.on('pointerdown', () => this.showMonStats());

    // const levelUpButton = this.add.text(screenCenterX, MON_STATS_Y + (2 * SELECTION_GAP), 'LEVEL UP MON', textOptions).setOrigin(0.5);
    // levelUpButton.setInteractive();
    // levelUpButton.on('pointerdown', () => this.levelUp());

    // const levelUpAndTeachButton = this.add.text(screenCenterX, MON_STATS_Y + (3 * SELECTION_GAP), 'LEVEL UP AND TEACH MON', textOptions).setOrigin(0.5);
    // levelUpAndTeachButton.setInteractive();
    // levelUpAndTeachButton.on('pointerdown', () => this.levelUpAndTeach());

    // const evolveButton = this.add.text(screenCenterX, MON_STATS_Y + (4 * SELECTION_GAP), 'EVOLVE MON', textOptions).setOrigin(0.5);
    // evolveButton.setInteractive();
    // evolveButton.on('pointerdown', () => this.evolve());

    // const evolveAndTeachButton = this.add.text(screenCenterX, MON_STATS_Y + (5 * SELECTION_GAP), 'EVOLVE AND TEACH MON', textOptions).setOrigin(0.5);
    // evolveAndTeachButton.setInteractive();
    // evolveAndTeachButton.on('pointerdown', () => this.evolveAndTeach());
  }

  showMonStats() {
    console.log('showMonStats');
  }

  levelUp() {
    console.log('levelUp');
  }

  levelUpAndTeach() {
    console.log('levelUpAndTeach');
  }

  evolve() {
    console.log('evolve');
  }

  evolveAndTeach() {
    console.log('evolveAndTeach');
  }

  update() {
  }
}
