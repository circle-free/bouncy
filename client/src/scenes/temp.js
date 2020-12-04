import Phaser from 'phaser';
import { EventEmitter } from 'events';

export default class TempScene extends Phaser.Scene {
  constructor() {
    super('Temp');
  }

  create() {
    const eventEmitter = new EventEmitter();

    const battleClient = {
      playerMonState: {
        monIndex: 0,
      },
      enemyMonState: {
        monIndex: 0,
      },
      player: {
        id: 0,
        name: 'Steph',
        mons: [
          {
            type: 'CATERPIE',
            name: 'YUCKY',
            moves: [
              { name: 'TACKLE' },
              { name: 'STRING SHOT' },
              { name: 'BUG BITE' },
            ],
            lvl: 3,
            maxHp: 20,
            hp: 20,
          },
          {
            type: 'PIDGEY',
            name: 'BIRD',
            moves: [
              { name: 'TACKLE' },
              { name: 'QUICK ATTACK' },
              { name: 'AIR CUTTER' },
            ],
            lvl: 4,
            maxHp: 22,
            hp: 22,
          },
        ],
      },
      enemy: {
        id: 1,
        mons: [{ type: 'ODDISH', lvl: 3, gender: 'male', maxHp: 23, hp: 23 }],
      },
      battleType: 'wild',

      on: (eventName, listener) => eventEmitter.on(eventName, listener),

      attack: () => {
        console.log('attacked');
      },

      forfeit: () => {
        console.log('forfeited');
      },

      removeAllListeners: () => eventEmitter.removeAllListeners(),

      _triggerEvent: (eventName, event) => eventEmitter.emit(eventName, event),
    };

    this.scene.start('Battle', { battleClient });
  }
}
