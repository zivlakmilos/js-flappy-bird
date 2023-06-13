import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import MenuScene from "./scenes/MenuScene";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = {
  x: WIDTH / 10,
  y: HEIGHT / 2,
}

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
}

const Scenes = [PreloadScene, MenuScene, PlayScene];

const initScenes = () => {
  return Scenes.map(Scene => new Scene(SHARED_CONFIG));
}

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
  scene: initScenes(),
}

new Phaser.Game(config);
