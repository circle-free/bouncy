import Phaser from 'phaser';

const HEIGHT = 200;
const PADDING = 10;
const BLUE = 0x5c3eff;

export default class DialogBox extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, scene.scale.height - HEIGHT);

    this.queue = [];

    const centerX = scene.scale.width >> 1;

    const width = scene.scale.width - 2 * PADDING;
    const height = HEIGHT - 2 * PADDING;
    this.dialogRect = scene.add.rectangle(centerX, PADDING, width, height, BLUE, 0.5);
    this.dialogRect.setOrigin(0.5, 0);
    this.dialogRect.setStrokeStyle(2, BLUE);
    this.dialogRect.setInteractive();
    this.add(this.dialogRect);

    const dialogOptions = { fontSize: '20px', fill: '#000000' };
    this.dialog = scene.add.text(2 * PADDING, 2 * PADDING, '', dialogOptions);
    this.dialog.setOrigin(0, 0);
    this.dialog.setWordWrapWidth(width - 2 * PADDING, true);
    this.add(this.dialog);

    this.nextIcon = scene.add.triangle(width, height, 0, 0, 20, 0, 10, 20);
    this.nextIcon.setFillStyle(BLUE);
    this.nextIcon.setOrigin(1, 1);
    this.nextIcon.setVisible(false);

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
    const verticalSpace = HEIGHT - 2 * PADDING - buttonStart;
    const buttonGap = verticalSpace / (actions.length + 1);

    this.buttons = actions.map(({ name, action }, i) => {
      const buttonTextOptions = { fontSize: '20px', fill: '#000000' };
      const button = this.scene.add.text(centerX, buttonStart + (i + 1) * buttonGap, name, buttonTextOptions);
      button.setOrigin(0.5, 0.5);
      button.setInteractive();

      button.once('pointerdown', () => {
        this.buttons.forEach((button) => button.destroy());
        this.dialog.setText('');

        action();
      });

      this.add(button);

      return button;
    });
  }
}
