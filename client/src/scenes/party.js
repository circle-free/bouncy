import Phaser from 'phaser';
import StatRadar from '../game-objects/stat-radar';
import Button from '../game-objects/button';

import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS } from '../enums';

const MON_SCALE = 1;
const FONT_FAMILY = 'Helvetica, sans-serif';

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

  create() {
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
      size: landscapeMode ? this.scale.width * 0.3 : this.scale.width * 0.7,
      fontFamily: FONT_FAMILY,
    };

    const statRadar = new StatRadar(this, statX, statY, this.mon, radarOptions);

    const backButton = new Button(this, 60, 60, 'Back', () => this.exit());

    const replenishButton = new Button(this, monX, monY + 200, 'Replenish', () => this.replenish());

    if (eligibleLevel > level) {
      const levelText = `Level up to ${eligibleLevel}${canLearnWithLevel ? ' (new moves)' : ''}`;
      const levelButton = new Button(this, monX, monY + 270, levelText, () => this.levelUp());
    }

    if (eligibleEvolutions.length) {
      const evolveText = `Evolve to ${eligibleEvolutions[0].name}${canLearnWithEvolve ? ' (new moves)' : ''}`;
      const evolveY = eligibleLevel > level ? monY + 340 : monY + 270;
      const evolveButton = new Button(this, monX, evolveY, evolveText, () => this.evolve());
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
