import Slider from 'phaser3-rex-plugins/plugins/slider.js';

export default class LineSlider extends Phaser.GameObjects.Container {
  constructor(scene, x, y, options = {}) {
    const {
      minValue = 0,
      maxValue = 10,
      defaultValue = 0,
      labelText = '',
      cursorColor = 0xffffff
    } = options;

    super(scene, x, y);
    this.scene = scene;

    this.cursor = scene.add.rectangle(0, 25, 12, 12, cursorColor);

    const valueTextOptions = { fontSize: '20px', fill: '#ffffff' };
    const valueText = this.scene.add.text(105, 35, '', valueTextOptions);

    this._value = defaultValue;
    
    const slider = new Slider(this.cursor, {
      endPoints: [
        { x: this.cursor.x - 130, y: this.cursor.y },
        { x: this.cursor.x + 130, y: this.cursor.y }
      ],
      value: (defaultValue - minValue)/(maxValue - minValue),
      valuechangeCallback: (v) => {
        this._value = Math.floor(minValue + v * (maxValue - minValue));
        valueText.setText(this._value);
      }
    });

    const line = scene.add
      .graphics()
      .lineStyle(5, 0xffffff, 1)
      .strokePoints(slider.endPoints);

    const labelTextOptions = { fontSize: '20px', fill: '#ffffff' };
    const label = this.scene.add.text(-125, 35, labelText, labelTextOptions);
    
    this.add(line);
    this.add(this.cursor);
    this.add(label);
    this.add(valueText);

    this.scene.add.existing(this);
  }

  get value () {
    return this._value
  }

  setCursorColor(color) {
    this.cursor.setFillStyle(color)
  }
}
