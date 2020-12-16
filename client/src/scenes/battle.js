import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import HealthBar from '../game-objects/health-bar';
import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS } from '../enums';

// TODO
// add stats bar
// add back button

const PHYSICAL_HIT_FRAMERATE = 128;
const SMOKE_FRAMERATE = 30;
const PLAYER_MON_X = 50;
const OTHER_MON_X = 600;
const MON_SCALE = 0.66;
const ENEMY_SLIDE_IN_DURATION = 750;
const BATTLE_HEIGHT_RATIO = 0.66;

const HEALTH_BARS = [
  { x: 340, y: 280 },
  { x: 200, y: 25 },
];

// Animations
const animateMonAppears = async (scene, { image }) => {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      x: OTHER_MON_X,
      duration: ENEMY_SLIDE_IN_DURATION,
      ease: 'linear',
      onComplete: resolve,
    });
  });
};

const animateSendMonOut = async (scene, { image }) => {
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
};

const animateBringMonIn = async (scene, { image }) => {
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
};

const animateAttacker = (scene, { image }) => {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      x: image.x + 25,
      y: image.y - 25,
      duration: 100,
      ease: 'linear',
      yoyo: 'true',
      onComplete: resolve,
    });
  });
};

const animateDefender = (scene, { image }) => {
  return new Promise((resolve) => {
    const hitAnimation = scene.add
      .sprite(image.x + image.displayWidth * 0.5, image.y + image.displayHeight * 0.75, 'physicalHit')
      .setScale(0.25)
      .play('physicalHit');

    hitAnimation.once('animationcomplete', () => {
      hitAnimation.destroy();
      resolve();
    });
  });
};

const animateMonShake = (scene, { image }) => {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      x: image.x + 10,
      duration: 25,
      ease: 'linear',
      yoyo: 'true',
      repeat: 10,
      onComplete: resolve,
    });
  });
};

const animateMonFaint = (scene, { image }) => {
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: image,
      y: image.y + 150,
      duration: 500,
      ease: 'linear',
      onComplete: resolve,
      onUpdate: (tween, target) => {
        image.setCrop(0, 0, image.width, target.height - tween.progress * target.height);
      },
    });
  });
};

// Click Event Handlers
const handleSwitchClicked = (scene) => {
  const { battle, partyIndex, dialogBox } = scene;

  const mons = battle.parties[partyIndex].mons;
  const monIndex = battle.monBattleStates[partyIndex]?.monIndex;
  const eligibleMons = mons.filter(({ currentHealth }, i) => i !== monIndex && currentHealth > 0);

  return new Promise((resolve) => {
    const buttonActions = eligibleMons.map((mon, i) => ({
      name: `${mon.species.name.toUpperCase()}`,
      action: () => {
        battle.use(partyIndex, i);
        resolve();
      },
    }));

    const promptText = 'Choose a mon.';
    dialogBox.displayButtons(promptText, buttonActions);
  });
};

const handleAttackClicked = (scene) => {
  const { partyIndex, dialogBox, battle, myMon } = scene;
  const monData = battle.parties[partyIndex].mons[myMon.battleState.monIndex];

  return new Promise((resolve) => {
    const buttonActions = monData.moves.map(({ name, maxPowerPoints }, i) => ({
      name: `${name.toUpperCase()} (PP: ${myMon.battleState.powerPoints[i]}/${maxPowerPoints})`,
      action: () => {
        battle.attack(partyIndex, i);
        resolve();
      },
    }));

    const promptText = 'Choose an attack.';
    dialogBox.displayButtons(promptText, buttonActions);
  });
};

// Battle Event Handlers
const handleNewTurn = (scene, event) => {
  // dependencies
  const { partyIndex, dialogBox, battle } = scene;
  const { side } = event;

  return new Promise((resolve) => {
    // if (scene.ended) return resolve();

    if (side !== partyIndex) return resolve();

    const buttonActions = [
      {
        name: 'ATTACK',
        action: () => handleAttackClicked(scene).then(resolve),
      },
      // {
      //   name: 'SWITCH',
      //   action: resolve,
      // },
      // {
      //   name: 'BAG',
      //   action: resolve,
      // },
      {
        name: 'RUN',
        action: () => {
          window.optimisticMonMon.runFromWildBattle();
          scene.scene.start('Menu');
          resolve();
        },
      },
    ];

    const promptText = 'Select an action.';
    dialogBox.displayButtons(promptText, buttonActions);
  });
};

