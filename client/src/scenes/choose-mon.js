import Phaser from 'phaser';
import Player, { preload as playerPreload } from '../game-objects/player';
import Map from '../game-objects/map';
import DialogBox from '../game-objects/dialog-box';

const TILES = ['furniture', 'floors-and-walls', 'electronics', 'plants', 'set-pieces', 'stairs-down'];

export default class ChooseMon extends Phaser.Scene {
  constructor() {
    super('ChooseMon');
  }

  preload() {
    this.map = new Map(this, 'professor-lab', TILES);

    this.load.image('capture-device', 'src/assets/images/items/capture-device.png');

    playerPreload(this);
    this.player = null;
  }

  create() {
    this.map.build();
    const tileMap = this.map.tileMap;

    const captureDevices = this.physics.add.staticGroup();

    const events = tileMap.getObjectLayer('events').objects;
    events.forEach((eventObject) => {
      const { name, x, y } = eventObject;

      if (name === 'playerSpawn') {
        this.player = new Player(this, x, y, 'player');
      }

      if (name.includes('chooseCreature')) {
        captureDevices.add(this.add.image(x, y, 'capture-device').setOrigin(0).setScale(0.5));
      }
    });

    this.map.addCollider(this.player);

    this.physics.add.overlap(this.player, captureDevices, () => this.scene.start('StarterSelection'));
  }

  update(time, delta) {
    this.player.update(time, delta);
  }
}
