import Phaser from 'phaser';
import Web3 from 'web3';
import OptimisticMonMon from 'mon-mon';
import { getStoredData } from '../utils';

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
    address: '0x7c11e0F269255575F50DAd1929092F96e15ea64a',
  };

  const oriOptions = {
    address: '0x7D1630CBA6723577372861a767A94140F61b03e4',
    web3: window.web3,
    requiredBond: '1000000000000000000',
    lockTime: '600',
  };

  const optimisticMonMon = new OptimisticMonMon(user, gameOptions, oriOptions, getStoredData());

  if (await optimisticMonMon.isInitialized()) {
    console.log('ORI account already initialized.');
    return optimisticMonMon;
  }

  try {
    const { receipt: initializeReceipt } = await optimisticMonMon.initialize();

    localStorage.setItem('exported-optimistic-mon-mon-state', JSON.stringify(optimisticMonMon.export()));

    console.log('ORI account initialized: ', initializeReceipt);
  } catch (_err) {
    console.error('ORI account initialization Failed.');
  }

  return optimisticMonMon;
};

const ethEnabled = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    return window.ethereum.enable();
  }

  return false;
};

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {}

  async create() {
    if (!(await ethEnabled())) {
      alert('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!');
    }

    window.optimisticMonMon = await setUpOptimisticMonMon();

    if (window.optimisticMonMon.party.mons.length) {
      this.scene.start('Menu');
      return;
    }

    this.scene.start('StarterSelection');
  }
}
