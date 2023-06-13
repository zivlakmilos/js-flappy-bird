import BaseScene from "./BaseScene";

class PauseScene extends BaseScene {
  constructor(config) {
    super('PauseScene', config);

    this.menu = [
      {
        scene: 'PlayScene',
        text: 'Continue',
      },
      {
        scene: 'MenuScene',
        text: 'Exit',
      },
    ]
  }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuitems.bind(this));
  }

  setupMenuitems(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on('pointerover', () => {
      textGO.setStyle({ fill: '#ff0' });
    });

    textGO.on('pointerout', () => {
      textGO.setStyle({ fill: '#fff' });
    });

    textGO.on('pointerup', () => {
      return;
      if (menuItem.scene) {
        this.scene.start(menuItem.scene);
      }

      if (menuItem.text === 'Exit') {
        this.game.destroy(true);
      }
    });
  }
}

export default PauseScene;
