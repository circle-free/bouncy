import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';

import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS } from '../enums';

const NAME_Y = 50;
const MON_Y = 170;
const MON_SCALE = 0.5;

export default class MonGrowScene extends Phaser.Scene {
  constructor() {
    super('MonGrow');
  }

  init({ mode = 'level', monIndex }) {
    this.mode = mode;
    this.monIndex = monIndex;
    this.mon = window.optimisticMonMon.party.mons[monIndex];
    this.moveLearnIds = [];
    this.moveReplaceIndices = [];

    // TODO: evolveLearnableMoves need to be filtered based on the possible species
    this.newMoves =
      this.mode === 'level'
        ? this.mon.levelUpLearnableMoves.map(({ move }) => move)
        : this.mon.evolveLearnableMoves.map(({ move }) => move);
  }

  preload() {
    const { speciesId } = this.mon;
    this.load.image(getSpeciesImageName(speciesId), `src/assets/images/species/${speciesId}.png`);
  }

  create() {
    const screenCenterX = this.scale.width >> 1;

    const {
      species,
      level,
      moves,
      eligibleLevel,
      canLearnWithLevel,
      eligibleEvolutions,
      canLearnWithEvolve,
    } = this.mon;

    const { id: speciesId, name: speciesName } = species;

    const { low, hi } = SPECIES_COLORS[speciesId];

    this.cameras.main.setBackgroundColor(low);

    const nameTextOptions = { fontSize: '36px', fill: '#ffffff' };
    this.nameLabel = this.add.text(screenCenterX, NAME_Y, speciesName.toUpperCase(), nameTextOptions).setOrigin(0.5);

    const monImage = this.add.image(screenCenterX, MON_Y, getSpeciesImageName(speciesId));
    monImage.setScale(MON_SCALE);

    this.backButton = this.add.rectangle(10, 10, 100, 25, 0xffffff).setOrigin(0);
    this.backButton.setInteractive();
    this.backButton.once('pointerdown', () => this.exit());
    const backTextOptions = { fontSize: '15px', fill: '#000000' };
    const backText = this.add.text(0, 0, 'BACK', backTextOptions).setOrigin(0.5);
    Phaser.Display.Align.In.Center(backText, this.backButton);

    this.dialogBox = new DialogBox(this);

    if (this.mode === 'level' && !canLearnWithLevel) {
      this.dialogBox.displayDialog(`Leveling up to level ${eligibleLevel}.`).then(() => this.levelUp());
      return;
    }

    if (this.mode === 'level') {
      this.dialogBox.displayDialog(`Leveling up to level ${eligibleLevel}.`).then(() => this.showNewMoves());
      return;
    }

    if (this.mode === 'evolve' && !canLearnWithEvolve) {
      this.dialogBox.displayDialog(`Evolving to ${eligibleEvolutions[0].name}.`).then(() => this.evolve());
      return;
    }

    if (this.mode === 'evolve') {
      this.dialogBox.displayDialog(`Evolving to ${eligibleEvolutions[0].name}.`).then(() => this.showNewMoves());
      return;
    }
  }

  exit() {
    this.scene.start('Party');
  }

  levelUp() {
    if (!this.moveLearnIds.length) {
      window.optimisticMonMon.levelUp(this.monIndex);
      this.exit();
      return;
    }

    window.optimisticMonMon.levelUpAndLearn(0, this.moveLearnIds, this.moveReplaceIndices);
    this.exit();
  }

  evolve() {
    if (!this.moveLearnIds.length) {
      window.optimisticMonMon.evolve(this.monIndex);
      this.exit();
      return;
    }

    window.optimisticMonMon.evolveAndLearn(0, this.moveLearnIds, this.moveReplaceIndices);
    this.exit();
  }

  showNewMoves() {
    // TODO: evolveLearnableMoves may span several species
    const isAlreadySelected = (moveId) => this.moveLearnIds.find((id) => id === moveId);
    const filteredNewMoves = this.newMoves.filter(({ id }) => !isAlreadySelected(id));

    const buttonActions = filteredNewMoves.map(({ id, name, power }) => ({
      name: `${name} (Power: ${power})`,
      action: () => this.showMoveSlots(id),
    }));

    buttonActions.push({
      name: 'Done',
      action: () => (this.mode === 'level' ? this.levelUp() : this.evolve()),
    });

    const infoText = 'Select moves to learn.';
    this.dialogBox.displayButtons(buttonActions, infoText);
  }

  showMoveSlots(selectedNewMoveId) {
    const currentMoveCount = this.mon.moves.length + this.moveLearnIds.length;

    if (currentMoveCount < 4) {
      this.addMoveLearn({ index: currentMoveCount, id: selectedNewMoveId });
      return;
    }

    const isAlreadyReplaced = (moveIndex) => this.moveReplaceIndices.find((index) => index === moveIndex);
    const filteredCurrentMoves = this.mon.moves.filter((_, i) => !isAlreadyReplaced(i));

    const buttonActions = filteredCurrentMoves.map(({ name, power }, index) => ({
      name: `${name} (Power: ${power})`,
      action: () => this.addMoveLearn({ index, id: selectedNewMoveId }),
    }));

    buttonActions.push({
      name: 'Cancel',
      action: () => this.showNewMoves(),
    });

    const infoText = 'Select move to be replaced.';
    this.dialogBox.displayButtons(buttonActions, infoText);
  }

  addMoveLearn({ index, id }) {
    this.moveLearnIds.push(id);
    this.moveReplaceIndices.push(index);

    if (this.newMoves.length === this.moveLearnIds.length) {
      this.mode === 'level' ? this.levelUp() : this.evolve();
      return;
    }

    this.showNewMoves();
  }
}
