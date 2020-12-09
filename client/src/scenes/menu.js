// This scene is a menu for the following tasks
// - Syncing Optimistic State

const MON_STATS_Y = 60;
const SELECTION_GAP = 80;

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
  }

  create() {
    const screenCenterX = this.scale.width / 2;
    const textOptions = { fontSize: '28px', fill: '#ffffff' };

    const monStatsButton = this.add.text(screenCenterX, MON_STATS_Y, 'MON STATS', textOptions).setOrigin(0.5);
    monStatsButton.setInteractive();
    monStatsButton.on('pointerdown', () => this.showMonStats());

    const battleWildButton = this.add.text(screenCenterX, MON_STATS_Y + SELECTION_GAP, 'BATTLE WILD MON', textOptions).setOrigin(0.5);
    battleWildButton.setInteractive();
    battleWildButton.on('pointerdown', () => this.battleWild());

    const levelUpButton = this.add.text(screenCenterX, MON_STATS_Y + (2 * SELECTION_GAP), 'LEVEL UP MON', textOptions).setOrigin(0.5);
    levelUpButton.setInteractive();
    levelUpButton.on('pointerdown', () => this.levelUp());

    const levelUpAndTeachButton = this.add.text(screenCenterX, MON_STATS_Y + (3 * SELECTION_GAP), 'LEVEL UP AND TEACH MON', textOptions).setOrigin(0.5);
    levelUpAndTeachButton.setInteractive();
    levelUpAndTeachButton.on('pointerdown', () => this.levelUpAndTeach());

    const evolveButton = this.add.text(screenCenterX, MON_STATS_Y + (4 * SELECTION_GAP), 'EVOLVE MON', textOptions).setOrigin(0.5);
    evolveButton.setInteractive();
    evolveButton.on('pointerdown', () => this.evolve());

    const evolveAndTeachButton = this.add.text(screenCenterX, MON_STATS_Y + (5 * SELECTION_GAP), 'EVOLVE AND TEACH MON', textOptions).setOrigin(0.5);
    evolveAndTeachButton.setInteractive();
    evolveAndTeachButton.on('pointerdown', () => this.evolveAndTeach());

    const syncButton = this.add.text(screenCenterX, MON_STATS_Y + (6 * SELECTION_GAP), 'SYNC TO CHAIN', textOptions).setOrigin(0.5);
    syncButton.setInteractive();
    syncButton.on('pointerdown', () => this.sync());
  }

  showMonStats() {
    console.log('showMonStats');
  }

  battleWild() {
    console.log('battleWild');

    const wildProperties = { level: window.optimisticMonMon.party.mons[0].level };
    const battle = window.optimisticMonMon.startWildBattle(wildProperties);

    this.scene.start('Battle', { battle });
  }

  levelUp() {
    console.log('levelUp');
  }

  levelUpAndTeach() {
    console.log('levelUpAndTeach');
  }

  evolve() {
    console.log('evolve');
  }

  evolveAndTeach() {
    console.log('evolveAndTeach');
  }

  sync() {
    console.log('sync');
  }

  update() {
  }
}
