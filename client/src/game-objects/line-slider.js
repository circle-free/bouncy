import Phaser from 'phaser';
import Slider from 'phaser3-rex-plugins/plugins/slider.js';

export default class LineSlider extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options = {}) {
    const {
      minValue = 0,
      maxValue = 10,
      defaultValue = 0,
      labelText = '',
      cursorColor = 0xffffff,
      valueToText = (i) => i,
      width = 260,
    } = options;

    super(scene, x, y);

    this.cursor = scene.add.rectangle(0, 25, 12, 12, cursorColor);

    const labelTextOptions = { fontSize: '16px', fill: '#000000' };
    const label = scene.add.text(-(width / 2), 35, labelText, labelTextOptions);
    label.setOrigin(0, 0);

    const valueTextOptions = { fontSize: '16px', fill: '#000000' };
    const valueText = scene.add.text(width / 2, 35, valueToText(defaultValue), valueTextOptions);
    valueText.setOrigin(1, 0);

    this._value = defaultValue;

    const slider = new Slider(this.cursor, {
      endPoints: [
        { x: this.cursor.x - width / 2, y: this.cursor.y },
        { x: this.cursor.x + width / 2, y: this.cursor.y },
      ],
      value: (defaultValue - minValue) / (maxValue - minValue),
      valuechangeCallback: (v) => {
        this._value = Math.floor(minValue + v * (maxValue - minValue));
        valueText.setText(valueToText(this._value));
      },
    });

    const line = scene.add.graphics().lineStyle(5, 0xffffff, 1).strokePoints(slider.endPoints);

    this.add(line);
    this.add(this.cursor);
    this.add(label);
    this.add(valueText);

    scene.add.existing(this);
  }

  get value() {
    return this._value;
  }

  setCursorColor(color) {
    this.cursor.setFillStyle(color);
  }
}
