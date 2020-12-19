import Phaser from 'phaser';
import DialogBox from '../game-objects/dialog-box';
import Button from '../game-objects/button';

import { getSpeciesImageName } from '../utils';
import { SPECIES_COLORS } from '../enums';

const MON_SCALE = 1;
const FONT_FAMILY = 'Helvetica, sans-serif';

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
    const landscapeMode = this.scale.width > this.scale.height;

    const { species, eligibleLevel, canLearnWithLevel, eligibleEvolutions, canLearnWithEvolve } = this.mon;

    const { id: speciesId, name: speciesName } = species;

    const { hiHex } = SPECIES_COLORS[speciesId];

    this.cameras.main.setBackgroundColor(hiHex);

    const monY = landscapeMode ? this.scale.height / 3 : this.scale.height / 4;
    const monImage = this.add.image(screenCenterX, monY, getSpeciesImageName(speciesId)).setScale(MON_SCALE);

    const nameTextOptions = { fontSize: '6em', fill: '#000000', fontFamily: FONT_FAMILY };
    this.nameLabel = this.add
      .text(screenCenterX, monY - 200, speciesName.toUpperCase(), nameTextOptions)
      .setOrigin(0.5);

    const backButton = new Button(this, 60, 60, 'Back', () => this.exit());

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

    const promptText = 'Select moves to learn.';
    this.dialogBox.displayButtons(promptText, buttonActions);
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

    const promptText = 'Select move to be replaced.';
    this.dialogBox.displayButtons(promptText, buttonActions);
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
