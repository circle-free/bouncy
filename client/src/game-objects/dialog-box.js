import Phaser from 'phaser';

const PADDING = 10;

const createDialogRect = (scene) => {
  const width = scene.scale.width - 2 * PADDING;
  const height = scene.scale.height * 0.33;
  const dialogRect = scene.add.rectangle(PADDING, 0, width, height - PADDING, 0x004040);

  dialogRect.setOrigin(0, 0);
  dialogRect.setStrokeStyle(4, 0xff0000);
  dialogRect.setInteractive();

  const dialogOptions = { fontSize: '20px', fill: '#ffffff' };
  const dialog = scene.add.text(0, 0, '', dialogOptions);
  dialog.setWordWrapWidth(width, true);
  Phaser.Display.Align.In.TopLeft(dialog, dialogRect, -PADDING, -PADDING);

  return { dialog, dialogRect };
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

const createButtonBoxes = (scene, dialogRect) => {
  const width = scene.scale.width * 0.5;

  const buttonsBox = scene.add.rectangle(0, 0, width, dialogRect.height, 0x004040);
  buttonsBox.setOrigin(0, 0);
  buttonsBox.setStrokeStyle(4, 0xff0000);
  Phaser.Display.Align.In.BottomRight(buttonsBox, dialogRect);

  const infoBox = scene.add.rectangle(0, 0, width, dialogRect.height, 0x004040);
  infoBox.setOrigin(0, 0);
  infoBox.setStrokeStyle(4, 0xff0000);
  Phaser.Display.Align.In.BottomLeft(infoBox, dialogRect);

  const infoOptions = { fontSize: '20px', fill: '#ffffff' };
  const info = scene.add.text(0, 0, '', infoOptions);
  info.setWordWrapWidth(width, true);
  Phaser.Display.Align.In.TopLeft(info, infoBox, -PADDING, -PADDING);

  return { info, infoBox, buttonsBox };
};

export default class DialogBox extends Phaser.GameObjects.Container {
  constructor(scene) {
    const height = scene.scale.height * 0.33;
    super(scene, 0, scene.scale.height - height);

    this.queue = [];

    const { dialog, dialogRect } = createDialogRect(scene, height);
    this.add(dialogRect);
    this.dialogRect = dialogRect;
    this.add(dialog);
    this.dialog = dialog;

    const nextIcon = createNextIcon(scene, dialogRect);
    this.add(nextIcon);
    this.nextIcon = nextIcon;

    const { info, infoBox, buttonsBox } = createButtonBoxes(scene, dialogRect);
    this.add(buttonsBox);
    this.buttonsBox = buttonsBox;
    this.add(infoBox);
    this.infoBox = infoBox;
    this.add(info);
    this.info = info;

    this.scene.add.existing(this);
  }

  displayDialog(dialogText) {
    this.dialogRect.setVisible(true);
    this.buttonsBox.setVisible(false);
    this.infoBox.setVisible(false);

    const dialogArray = Array.isArray(dialogText) ? dialogText : [dialogText];

    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) return reject('Queue should be empty');

      this.queue.push(...dialogArray);

      if (!this.dialog.text) {
        this.dialog.setText(this.queue.shift());
        this.nextIcon.setVisible(true);
      }

      this.dialogRect.on('pointerdown', () => {
        const nextText = this.queue.shift();

        if (!nextText) {
          this.dialog.setText('');
          this.dialogRect.removeAllListeners('pointerdown');
          return resolve();
        }

        this.dialog.setText(nextText);
      });
    });
  }

  displayButtons(buttonActions = [], buttonsInfo) {
    this.dialogRect.setVisible(false);
    this.buttonsBox.setVisible(true);
    this.infoBox.setVisible(true);

    this.info.setText(buttonsInfo);

    const x = this.buttonsBox.x + this.buttonsBox.width / 2 + PADDING;

    const buttons = buttonActions.map(({ name, action }, i) => {
      const buttonTextOptions = { fontSize: '20px', fill: '#ffffff' };
      const button = this.scene.add.text(x, this.y + 30 + i * 40, name, buttonTextOptions).setOrigin(0.5);

      button.setInteractive();

      button.on('pointerdown', () => {
        buttons.forEach((button) => button.destroy());
        this.info.setText('');

        action();
      });

      return button;
    });
  }
}
