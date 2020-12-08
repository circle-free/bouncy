import Phaser from 'phaser';
import { EventEmitter } from 'events';
import Web3 from 'web3';
import OptimisticMonMon from 'mon-mon';
import { rejects } from 'assert';

const getAccount = () =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });

const setUpOptimisticMonMon = async () => {
  const user = await getAccount();

  const gameOptions = {
    address: '0x258828f956716BB308628dC33bE064FaDC20538d',
  };

  const oriOptions = {
    address: '0x6D28B2B9379634a368652a51523387020488A487',
    web3: window.web3,
    requiredBond: '1000000000000000000',
    lockTime: '600',
  };

  const optimisticMonMon = new OptimisticMonMon(user, gameOptions, oriOptions);

  await optimisticMonMon.initialize().catch((_err) => {});

  const starterProperties = {
    speciesId: 1,
    nature: 0,
    IVs: {
      attack: 5,
      defense: 5,
      speed: 5,
      specialAttack: 5,
      specialDefense: 5,
      health: 5,
    },
    moves: [{ id: 1 }],
  };

  optimisticMonMon.initializeParty(starterProperties);

  return optimisticMonMon;
};

const ethEnabled = () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    window.ethereum.enable();
    return true;
  }
  return false;
};

export default class TempScene extends Phaser.Scene {
  constructor() {
    super('Temp');
  }

  preload() {
    if (!ethEnabled()) {
      alert(
        'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
      );
    }
  }

  async create() {
    const optimisticMonMon = await setUpOptimisticMonMon();

    const wildProperties = {
      level: optimisticMonMon.party.mons[0].level,
      speciesId: 7,
    };

    const battle = optimisticMonMon.startWildBattle(wildProperties);

    this.scene.start('Battle', {
      battle,
    });
  }
}
