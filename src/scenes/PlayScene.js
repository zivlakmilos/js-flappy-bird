import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config);

    this.PIPES_TO_RENDER = 4;

    this.bird = null;
    this.pipes = null;

    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';

    this.isPaused = false;

    this.currentDifficulty = 'easy';
    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [300, 350],
        pipeVerticalDistanceRange: [150, 200],
      },
      'normal': {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190],
      },
      'hard': {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [120, 150],
      },
    }
  }

  create() {
    super.create();
    this.currentDifficulty = 'easy';
    this.createBird();
    this.createPipes();
    this.createColiders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }

    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5);

      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      })
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText(`Fly in: ${this.initialTime}`);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timeEvent.remove();
    }
  }

  checkGameStatus() {
    if (this.bird.y <= 0 || this.bird.getBounds().bottom >= this.config.height) {
      this.gameOver();
    }
  }

  createBird() {
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0, 0);
    this.bird.body.gravity.y = 600;

    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColiders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000' });

    const bestScore = localStorage.getItem('bestScore');
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000' });
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this);

    this.input.keyboard.on('keydown-SPACE', this.flap, this);
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];

    const rightMostX = this.getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(20, this.config.height - 20 - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);

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
          this.increseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = 'normal';
    }
    if (this.score === 3) {
      this.currentDifficulty = 'hard';
    }
  }

  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(pipe => {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }

  saveBestScore() {
    const bestScoreText = localStorage.getItem('bestScore');
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem('bestScore', this.score);
    }

  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xFF0000);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  flap() {
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
