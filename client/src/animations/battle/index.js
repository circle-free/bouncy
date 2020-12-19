import { addSpriteAnimation } from '../utils';
import { cropOut, shake, move, shrink } from '../common';

const ENEMY_SLIDE_IN_DURATION = 750;

export function animateEnemySlideIn(scene, { image }) {
  const x = image.x;
  image.setX(0);
  return move(scene, image, { x }, { duration: ENEMY_SLIDE_IN_DURATION });
}

export function animateSendMonOut(scene, { image }) {
  return new Promise((resolve) => {
    const smokeAnimation = scene.add.sprite(image.x, image.y, 'smoke').setOrigin(0.5, 0.5).setScale(0.25).play('smoke');

    image.setX(image.x);

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
  const hitSprite = scene.add.sprite(image.x, image.y, 'physicalHit').setScale(0.25);

  return addSpriteAnimation(hitSprite, 'physicalHit');
}

export async function animateMonFaint(scene, { image }) {
  await shake(scene, image);
  return cropOut(scene, image);
}
