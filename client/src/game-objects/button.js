import Phaser from 'phaser';

const FONT_FAMILY = 'Helvetica, sans-serif';
const BLUE = 0x5c3eff;

export default class LineSlider extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text = '', callback, options = {}) {
    const {
      fontSize = 28,
      fontFamily = FONT_FAMILY,
      width,
      height,
      buttonColor = BLUE,
      textColor = '#ffffff',
    } = options;

    super(scene, x, y);

    const testOptions = { fontFamily, fontSize, fill: textColor };
    const buttonText = scene.add.text(0, 0, text, testOptions).setOrigin(0.5, 0.5).setDepth(2);

    const buttonWidth = width ?? buttonText.width + fontSize;
    const buttonHeight = height ?? buttonText.height + fontSize;

    const button = scene.add
      .rectangle(0, 0, buttonWidth, buttonHeight, buttonColor, 0.5)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, BLUE)
      .setDepth(1)
      .setInteractive()
      .on('pointerdown', callback);

    this.add(button);
    this.add(buttonText);

    scene.add.existing(this);
  }
}
