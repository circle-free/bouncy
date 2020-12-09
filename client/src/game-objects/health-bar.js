import Phaser from 'phaser';

const BAR_HEIGHT = 12;
const BAR_WIDTH = 200;
const RED_PERCENTAGE = 0.25;
const YELLOW_PERCENTAGE = 0.5;

const createBar = (scene) => scene.add.rectangle(250, 100, BAR_WIDTH, BAR_HEIGHT, 0x008000);

const getNewHp = ({ maxHp, hp }, delta) => {
  const newHp = hp + delta;

  if (newHp > maxHp) return maxHp;

  if (newHp < 0) return 0;

  return newHp;
};

export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, monData) {
    super(scene, x, y);

    this.scene = scene;

    const bar = createBar(scene);
    this.bar = bar;
    this.add(bar);

    const barLabelOptions = { fontSize: '20px', fill: '#ffffff' };
    const barLabel = this.scene.add.text(0, 0, 'HP: ', barLabelOptions);
    Phaser.Display.Align.To.LeftCenter(barLabel, this.bar);
    this.add(barLabel);

    const lvlLabelOptions = { fontSize: '30px', fill: '#ffffff' };
    const lvlLabel = this.scene.add.text(0, 0, `Lv${monData.level}`, lvlLabelOptions);
    Phaser.Display.Align.To.TopRight(lvlLabel, this.bar, 0, 25);
    this.add(lvlLabel);

    const monNameOptions = { fontSize: '30px', fill: '#ffffff' };
    const monName = this.scene.add.text(0, 0, monData.species.name.toUpperCase(), monNameOptions);
    Phaser.Display.Align.To.TopLeft(monName, this.bar, 125, 25);
    this.add(monName);

    this.maxHp = monData.maxHealth;
    this.hp = monData.currentHealth;
    const hpLabelOptions = { fontSize: '20px', fill: '#ffffff' };
    const hpLabel = this.scene.add.text(0, 0, `${this.hp}/${this.maxHp}`, hpLabelOptions);
    Phaser.Display.Align.To.BottomRight(hpLabel, this.bar);
    this.add(hpLabel);
    this.hpLabel = hpLabel;

    this.bar.width = (BAR_WIDTH * this.hp) / this.maxHp;

    this.scene.add.existing(this);
  }

  updateHealth(delta) {
    const newHp = getNewHp(this, delta);

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.bar,
        duration: 1000,
        ease: 'linear',
        props: {
          width: {
            value: () => BAR_WIDTH * (newHp / this.maxHp),
          },
        },
        onComplete: () => {
          this.hp = newHp;
          resolve();
        },
        onUpdate: (tween) => {
          const currentHp = getNewHp(this, Math.floor(delta * tween.progress));

          this.hpLabel.setText(`${currentHp}/${this.maxHp}`);

          if (currentHp / this.maxHp < RED_PERCENTAGE) {
            this.bar.fillColor = 0xff0000;
            return;
          }

          if (currentHp / this.maxHp < YELLOW_PERCENTAGE) {
            this.bar.fillColor = 0xffff00;
            return;
          }

          this.bar.fillColor = 0x008000;
        },
      });
    });
  }
}
