import { shrink, move } from '../common';
import { addSpriteAnimation } from '../utils';

import { getSpeciesImageName } from '../../utils';
import HealthBar from '../../game-objects/health-bar';

const returnMonAnimation = (scene, useMonEvent) => {
  // dependencies
  const { dialogBox, myMon, enemyMon, partyIndex } = scene;

  const { side } = useMonEvent;

  const isMySide = partyIndex === side;

  const { mon, dialog } = isMySide
    ? {
        mon: myMon,
        dialog: [`${myMon.name.toUpperCase()}, thats enough! Come back!`],
      }
    : {
        mon: enemyMon,
        dialog: [`Opponent withdrew ${enemyMon.name.toUpperCase()}`],
      };
  console.log('🚀 ~ file: use-mon.js ~ line 16 ~ returnMonAnimation ~ mon', mon);

  return Promise.all([dialogBox.displayDialog(dialog), shrink(scene, mon.image)]).then(() => {
    mon.healthBar.destroy();
    mon.image.destroy();

    scene[isMySide ? 'myMon' : 'enemyMon'] = {};
  });
};

const sendOutAnimation = (scene, useMonEvent) => {
  // dependencies
  const { partyIndex, enemyIndex, battle, dialogBox } = scene;

  const { side, monBattleState } = useMonEvent;

  const isMySide = partyIndex === side;

  const { healthBarX, healthBarY, monData, monImageY, targetX, key } = isMySide
    ? {
        healthBarX: 350,
        healthBarY: 225,
        monData: battle.parties[partyIndex].mons[monBattleState.monIndex],
        monImageY: scene.scale.height * 0.62,
        targetX: 75,
        key: 'myMon',
      }
    : {
        healthBarX: 50,
        healthBarY: 0,
        monData: battle.parties[enemyIndex].mons[monBattleState.monIndex],
        monImageY: scene.scale.height * 0.3,
        targetX: scene.scale.width * 0.7,
        key: 'enemyMon',
      };

  const healthBar = new HealthBar(scene, healthBarX, healthBarY, monData);

  const monImage = scene.add.image(0, monImageY, getSpeciesImageName(monData.species.id));
  monImage.setOrigin(0, 1);
  monImage.setScale(0.66);

  scene[key] = {
    image: monImage,
    index: monBattleState.monIndex,
    name: monData.species.name.toUpperCase(),
    healthBar,
  };

  const imageAnimation = () => {
    if (!isMySide) {
      return move(scene, monImage, { x: targetX }, { duration: 1000 });
    }

    monImage.setX(targetX);

    const smokeSprite = scene.add
      .sprite(targetX + monImage.displayWidth * 0.5, monImage.y - monImage.displayHeight * 0.25, 'smoke')
      .setScale(0.25);

    return addSpriteAnimation(smokeSprite, 'smoke');
  };

  const dialog = isMySide
    ? [`Go ${monData.species.name.toUpperCase()}!`]
    : [`A wild ${monData.species.name.toUpperCase()} has appeared!`];

  return Promise.all([imageAnimation(), dialogBox.displayDialog(dialog)]);
};

export default async (scene, useMonEvent) => {
  // dependencies
  const { myMon, enemyMon, partyIndex } = scene;

  const { side } = useMonEvent;

  const { image } = side === partyIndex ? myMon : enemyMon;

  if (image) {
    await returnMonAnimation(scene, useMonEvent);
  }

  return sendOutAnimation(scene, useMonEvent);
};
