import Phaser from 'phaser';
import StatRadar from '../game-objects/stat-radar';

import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS, NATURES, TYPES, LEVELING_RATES, MOVE_CATEGORIES } from '../enums';

const MON_SCALE = 1;
const PADDING = 0;
const FONT_FAMILY = 'Helvetica, sans-serif';
const NAME_Y = 100;

export default class PartyScene extends Phaser.Scene {
  constructor() {
    super('Party');
  }

  preload() {
    this.mons = window.optimisticMonMon.party.mons;

    this.mons.forEach(({ speciesId }) => {
      this.load.image(getSpeciesImageName(speciesId), `src/assets/images/species/${speciesId}.png`);
    });
  }

  async create() {
    const screenCenterX = this.scale.width >> 1;
    const screenCenterY = this.scale.height >> 1;
    const landscapeMode = this.scale.width > this.scale.height;

    this.mon = this.mons[0];

    const { species, level, eligibleLevel, canLearnWithLevel, eligibleEvolutions, canLearnWithEvolve } = this.mon;

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

    const { hiHex } = SPECIES_COLORS[speciesId];
    this.cameras.main.setBackgroundColor(hiHex);

    const monX = landscapeMode ? screenCenterX / 2 : screenCenterX;
    const monY = landscapeMode ? screenCenterY : screenCenterY / 2;
    const monImage = this.add.image(monX, monY, getSpeciesImageName(speciesId)).setScale(MON_SCALE).setOrigin(0.5);

    const nameTextOptions = { fontSize: '6em', fill: '#000000', fontFamily: FONT_FAMILY };
    this.nameLabel = this.add.text(monX, monY - 200, speciesName.toUpperCase(), nameTextOptions).setOrigin(0.5);

    const statX = landscapeMode ? monX + screenCenterX : screenCenterX;
    const statY = landscapeMode ? monY : monY + screenCenterY;
    const radarOptions = {
      size: landscapeMode ? this.scale.height * 0.6 : this.scale.width * 0.7,
      fontFamily: FONT_FAMILY,
    };
    const statRadar = new StatRadar(this, statX, statY, this.mon, radarOptions);

    const backTextOptions = { fontSize: '4em', fill: '#000000', fontFamily: FONT_FAMILY };
    const backText = this.add
      .text(20, 20, 'BACK', backTextOptions)
      .setOrigin(0)
      .setInteractive()
      .once('pointerdown', () => this.exit());

    const replenishOptions = { fontSize: '4em', fill: '#000000', fontFamily: FONT_FAMILY };
    const replenishText = this.add
      .text(monX, monY + 200, 'REPLENISH', replenishOptions)
      .setOrigin(0.5)
      .setInteractive()
      .once('pointerdown', () => this.replenish());

    if (eligibleLevel > level) {
      const levelTextOptions = { fontSize: '4em', fill: '#000000', fontFamily: FONT_FAMILY };
      const levelText = this.add
        .text(
          monX,
          monY + 250,
          `Level up to ${eligibleLevel}${canLearnWithLevel ? ' (new moves)' : ''}`,
          levelTextOptions
        )
        .setOrigin(0.5)
        .setInteractive()
        .once('pointerdown', () => this.levelUp());
    }

    if (eligibleEvolutions.length) {
      const evolveTextOptions = { fontSize: '4em', fill: '#000000' };
      const evolveText = this.add
        .text(
          monX,
          monY + 300,
          `Evolve to ${eligibleEvolutions[0].name}${canLearnWithEvolve ? ' (new moves)' : ''}`,
          evolveTextOptions
        )
        .setOrigin(0.5)
        .setInteractive()
        .once('pointerdown', () => this.evolve());
    }
  }

  exit() {
    this.scene.start('Menu');
  }

  replenish() {
    window.optimisticMonMon.replenish(0);
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
