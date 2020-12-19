import Phaser from 'phaser';
import { NATURES, TYPES } from '../enums';

const GREEN = 0x55ff22;
const GREEN_HEX = '#55ff22';
const YELLOW = 0xffd221;
const YELLOW_HEX = '#ffd221';
const RED = 0xff233f;
const RED_HEX = '#ff233f';
const BLUE = 0x5c3eff;
const BLUE_HEX = '#5c3eff';
const MAX_STAT = 714;
const INTERNAL_OPACITY = 0.2;
const FONT_FAMILY = 'Helvetica, sans-serif';

const createRadar = (container, points, fillColor, strokeColor, opacity = 1) => {
  const radar = container.scene.add
    .polygon(0, 0, points, fillColor, opacity)
    .setOrigin(0, 0)
    .setStrokeStyle(4, strokeColor);
  container.add(radar);
  return radar;
};

const createAxisLine = (container, x0, y0, x1, y1, color) => {
  const axisLine = container.scene.add.line(0, 0, x0 * 1.1, y0 * 1.1, x1 * 1.1, y1 * 1.1, color).setOrigin(0, 0);
  container.add(axisLine);
  return axisLine;
};

const createLabel = (container, x, y, text, options) => {
  const { originX = 0.5, depth = 2, opacity = 1 } = options;
  const label = container.scene.add.text(x, y, text, options).setOrigin(originX, 0.5).setDepth(depth).setAlpha(opacity);
  container.add(label);
  return label;
};

const createRadarLabels = (container, radarPoints, labelOptions) => {
  const speedLabel = createLabel(container, radarPoints[0] * 1.2, radarPoints[1] * 1.2, 'SPD', labelOptions);
  const defenseLabel = createLabel(container, radarPoints[2] * 1.2, radarPoints[3] * 1.2, 'DEF', labelOptions);
  const attackLabel = createLabel(container, radarPoints[4] * 1.2, radarPoints[5] * 1.2, 'ATT', labelOptions);
  const healthLabel = createLabel(container, radarPoints[6] * 1.2, radarPoints[7] * 1.2, 'HP', labelOptions);
  const specialAttackLabel = createLabel(container, radarPoints[8] * 1.2, radarPoints[9] * 1.2, 'S.A', labelOptions);
  const specialDefenseLabel = createLabel(container, radarPoints[10] * 1.2, radarPoints[11] * 1.2, 'S.D', labelOptions);
  return [speedLabel, defenseLabel, attackLabel, healthLabel, specialAttackLabel, specialDefenseLabel];
};

const createLegendLabels = (container, radarPoints, labelOptions = {}) => {
  const x = radarPoints[8] - 5;
  const { legendGap } = container;

  const baseOptions = Object.assign({ fill: RED_HEX }, labelOptions);
  const baseLabel = createLabel(container, x, radarPoints[5] + legendGap * 1, 'BASE', baseOptions);

  const ivOptions = Object.assign({ fill: YELLOW_HEX }, labelOptions);
  const ivLabel = createLabel(container, x, radarPoints[5] + legendGap * 2, 'IV', ivOptions);

  const evOptions = Object.assign({ fill: GREEN_HEX }, labelOptions);
  const evLabel = createLabel(container, x, radarPoints[5] + legendGap * 3, 'EV', evOptions);

  const statOptions = Object.assign({ fill: BLUE_HEX }, labelOptions);
  const statLabel = createLabel(container, x, radarPoints[5] + legendGap * 4, 'STAT', statOptions);

  return [baseLabel, ivLabel, evLabel, statLabel];
};

