import Phaser from 'phaser';
import scenes from './scenes';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  scene: scenes,
};

const game = new Phaser.Game(config);
