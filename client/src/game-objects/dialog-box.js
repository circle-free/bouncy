import Phaser from 'phaser';

const HEIGHT_RATIO = 0.3;
const PADDING = 10;
const BLUE = 0x5c3eff;
const FONT_FAMILY = 'Helvetica, sans-serif';

export default class DialogBox extends Phaser.GameObjects.Container {
  constructor(scene, options = {}) {
    super(scene, 0, scene.scale.height * (1 - HEIGHT_RATIO));

    const { fontSize = '4em', fontFamily = FONT_FAMILY, opacity = 1 } = options;

    this.fontFamily = fontFamily;

    this.queue = [];

    const centerX = scene.scale.width >> 1;

    const width = scene.scale.width - 2 * PADDING;
    const height = scene.scale.height * HEIGHT_RATIO - 2 * PADDING;
    this.fontSize = Math.floor(height / 10);

    this.dialogRect = scene.add
      .rectangle(centerX, PADDING, width, height, BLUE, 0.5)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, BLUE)
      .setInteractive();
    this.add(this.dialogRect);

    const dialogOptions = { fontSize: this.fontSize, fill: '#000000', fontFamily };
    this.dialog = scene.add
      .text(2 * PADDING, 2 * PADDING, '', dialogOptions)
      .setOrigin(0, 0)
      .setWordWrapWidth(width - 2 * PADDING, true);
    this.add(this.dialog);

    const triangleSize = this.fontSize;
    this.nextIcon = scene.add
      .triangle(width, height, 0, 0, triangleSize, 0, triangleSize / 2, triangleSize, BLUE)
      .setOrigin(1, 1)
      .setVisible(false);

    scene.tweens.add({
      targets: this.nextIcon,
      y: this.nextIcon.y - 10,
      duration: 500,
      loop: -1,
      yoyo: true,
    });

    this.add(this.nextIcon);

    scene.add.existing(this);
  }

  displayDialog(dialogText) {
    const dialogArray = Array.isArray(dialogText) ? dialogText : [dialogText];

    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) return reject('Queue should be empty');

      this.queue.push(...dialogArray);

      if (!this.dialog.text) {
        this.dialog.setText(this.queue.shift());
        this.nextIcon.setVisible(true);
      }

      this.dialogRect.once('pointerdown', () => {
        const nextText = this.queue.shift();

        if (!nextText) {
          this.nextIcon.setVisible(false);
          this.dialog.setText('');
          this.dialogRect.removeAllListeners('pointerdown');
          return resolve();
        }

        this.dialog.setText(nextText);
      });
    });
  }

  displayButtons(promptText, actions = []) {
    this.dialog.setText(promptText);

    const centerX = this.scene.scale.width >> 1;
    const buttonStart = 3 * PADDING;
    const verticalSpace = this.scene.scale.height * HEIGHT_RATIO - 2 * PADDING - buttonStart;
    const buttonGap = Math.floor(verticalSpace / (actions.length + 1));

    this.buttons = actions.map(({ name, action }, i) => {
      const buttonTextOptions = { fontSize: this.fontSize, fill: '#000000', fontFamily: this.fontFamily };
      const button = this.scene.add
        .text(centerX, buttonStart + (i + 1) * buttonGap, name, buttonTextOptions)
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .once('pointerdown', () => {
          this.buttons.forEach((button) => button.destroy());
          this.dialog.setText('');

          action();
        });

      this.add(button);

      return button;
    });
  }
}
