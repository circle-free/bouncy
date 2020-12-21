import Phaser from 'phaser';
import LineSlider from '../game-objects/line-slider';
import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS, NATURES } from '../enums';
import { move } from '../animations/common';

const MON_SCALE = 0.75;
const ARROW_GAP = 50;
const PADDING = 0;

const getNewMonIndex = (scene, direction) => {
  const newMonIndex = direction === 'previous' ? scene.currentMonIndex - 1 : scene.currentMonIndex + 1;

  if (newMonIndex < 0) {
    return scene.starterSpecies.length - 1;
  }

  if (newMonIndex >= scene.starterSpecies.length) {
    return 0;
  }

  return newMonIndex;
};

const setColors = (scene, id) => {
  const { lo, hiHex } = SPECIES_COLORS[id];

  scene.cameras.main.setBackgroundColor(hiHex);
  scene.natureSlider.setCursorColor(lo);
  scene.attackSlider.setCursorColor(lo);
  scene.defenseSlider.setCursorColor(lo);
  scene.speedSlider.setCursorColor(lo);
  scene.specialAttackSlider.setCursorColor(lo);
  scene.specialDefenseSlider.setCursorColor(lo);
  scene.healthSlider.setCursorColor(lo);
  scene.confirmButton.setFillStyle(lo);
};

const switchMonAnimation = (scene, direction) => {
  if (scene.switchingMonBusy) return;

  scene.switchingMonBusy = true;

  const monY = scene.currentMonImage.y;

  const targetX =
    direction === 'previous'
      ? scene.currentMonImage.x - scene.scale.width
      : scene.currentMonImage.x + scene.scale.width;

  const newMonIndex = getNewMonIndex(scene, direction);

  const { id, name } = scene.starterSpecies[newMonIndex];

  const newMonStartingX =
    direction === 'previous' ? scene.scale.width + scene.currentMonImage.width : 0 - scene.currentMonImage.width;

  const newMonImage = scene.add.image(newMonStartingX, monY, getSpeciesImageName(id));
  newMonImage.setScale(MON_SCALE);

  return Promise.all([
    move(scene, scene.currentMonImage, { x: targetX, y: monY }),
    move(scene, newMonImage, { x: scene.scale.width >> 1, y: monY }),
  ]).then(() => {
    scene.nameLabel.setText(name.toUpperCase());

    scene.currentMonImage.destroy();
    scene.currentMonIndex = newMonIndex;
    scene.currentMonImage = newMonImage;

    setColors(scene, id);

    scene.switchingMonBusy = false;
  });
};

const toNatureText = (i) => NATURES[i];

export default class StarterSelectionScene extends Phaser.Scene {
  constructor() {
    super('StarterSelection');

    this.currentMonImage = null;
    this.currentMonIndex = 0;
    this.switchingMonBusy = false;

    this.nature = 0;
    this.attackIV = 7;
    this.defenseIV = 7;
    this.speedIV = 7;
    this.specialAttackIV = 7;
    this.specialDefenseIV = 7;
    this.healthIV = 7;
  }

  preload() {
    this.starterSpecies = window.optimisticMonMon.starterSpecies;

    this.starterSpecies.forEach(({ id }) => {
      this.load.image(getSpeciesImageName(id), `src/assets/images/species/${id}.png`);
    });
  }

