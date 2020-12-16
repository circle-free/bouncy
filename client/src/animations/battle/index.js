import { addSpriteAnimation } from '../utils';
import { cropOut, shake, move, shrink } from '../common';

const PLAYER_MON_X = 50;
const ENEMY_MON_X = 600;
const ENEMY_SLIDE_IN_DURATION = 750;

export function animateEnemySlideIn(scene, { image }) {
  return move(scene, image, { x: ENEMY_MON_X }, { duration: ENEMY_SLIDE_IN_DURATION });
}

export function animateSendMonOut(scene, { image }) {
  return new Promise((resolve) => {
    const smokeAnimation = scene.add
      .sprite(PLAYER_MON_X + image.displayWidth * 0.5, image.y + image.displayHeight * 0.25, 'smoke')
      .setScale(0.25)
      .play('smoke');

    image.setX(PLAYER_MON_X);

    smokeAnimation.once('animationcomplete', () => {
      smokeAnimation.destroy();
      resolve();
    });
  });
}

export function animateBringMonIn(scene, { image }) {
  const originalScale = image.scale;

  return new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      y: image.y + 150,
      duration: 150,
      ease: 'linear',
      onComplete: () => {
        image.destroy();
        resolve();
      },
      onUpdate: (tween) => {
        image.setScale(originalScale * (1 - tween.progress));
      },
    });
  });
}

export function animateBringMonInNew(scene, { image }) {
  return shrink(scene, image);
}

export function animatePhysicalAttack(scene, { image }, options = {}) {
  const { direction = 'right' } = options;

  const { x, y } = direction === 'right' ? { x: image.x + 25, y: image.y - 25 } : { x: image.x - 25, y: image.y + 25 };

  return move(scene, image, { x, y }, { duration: 100, yoyo: true });
}

export function animatePhysicalHit(scene, { image }) {
  const hitSprite = scene.add
    .sprite(image.x + image.displayWidth * 0.5, image.y + image.displayHeight * 0.75, 'physicalHit')
    .setScale(0.25);

  return addSpriteAnimation(hitSprite, 'physicalHit');
}

export async function animateMonFaint(scene, { image }) {
  await shake(scene, image);
  return cropOut(scene, image);
}
