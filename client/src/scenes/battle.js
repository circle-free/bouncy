import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import HealthBar from '../game-objects/health-bar';

// TODO add switch action
// stats bar
// add other attack types and dialog
// add other dialog for non wild battle

const useMonDialog = (battleScene, monData, isPlayerSide) => {
  if (isPlayerSide) {
    return [`Go ${monData.name}!`];
  }

  if (battleScene.battleClient.battleType === 'wild') {
    return [`A wild ${monData.type} has appeared!`];
  }
};
const useMonImageAnimation = (battleScene, monData, isPlayerSide) =>
  new Promise((resolve) => {
    const healthBarX = isPlayerSide ? 350 : 50;
    const healthBarY = isPlayerSide ? 250 : 0;
    const healthBar = new HealthBar(
      battleScene,
      healthBarX,
      healthBarY,
      monData
    );

    battleScene[
      isPlayerSide ? 'playerHealthBar' : 'enemyHealthBar'
    ] = healthBar;

    const x = isPlayerSide ? battleScene.scale.width : 0;
    const y = isPlayerSide ? battleScene.scale.height * 0.33 : 10;

    const mon = battleScene.add.image(x, y, monData.type, 3);
    mon.setOrigin(0, 0);
    mon.setScale(0.66);

    if (isPlayerSide) {
      battleScene.playerMon = mon;
    } else {
      battleScene.enemyMon = mon;
    }

    const targetX = isPlayerSide ? 50 : 600;

    if (battleScene.battleClient.battleType === 'wild' && !isPlayerSide) {
      battleScene.tweens.add({
        targets: mon,
        x: targetX,
        duration: 1500,
        ease: 'linear',
        onComplete: resolve,
      });
    } else {
      const smokeAnimation = battleScene.add
        .sprite(
          targetX + mon.displayWidth * 0.5,
          mon.y + mon.displayHeight * 0.25,
          'smoke'
        )
        .setScale(0.25)
        .play('smoke');

      mon.setX(targetX);

      smokeAnimation.once('animationcomplete', () => {
        smokeAnimation.destroy();
        resolve();
      });
    }
  });
const returnMonAnimation = (battleScene, mon, isPlayerSide) => {
  const originalScale = mon.scale;

  battleScene[isPlayerSide ? 'playerHealthBar' : 'enemyHealthBar'].destroy();

  return new Promise((resolve) => {
    battleScene.tweens.add({
      targets: mon,
      y: mon.y + 150,
      duration: 150,
      ease: 'linear',
      onComplete: resolve,
      onUpdate: (tween) => {
        mon.setScale(originalScale * (1 - tween.progress));
      },
    });
  });
};
const useMonAnimation = async (battleScene, useMonEvent) => {
  const { monIndex, side } = useMonEvent;
  const isPlayerSide = side === battleScene.battleClient.player.id;
  const monData =
    battleScene.battleClient[isPlayerSide ? 'player' : 'enemy'].mons[monIndex];
  const currentMon = isPlayerSide
    ? battleScene.playerMon
    : battleScene.enemyMon;

  if (currentMon) {
    await Promise.all([
      battleScene.dialogBox.displayDialog(
        isPlayerSide
          ? [`${monData.name}, thats enough! Come back!`]
          : [
              `${battleScene.battleClient.enemy.name} is sending out ${
                monData.name || monData.type
              }`,
            ]
      ),
      returnMonAnimation(battleScene, currentMon, isPlayerSide),
    ]);
  }

  return Promise.all([
    battleScene.dialogBox.displayDialog(
      useMonDialog(battleScene, monData, isPlayerSide)
    ),
    useMonImageAnimation(battleScene, monData, isPlayerSide),
  ]);
};

