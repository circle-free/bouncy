import Phaser from 'phaser';

const PARTY_Y = 200;
const SELECTION_GAP = 100;

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {}

  create() {
    const screenCenterX = this.scale.width / 2;
    const textOptions = { fontSize: '36px', fill: '#000000' };

    const partyText = this.add
      .text(screenCenterX, PARTY_Y, 'MY MON', textOptions)
      .setOrigin(0.5)
      .setDepth(1);
    const partyButton = this.add
      .rectangle(
        screenCenterX,
        PARTY_Y,
        partyText.width + 20,
        partyText.height + 20,
        0xffffff
      )
      .setStrokeStyle(4, 0x000000);
    partyButton.setInteractive();
    partyButton.on('pointerdown', () => this.party());

    const battleWildText = this.add
      .text(
        screenCenterX,
        PARTY_Y + SELECTION_GAP,
        'BATTLE WILD MON',
        textOptions
      )
      .setOrigin(0.5)
      .setDepth(1);
    const battleWildButton = this.add
      .rectangle(
        screenCenterX,
        PARTY_Y + SELECTION_GAP,
        battleWildText.width + 20,
        battleWildText.height + 20,
        0xffffff
      )
      .setStrokeStyle(4, 0x000000);
    battleWildButton.setInteractive();
    battleWildButton.on('pointerdown', () => this.battleWild());

    const syncText = this.add
      .text(
        screenCenterX,
        PARTY_Y + 2 * SELECTION_GAP,
        'SYNC TO CHAIN',
        textOptions
      )
      .setOrigin(0.5)
      .setDepth(1);
    const syncButton = this.add
      .rectangle(
        screenCenterX,
        PARTY_Y + 2 * SELECTION_GAP,
        syncText.width + 20,
        syncText.height + 20,
        0xffffff
      )
      .setStrokeStyle(4, 0x000000);
    syncButton.setInteractive();
    syncButton.on('pointerdown', () => this.sync());
  }

  party() {
    this.scene.start('Party');
  }

  battleWild() {
    const wildProperties = {
      level: window.optimisticMonMon.party.mons[0].level,
    };
    const battle = window.optimisticMonMon.startWildBattle(wildProperties);
    this.scene.start('Battle', { battle });
  }

  async sync() {
    const { receipt, syncComplete } = await window.optimisticMonMon.sync({
      gas: 1000000,
    });

    console.log('Sync receipt:', receipt);

    if (syncComplete) return;

    console.log('Pending optimistic transitions remaining...');

    await this.sync();
  }

  update() {}
}
