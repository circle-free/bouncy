const useMonDialog = (battleScene, monData, isPlayerSide) => {
  if (isPlayerSide) {
    return [`Go ${monData.name}!`];
  }

  if (battleScene.battleClient.battleType === 'wild') {
    return [`A wild ${monData.type} has appeared!`];
  }
};
const useMonImageAnimation = (battleScene, monData, isPlayerSide) =>
  new Promise((resolve) => {
    const healthBarX = isPlayerSide ? 350 : 50;
    const healthBarY = isPlayerSide ? 250 : 0;
    const healthBar = new HealthBar(battleScene, healthBarX, healthBarY, monData);

    battleScene[isPlayerSide ? 'playerHealthBar' : 'enemyHealthBar'] = healthBar;

    const x = isPlayerSide ? battleScene.scale.width : 0;
    const y = isPlayerSide ? battleScene.scale.height * 0.33 : 10;

    const mon = battleScene.add.image(x, y, monData.type, 3);
    mon.setOrigin(0, 0);
    mon.setScale(0.66);

    if (isPlayerSide) {
      battleScene.playerMon = mon;
    } else {
      battleScene.enemyMon = mon;
    }

    const targetX = isPlayerSide ? 50 : 600;

    if (battleScene.battleClient.battleType === 'wild' && !isPlayerSide) {
      battleScene.tweens.add({
        targets: mon,
        x: targetX,
        duration: 1500,
        ease: 'linear',
        onComplete: resolve,
      });
    } else {
      const smokeAnimation = battleScene.add
        .sprite(targetX + mon.displayWidth * 0.5, mon.y + mon.displayHeight * 0.25, 'smoke')
        .setScale(0.25)
        .play('smoke');

      mon.setX(targetX);

      smokeAnimation.once('animationcomplete', () => {
        smokeAnimation.destroy();
        resolve();
      });
    }
  });
const returnMonAnimation = (battleScene, mon, isPlayerSide) => {
  const originalScale = mon.scale;

  battleScene[isPlayerSide ? 'playerHealthBar' : 'enemyHealthBar'].destroy();

  return new Promise((resolve) => {
    battleScene.tweens.add({
      targets: mon,
      y: mon.y + 150,
      duration: 150,
      ease: 'linear',
      onComplete: resolve,
      onUpdate: (tween) => {
        mon.setScale(originalScale * (1 - tween.progress));
      },
    });
  });
};

export default async (scene, useMonEvent) => {
  // scene dependencies
  const { dialogBox, client, myPartyIndex } = scene;

  const { monIndex, side } = useMonEvent;

  const { monData };

  const isPlayerSide = side === battleScene.battleClient.player.id;
  const monData = battleScene.battleClient[isPlayerSide ? 'player' : 'enemy'].mons[monIndex];
  const currentMon = isPlayerSide ? battleScene.playerMon : battleScene.enemyMon;

  if (currentMon) {
    await Promise.all([
      battleScene.dialogBox.displayDialog(
        isPlayerSide
          ? [`${monData.name}, thats enough! Come back!`]
          : [`${battleScene.battleClient.enemy.name} is sending out ${monData.name || monData.type}`]
      ),
      returnMonAnimation(battleScene, currentMon, isPlayerSide),
    ]);
  }

  return Promise.all([
    battleScene.dialogBox.displayDialog(useMonDialog(battleScene, monData, isPlayerSide)),
    useMonImageAnimation(battleScene, monData, isPlayerSide),
  ]);
};
