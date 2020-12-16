import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import { getSpeciesImageName } from '../utils';
import useMonAnimation from '../animations/battle/use-mon';
import attackAnimation from '../animations/battle/attack';
import faintedAnimation from '../animations/battle/fainted';

// TODO
// add stats bar
// add other attack types and dialog
// add other dialog for non wild battle

const switchAction = (scene, newTurnEvent, options = {}) => {
  // dependencies
  const { battle, partyIndex, dialogBox } = scene;
  const { includeBack = true } = options;

  const mons = battle.parties[partyIndex].mons;

  const monIndex = battle.monBattleStates[partyIndex]?.monIndex;

  const eligibleMons = mons.filter(({ currentHealth }, i) => {
    return i !== monIndex && currentHealth > 0;
  });

  return new Promise((resolve) => {
    const buttons = eligibleMons.map((mon, i) => ({
      name: `${mon.species.name.toUpperCase()}`,
      action: () => {
        battle.use(partyIndex, i);
        resolve();
      },
    }));

    if (includeBack) {
      buttons.push({ name: 'back', action: () => newTurnAnimation(scene, newTurnEvent).then(resolve) });
    }

    const infoText = 'Choose a mon.';
    dialogBox.displayButtons(buttons, infoText);
  });
};

const attackAction = (scene, newTurnEvent) => {
  // dependencies
  const { partyIndex, dialogBox, battle, myMon } = scene;
  const monData = battle.parties[partyIndex].mons[myMon.index];

  return new Promise((resolve) => {
    const buttonActions = monData.moves
      .map(({ name }, i) => ({
        name: name.toUpperCase(),
        action: () => {
          battle.attack(partyIndex, i);
          resolve();
        },
      }))
      .concat({ name: 'back', action: () => newTurnAnimation(scene, newTurnEvent).then(resolve) });

    const infoText = 'Choose an attack.';
    dialogBox.displayButtons(buttonActions, infoText);
  });
};

const newTurnAnimation = (scene, newTurnEvent) => {
  // dependencies
  const { partyIndex, dialogBox } = scene;
  const { side } = newTurnEvent;

  return new Promise((resolve) => {
    if (scene.ended) return resolve();

    if (side !== partyIndex) return resolve();

    const buttonActions = [
      {
        name: 'FIGHT',
        action: () => attackAction(scene, newTurnEvent).then(resolve),
      },
      {
        name: 'SWITCH',
        action: () => switchAction(scene, newTurnEvent).then(resolve),
        // action: resolve,
      },
      {
        name: 'BAG',
        action: () => {
          dialogBox.displayButtons([
            { name: 'back', action: () => newTurnAnimation(scene, newTurnEvent).then(resolve) },
          ]);
        },
      },
      {
        name: 'RUN',
        action: () => {
          window.optimisticMonMon.runFromWildBattle();
          scene.scene.start('Menu');
          resolve();
        },
      },
    ];

    const infoText = 'Select an action.';
    dialogBox.displayButtons(buttonActions, infoText);
  });
};

const firstTurnAnimation = (scene, event) => switchAction(scene, event, { includeBack: false });

const battleEndedAnimation = (scene, event) => {
  // dependencies
  const { partyIndex, dialogBox, battle } = scene;
  const { winner } = event;
  const dialog = winner === partyIndex ? ['YOU WON!!!!'] : [`YOU LOST :(`];

  return dialogBox.displayDialog(dialog).then(() => {
    battle.removeAllListeners();
  });
};

const experienceGainedAnimation = async (scene, event) => {
  // dependencies
  const { dialogBox, partyIndex, myMon } = scene;
  const [{ side, experience }] = event;

  if (side !== partyIndex) return;

  return dialogBox.displayDialog([`${myMon.name} gained ${experience} EXP. points!`]);
};

const ANIMATIONS_BY_EVENT = {
  use: useMonAnimation,
  newTurn: newTurnAnimation,
  attack: attackAnimation,
  ended: battleEndedAnimation,
  fainted: faintedAnimation,
  experienceGained: experienceGainedAnimation,
  firstTurn: firstTurnAnimation,
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('Battle');
  }

  init(data) {
    this.battle = data.battle;
  }

  preload() {
    this.eventQueue = [];
    this.busy = false;
    this.ended = false;

    // TODO: replace default
    this.partyIndex = 0;
    this.enemyIndex = 1;

    this.myMon = { image: null, index: null, name: null, healthBar: null };

    this.enemyMon = { image: null, index: null, name: null, healthBar: null };

    this.battle.parties.forEach(({ mons }) => {
      mons.forEach(({ species }) => {
        this.load.image(getSpeciesImageName(species.id), `src/assets/images/species/${species.id}.png`);
      });
    });

    // load animations
    this.load.spritesheet('physicalHit', 'src/assets/images/battle/physical-hit.png', {
      frameWidth: 1024,
      frameHeight: 1024,
    });

    this.load.spritesheet('smoke', 'src/assets/images/battle/smoke.png', {
      frameWidth: 1024,
      frameHeight: 1024,
    });
  }

  create() {
    this.dialogBox = new DialogBox(this);

    Object.keys(ANIMATIONS_BY_EVENT).forEach((eventName) => {
      this.battle.on(eventName, (event) => {
        if (eventName === 'ended') {
          this.ended = true;
        }

        this.eventQueue.push({ name: eventName, event });
      });
    });

    // create animations
    this.anims.create({ key: 'physicalHit', frames: 'physicalHit', frameRate: 128 });
    this.anims.create({ key: 'smoke', frames: 'smoke', frameRate: 6 });

    // add first choose event
    this.eventQueue.push({ name: 'firstTurn', event: {} });
  }

  update() {
    if (this.busy || this.eventQueue.length === 0) return;

    this.busy = true;
    const { name, event } = this.eventQueue.shift();

    return ANIMATIONS_BY_EVENT[name](this, event).then(() => {
      this.busy = false;

      if (name !== 'ended') return;

      window.optimisticMonMon.processWildBattle();
      this.scene.start('Menu');
    });
  }
}
