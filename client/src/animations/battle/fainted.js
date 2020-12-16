import { cropOut, shake } from '../common';

export default function (scene, event) {
  // dependencies
  const { partyIndex, myMon, enemyMon, dialogBox } = scene;

  const { side } = event;
  const mon = side === partyIndex ? myMon : enemyMon;

  return Promise.all([
    dialogBox.displayDialog([`${mon.name} has fainted`]),
    shake(scene, mon.image).then(() => cropOut(scene, mon.image, 'down')),
  ]).then(() => {
    scene[side === partyIndex ? 'myMon' : 'enemyMon'] = {};
  });
}