  create() {
    // TODO: remove hardcoded values
    this.scale.setGameSize(800, 600);

    const screenCenterX = this.scale.width >> 1;
    const screenCenterY = this.scale.height >> 1;
    const landscapeMode = this.scale.width > this.scale.height;
    const elementGap = Math.floor((this.scale.height - 2 * PADDING) / (landscapeMode ? 10 : 13));
    const firstColumnX = landscapeMode ? screenCenterX - 400 : screenCenterX;
    const secondColumnX = landscapeMode ? screenCenterX + 400 : screenCenterX;

    const { id, name } = this.starterSpecies[this.currentMonIndex];

    const nameTextOptions = { fontSize: '6em', fill: '#000000' };
    this.nameLabel = this.add
      .text(screenCenterX, PADDING + elementGap, name.toUpperCase(), nameTextOptions)
      .setOrigin(0.5);

    const previousMonButton = this.add
      .triangle(0, 0, 0, 15, 30, 0, 30, 30, 0x000000)
      .setInteractive()
      .on('pointerdown', () => switchMonAnimation(this, 'previous'));
    Phaser.Display.Align.To.LeftCenter(previousMonButton, this.nameLabel, ARROW_GAP);

    const nextMonButton = this.add
      .triangle(0, 0, 0, 0, 0, 30, 30, 15, 0x000000)
      .setInteractive()
      .on('pointerdown', () => switchMonAnimation(this, 'next'));
    Phaser.Display.Align.To.RightCenter(nextMonButton, this.nameLabel, ARROW_GAP);

    this.currentMonImage = this.add
      .image(screenCenterX, PADDING + elementGap * 2.5, getSpeciesImageName(id))
      .setOrigin(0.5)
      .setScale(MON_SCALE);

    const natureOptions = { labelText: 'Nature', maxValue: 24, valueToText: toNatureText };
    this.natureSlider = new LineSlider(this, screenCenterX, PADDING + elementGap * 4, natureOptions);

    const ivOptions = { maxValue: 31, defaultValue: 7 };

    const attackOptions = Object.assign({ labelText: `Attack IV` }, ivOptions);
    this.attackSlider = new LineSlider(this, firstColumnX, PADDING + elementGap * 5, attackOptions);

    const defenseOptions = Object.assign({ labelText: `Defense IV` }, ivOptions);
    this.defenseSlider = new LineSlider(this, firstColumnX, PADDING + elementGap * 6, defenseOptions);

    const speedOptions = Object.assign({ labelText: `Speed IV` }, ivOptions);
    this.speedSlider = new LineSlider(this, firstColumnX, PADDING + elementGap * 7, speedOptions);

    const specialAttackOptions = Object.assign({ labelText: `Special Attack IV` }, ivOptions);
    const specialAttackY = PADDING + elementGap * (landscapeMode ? 5 : 8);
    this.specialAttackSlider = new LineSlider(this, secondColumnX, specialAttackY, specialAttackOptions);

    const specialDefenseOptions = Object.assign({ labelText: `Special Defense IV` }, ivOptions);
    this.specialDefenseSlider = new LineSlider(this, secondColumnX, specialAttackY + elementGap, specialDefenseOptions);

    const healthOptions = Object.assign({ labelText: `Health IV` }, ivOptions);
    this.healthSlider = new LineSlider(this, secondColumnX, specialAttackY + 2 * elementGap, healthOptions);

    const confirmTextOptions = { fontSize: '4em', fill: '#ffffff' };
    const confirmText = this.add
      .text(screenCenterX, specialAttackY + 4 * elementGap, 'CONFIRM STARTER', confirmTextOptions)
      .setOrigin(0.5)
      .setDepth(1);

    this.confirmButton = this.add
      .rectangle(screenCenterX, specialAttackY + 4 * elementGap, confirmText.width + 20, confirmText.height + 20)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x000000)
      .setInteractive()
      .once('pointerdown', () => this.confirmStarter());

    setColors(this, id);
  }

  confirmStarter() {
    const { id: speciesId } = this.starterSpecies[this.currentMonIndex];
    const { value: nature } = this.natureSlider;
    const { value: attack } = this.attackSlider;
    const { value: defense } = this.defenseSlider;
    const { value: speed } = this.speedSlider;
    const { value: specialAttack } = this.specialAttackSlider;
    const { value: specialDefense } = this.specialDefenseSlider;
    const { value: health } = this.healthSlider;

    const IVs = {
      attack,
      defense,
      speed,
      specialAttack,
      specialDefense,
      health,
    };

    try {
      window.optimisticMonMon.initializeParty({ speciesId, nature, IVs });
    } catch (err) {
      if (err.message === 'Invalid IV sum.') {
        alert('Sum of all IVs must equal 144 for a starter mon.');
        return;
      }

      console.error(err.message);

      return;
    }

    this.scene.start('Menu');
  }

  update() {}
}
