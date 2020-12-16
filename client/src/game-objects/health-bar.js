import Phaser from 'phaser';

const WIDTH = 240;
const HEIGHT = 90;
const BAR_HEIGHT = 12;
const RED_PERCENTAGE = 0.25;
const YELLOW_PERCENTAGE = 0.5;
const HP_LABEL_WIDTH = 30;
const BAR_GREEN = 0x55ff22;
const BAR_YELLOW = 0xffd221;
const BAR_RED = 0xff233f;
const BAR_BLUE = 0x5c3eff;
const PADDING = 10;

const getNewHp = ({ hp, maxHp }, delta) => {
  const newHp = hp + delta;

  if (newHp > maxHp) return maxHp;

  if (newHp < 0) return 0;

  return newHp;
};

export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, monData, options = {}) {
    const { fillColor = 0xffffff } = options;

    super(scene, x, y);
    this.scene = scene;

    const { stats, currentHealth, level, species } = monData;

    this.maxHp = stats.maxHealth;
    this.hp = currentHealth;

    const background = scene.add.rectangle(0, 0, WIDTH, HEIGHT, fillColor);
    background.setStrokeStyle(2, 0x000000);
    background.setOrigin(0, 0);
    this.add(background);

    const topLine = (HEIGHT >> 1) - BAR_HEIGHT;
    const emptyBarWidth = WIDTH - (PADDING * 2) - HP_LABEL_WIDTH;
    const fullBarWidth = emptyBarWidth - 6;

    const monNameOptions = { fontSize: '24px', fill: '#000000' };
    const monName = scene.add.text(PADDING, topLine, species.name.toUpperCase(), monNameOptions);
    monName.setOrigin(0, 1);
    this.add(monName);

    const levelLabelOptions = { fontSize: '18px', fill: '#000000' };
    const levelLabel = scene.add.text(WIDTH - PADDING, topLine, `Lv.${level}`, levelLabelOptions);
    levelLabel.setOrigin(1, 1);
    this.add(levelLabel);

    const hpLabelOptions = { fontSize: '18px', fill: '#000000' };
    const hpLabel = scene.add.text(PADDING, HEIGHT >> 1, 'HP', hpLabelOptions);
    hpLabel.setOrigin(0, 0.5);
    this.add(hpLabel);

    const emptyBar = scene.add.rectangle(PADDING + HP_LABEL_WIDTH, HEIGHT >> 1, emptyBarWidth, BAR_HEIGHT, 0xffffff);
    emptyBar.setStrokeStyle(2, 0x000000);
    emptyBar.setOrigin(0, 0.5);
    this.add(emptyBar);

    this.bar = scene.add.rectangle(13 + HP_LABEL_WIDTH, HEIGHT >> 1, fullBarWidth, BAR_HEIGHT - 6, BAR_GREEN);
    this.bar.setOrigin(0, 0.5);
    this.add(this.bar);

    this.bar.width = (fullBarWidth * this.hp) / this.maxHp;

    const hpValueOptions = { fontSize: '18px', fill: '#000000' };
    this.hpValue = scene.add.text(WIDTH - PADDING, (HEIGHT >> 1) + BAR_HEIGHT, `${this.hp}/${this.maxHp}`, hpValueOptions);
    this.hpValue.setOrigin(1, 0);
    this.add(this.hpValue);

    scene.add.existing(this);
  }

  updateHealth(delta) {
    const emptyBarWidth = WIDTH - (2 * PADDING) - HP_LABEL_WIDTH;
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