const fillTable = (container, radarPoints, mon, tableWidth, textOptions = {}) => {
  const { legendGap } = container;
  const { IVs, EVs, stats, species } = mon;

  const { baseAttack, baseDefense, baseSpeed, baseSpecialAttack, baseSpecialDefense, baseHealth } = species;

  const tableElements = [];

  const rowSpacer = Math.floor(tableWidth / 12);
  const headerY = radarPoints[5] + legendGap * 1 - (legendGap >> 1);
  const attackHeader = createLabel(container, radarPoints[8] + rowSpacer * 1, headerY, 'ATT', textOptions);
  const defenseHeader = createLabel(container, radarPoints[8] + rowSpacer * 3, headerY, 'DEF', textOptions);
  const speedHeader = createLabel(container, radarPoints[8] + rowSpacer * 5, headerY, 'SPD', textOptions);
  const specialAttackHeader = createLabel(container, radarPoints[8] + rowSpacer * 7, headerY, 'S.A', textOptions);
  const specialDefenseHeader = createLabel(container, radarPoints[8] + rowSpacer * 9, headerY, 'S.D', textOptions);
  const healthHeader = createLabel(container, radarPoints[8] + rowSpacer * 11, headerY, 'HP', textOptions);
  tableElements.push(attackHeader, defenseHeader, speedHeader, specialAttackHeader, specialDefenseHeader, healthHeader);

  const baseY = headerY + legendGap;
  const attackBase = createLabel(container, radarPoints[8] + rowSpacer * 1, baseY, baseAttack, textOptions);
  const defenseBase = createLabel(container, radarPoints[8] + rowSpacer * 3, baseY, baseDefense, textOptions);
  const speedBase = createLabel(container, radarPoints[8] + rowSpacer * 5, baseY, baseSpeed, textOptions);
  const specialAttackBase = createLabel(
    container,
    radarPoints[8] + rowSpacer * 7,
    baseY,
    baseSpecialAttack,
    textOptions
  );
  const specialDefenseBase = createLabel(
    container,
    radarPoints[8] + rowSpacer * 9,
    baseY,
    baseSpecialDefense,
    textOptions
  );
  const healthBase = createLabel(container, radarPoints[8] + rowSpacer * 11, baseY, baseHealth, textOptions);
  tableElements.push(attackBase, defenseBase, speedBase, specialAttackBase, specialDefenseBase, healthBase);

  const ivY = baseY + legendGap;
  const attackIV = createLabel(container, radarPoints[8] + rowSpacer * 1, ivY, IVs.attack, textOptions);
  const defenseIV = createLabel(container, radarPoints[8] + rowSpacer * 3, ivY, IVs.defense, textOptions);
  const speedIV = createLabel(container, radarPoints[8] + rowSpacer * 5, ivY, IVs.speed, textOptions);
  const specialAttackIV = createLabel(container, radarPoints[8] + rowSpacer * 7, ivY, IVs.specialAttack, textOptions);
  const specialDefenseIV = createLabel(container, radarPoints[8] + rowSpacer * 9, ivY, IVs.specialDefense, textOptions);
  const healthIV = createLabel(container, radarPoints[8] + rowSpacer * 11, ivY, IVs.health, textOptions);
  tableElements.push(attackIV, defenseIV, speedIV, specialAttackIV, specialDefenseIV, healthIV);

  const evY = ivY + legendGap;
  const attackEV = createLabel(container, radarPoints[8] + rowSpacer * 1, evY, EVs.attack, textOptions);
  const defenseEV = createLabel(container, radarPoints[8] + rowSpacer * 3, evY, EVs.defense, textOptions);
  const speedEV = createLabel(container, radarPoints[8] + rowSpacer * 5, evY, EVs.speed, textOptions);
  const specialAttackEV = createLabel(container, radarPoints[8] + rowSpacer * 7, evY, EVs.specialAttack, textOptions);
  const specialDefenseEV = createLabel(container, radarPoints[8] + rowSpacer * 9, evY, EVs.specialDefense, textOptions);
  const healthEV = createLabel(container, radarPoints[8] + rowSpacer * 11, evY, EVs.health, textOptions);
  tableElements.push(attackEV, defenseEV, speedEV, specialAttackEV, specialDefenseEV, healthEV);

  const statY = evY + legendGap;
  const attackStat = createLabel(container, radarPoints[8] + rowSpacer * 1, statY, stats.attack, textOptions);
  const defenseStat = createLabel(container, radarPoints[8] + rowSpacer * 3, statY, stats.defense, textOptions);
  const speedStat = createLabel(container, radarPoints[8] + rowSpacer * 5, statY, stats.speed, textOptions);
  const specialAttackStat = createLabel(
    container,
    radarPoints[8] + rowSpacer * 7,
    statY,
    stats.specialAttack,
    textOptions
  );
  const specialDefenseStat = createLabel(
    container,
    radarPoints[8] + rowSpacer * 9,
    statY,
    stats.specialDefense,
    textOptions
  );
  const healthStat = createLabel(container, radarPoints[8] + rowSpacer * 11, statY, stats.health, textOptions);
  tableElements.push(attackStat, defenseStat, speedStat, specialAttackStat, specialDefenseStat, healthStat);

  return tableElements;
};

