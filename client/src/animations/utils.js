export function addTween(scene, config) {
  return new Promise((resolve) => {
    scene.tweens.add(Object.assign(config, { onComplete: resolve }));
  });
}

export function addSpriteAnimation(sprite, animationName) {
  return new Promise((resolve) => {
    sprite.play(animationName);

    sprite.once('animationcomplete', () => {
      sprite.destroy();
      resolve();
    });
  });
}
