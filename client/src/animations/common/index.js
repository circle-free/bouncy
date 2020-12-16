import { addTween } from '../utils';

const getMoveOutEndpoints = (target, direction) => {
  if (direction === 'down') return { x: target.x, y: target.y + target.height };

  if (direction === 'up') return { x: target.x, y: target.y - target.height };

  if (direction === 'left') return { x: target.x - target.width, y: target.y };

  return { x: target.x + target.width, y: target.y };
};

export function move(scene, target, endpoint, options = {}) {
  const { duration = 250, ease = 'linear', yoyo = false } = options;

  const config = Object.assign(
    {
      targets: target,
      duration,
      ease,
      yoyo,
    },
    endpoint.x && { x: endpoint.x },
    endpoint.y && { y: endpoint.y }
  );

  return addTween(scene, config);
}

export function shrink(scene, target, options = {}) {
  const { duration = 200, ease = 'linear' } = options;

  const config = {
    targets: target,
    props: {
      scale: { value: 0 },
    },
    duration,
    ease,
  };

  return addTween(scene, config);
}

export function cropOut(scene, target, options = {}) {
  const { duration = 250, ease = 'linear', direction = 'down' } = options;

  const { x, y } = getMoveOutEndpoints(target, direction);

  const onUpdate = (tween, target) => {
    if (direction === 'down') {
      target.setCrop(0, 0, target.width, target.height - tween.progress * target.height);
      return;
    }

    if (direction === 'up') {
      target.setCrop(0, tween.progress * target.height, target.width, target.height);
      return;
    }

    if (direction === 'left') {
      target.setCrop(tween.progress * target.width, 0, target.width, target.height);
      return;
    }

    target.setCrop(0, 0, target.width - tween.progress * target.width, target.height);
  };

  const config = {
    targets: target,
    x,
    y,
    duration,
    ease,
    onUpdate,
  };

  return addTween(scene, config);
}

export function shake(scene, target, options = {}) {
  const { count = 10 } = options;

  const config = {
    targets: target,
    x: target.x + 10,
    duration: 25,
    ease: 'linear',
    yoyo: true,
    repeat: count,
  };

  return addTween(scene, config);
}
