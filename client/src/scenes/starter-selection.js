import Phaser from 'phaser';
import LineSlider from '../game-objects/line-slider';
import { getSpeciesImageName, getBackgroundColor, getHighlightColor } from '../utils';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;
const ARROW_GAP = 30;
const NATURE_Y = 260;
const LEFT_COLUMN_X = 250;
const RIGHT_COLUMN_X = 550;
const SLIDER_GAP = 60;
const CONFIRM_Y = 550;

const moveAnimation = (scene, image, targetX, targetY) =>
  new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      x: targetX,
      y: targetY,
      duration: 250,
      ease: 'linear',
      onComplete: resolve,
    });
  });

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
  scene.cameras.main.setBackgroundColor(getBackgroundColor(id));

  const cursorColor = getHighlightColor(id);
  scene.natureSlider.setCursorColor(cursorColor);
  scene.attackSlider.setCursorColor(cursorColor);
  scene.defenseSlider.setCursorColor(cursorColor);
  scene.speedSlider.setCursorColor(cursorColor);
  scene.specialAttackSlider.setCursorColor(cursorColor);
  scene.specialDefenseSlider.setCursorColor(cursorColor);
  scene.healthSlider.setCursorColor(cursorColor);

  scene.confirmButton.setFillStyle(cursorColor);
};

const switchMonAnimation = (scene, direction) => {
  if (scene.switchingMonBusy) return;

  scene.switchingMonBusy = true;

  const targetX =
    direction === 'previous'
      ? scene.currentMonImage.x - scene.scale.width
      : scene.currentMonImage.x + scene.scale.width;

  const newMonIndex = getNewMonIndex(scene, direction);

  const { id, name } = scene.starterSpecies[newMonIndex];

  const newMonStartingX =
    direction === 'previous' ? scene.scale.width + scene.currentMonImage.width : 0 - scene.currentMonImage.width;

  const newMonImage = scene.add.image(newMonStartingX, MON_Y, getSpeciesImageName(id));
  newMonImage.setScale(MON_SCALE);

  return Promise.all([
    moveAnimation(scene, scene.currentMonImage, targetX, scene.currentMonImage.y),
    moveAnimation(scene, newMonImage, scene.scale.width >> 1, MON_Y),
  ]).then(() => {
    scene.nameLabel.setText(name.toUpperCase());

    scene.currentMonImage.destroy();
    scene.currentMonIndex = newMonIndex;
    scene.currentMonImage = newMonImage;

    setColors(scene, id);

    scene.switchingMonBusy = false;
  });
};

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
    const screenCenterX = this.scale.width >> 1;

    const { id, name } = this.starterSpecies[this.currentMonIndex];

    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add.text(screenCenterX, NAME_Y, name.toUpperCase(), nameTextOptions).setOrigin(0.5);

    this.currentMonImage = this.add.image(screenCenterX, MON_Y, getSpeciesImageName(id));
    this.currentMonImage.setScale(MON_SCALE);

    const previousMonButton = this.add.triangle(0, 0, 0, 15, 30, 0, 30, 30, 0xffffff);
    previousMonButton.setInteractive();
    previousMonButton.on('pointerdown', () => switchMonAnimation(this, 'previous'));
    Phaser.Display.Align.To.LeftCenter(previousMonButton, this.nameLabel, ARROW_GAP);

    const nextMonButton = this.add.triangle(0, 0, 0, 0, 0, 30, 30, 15, 0xffffff);
    nextMonButton.setInteractive();
    nextMonButton.on('pointerdown', () => switchMonAnimation(this, 'next'));
    Phaser.Display.Align.To.RightCenter(nextMonButton, this.nameLabel, ARROW_GAP);

    const natureOptions = { labelText: 'Nature', maxValue: 24 };
    this.natureSlider = new LineSlider(this, screenCenterX, NATURE_Y, natureOptions);

    const ivOptions = { maxValue: 31, defaultValue: 7 };

    this.attackSlider = new LineSlider(
      this,
      LEFT_COLUMN_X,
      NATURE_Y + SLIDER_GAP,
      Object.assign({ labelText: `Attack IV` }, ivOptions)
    );

    this.defenseSlider = new LineSlider(
      this,
      LEFT_COLUMN_X,
      NATURE_Y + 2 * SLIDER_GAP,
      Object.assign({ labelText: `Defense IV` }, ivOptions)
    );

    this.speedSlider = new LineSlider(
      this,
      LEFT_COLUMN_X,
      NATURE_Y + 3 * SLIDER_GAP,
      Object.assign({ labelText: `Speed IV` }, ivOptions)
    );

    this.specialAttackSlider = new LineSlider(
      this,
      RIGHT_COLUMN_X,
      NATURE_Y + SLIDER_GAP,
      Object.assign({ labelText: `Special Attack IV` }, ivOptions)
    );

    this.specialDefenseSlider = new LineSlider(
      this,
      RIGHT_COLUMN_X,
      NATURE_Y + 2 * SLIDER_GAP,
      Object.assign({ labelText: `Special Defense IV` }, ivOptions)
    );
    
    this.healthSlider = new LineSlider(
      this,
      RIGHT_COLUMN_X,
      NATURE_Y + 3 * SLIDER_GAP,
      Object.assign({ labelText: `Health IV` }, ivOptions)
    );

    const confirmTextOptions = { fontSize: '36px', fill: '#000000' };
    const confirmText = this.add.text(screenCenterX, CONFIRM_Y, 'CONFIRM STARTER', confirmTextOptions).setOrigin(0.5);
    confirmText.depth = 1;

    const confirmButton = this.add.rectangle(screenCenterX, CONFIRM_Y, confirmText.width + 20, confirmText.height + 20);
    confirmButton.setStrokeStyle(4, 0x000000);
    this.confirmButton = confirmButton;

    setColors(this, id);

    confirmButton.setInteractive();
    confirmButton.on('pointerdown', () => this.confirmStarter());
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
