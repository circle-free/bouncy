import Phaser from 'phaser';

import Button from '../game-objects/button';
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
    const textOptions = { fontSize: 48 };

    const showSave = canSave();
    const showSync = canSync();
    const buttonCount = 2 + showSave + showSync;

    const buttonGap = screenCenterY / (1 + buttonCount);

    const partyY = screenCenterY - (buttonCount >> 1) * buttonGap;
    const partyButton = new Button(this, screenCenterX, partyY, 'MY MON', () => this.party(), textOptions);

    const battleY = partyY + buttonGap;
    const battleButton = new Button(
      this,
      screenCenterX,
      battleY,
      'BATTLE WILD MON',
      () => this.battleWild(),
      textOptions
    );

    if (showSave) {
      const saveY = battleY + buttonGap;
      const saveButton = new Button(this, screenCenterX, saveY, 'SAVE LOCALLY', () => this.save(), textOptions);
    }

    if (showSync) {
      const syncY = battleY + buttonGap + showSave * buttonGap;
      const syncButton = new Button(this, screenCenterX, syncY, 'SYNC TO CHAIN', () => this.sync(), textOptions);
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
