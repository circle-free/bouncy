import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import HealthBar from '../game-objects/health-bar';

// TODO
// add stats bar
// add back button
// add other attack types and dialog
// add other dialog for non wild battle

const getSpeciesImageName = (speciesId) => `species-${speciesId}`;

const sendOutAnimation = (scene, useMonEvent) => {
  const { partyIndex, enemyIndex, battle, dialogBox } = scene;
  const { side, monBattleState } = useMonEvent;
  const isMySide = partyIndex === side;

  const healthBarX = isMySide ? 350 : 50;
  const healthBarY = isMySide ? 250 : 0;

  const monData = isMySide
    ? battle.parties[partyIndex].mons[monBattleState.monIndex]
    : battle.parties[enemyIndex].mons[monBattleState.monIndex];

  const monImageX = isMySide ? scene.scale.width : 0;
  const monImageY = isMySide ? scene.scale.height * 0.33 : 10;
  const targetX = isMySide ? 50 : 600;

  const healthBar = new HealthBar(scene, healthBarX, healthBarY, monData);

  scene[isMySide ? 'myHealthBar' : 'enemyHealthBar'] = healthBar;
  const monImage = scene.add.image(monImageX, monImageY, getSpeciesImageName(monData.species.id));

  monImage.setOrigin(0, 0);
  monImage.setScale(0.66);

  scene[isMySide ? 'myMon' : 'enemyMon'] = {
    image: monImage,
    index: monBattleState.monIndex,
    name: monData.species.name,
  };

  const imageAnimation = new Promise((resolve) => {
    if (!isMySide) {
      scene.tweens.add({
        targets: monImage,
        x: targetX,
        duration: 1500,
        ease: 'linear',
        onComplete: resolve,
      });

      return;
    }

    const smokeAnimation = scene.add
      .sprite(
        targetX + monImage.displayWidth * 0.5,
        monImage.y + monImage.displayHeight * 0.25,
        'smoke'
      )
      .setScale(0.25)
      .play('smoke');

    monImage.setX(targetX);

    smokeAnimation.once('animationcomplete', () => {
      smokeAnimation.destroy();
      resolve();
    });
  });

  const dialog = isMySide
    ? [`Go ${monData.species.name.toUpperCase()}!`]
    : [`A wild ${monData.species.name.toUpperCase()} has appeared!`];

  const displayDialog = dialogBox.displayDialog(dialog);

  return Promise.all([imageAnimation, displayDialog]);
};

const returnMonAnimation = (scene, useMonEvent) => {
  // dependencies
  const { dialogBox, myMon, myHealthBar, enemyMon, enemyHealthBar, partyIndex } = scene;
  const { side } = useMonEvent;
  const isMySide = partyIndex === side;

  const currentMon = isMySide ? myMon : enemyMon;
  const currentHealthBar = isMySide ? myHealthBar : enemyHealthBar;

  const dialog = isMySide
    ? [`${myMon.name.toUpperCase()}, thats enough! Come back!`]
    : [[`Opponent withdrew ${myMon.name.toUpperCase()}`]];

  const originalScale = currentMon.image.scale;

  currentHealthBar.destroy();

  const displayReturnMonDialog = dialogBox.displayDialog(dialog);

  const tween = new Promise((resolve) => {
    scene.tweens.add({
      targets: currentMon.image,
      y: currentMon.image.y + 150,
      duration: 150,
      ease: 'linear',
      onComplete: () => {
        currentMon.image.destroy();
        resolve();
      },
      onUpdate: (tween) => {
        currentMon.image.setScale(originalScale * (1 - tween.progress));
      },
    });
  });

  return Promise.all([displayReturnMonDialog, tween]).then(
    () => (scene[isMySide ? 'myMon' : 'enemyMon'] = {})
  );
};

const useMonAnimation = async (scene, useMonEvent) => {
  // dependencies
  const { myMon, enemyMon, partyIndex } = scene;
  const { side } = useMonEvent;
  const { image } = side === partyIndex ? myMon : enemyMon;

  if (image) {
    await returnMonAnimation(scene, useMonEvent);
  }

  return sendOutAnimation(scene, useMonEvent);
};

const switchAction = (scene) => {
  // dependencies
  const { battle, partyIndex, dialogBox, myMon } = scene;
  const currentMonIndex = myMon?.index;
  const mons = battle.parties[partyIndex].mons;

  // TODO: and have currentHealth
  const eligibleMons = mons.filter((_value, i) => i !== currentMonIndex);

  return new Promise((resolve) => {
    dialogBox.displayButtons(
      eligibleMons.map((mon, i) => ({
        name: `${mon.species.name.toUpperCase()}`,
        action: () => {
          battle.use(partyIndex, i);
          resolve();
        },
      }))
    );
  });
};

const attackAction = (scene) => {
  // dependencies
  const { partyIndex, dialogBox, battle, myMon } = scene;
  const monData = battle.parties[partyIndex].mons[myMon.index];

  return new Promise((resolve) => {
    dialogBox.displayButtons(
      monData.moves.map(({ name }, i) => ({
        name: name.toUpperCase(),
        action: () => {
          battle.attack(partyIndex, i);
          resolve();
        },
      }))
    );
  });
};

const newTurnAnimation = (scene, newTurnEvent) => {
  // dependencies
  const { partyIndex, dialogBox } = scene;
  const { side } = newTurnEvent;

  return new Promise((resolve) => {
    if (side !== partyIndex) return resolve();

    dialogBox.displayButtons([
      {
        name: 'FIGHT',
        action: () => attackAction(scene).then(resolve),
      },
      {
        name: 'SWITCH',
        action: () => switchAction(scene).then(resolve),
      },
      {
        name: 'BAG',
        action: resolve,
      },
      {
        name: 'RUN',
        action: resolve,
      },
    ]);
  });
};

