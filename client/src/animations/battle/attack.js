import { addSpriteAnimation } from '../utils';
import { move } from '../common';

const attackerAnimation = (scene, attackingMon, isMySide) => {
  const { x, y } = isMySide
    ? { x: attackingMon.image.x + 25, y: attackingMon.image.y - 25 }
    : { x: attackingMon.image.x - 25, y: attackingMon.image.y + 25 };

  return move(scene, attackingMon.image, { x, y }, { duration: 100, yoyo: true });
};

const targetAnimation = (scene, targetMon) => {
  const hitSprite = scene.add
    .sprite(
      targetMon.image.x + targetMon.image.displayWidth * 0.5,
      targetMon.image.y - targetMon.image.displayHeight * 0.75,
      'physicalHit'
    )
    .setScale(0.25);

  return addSpriteAnimation(hitSprite, 'physicalHit');
};

export default function (scene, attackEvent) {
  // dependencies
  const { partyIndex, myMon, enemyMon } = scene;

  const { side, damage } = attackEvent;

  const isMySide = partyIndex === side;

  const { targetMon, attackingMon } = isMySide
    ? { targetMon: enemyMon, attackingMon: myMon }
    : { targetMon: myMon, attackingMon: enemyMon };

  return attackerAnimation(scene, attackingMon, isMySide).then(() =>
    Promise.all([targetAnimation(scene, targetMon), targetMon.healthBar.updateHealth(-damage)])
  );
}
