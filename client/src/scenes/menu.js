import Phaser from 'phaser';

const PARTY_Y = 200;
const SELECTION_GAP = 100;

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
  }

  create() {
    const screenCenterX = this.scale.width / 2;
    const textOptions = { fontSize: '36px', fill: '#ffffff' };

    const partyButton = this.add.text(screenCenterX, PARTY_Y, 'MY MON', textOptions).setOrigin(0.5);
    partyButton.setInteractive();
    partyButton.on('pointerdown', () => this.party());

    const battleWildButton = this.add.text(screenCenterX, PARTY_Y + SELECTION_GAP, 'BATTLE WILD MON', textOptions).setOrigin(0.5);
    battleWildButton.setInteractive();
    battleWildButton.on('pointerdown', () => this.battleWild());

    const syncButton = this.add.text(screenCenterX, PARTY_Y + (2 * SELECTION_GAP), 'SYNC TO CHAIN', textOptions).setOrigin(0.5);
    syncButton.setInteractive();
    syncButton.on('pointerdown', () => this.sync());
  }

  party() {
    this.scene.start('Party');
  }

  battleWild() {
    const wildProperties = { level: window.optimisticMonMon.party.mons[0].level };
    const battle = window.optimisticMonMon.startWildBattle(wildProperties);
    this.scene.start('Battle', { battle });
  }

  async sync() {
    const { receipt, syncComplete } = await window.optimisticMonMon.sync({ gas: 1000000 });

    console.log('Sync receipt:', receipt);

    if (syncComplete) return;

    console.log('Pending optimistic transitions remaining...');

    await this.sync();
  }

  update() {
  }
}