const createMoves = (container, radarPoints, moves, textOptions = {}) => {
  return moves.map(({ name }, i) => {
    const originY = i < 2 ? 1 : 0;

    const x =
      i == 0
        ? (radarPoints[8] + radarPoints[6]) >> 1
        : i === 1
        ? (radarPoints[6] + radarPoints[4]) >> 1
        : i === 2
        ? (radarPoints[10] + radarPoints[0]) >> 1
        : (radarPoints[0] + radarPoints[2]) >> 1;

    const y =
      i == 0
        ? (radarPoints[9] + radarPoints[7]) >> 1
        : i === 1
        ? (radarPoints[7] + radarPoints[5]) >> 1
        : i === 2
        ? (radarPoints[11] + radarPoints[1]) >> 1
        : (radarPoints[1] + radarPoints[3]) >> 1;

    const angle = i == 0 || i === 3 ? -30 : 30;

    const moveText = container.scene.add
      .text(x, y, name.toUpperCase(), Object.assign({ padding: 10 }, textOptions))
      .setOrigin(0.5, originY)
      .setDepth(2)
      .setAngle(angle);

    const moveBox = container.scene.add
      .rectangle(x, y, moveText.width + 20, moveText.height, 0xcccccc)
      .setOrigin(0.5, originY)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(1)
      .setAngle(angle);
    container.add(moveBox);
    container.add(moveText);

    return [moveText, moveBox];
  });
};

const createHealthBar = (container, radarPoints, currentHealth, maxHealth, width, textOptions = {}) => {
  const height = radarPoints[3] - radarPoints[5];
  const emptyHealthBar = container.scene.add
    .rectangle(radarPoints[4], radarPoints[5], width, height, 0xcccccc)
    .setOrigin(0, 0)
    .setStrokeStyle(4, 0xffffff)
    .setDepth(1);
  container.add(emptyHealthBar);

  const healthHeight = (currentHealth / maxHealth) * (height - 12);
  const healthBar = container.scene.add
    .rectangle(radarPoints[4] + 6, radarPoints[3] - 6, width - 12, healthHeight, GREEN)
    .setOrigin(0, 1)
    .setDepth(1);
  container.add(healthBar);

  const dividerX = radarPoints[4] + width / 2;
  const divider = container.scene.add.line(dividerX, 0, 0, 0, width / 2, 0, 0xffffff);
  container.add(divider);

  const healthText = createLabel(container, dividerX, -30, currentHealth, textOptions);
  const maxHealthText = createLabel(container, dividerX, 30, maxHealth, textOptions);

  return [emptyHealthBar, healthBar, divider, healthText, maxHealthText];
};

export default class StatRadar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, mon = {}, options = {}) {
    super(scene, x, y);

    const { size = 400, fontFamily = FONT_FAMILY } = options;

    this.verbose = false;

    const { level, nature, IVs, EVs, stats, species, moves, currentHealth, maxHealth } = mon;