const attackAction = (battleScene) => {
  const monIndex = battleScene.battleClient.playerMonState.monIndex;
  const monData = battleScene.battleClient.player.mons[monIndex];

  return new Promise((resolve) => {
    battleScene.dialogBox.displayButtons(
      monData.moves.map(({ name }, i) => ({
        name,
        action: () => {
          battleScene.battleClient.attack(i);
          resolve();
        },
      }))
    );
  });
};
const newTurnAnimation = (battleScene, newTurnEvent) =>
  new Promise((resolve) => {
    if (newTurnEvent.side !== battleScene.battleClient.player.id) {
      resolve();
    }

    battleScene.dialogBox.displayButtons([
      {
        name: 'FIGHT',
        action: () => attackAction(battleScene).then(resolve),
      },
      {
        name: 'SWITCH',
        action: resolve,
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

const attackerAnimation = (battleScene, attackingMon) =>
  new Promise((resolve) => {
    battleScene.tweens.add({
      targets: attackingMon,
      x: attackingMon.x + 25,
      y: attackingMon.y - 25,
      duration: 100,
      ease: 'linear',
      yoyo: 'true',
      onComplete: resolve,
    });
  });
const targetAnimation = (battleScene, targetMon, hitType) =>
  new Promise((resolve) => {
    const hitAnimation = battleScene.add
      .sprite(
        targetMon.x + targetMon.displayWidth * 0.5,
        targetMon.y + targetMon.displayHeight * 0.75,
        `${hitType}Hit`
      )
      .setScale(0.25)
      .play(`${hitType}Hit`);

    hitAnimation.once('animationcomplete', () => {
      hitAnimation.destroy();
      resolve();
    });
  });
const attackAnimation = (battleScene, attackEvent) => {
  const { type: hitType, side, damage } = attackEvent;

  const { targetMon, attackingMon, healthBar } =
    side === battleScene.battleClient.player.id
      ? {
          targetMon: battleScene.enemyMon,
          attackingMon: battleScene.playerMon,
          healthBar: battleScene.enemyHealthBar,
        }
      : {
          targetMon: battleScene.playerMon,
          attackingMon: battleScene.enemyMon,
          healthBar: battleScene.playerHealthBar,
        };
  return attackerAnimation(battleScene, attackingMon).then(() =>
    Promise.all([
      targetAnimation(battleScene, targetMon, hitType),
      healthBar.updateHealth(-damage),
    ])
  );
};

const battleEndedAnimation = (battleScene, event) => {
  const { winnerId } = event;

  const enemyMonIndex = battleScene.battleClient.enemyMonState.monIndex;
  const enemyMonData = battleScene.battleClient.enemy.mons[enemyMonIndex];

  const enemyName =
    battleScene.battleClient.battleType === 'wild'
      ? enemyMonData.type
      : battleScene.battleClient.enemy.name;

  const { id: playerId, name: playerName } = battleScene.battleClient.player;

  const dialog =
    winnerId === playerId
      ? [`${playerName} defeated ${enemyName}`]
      : [`${enemyName} defeated ${playerName}`];

  return battleScene.dialogBox.displayDialog([dialog]).then(() => {
    battleScene.battleClient.removeAllListeners();
    battleScene.scene.restart();
  });
};

const shakeAnimation = (battleScene, mon) =>
  new Promise((resolve) => {
    battleScene.tweens.add({
      targets: mon,
      x: mon.x + 10,
      duration: 25,
      ease: 'linear',
      yoyo: 'true',
      repeat: 10,
      onComplete: resolve,
    });
  });
const dropDownAnimation = (battleScene, mon) =>
  new Promise((resolve) => {
    battleScene.tweens.add({
      targets: mon,
      y: mon.y + 150,
      duration: 500,
      ease: 'linear',
      onComplete: resolve,
      onUpdate: (tween, target) => {
        mon.setCrop(
          0,
          0,
          mon.width,
          target.height - tween.progress * target.height
        );
      },
    });
  });
const faintedAnimation = (battleScene, event) => {
  const { side } = event;

  const mon =
    side === battleScene.battleClient.player.id
      ? battleScene.playerMon
      : battleScene.enemyMon;

  const monIndex = battleScene.battleClient.playerMonState.monIndex;
  const monData = battleScene.battleClient.player.mons[monIndex];

  return Promise.all([
    battleScene.dialogBox.displayDialog([
      `${monData.name || monData.type} has fainted`,
    ]),
    shakeAnimation(battleScene, mon).then(() =>
      dropDownAnimation(battleScene, mon)
    ),
  ]);
};

const experienceGainedAnimation = (battleScene, event) => {
  const { side, monIndex, experience } = event;

  if (side !== battleScene.battleClient.player.id) {
    return;
  }

  const monData = battleScene.battleClient.player.mons[monIndex];

  return battleScene.dialogBox.displayDialog([
    `${monData.name || monData.type} gained ${experience} EXP. points!`,
  ]);
};

const ANIMATIONS_BY_EVENT = {
  useMon: useMonAnimation,
  newTurn: newTurnAnimation,
  attack: attackAnimation,
  battleEnded: battleEndedAnimation,
  fainted: faintedAnimation,
  experienceGained: experienceGainedAnimation,
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('Battle');
  }

  init(data) {
    this.battleClient = data.battleClient;
  }

  preload() {
    this.temp = false;

    this.eventQueue = [];
    this.busy = false;
    this.playerMon = null;
    this.enemyMon = null;
    this.playerHealthBar = null;
    this.enemyHealthBar = null;

    const { enemy, player } = this.battleClient;

    // load all player mons
    const { mons: playerMons } = player;
    playerMons.forEach(({ type }) => {
      this.load.image(type, `src/assets/images/mon/${type}.png`);
    });

    // load all enemy mons
    const { mons: enemyMons } = enemy;
    enemyMons.forEach(({ type }) => {
      this.load.image(type, `src/assets/images/mon/${type}.png`);
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
      this.battleClient.on(eventName, (event) => {
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
  }

  update() {
    if (!this.temp) {
      this.temp = true;
      this.battleClient._triggerEvent('useMon', {
        monIndex: 0,
        side: 1,
      });
      this.battleClient._triggerEvent('useMon', {
        monIndex: 0,
        side: 0,
      });
      this.battleClient._triggerEvent('useMon', {
        monIndex: 1,
        side: 0,
      });
      this.battleClient._triggerEvent('newTurn', {
        type: 'caterpie',
        name: 'Yucky',
        side: 0,
      });
      this.battleClient._triggerEvent('attack', {
        type: 'physical',
        side: 0,
        damage: 23,
      });
      this.battleClient._triggerEvent('fainted', {
        side: 1,
      });
      this.battleClient._triggerEvent('experienceGained', {
        side: 0,
        monIndex: 0,
        experience: 500,
      });
      this.battleClient._triggerEvent('battleEnded', {
        winnerId: 0,
      });
      return;
    }

    if (!this.busy && this.eventQueue.length > 0) {
      this.busy = true;

      const { name, event } = this.eventQueue.shift();

      return ANIMATIONS_BY_EVENT[name](this, event).then(() => {
        this.busy = false;
      });
    }
  }
}
