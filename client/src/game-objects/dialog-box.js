import Phaser from 'phaser';

const PADDING = 10;

const createDialogRect = (scene) => {
  const height = scene.scale.height * 0.33;

  const dialogRect = scene.add.rectangle(
    PADDING,
    0,
    scene.scale.width - PADDING - PADDING,
    height - PADDING,
    0x004040
  );
  dialogRect.setOrigin(0, 0);
  dialogRect.setStrokeStyle(4, 0xff0000);
  dialogRect.setInteractive();

  return dialogRect;
};

const createNextIcon = (scene, dialogRect) => {
  const nextIcon = scene.add.triangle(0, 0, 0, 0, 20, 0, 10, 20);
  nextIcon.setFillStyle(0xffffff);
  nextIcon.setOrigin(0, 0);
  nextIcon.setVisible(false);

  Phaser.Display.Align.In.BottomRight(nextIcon, dialogRect, -PADDING, -PADDING);

  scene.tweens.add({
    targets: nextIcon,
    y: nextIcon.y - 10,
    duration: 500,
    loop: -1,
    yoyo: true,
  });

  return nextIcon;
};

const createButtonsBox = (scene, dialogRect) => {
  const width = scene.scale.width * 0.5;

  const buttonsBox = scene.add.rectangle(
    0,
    0,
    width,
    dialogRect.height,
    0x004040
  );
  buttonsBox.setOrigin(0, 0);
  buttonsBox.setStrokeStyle(4, 0xff0000);
  buttonsBox.setVisible(false);

  Phaser.Display.Align.In.BottomRight(buttonsBox, dialogRect);

  return buttonsBox;
};

export default class DialogBox extends Phaser.GameObjects.Container {
  constructor(scene) {
    const height = scene.scale.height * 0.33;
    super(scene, 0, scene.scale.height - height);

    this.queue = [];

    const dialogRect = createDialogRect(scene, height);
    this.add(dialogRect);
    this.dialogRect = dialogRect;

    const dialog = this.scene.add.text(0, 0, '', {
      fontSize: '20px',
      fill: '#ffffff',
    });
    Phaser.Display.Align.In.TopLeft(dialog, dialogRect, -PADDING, -PADDING);
    this.add(dialog);
    this.dialog = dialog;

    const nextIcon = createNextIcon(scene, dialogRect);
    this.add(nextIcon);
    this.nextIcon = nextIcon;

    const buttonsBox = createButtonsBox(scene, dialogRect);
    this.add(buttonsBox);
    this.buttonsBox = buttonsBox;

    this.scene.add.existing(this);
  }

  displayDialog(dialogArray) {
    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) {
        reject('Queue should be empty');
      }

      this.queue.push(...dialogArray);

      if (!this.dialog.text) {
        this.dialog.setText(this.queue.shift());
        this.nextIcon.setVisible(true);
      }

      this.dialogRect.on('pointerdown', () => {
        const nextText = this.queue.shift();

        if (!nextText) {
          this.dialog.setText('');
          this.nextIcon.setVisible(false);
          this.dialogRect.removeAllListeners('pointerdown');
          resolve();
        }

        this.dialog.setText(nextText);
      });
    });
  }

  displayButtons(buttonActions = []) {
    this.buttonsBox.setVisible(true);

    const x = this.buttonsBox.x + this.buttonsBox.width / 2 + PADDING;

    const buttons = buttonActions.map(({ name, action }, i) => {
      const button = this.scene.add
        .text(x, this.y + 30 + i * 40, name, {
          fontSize: '20px',
          fill: '#ffffff',
        })
        .setOrigin(0.5);

      button.setInteractive();

      button.on('pointerdown', () => {
        buttons.forEach((button) => button.destroy());
        this.buttonsBox.setVisible(false);
        action();
      });

      return button;
    });
  }
}