    const {
      type1,
      type2,
      baseAttack,
      baseDefense,
      baseSpeed,
      baseSpecialAttack,
      baseSpecialDefense,
      baseHealth,
    } = species;

    const largeFontSize = size >> 3;
    const fontSize = size >> 4;
    const radius = size >> 1;
    const tabSize = Math.floor(size / 5);
    const radarPoints = [];

    for (let i = 0; i < 6; i++) {
      radarPoints.push(Math.floor(radius * Math.sin((2 * Math.PI * i) / 6)));
      radarPoints.push(Math.floor(radius * Math.cos((2 * Math.PI * i) / 6)));
    }

    const radar = createRadar(this, radarPoints, 0xcccccc, 0xffffff);

    const axisLine1 = createAxisLine(this, radarPoints[0], radarPoints[1], radarPoints[6], radarPoints[7], 0xffffff);
    const axisLine2 = createAxisLine(this, radarPoints[2], radarPoints[3], radarPoints[8], radarPoints[9], 0xffffff);
    const axisLine3 = createAxisLine(this, radarPoints[4], radarPoints[5], radarPoints[10], radarPoints[11], 0xffffff);

    const ivPoints = [
      Math.floor((radarPoints[0] * IVs.speed) / 31),
      Math.floor((radarPoints[1] * IVs.speed) / 31),
      Math.floor((radarPoints[2] * IVs.defense) / 31),
      Math.floor((radarPoints[3] * IVs.defense) / 31),
      Math.floor((radarPoints[4] * IVs.attack) / 31),
      Math.floor((radarPoints[5] * IVs.attack) / 31),
      Math.floor((radarPoints[6] * IVs.health) / 31),
      Math.floor((radarPoints[7] * IVs.health) / 31),
      Math.floor((radarPoints[8] * IVs.specialAttack) / 31),
      Math.floor((radarPoints[9] * IVs.specialAttack) / 31),
      Math.floor((radarPoints[10] * IVs.specialDefense) / 31),
      Math.floor((radarPoints[11] * IVs.specialDefense) / 31),
    ];

    const ivRadar = createRadar(this, ivPoints, YELLOW, YELLOW, INTERNAL_OPACITY);

    const evPoints = [
      Math.floor((radarPoints[0] * EVs.speed) / 255),
      Math.floor((radarPoints[1] * EVs.speed) / 255),
      Math.floor((radarPoints[2] * EVs.defense) / 255),
      Math.floor((radarPoints[3] * EVs.defense) / 255),
      Math.floor((radarPoints[4] * EVs.attack) / 255),
      Math.floor((radarPoints[5] * EVs.attack) / 255),
      Math.floor((radarPoints[6] * EVs.health) / 255),
      Math.floor((radarPoints[7] * EVs.health) / 255),
      Math.floor((radarPoints[8] * EVs.specialAttack) / 255),
      Math.floor((radarPoints[9] * EVs.specialAttack) / 255),
      Math.floor((radarPoints[10] * EVs.specialDefense) / 255),
      Math.floor((radarPoints[11] * EVs.specialDefense) / 255),
    ];

    const evRadar = createRadar(this, evPoints, GREEN, GREEN, INTERNAL_OPACITY);

    const basePoints = [
      Math.floor((radarPoints[0] * baseSpeed) / 255),
      Math.floor((radarPoints[1] * baseSpeed) / 255),
      Math.floor((radarPoints[2] * baseDefense) / 255),
      Math.floor((radarPoints[3] * baseDefense) / 255),
      Math.floor((radarPoints[4] * baseAttack) / 255),
      Math.floor((radarPoints[5] * baseAttack) / 255),
      Math.floor((radarPoints[6] * baseHealth) / 255),
      Math.floor((radarPoints[7] * baseHealth) / 255),
      Math.floor((radarPoints[8] * baseSpecialAttack) / 255),
      Math.floor((radarPoints[9] * baseSpecialAttack) / 255),
      Math.floor((radarPoints[10] * baseSpecialDefense) / 255),
      Math.floor((radarPoints[11] * baseSpecialDefense) / 255),
    ];

