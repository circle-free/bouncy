import Phaser from 'phaser';
import Web3 from 'web3';
import OptimisticMonMon from 'mon-mon';

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
    address: '0x0c486b94E926D4c979b04772FF7491FAC2869A7A',
  };

  const oriOptions = {
    address: '0xD87492D4A007C6Bb037060493a571E2cB07ee48D',
    web3: window.web3,
    requiredBond: '1000000000000000000',
    lockTime: '600',
  };

  const exportedStateString = localStorage.getItem('exported-optimistic-mon-mon-state');

  const exportedState = exportedStateString ? JSON.parse(exportedStateString) : {};

  const optimisticMonMon = new OptimisticMonMon(user, gameOptions, oriOptions, exportedState);

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