const handleMonUsed = async (scene, event) => {
  const { dialogBox, partyIndex } = scene;
  const { side, monBattleState } = event;
  const isMySide = partyIndex === side;
  const currentMon = event.side === partyIndex ? scene.myMon : scene.enemyMon;

  if (currentMon) {
    const monInDialog = isMySide
      ? `${mon.battleState.species.name.toUpperCase()}, thats enough! Come back!`
      : `Opponent withdrew ${mon.battleState.species.name.toUpperCase()}`;

    (isMySide ? scene.myHealthBar : scene.enemyHealthBar).destroy();

    await Promise.all([dialogBox.displayDialog(monInDialog), animateBringMonIn(scene, mon)]);
  }

  const { hi } = SPECIES_COLORS[monBattleState.species.id];

  const { x: healthBarX, y: healthBarY } = HEALTH_BARS[isMySide ? 0 : 1];
  const healthBarOptions = { fillColor: hi };
  const healthBar = new HealthBar(scene, healthBarX, healthBarY, monBattleState, healthBarOptions);

  const monImageX = isMySide ? scene.scale.width : 0;
  const monImageY = isMySide ? scene.scale.height * 0.33 : 10;
  const monImage = scene.add.image(monImageX, monImageY, getSpeciesImageName(monBattleState.species.id));

  monImage.setOrigin(0, 0);
  monImage.setScale(MON_SCALE);
  monImage.setFlipX(isMySide);

  const monObject = { image: monImage, battleState: monBattleState };
  const imageAnimation = isMySide ? animateSendMonOut(scene, monObject) : animateMonAppears(scene, monObject);

  if (isMySide) {
    scene.myHealthBar = healthBar;
    scene.myMon = monObject;
  } else {
    scene.enemyHealthBar = healthBar;
    scene.enemyMon = monObject;
  }

  const monOutDialog = isMySide
    ? `Go ${monBattleState.species.name.toUpperCase()}!`
    : `A wild ${monBattleState.species.name.toUpperCase()} has appeared!`;

  return Promise.all([dialogBox.displayDialog(monOutDialog), imageAnimation]);
};

const handleMonAttacked = async (scene, event) => {
  const { myMon, enemyMon, dialogBox } = scene;
  const { side, move, damage } = event;
  const isMySide = scene.partyIndex === side;
  const defendingMon = isMySide ? enemyMon : myMon;
  const attackingMon = isMySide ? myMon : enemyMon;
  const affectedHealthBar = isMySide ? scene.enemyHealthBar : scene.myHealthBar;

  await Promise.all([
    dialogBox.displayDialog(`${attackingMon.battleState.species.name.toUpperCase()} used ${move.name.toUpperCase()}.`),
    animateAttacker(scene, attackingMon),
    animateDefender(scene, defendingMon).then(() => affectedHealthBar.updateHealth(-damage)),
  ]);

  return dialogBox.displayDialog(
    `${defendingMon.battleState.species.name.toUpperCase()} took ${damage || 'no'} damage.`
  );
};

const handleFainted = async (scene, event) => {
  const { dialogBox } = scene;
  const isMySide = scene.partyIndex === event.side;
  const mon = isMySide ? scene.myMon : scene.enemyMon;

  if (isMySide) {
    scene.myMon = null;
  } else {
    scene.enemyMon = null;
  }

  await Promise.all([
    dialogBox.displayDialog(`${mon.battleState.species.name.toUpperCase()} has fainted`),
    animateMonShake(scene, mon).then(() => animateMonFaint(scene, mon)),
  ]);
};

const handleExperienceGained = (scene, event) => {
  const { dialogBox, partyIndex, myMon } = scene;
  const [{ side, experience }] = event;

  if (side !== partyIndex) return;

  return dialogBox.displayDialog(`${myMon.battleState.species.name.toUpperCase()} gained ${experience} EXP. points!`);
};

const handleBattleEnded = async (scene, event) => {
  const { partyIndex, dialogBox, battle } = scene;
  const { winner } = event;
  const dialog = winner === partyIndex ? 'You won the battle!' : `You lost the battle!`;

  await dialogBox.displayDialog(dialog);

  battle.removeAllListeners();
};

const eventHandlers = {
  use: handleMonUsed,
  newTurn: handleNewTurn,
  attack: handleMonAttacked,
  ended: handleBattleEnded,
  fainted: handleFainted,
  experienceGained: handleExperienceGained,
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('Battle');
  }

  init({ battle }) {
    this.battle = battle;
    this.eventQueue = [];
    this.busy = false;
    // this.ended = false;

    // TODO: replace default
    this.partyIndex = 0;
    this.enemyIndex = 1;

    this.myMon = null;
    this.myHealthBar = null;

    this.enemyMon = null;
    this.enemyHealthBar = null;
  }

  preload() {
    this.battle.parties.forEach(({ mons }) => {
      mons.forEach(({ species }) => {
        this.load.image(getSpeciesImageName(species.id), `src/assets/images/species/${species.id}.png`);
      });
    });

    // Load animations
    const spritesheetOptions = { frameWidth: 1024, frameHeight: 1024 };
    this.load.spritesheet('physicalHit', 'src/assets/images/battle/physical-hit.png', spritesheetOptions);
    this.load.spritesheet('smoke', 'src/assets/images/battle/smoke.png', spritesheetOptions);
  }

  create() {
    Object.keys(eventHandlers).forEach((eventName) => {
      this.battle.on(eventName, (event) => {
        // this.ended = eventName === 'ended';
        this.eventQueue.push({ name: eventName, event });
      });
    });

    // create animations
    this.anims.create({ key: 'physicalHit', frames: 'physicalHit', frameRate: PHYSICAL_HIT_FRAMERATE });
    this.anims.create({ key: 'smoke', frames: 'smoke', frameRate: SMOKE_FRAMERATE });

    this.battle.use(this.partyIndex, 0);

    this.cameras.main.setBackgroundColor('#ffffff');

    this.dialogBox = new DialogBox(this);
  }

  async update() {
    if (this.busy || this.eventQueue.length === 0) return;

    this.busy = true;
    const { name, event } = this.eventQueue.shift();

    await eventHandlers[name](this, event);

    this.busy = false;

    if (name !== 'ended') return;

    window.optimisticMonMon.processWildBattle();
    this.scene.start('Menu');
  }
}