    const baseRadar = createRadar(this, basePoints, RED, RED, INTERNAL_OPACITY);

    const maxStat = Math.floor((MAX_STAT * level) / 50);

    const statPoints = [
      Math.floor((radarPoints[0] * stats.speed) / maxStat),
      Math.floor((radarPoints[1] * stats.speed) / maxStat),
      Math.floor((radarPoints[2] * stats.defense) / maxStat),
      Math.floor((radarPoints[3] * stats.defense) / maxStat),
      Math.floor((radarPoints[4] * stats.attack) / maxStat),
      Math.floor((radarPoints[5] * stats.attack) / maxStat),
      Math.floor((radarPoints[6] * stats.health) / maxStat),
      Math.floor((radarPoints[7] * stats.health) / maxStat),
      Math.floor((radarPoints[8] * stats.specialAttack) / maxStat),
      Math.floor((radarPoints[9] * stats.specialAttack) / maxStat),
      Math.floor((radarPoints[10] * stats.specialDefense) / maxStat),
      Math.floor((radarPoints[11] * stats.specialDefense) / maxStat),
    ];

    const statRadar = createRadar(this, statPoints, BLUE, BLUE, INTERNAL_OPACITY);

    const labelOptions = { fontSize, fill: '#000000', fontFamily };
    const radarLabels = createRadarLabels(this, radarPoints, labelOptions);
    this.radarLabelGroup = scene.add.group(radarLabels);

    const largeLabelOptions = { fontSize: largeFontSize, fill: '#ffffff', fontFamily, opacity: 0.6 };
    const type1Label = createLabel(this, 0, -size / 4, TYPES[type1], largeLabelOptions);
    const type2Label = createLabel(this, 0, -size / 8, TYPES[type2], largeLabelOptions);
    const levelLabel = createLabel(this, 0, +size / 8, `Lv. ${level}`, largeLabelOptions);
    const natureLabel = createLabel(this, 0, +size / 4, NATURES[nature], largeLabelOptions);

    const moveElements = createMoves(this, radarPoints, moves, labelOptions);
    const healthElements = createHealthBar(this, radarPoints, currentHealth, maxHealth, tabSize, labelOptions);

    const legendHeight = radarPoints[3] - radarPoints[5];
    this.legendGap = Math.floor(legendHeight / 5);

    const legend = scene.add
      .rectangle(radarPoints[8], radarPoints[5], tabSize, legendHeight, 0xcccccc)
      .setOrigin(1, 0)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(1);
    this.add(legend);

    const legendLabelOptions = { fontSize, originX: 1, fontFamily };
    const legendLabels = createLegendLabels(this, radarPoints, legendLabelOptions);
    this.legendLabelGroup = scene.add.group(legendLabels);

    const tableWidth = radarPoints[4] - radarPoints[8];
    const table = scene.add
      .rectangle(radarPoints[8], radarPoints[9], tableWidth, legendHeight, 0xcccccc, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(1);
    this.add(table);

    const tableElements = [table].concat(fillTable(this, radarPoints, mon, tableWidth, labelOptions));
    this.tableGroup = scene.add.group(tableElements);
    this.tableGroup.setVisible(false);

    scene.add.existing(this);

    legend.setInteractive().on('pointerdown', () => this.toggleVerbose());

    // Moves
    // name.toUpperCase(),
    // MOVE_CATEGORIES[category],
    // TYPES[type],
    // power,
    // accuracy,
    // powerPoints,
    // maxPowerPoints,
  }

  toggleVerbose() {
    this.verbose = !this.verbose;
    this.radarLabelGroup.setVisible(!this.verbose);
    this.legendLabelGroup.incY(this.verbose ? this.legendGap / 2 : -this.legendGap / 2);
    this.tableGroup.setVisible(this.verbose);
  }
}
