import Phaser from 'phaser';

const RED_PERCENTAGE = 0.25;
const YELLOW_PERCENTAGE = 0.5;
const BAR_GREEN = 0x55ff22;
const BAR_YELLOW = 0xffd221;
const BAR_RED = 0xff233f;
const BAR_BLUE = 0x5c3eff;
const PADDING = 10;
const FONT_FAMILY = 'Helvetica, sans-serif';

const getNewHp = ({ hp, maxHp }, delta) => {
  const newHp = hp + delta;

  if (newHp > maxHp) return maxHp;

  if (newHp < 0) return 0;

  return newHp;
};

export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, monData, options = {}) {
    const { fillColor = 0xffffff, fontFamily = FONT_FAMILY, height = 90, width = 3 * height } = options;

    super(scene, x, y);

    const largeFontSize = Math.floor(height / 4);
    const fontSize = Math.floor(height / 5);
    const barHeight = Math.floor(height / 5);

    const { stats, currentHealth, level, species } = monData;

    this.maxHp = stats.maxHealth;
    this.hp = currentHealth;

    const background = scene.add
      .rectangle(0, 0, width, height, fillColor)
      .setStrokeStyle(2, 0x000000)
      .setOrigin(0.5, 0.5);
    this.add(background);

    const hpLabelOptions = { fontSize, fill: '#000000', fontFamily };
    const hpLabel = scene.add.text(PADDING - width / 2, 0, 'HP', hpLabelOptions).setOrigin(0, 0.5);
    this.add(hpLabel);
    const hpLabelWidth = hpLabel.width * 1.5;

    const topBaseLine = -barHeight;
    const bottomTopLine = barHeight;
    const emptyBarWidth = width - PADDING * 2 - hpLabelWidth;
    const fullBarWidth = emptyBarWidth - 8;

    const monNameOptions = { fontSize: largeFontSize, fill: '#000000', fontFamily };
    const monName = scene.add
      .text(PADDING - width / 2, topBaseLine, species.name.toUpperCase(), monNameOptions)
      .setOrigin(0, 1);
    this.add(monName);

    const levelLabelOptions = { fontSize, fill: '#000000', fontFamily };
    const levelLabel = scene.add
      .text(width / 2 - PADDING, topBaseLine, `Lv.${level}`, levelLabelOptions)
      .setOrigin(1, 1);
    this.add(levelLabel);

    this.emptyBar = scene.add
      .rectangle(PADDING - width / 2 + hpLabelWidth, 0, emptyBarWidth, barHeight, 0xffffff)
      .setStrokeStyle(2, 0x000000)
      .setOrigin(0, 0.5);
    this.add(this.emptyBar);

    this.bar = scene.add
      .rectangle(PADDING - width / 2 + hpLabelWidth + 4, 0, fullBarWidth, barHeight - 8, BAR_GREEN)
      .setOrigin(0, 0.5);
    this.add(this.bar);

    this.bar.width = (fullBarWidth * this.hp) / this.maxHp;

    const hpValueOptions = { fontSize, fill: '#000000', fontFamily };
    this.hpValue = scene.add
      .text(width / 2 - PADDING, bottomTopLine, `${this.hp}/${this.maxHp}`, hpValueOptions)
      .setOrigin(1, 0);
    this.add(this.hpValue);

    scene.add.existing(this);
  }

  updateHealth(delta) {
    const emptyBarWidth = this.emptyBar.width;
    const fullBarWidth = emptyBarWidth - 6;
    const newHp = getNewHp(this, delta);

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.bar,
        duration: 1000,
        ease: 'linear',
        props: {
          width: {
            value: () => (fullBarWidth * newHp) / this.maxHp,
          },
        },
        onComplete: () => {
          this.hp = newHp;
          resolve();
        },
        onUpdate: (tween) => {
          const currentHp = getNewHp(this, Math.floor(delta * tween.progress));

          this.hpValue.setText(`${currentHp}/${this.maxHp}`);

          if (currentHp / this.maxHp < RED_PERCENTAGE) {
            this.bar.fillColor = BAR_RED;
            return;
          }

          if (currentHp / this.maxHp < YELLOW_PERCENTAGE) {
            this.bar.fillColor = BAR_YELLOW;
            return;
          }

          this.bar.fillColor = BAR_GREEN;
        },
      });
    });
  }
}
