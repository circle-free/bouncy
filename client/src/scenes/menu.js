import Phaser from 'phaser';
import { canSave, canSync } from '../utils';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {}

  create() {
    const screenCenterX = this.scale.width >> 1;
    const screenCenterY = this.scale.height >> 1;

    this.cameras.main.setBackgroundColor('#ffffff');
    const textOptions = { fontSize: '5em', fill: '#000000' };

    const showSave = canSave();
    const showSync = canSync();
    const buttonCount = 2 + showSave + showSync;

    const buttonGap = screenCenterY / (1 + buttonCount);

    const partyY = screenCenterY - ((buttonCount * buttonGap) >> 1);
    const partyText = this.add.text(screenCenterX, partyY, 'MY MON', textOptions).setOrigin(0.5).setDepth(1);
    const partyButton = this.add
      .rectangle(screenCenterX, partyY, partyText.width + 20, partyText.height + 20, 0xffffff)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0x000000)
      .setInteractive()
      .once('pointerdown', () => this.party());

    const battleY = partyY + buttonGap;
    const battleText = this.add.text(screenCenterX, battleY, 'BATTLE WILD MON', textOptions).setOrigin(0.5).setDepth(1);
    const battleButton = this.add
      .rectangle(screenCenterX, battleY, battleText.width + 20, battleText.height + 20, 0xffffff)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0x000000)
      .setInteractive()
      .once('pointerdown', () => this.battleWild());

    if (showSave) {
      const saveY = battleY + buttonGap;
      const saveText = this.add.text(screenCenterX, saveY, 'SAVE LOCALLY', textOptions).setOrigin(0.5).setDepth(1);
      const saveButton = this.add
        .rectangle(screenCenterX, saveY, saveText.width + 20, saveText.height + 20, 0xffffff)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x000000)
        .setInteractive()
        .once('pointerdown', () => this.save());
    }

    if (showSync) {
      const syncY = battleY + buttonGap + showSave * buttonGap;
      const syncText = this.add.text(screenCenterX, syncY, 'SYNC TO CHAIN', textOptions).setOrigin(0.5).setDepth(1);
      const syncButton = this.add
        .rectangle(screenCenterX, syncY, syncText.width + 20, syncText.height + 20, 0xffffff)
        .setOrigin(0.5)
        .setStrokeStyle(4, 0x000000)
        .setInteractive()
        .once('pointerdown', () => this.sync());
    }
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

  save() {
    localStorage.setItem('exported-optimistic-mon-mon-state', JSON.stringify(optimisticMonMon.export()));
    this.scene.restart();
  }

  async sync() {
    const { receipt, syncComplete } = await window.optimisticMonMon.sync({
      gas: 1000000,
    });

    console.log('Sync receipt:', receipt);

    if (syncComplete) {
      this.save();
      this.scene.restart();

      return;
    }

    console.log('Pending optimistic transitions remaining...');

    await this.sync();
  }

  update() {}
}
