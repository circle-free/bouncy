import LineSlider from '../game-objects/line-slider';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;
const ARROW_GAP = 30;
const OFF_SCREEN_DISTANCE = 200;
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
      this.load.image(getSpeciesImageName(id), `src/assets/images/species/${id}.png`)
    });
  }

  create() {
    const screenCenterX = this.scale.width / 2;

    const { id, name } = this.starterSpecies[this.currentMonIndex];
    this.cameras.main.setBackgroundColor(getBackgroundColor(id));
    
    this.currentMonImage = this.add.image(this.scale.width * 0.5, MON_Y, getSpeciesImageName(id));
    this.currentMonImage.setScale(MON_SCALE);
    
    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add.text(screenCenterX, NAME_Y, name.toUpperCase(), nameTextOptions).setOrigin(0.5);

    const previousMonButton = this.add.triangle(0, 0, 0, 15, 30, 0, 30, 30, 0xffffff);
    previousMonButton.setInteractive();
    previousMonButton.on('pointerdown', () => this.previousSpecies());
    Phaser.Display.Align.To.LeftCenter(previousMonButton, this.nameLabel, ARROW_GAP);

    const nextMonButton = this.add.triangle(0, 0, 0, 0, 0, 30, 30, 15, 0xffffff);
    nextMonButton.setInteractive();
    nextMonButton.on('pointerdown', () => this.nextSpecies());
    Phaser.Display.Align.To.RightCenter(nextMonButton, this.nameLabel, ARROW_GAP);

    const highlightColor = getHighlightColor(id);
    const natureOptions = { labelText: 'Nature', maxValue: 24, cursorColor: highlightColor };
    this.natureSlider = new LineSlider(this, screenCenterX, NATURE_Y, natureOptions);

    const ivOptions = { maxValue: 31, defaultValue: 7, cursorColor: highlightColor };
    this.attackSlider = new LineSlider(this, LEFT_COLUMN_X, NATURE_Y + SLIDER_GAP, Object.assign({ labelText: `Attack IV` }, ivOptions));
    this.defenseSlider = new LineSlider(this, LEFT_COLUMN_X, NATURE_Y + 2 * SLIDER_GAP, Object.assign({ labelText: `Defense IV` }, ivOptions));
    this.speedSlider = new LineSlider(this, LEFT_COLUMN_X, NATURE_Y + 3 * SLIDER_GAP, Object.assign({ labelText: `Speed IV` }, ivOptions));
    this.specialAttackSlider = new LineSlider(this, RIGHT_COLUMN_X, NATURE_Y + SLIDER_GAP, Object.assign({ labelText: `Special Attack IV` }, ivOptions));
    this.specialDefenseSlider = new LineSlider(this, RIGHT_COLUMN_X, NATURE_Y + 2 * SLIDER_GAP, Object.assign({ labelText: `Special Defense IV` }, ivOptions));
    this.healthSlider = new LineSlider(this, RIGHT_COLUMN_X, NATURE_Y + 3 * SLIDER_GAP, Object.assign({ labelText: `Health IV` }, ivOptions));

    const confirmTextOptions = { fontSize: '36px', fill: '#ffffff' };
    const confirmButton = this.add.text(screenCenterX, CONFIRM_Y, 'CONFIRM STARTER', confirmTextOptions).setOrigin(0.5);
    confirmButton.setInteractive();
    confirmButton.on('pointerdown', () => this.confirmStarter());
  }

  updateElements(monIndex, monImage) {
    const { id, name } = this.starterSpecies[monIndex];

    this.cameras.main.setBackgroundColor(getBackgroundColor(id));
    this.nameLabel.setText(name.toUpperCase());

    const cursorColor = getHighlightColor(id);
    this.natureSlider.setCursorColor(cursorColor);
    this.attackSlider.setCursorColor(cursorColor);
    this.defenseSlider.setCursorColor(cursorColor);
    this.speedSlider.setCursorColor(cursorColor);
    this.specialAttackSlider.setCursorColor(cursorColor);
    this.specialDefenseSlider.setCursorColor(cursorColor);
    this.healthSlider.setCursorColor(cursorColor);

    this.currentMonImage.destroy();
    this.currentMonIndex = monIndex;
    this.currentMonImage = monImage;
  }

  previousSpecies() {
    if (this.switchingMonBusy) return;
    
    this.switchingMonBusy = true;
    const targetX = this.currentMonImage.x - this.scale.width - this.currentMonImage.width;
    const newMonIndex = this.currentMonIndex - 1 < 0 ? this.starterSpecies.length - 1 : this.currentMonIndex - 1;
    const { id } = this.starterSpecies[newMonIndex];
    const newMonImage = this.add.image(this.scale.width + OFF_SCREEN_DISTANCE, MON_Y, getSpeciesImageName(id));
    newMonImage.setScale(MON_SCALE);
    
    return Promise.all([
      moveAnimation(this, this.currentMonImage, targetX, this.currentMonImage.y), 
      moveAnimation(this, newMonImage, this.scale.width * 0.5, MON_Y)
    ])
    .then(() => {
      this.updateElements(newMonIndex, newMonImage);
      this.switchingMonBusy = false;
    });
  }

  nextSpecies() {
    if (this.switchingMonBusy) return;
    
    this.switchingMonBusy = true;
    const targetX = this.currentMonImage.x + this.scale.width + this.currentMonImage.width;
    const newMonIndex = this.currentMonIndex + 1 >= this.starterSpecies.length ? 0 : this.currentMonIndex + 1;
    const { id } = this.starterSpecies[newMonIndex];
    const newMonImage = this.add.image(0 - OFF_SCREEN_DISTANCE, MON_Y, getSpeciesImageName(id));
    newMonImage.setScale(MON_SCALE);
    
    return Promise.all([
      moveAnimation(this, this.currentMonImage, targetX, this.currentMonImage.y), 
      moveAnimation(this, newMonImage, this.scale.width * 0.5, MON_Y)
    ])
    .then(() => {
      this.updateElements(newMonIndex, newMonImage);
      this.switchingMonBusy = false;
    });
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

    const IVs = { attack, defense, speed, specialAttack, specialDefense, health };
    
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