const firstTurnAnimation = switchAction;

const attackerAnimation = (scene, attackingMon) =>
  new Promise((resolve) => {
    scene.tweens.add({
      targets: attackingMon.image,
      x: attackingMon.image.x + 25,
      y: attackingMon.image.y - 25,
      duration: 100,
      ease: 'linear',
      yoyo: 'true',
      onComplete: resolve,
    });
  });

const targetAnimation = (scene, targetMon) => {
  return new Promise((resolve) => {
    const hitAnimation = scene.add
      .sprite(
        targetMon.image.x + targetMon.image.displayWidth * 0.5,
        targetMon.image.y + targetMon.image.displayHeight * 0.75,
        'physicalHit'
      )
      .setScale(0.25)
      .play('physicalHit');

    hitAnimation.once('animationcomplete', () => {
      hitAnimation.destroy();
      resolve();
    });
  });
};

const attackAnimation = (scene, attackEvent) => {
  // dependencies
  const { partyIndex, myMon, enemyMon, myHealthBar, enemyHealthBar } = scene;
  const { side, damage } = attackEvent;
  const isMySide = partyIndex === side;
  const targetMon = isMySide ? enemyMon : myMon;
  const attackingMon = isMySide ? myMon : enemyMon;
  const affectedHealthBar = isMySide ? enemyHealthBar : myHealthBar;

  return attackerAnimation(scene, attackingMon).then(() =>
    Promise.all([
      targetAnimation(scene, targetMon),
      affectedHealthBar.updateHealth(-damage),
    ])
  );
};

const battleEndedAnimation = (scene, event) => {
  // dependencies
  const { partyIndex, dialogBox, battle } = scene;
  const { winner } = event;
  const dialog = winner === partyIndex ? ['YOU WON!!!!'] : [`YOU LOST :(`];

  return dialogBox.displayDialog(dialog).then(() => {
    battle.removeAllListeners();
    scene.scene.restart();
  });
};

const shakeAnimation = (scene, mon) =>
  new Promise((resolve) => {
    scene.tweens.add({
      targets: mon.image,
      x: mon.image.x + 10,
      duration: 25,
      ease: 'linear',
      yoyo: 'true',
      repeat: 10,
      onComplete: resolve,
    });
  });

const dropDownAnimation = (scene, mon) =>
  new Promise((resolve) => {
    scene.tweens.add({
      targets: mon.image,
      y: mon.image.y + 150,
      duration: 500,
      ease: 'linear',
      onComplete: resolve,
      onUpdate: (tween, target) => {
        mon.image.setCrop(
          0,
          0,
          mon.image.width,
          target.height - tween.progress * target.height
        );
      },
    });
  });

const faintedAnimation = (scene, event) => {
  // dependencies
  const { partyIndex, myMon, enemyMon, dialogBox } = scene;
  const { side } = event;
  const mon = side === partyIndex ? myMon : enemyMon;

  return Promise.all([
    dialogBox.displayDialog([`${mon.name} has fainted`]),
    shakeAnimation(scene, mon).then(() => dropDownAnimation(scene, mon)),
  ]).then(() => {
    scene[side === partyIndex ? 'myMon' : 'enemyMon'] = {};
  });
};

const experienceGainedAnimation = async (scene, event) => {
  // dependencies
  const { dialogBox, partyIndex, myMon } = scene;
  const [{ side, experience }] = event;

  if (side !== partyIndex) return;

  return dialogBox.displayDialog([
    `${myMon.name} gained ${experience} EXP. points!`,
  ]);
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

    // TODO: replace default
    this.partyIndex = 0;
    this.enemyIndex = 1;

    this.myMon = { image: null, index: null, name: null };
    this.myHealthBar = null;

    this.enemyMon = { image: null, index: null, name: null };
    this.enemyHealthBar = null;

    this.battle.parties.forEach(({ mons }) => {
      mons.forEach(({ species }) => {
        this.load.image(
          getSpeciesImageName(species.id),
          `src/assets/images/species/${species.id}.png`
        );
      });
    });

    // load animations
    this.load.spritesheet(
      'physicalHit',
      'src/assets/images/battle/physical-hit.png',
      { frameWidth: 1024, frameHeight: 1024 }
    );

    this.load.spritesheet('smoke', 'src/assets/images/battle/smoke.png', {
      frameWidth: 1024,
      frameHeight: 1024,
    });
  }

  create() {
    this.dialogBox = new DialogBox(this);

    Object.keys(ANIMATIONS_BY_EVENT).forEach((eventName) => {
      this.battle.on(eventName, (event) => {
        console.log(
          '🚀 ~ file: battle.js ~ line 392 ~ BattleScene ~ this.battle.on ~ event',
          eventName,
          event
        );

        this.eventQueue.push({ name: eventName, event });
      });
    });

    // create animations
    this.anims.create({
      key: 'physicalHit',
      frames: 'physicalHit',
      frameRate: 128,
    });

    this.anims.create({
      key: 'smoke',
      frames: 'smoke',
      frameRate: 6,
    });

    // add first choose event
    this.eventQueue.push({
      name: 'firstTurn',
      event: {},
    });
  }

  update() {
    if (this.busy || this.eventQueue.length === 0) return;

    this.busy = true;

    const { name, event } = this.eventQueue.shift();
    console.log(name);

    return ANIMATIONS_BY_EVENT[name](this, event).then(() => {
      console.log('after ', name);
      this.busy = false;

      if (name !== 'ended') return;

      this.scene.start('Menu');
    });
  }
}
