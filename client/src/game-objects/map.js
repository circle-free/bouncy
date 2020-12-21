const LAYERS = {
  abovePlayer: 'above-player',
  collision: 'collision',
};

export default class Map {
  constructor(scene, tilemapKey, tilesetKeys) {
    this.scene = scene;

    this.scene.load.tilemapTiledJSON(tilemapKey, `src/assets/maps/${tilemapKey}.json`);
    this.tilemapKey = tilemapKey;

    tilesetKeys.forEach((tilesetKey) =>
      this.scene.load.image(tilesetKey, `src/assets/images/tilesets/${tilesetKey}.png`)
    );
    this.tilesetKeys = tilesetKeys;

    this.collisionObjects = null;
    this.tileMap = null;
  }

  build() {
    this.tileMap = this.scene.make.tilemap({ key: this.tilemapKey });

    this.tilesetKeys.forEach((tilesetKey) => this.tileMap.addTilesetImage(tilesetKey, tilesetKey, 16, 16));

    this.tileMap.layers.forEach((layer) => {
      const staticLayer = this.tileMap.createStaticLayer(layer.name, this.tilesetKeys);

      if (layer.name === LAYERS.abovePlayer) {
        staticLayer.setDepth(100);
      }
    });

    this.scene.scale.setGameSize(this.tileMap.widthInPixels, this.tileMap.heightInPixels);

    const collisionLayer = this.tileMap.getObjectLayer(LAYERS.collision);
    this.collisionObjects = this.scene.physics.add.staticGroup(
      collisionLayer.objects.map(({ x, y, width, height }) =>
        this.scene.add.rectangle(x, y, width, height).setOrigin(0)
      )
    );
  }

  addCollider(objects) {
    this.scene.physics.add.collider(objects, this.collisionObjects);
  }
}
