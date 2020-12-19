import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import HealthBar from '../game-objects/health-bar';
import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS } from '../enums';

import {
  animateEnemySlideIn,
  animateSendMonOut,
  animateBringMonIn,
  animatePhysicalAttack,
  animatePhysicalHit,
  animateMonFaint,
} from '../animations/battle';

// TODO: add stats bar

const PHYSICAL_HIT_FRAMERATE = 128;
const SMOKE_FRAMERATE = 30;
const FONT_FAMILY = 'Helvetica, sans-serif';
const PADDING = 30;
const BLUE = 0x5c3eff;

const HEALTH_BARS = [
  { x: 300, y: 280 },
  { x: 0, y: 0 },
];

// Click Event Handlers
const handleSwitchClicked = (scene) => {
  const { battle, partyIndex, dialogBox } = scene;

  const mons = battle.parties[partyIndex].mons;
  const monIndex = battle.monBattleStates[partyIndex]?.monIndex;
  const eligibleMons = mons.filter(({ currentHealth }, i) => i !== monIndex && currentHealth > 0);

  const buttonActions = eligibleMons.map((mon, i) => ({
    name: `${mon.species.name.toUpperCase()}`,
    action: () => battle.use(partyIndex, i),
  }));

  const promptText = 'Choose a mon.';
  dialogBox.displayButtons(promptText, buttonActions);
};

const handleAttackClicked = (scene) => {
  const { partyIndex, dialogBox, battle, myMon } = scene;
  const monData = battle.parties[partyIndex].mons[myMon.battleState.monIndex];

  const buttonActions = monData.moves.map(({ name, maxPowerPoints }, i) => ({
    name: `${name.toUpperCase()} (PP: ${myMon.battleState.powerPoints[i]}/${maxPowerPoints})`,
    action: () => battle.attack(partyIndex, i),
  }));

  buttonActions.push({
    name: 'Back',
    action: () => handleNewTurn(scene, { side: partyIndex }),
  });

  const promptText = 'Choose an attack.';
  dialogBox.displayButtons(promptText, buttonActions);
};

// Battle Event Handlers
const handleNewTurn = (scene, event) => {
  // dependencies
  const { partyIndex, dialogBox, battle } = scene;
  const { side } = event;

  if (side !== partyIndex) return;

  const buttonActions = [
    {
      name: 'ATTACK',
      action: () => handleAttackClicked(scene),
    },
    // {
    //   name: 'SWITCH',
    //   action: () => {},
    // },
    // {
    //   name: 'BAG',
    //   action: () => {},
    // },
    {
      name: 'RUN',
      action: () => {
        window.optimisticMonMon.runFromWildBattle();
        scene.scene.start('Menu');
      },
    },
  ];

  const promptText = 'Select an action.';
  dialogBox.displayButtons(promptText, buttonActions);
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

  const monImageX = isMySide ? scene.playerMonX : scene.enemyMonX;
  const monImageY = isMySide ? scene.playerMonY : scene.enemyMonY;

  const monImage = scene.add
    .image(monImageX, monImageY, getSpeciesImageName(monBattleState.species.id))
    .setOrigin(0.5, 0.5)
    .setScale(scene.monScale)
    .setFlipX(isMySide);

  const monObject = { image: monImage, battleState: monBattleState };
  const imageAnimation = isMySide ? animateSendMonOut(scene, monObject) : animateEnemySlideIn(scene, monObject);

  const monOutDialog = isMySide
    ? `Go ${monBattleState.species.name.toUpperCase()}!`
    : `A wild ${monBattleState.species.name.toUpperCase()} has appeared!`;

  await Promise.all([dialogBox.displayDialog(monOutDialog), imageAnimation]);

  const healthBarOptions = { fillColor: hi, height: scene.healthBarHeight, width: scene.healthBarWidth };
  const healthBarX = isMySide ? scene.playerHealthBarX : scene.enemyHealthBarX;
  const healthBar = new HealthBar(scene, healthBarX, monImageY, monBattleState, healthBarOptions);

  if (isMySide) {
    scene.myHealthBar = healthBar;
    scene.myMon = monObject;
  } else {
    scene.enemyHealthBar = healthBar;
    scene.enemyMon = monObject;
  }
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
    animatePhysicalAttack(scene, attackingMon, { direction: isMySide ? 'right' : 'left' }),
    animatePhysicalHit(scene, defendingMon).then(() => affectedHealthBar.updateHealth(-damage)),
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
    animateMonFaint(scene, mon),
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
        this.eventQueue.push({ name: eventName, event });
      });
    });

    // create animations
    this.anims.create({ key: 'physicalHit', frames: 'physicalHit', frameRate: PHYSICAL_HIT_FRAMERATE });
    this.anims.create({ key: 'smoke', frames: 'smoke', frameRate: SMOKE_FRAMERATE });

    this.battle.use(this.partyIndex, 0);
    this.cameras.main.setBackgroundColor('#ffffff');
    this.dialogBox = new DialogBox(this, { fontFamily: FONT_FAMILY });

    this.monScale = Math.min(this.scale.height / 1024, this.scale.width / 768);

    const monWidth = this.monScale * 256;
    const monHeight = this.monScale * 256;

    this.playerMonX = Math.max(PADDING + monWidth / 2, 0.25 * this.scale.width);
    this.enemyMonX = Math.min(this.scale.width - (PADDING + monWidth / 2), 0.75 * this.scale.width);
    this.playerMonY = this.scale.height * 0.65 - (PADDING + monHeight / 2);
    this.enemyMonY = PADDING + monHeight / 2;

    this.healthBarHeight = monHeight >> 1;
    this.healthBarWidth = this.healthBarHeight * 3;

    this.playerHealthBarX = Math.min(this.scale.width - PADDING - this.healthBarWidth / 2, 0.75 * this.scale.width);
    this.enemyHealthBarX = Math.max(PADDING + this.healthBarWidth / 2, 0.25 * this.scale.width);

    this.add
      .ellipse(this.playerMonX, this.playerMonY + monHeight / 2, monWidth * 1.4, monWidth * 0.2, BLUE, 0.5)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, BLUE);

    this.add
      .ellipse(this.enemyMonX, this.enemyMonY + monHeight / 2, monWidth * 1.4, monWidth * 0.2, BLUE, 0.5)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(2, BLUE);
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
