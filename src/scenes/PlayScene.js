import Phaser from "phaser";

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super('PlayScene');

    this.config = config;

    this.PIPES_TO_RENDER = 4;

    this.bird = null;
    this.pipes = null;

    this.pipeVerticalDistanceRange = [150, 250];
    this.pipeHorizontalDistanceRange = [500, 550];

    this.flapVelocity = 250;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
  }

  create() {
    this.createBG();
    this.createBird();
    this.createPipes();
    this.handleInputs();
  }

  update() {
    if (this.bird.y < -this.bird.height || this.bird.y > this.config.height) {
      this.restartPlayerPosition();
    }

    this.recyclePipes();
  }

  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  createBird() {
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0, 0);
    this.bird.body.gravity.y = 400;
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe').setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe').setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  handleInputs() {
    this.input.on('pointerdown', () => this.flap, this);

    this.input.keyboard.on('keydown-SPACE', this.flap, this);
  }

  placePipe(uPipe, lPipe) {
    const rightMostX = this.getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(...this.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(20, this.config.height - 20 - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...this.pipeHorizontalDistanceRange);

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }

  recyclePipes() {
    const tmpPipes = [];

    this.pipes.getChildren().forEach(pipe => {
      if (pipe.getBounds().right <= 0) {
        tmpPipes.push(pipe);
        if (tmpPipes.length === 2) {
          this.placePipe(...tmpPipes);
        }
      }
    });
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(pipe => {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }

  restartPlayerPosition() {
    this.bird.x = this.config.startPosition.x;
    this.bird.y = this.config.startPosition.y;
    this.bird.body.velocity.y = 0;
  }

  flap() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }
}

export default PlayScene;
