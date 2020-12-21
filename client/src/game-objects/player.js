import Phaser from 'phaser';

const SCALE = 0.5;

let isPreLoaded = false;
let animationsAdded = false;

const addAnimations = (scene) => {
  scene.anims.create({
    key: 'player-left-walk',
    frames: scene.anims.generateFrameNames('player', {
      prefix: 'player-left-walk.',
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: 'player-right-walk',
    frames: scene.anims.generateFrameNames('player', {
      prefix: 'player-right-walk.',
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: 'player-front-walk',
    frames: scene.anims.generateFrameNames('player', {
      prefix: 'player-front-walk.',
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: 'player-back-walk',
    frames: scene.anims.generateFrameNames('player', {
      prefix: 'player-back-walk.',
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
};

export function preload(scene) {
  if (isPreLoaded) {
    return;
  }

  scene.load.atlas('player', 'src/assets/atlas/player.png', 'src/assets/atlas/player.json');
  isPreLoaded = true;
}

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    this.setScale(SCALE);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.body.setCollideWorldBounds(true);

    this.speed = 100;

    if (!animationsAdded) {
      animationsAdded = true;
      addAnimations(scene);
    }
  }

  update() {
    const prevVelocity = this.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(this.speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.body.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown) {
      this.body.setVelocityY(this.speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale(this.speed);

    // Update the animation and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.anims.play('player-left-walk', true);
    } else if (this.cursors.right.isDown) {
      this.anims.play('player-right-walk', true);
    } else if (this.cursors.up.isDown) {
      this.anims.play('player-back-walk', true);
    } else if (this.cursors.down.isDown) {
      this.anims.play('player-front-walk', true);
    } else {
      this.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) this.setTexture('player', 'player-left');
      else if (prevVelocity.x > 0) this.setTexture('player', 'player-right');
      else if (prevVelocity.y < 0) this.setTexture('player', 'player-back');
      else if (prevVelocity.y > 0) this.setTexture('player', 'player-front');
    }
  }
}
