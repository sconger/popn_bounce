'use strict';

const imagePrefix = './img/';
const imagePaths = [
  'heart_empty.png',
  'heart_full.png',
  'level.png',
  'chars/dot.png',
  'chars/dot_bed.png',
  'chars/dot_border.png',
  'chars/drop.png',
  'chars/drop_bed.png',
  'chars/drop_border.png',
  'chars/fang.png',
  'chars/fang_bed.png',
  'chars/fang_border.png',
  'chars/lilly.png',
  'chars/lilly_bed.png',
  'chars/lilly_border.png',
  'chars/margo.png',
  'chars/margo_bed.png',
  'chars/margo_border.png',
  'chars/maroony.png',
  'chars/maroony_bed.png',
  'chars/maroony_border.png',
  'chars/voxandra.png',
  'chars/voxandra_bed.png',
  'chars/voxandra_border.png',
  'enemies/bowser-1.png',
  'enemies/bowser-2.png',
  'enemies/bowser-3.png',
  'enemies/bowser-4.png',
  'enemies/opa_opa-1.png',
  'enemies/opa_opa-2.png',
  'enemies/plane-1.png',
  'enemies/plane-2.png',
  'enemies/plane-3.png',
  'enemies/tonberry-1.png',
  'enemies/tonberry-2.png',
  'explosion/explosion-1.png',
  'explosion/explosion-2.png',
  'explosion/explosion-3.png',
  'explosion/explosion-4.png',
  'items/donut1.png',
  'items/donut2.png',
  'items/donut3.png',
  'items/donut4.png',
  'items/donut5.png',
  'items/donut6.png',
  'text/text_char_select.png',
];

const songElem = document.querySelector('audio');

const charInfo = [
  {
    name: 'dot',
    x: 50,
    y: 250,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'fang',
    x: 150,
    y: 250,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'lilly',
    x: 250,
    y: 250,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'drop',
    x: 350,
    y: 250,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'margo',
    x: 100,
    y: 350,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'maroony',
    x: 200,
    y: 350,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  },
  {
    name: 'voxandra',
    x: 300,
    y: 350,
    width: 100,
    height: 100,
    physWidth: 70,
    physHeight: 80
  }
];

const enemyInfo = [
  {
    name: 'bowser',
    maxCount: 1,
    animation: ['enemies/bowser-1.png', 'enemies/bowser-2.png', 'enemies/bowser-3.png', 'enemies/bowser-4.png'],
    animRate: .0125,
    width: 100,
    height: 100,
    physWidth: 80,
    physHeight: 80
  },
  {
    name: 'opa_opa',
    maxCount: 1,
    animation: ['enemies/opa_opa-1.png', 'enemies/opa_opa-2.png'],
    animRate: .0125,
    width: 50,
    height: 50,
    physWidth: 30,
    physHeight: 30
  },
  {
    name: 'plane',
    maxCount: 5,
    animation: ['enemies/plane-1.png', 'enemies/plane-2.png', 'enemies/plane-3.png'],
    animRate: .025,
    width: 100,
    height: 50,
    physWidth: 80,
    physHeight: 30
  },
  {
    name: 'tonberry',
    maxCount: 3,
    animation: ['enemies/tonberry-1.png', 'enemies/tonberry-2.png'],
    animRate: .05,
    width: 50,
    height: 50,
    physWidth: 30,
    physHeight: 30
  }
];

const explosionFrames = [
  'explosion/explosion-1.png',
  'explosion/explosion-2.png',
  'explosion/explosion-3.png',
  'explosion/explosion-4.png'
];
const explosionAnimRate = .01;
const explosionWidth = 100;
const explosionHeight = 100;

let entityIdCounter = 0;

class Entity {
  constructor(gameHandler, x, y, width, height, physWidth, physHeight, speedX=0, speedY=0, spin=0, spinSpeed=0, horizFlip=false) {
    this.gameHandler = gameHandler;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.physWidth = physWidth;
    this.physHeight = physHeight;
    this.speedX = speedX;
    this.speedY = speedY;
    this.spin = spin;
    this.spinSpeed = spinSpeed;
    this.horizFlip = horizFlip;
    this.id = entityIdCounter++;
  }

  render(ctx, scrollTop, timePassed) {
    const img = this.getCurrentImg(timePassed);

    ctx.save();
    const drawX = this.x + (this.width / 2) - ((this.width - this.physWidth) / 2);
    const drawY = this.y - scrollTop + (this.height / 2) - ((this.height - this.physHeight) / 2);
    ctx.translate(drawX, drawY); // sets scale and origin
    if (this.horizFlip) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(this.spin);
    ctx.drawImage(img, -1 * (this.width / 2), -1 * (this.height / 2), this.width, this.height);

    if (debugToggle) {
      ctx.beginPath();
      ctx.lineWidth = '1';
      ctx.strokeStyle = 'red';
      ctx.rect(-1 * (this.physWidth / 2), -1 * (this.physHeight / 2), this.physWidth, this.physHeight);
      ctx.stroke();
    }

    ctx.restore();
  }

  overlaps(otherEntity) {
    // TODO: Implement rotated collision?
    return this.x + this.physWidth >= otherEntity.x &&
      this.x <= otherEntity.x + otherEntity.physWidth &&
      this.y <= otherEntity.y + otherEntity.physHeight &&
      this.y + this.physHeight >= otherEntity.y
  }
}

const keyPressSpeedFraction = 1500;
const keyPressSpinFraction = 10000;
const dragSpeedFraction = 10000;
const spinSpeedFraction = 25;
const horizontalSpeedMultiplier = .5;
const verticalSpeedMultiplier = .5;
const gravity = .00025;
const maxSpin = 0.16;
const bedBounceOffset = 60;
const donutMove = 250;

class PlayerEntity extends Entity {
  constructor(gameHandler, x, y, charInfo, bedTop) {
    super(gameHandler, x, y, charInfo.width, charInfo.height, charInfo.physWidth, charInfo.physHeight);
    this.playerImg = imageMap.get(`chars/${charInfo.name}.png`);
    this.bedBounceTop = bedTop + bedBounceOffset;
    this.initBounce();
  }

  gameLogic(timePassed) {
    this.bounceTime += timePassed;

    let touchedBed = false;

    // Adjust player position based on existing speed
    this.x += this.speedX * (timePassed * horizontalSpeedMultiplier);
    if (this.x <= 0) {
      this.x = 0;
      this.speedX = 0;
    } else if (this.x >= width - this.physWidth) {
      this.x = width - this.physWidth;
      this.speedX = 0;
    }

    // Doing a hard calculation of height to avoid the possibility of being off target
    // y = Vo t - .5 g t^2
    const yClimb = (this.launchVelocity * this.bounceTime) - (.5 * gravity * this.bounceTime * this.bounceTime);
    console.log(`yClimb: ${yClimb}`);
    this.y = this.bedBounceTop - this.physHeight - yClimb;
    console.log(`y: ${this.y}`);

    // Adjust spin
    this.spin += (timePassed * this.spinSpeed) / spinSpeedFraction;

    // If pressing left or right, effect speed
    if (leftPressed) {
      this.speedX -= (timePassed / keyPressSpeedFraction);
      if (this.x > 0) {
        this.spinSpeed -= (timePassed / keyPressSpinFraction);
        this.spinSpeed = Math.max(this.spinSpeed, -1 * maxSpin);
      }
    } else if (rightPressed) {
      this.speedX += (timePassed / keyPressSpeedFraction);
      if (this.x < width - this.physWidth) {
        this.spinSpeed += (timePassed / keyPressSpinFraction);
        this.spinSpeed = Math.min(this.spinSpeed, maxSpin);
      }
    } else {
      // If not pressing a key, apply drag
      if (this.speedX < 0) {
        this.speedX += (timePassed / dragSpeedFraction);
        this.speedX = Math.min(this.speedX, 0);
      } else {
        this.speedX -= (timePassed / dragSpeedFraction);
        this.speedX = Math.max(this.speedX, 0);
      }
    }

    // Handle touching bed
    if (this.y + this.physHeight >= this.bedBounceTop) {
      this.y = this.bedBounceTop - this.physHeight;
      this.gameHandler.bedTouched();
      this.initBounce();
    }
  }

  getCurrentImg() {
    return this.playerImg;
  }

  initBounce() {
    // This target height is in positive units
    const levelHeight = 5000;
    const targetHeight = (levelHeight - this.gameHandler.calcDonutY()) - (levelHeight - this.bedBounceTop) + 50;

    // Calculate initial speed to reach height
    // Vo = sqrt(2yg)
    this.launchVelocity = Math.sqrt(2 * targetHeight * gravity);
    this.bounceTime = 0;
  }
}

class DonutEntity extends Entity {
  constructor(gameHandler, donutNumber, x, y) {
    super(gameHandler, x, y, 30, 30, 30, 30);
    const spinDir = Math.floor(Math.random() * 2) === 1;
    this.spinSpeed = spinDir ? .05 : -.05;

    this.donutImg = imageMap.get(`items/donut${donutNumber}.png`);
  }

  gameLogic(timePassed) {
    // Adjust spin
    this.spin += (timePassed * this.spinSpeed) / spinSpeedFraction;
  }

  getCurrentImg() {
    return this.donutImg;
  }

  handlePlayerInteraction(_playerEntity) {
    this.gameHandler.donutTouched(this);
  }
}

class EnemyEntity extends Entity {
  constructor(gameHandler, info, x, y, speedX) {
    super(gameHandler, x, y, info.width, info.height, info.physWidth, info.physHeight, speedX, 0, 0, 0, speedX < 0);
    this.info = info;
    this.totalTime = 0;
    this.animation = info.animation.map((filePath) => imageMap.get(filePath));
  }

  gameLogic(timePassed) {
    this.totalTime += timePassed;

    this.x += this.speedX * (timePassed * horizontalSpeedMultiplier);

    if ((this.speedX < 0 && this.x < -1 * this.width) ||
         this.speedX > 0 && this.x > width) {
      this.gameHandler.removeEntity(this);
    }
  }

  getCurrentImg() {
    const frameIndex = (Math.floor(this.totalTime * this.info.animRate)) % this.animation.length;
    return this.animation[frameIndex];
  }

  handlePlayerInteraction(_playerEntity) {
    this.gameHandler.enemyTouched(this);
  }
}

class ExplosionEntity extends Entity {
  constructor(gameHandler, x, y) {
    super(gameHandler, x, y, explosionWidth, explosionHeight, explosionWidth, explosionHeight);
    this.totalTime = 0;
    this.animation = explosionFrames.map((filePath) => imageMap.get(filePath));
  }

  gameLogic(timePassed) {
    this.totalTime += timePassed;

    // If went past end of explosion frames, remove it
    const frameIndex = (Math.floor(this.totalTime * explosionAnimRate));
    if (frameIndex > this.animation.length) {
      this.gameHandler.removeEntity(this);
    }
  }

  getCurrentImg() {
    const frameIndex = (Math.floor(this.totalTime * explosionAnimRate)) % this.animation.length;
    return this.animation[frameIndex];
  }
}

/**
 * Renderer for character selection
 */
class CharSelectHandler {
  render(_timePassed) {
    ctx.fillStyle = '000';
    ctx.fillRect(0, 0, width, height);
  
    ctx.drawImage(imageMap.get('text/text_char_select.png'), 100, 100, 300, 100);
  
    for (const char of charInfo) {
      const overlaps = this.overlapsPlayerSelect(char, lastMouseX, lastMouseY);    
      const imagePath = overlaps ? `chars/${char.name}_border.png` : `chars/${char.name}.png`;
      ctx.drawImage(imageMap.get(imagePath), char.x, char.y, char.width, char.height);
    }
  }

  click(e) {
    // If a character was clicked, note which was picked and change state
    for (const char of charInfo) {
      const overlaps = this.overlapsPlayerSelect(char, e.clientX, e.clientY);
      if (overlaps) {
        console.log(`Selected ${char.name}`);
        selectedChar = char;
        currentGameHandler = new MainGameHandler();
        songElem.play();
        break;
      }
    }
  }

  /** Checks if the given character is at location x y */
  overlapsPlayerSelect(char, x, y) {
    return (x > char.x) &&
      (x < char.x + char.width) &&
      (y > char.y) &&
      (y < char.y + char.height);
  }
}

/**
 * Renderer for the main game
 */
class MainGameHandler {
  constructor() {
    this.levelImg = imageMap.get('level.png');
    this.heartFullImg = imageMap.get(`heart_full.png`);
    this.heartEmptyImg = imageMap.get(`heart_empty.png`);
    this.bedImg = imageMap.get(`chars/${selectedChar.name}_bed.png`);
    this.donutCountImg = imageMap.get(`items/donut1.png`);

    this.bedWidth = width;
    this.bedHeight = this.bedImg.height / (this.bedImg.width / width);
    this.bedTop = this.levelImg.height - this.bedHeight - 20;
    this.bedBounceTop = this.bedTop + bedBounceOffset;

    this.playerHealth = 3;
    this.playerFoodCollect = 0;
    this.donutSpawned = false;

    const playerX = (width / 2) - (selectedChar.physWidth / 2);
    const playerY = this.bedBounceTop - selectedChar.physHeight;
    this.player = new PlayerEntity(this, playerX, playerY, selectedChar, this.bedTop);

    this.entityList = [this.player];
    this.spawnDonut(true);
  }

  render(timePassed) {
    this.gameLogic(timePassed);

    ctx.fillStyle = '000';
    ctx.fillRect(0, 0, width, height);

    const playerMiddle = this.player.y + (this.player.height / 2);
    let scrollTop = playerMiddle - (height / 2);
    scrollTop = Math.max(scrollTop, 0);
    scrollTop = Math.min(scrollTop, this.levelImg.height - height);

    // Draw the level
    ctx.drawImage(this.levelImg, 0, -1 * scrollTop, this.levelImg.width, this.levelImg.height);

    // Draw the bed
    ctx.drawImage(this.bedImg, (width / 2) - (this.bedWidth / 2), this.bedTop - scrollTop, this.bedWidth, this.bedHeight);

    // Draw the entities in reverse order, as the more important tend to be first
    for (let i = this.entityList.length - 1; i >= 0; i--) {
      this.entityList[i].render(ctx, scrollTop, timePassed);
    }

    // Draw the hearts
    let statsX = width - ((3 * 22) + 10);
    let heartX = statsX;
    for (let i = 0; i < 3; i++) {
      const filled = this.playerHealth >= (3 - i);
      const heartImage = filled ? this.heartFullImg : this.heartEmptyImg;
      ctx.drawImage(heartImage, heartX, 10, 20, 20);
      heartX += 22;
    }

    // Draw the donut counter
    ctx.drawImage(this.donutCountImg, statsX, 36, 20, 20);
    ctx.font = '20px serif';
    ctx.fillText(this.playerFoodCollect, statsX + 25, 52);
  }

  gameLogic(timePassed) {
    if (!timePassed) {
      return;
    }

    for (const entity of this.entityList) {
      if (entity.gameLogic) {
        entity.gameLogic(timePassed);
      }
    }

    for (const entity of this.entityList) {
      if (entity.handlePlayerInteraction && this.player.overlaps(entity)) {
        entity.handlePlayerInteraction(this.player);
      }
    }
  }

  removeEntity(entityToRemove) {
    console.log(`Removing ${entityToRemove.id} ${entityToRemove.constructor.name}`);
    this.entityList = this.entityList.filter((entity) => entity.id !== entityToRemove.id);
  }

  spawnDonut(startingOut) {
    let donutY = this.calcDonutY();
    let donutX;

    if (startingOut) {
      if (Math.floor(Math.random() * 2) % 2) {
        donutX = 50;
      } else {
        donutX = width - 30 - 50;
      }
    } else {
      const range = width - 90;
      donutX = (Math.random() * range) + 30;
    }

    const donutIndex = Math.floor(Math.random() * 6) + 1;
    const donut = new DonutEntity(this, donutIndex, donutX, donutY);
    this.entityList.push(donut);
    this.donutSpawned = true;
  }

  calcDonutY() {
    return this.bedBounceTop - 550 - (this.playerFoodCollect * donutMove);;
  }

  bedTouched() {
    // Spawn a donut if one doesn't exist
    if (!this.donutSpawned) {
      this.spawnDonut(false);
    }

    // No enemies for initial donuts
    if (this.playerFoodCollect < 2) {
      return;
    }

    // Spawn enemies
    const enemyCount = Math.floor(this.playerFoodCollect / 5) * 2 + 1;

    const donutY = this.calcDonutY();

    for (let i = 0; i < enemyCount; i++) {
      const info = enemyInfo[Math.floor(Math.random() * enemyInfo.length)];
      const spawnSide = !!Math.floor(Math.random() * 2);
      const spawnX = spawnSide ?
        -1 * info.width - (Math.random() * 100) :
        width + (Math.random() * 20);
      const spawnY = donutY + 100 + (i * 150) + (Math.random() * 50);
      const speedX = (spawnSide ? .125 : -.125) * (1 + i * .05);

      const enemy = new EnemyEntity(this, info, spawnX, spawnY, speedX);
      this.entityList.push(enemy);
    }
  }

  donutTouched(donut) {
    this.removeEntity(donut);
    this.playerFoodCollect++;
    this.donutSpawned = false;
  }

  enemyTouched(enemy) {
    this.removeEntity(enemy);
    const enemyCenterX = enemy.x + enemy.width / 2;
    const enemyCenterY = enemy.y + enemy.height / 2;
    const explosionX = enemyCenterX - explosionWidth / 2;
    const explosionY = enemyCenterY - explosionWidth / 2;
    const explosion = new ExplosionEntity(this, explosionX, explosionY);
    this.entityList.push(explosion);

    this.playerHealth--;
    if (this.playerHealth <= 0) {
      // TODO: Do something on death
    }
  }
}

const canvas = document.getElementById('canvas');
const width = Number(canvas.getAttribute('width'));
const height = Number(canvas.getAttribute('height'));

const ctx = canvas.getContext("2d");

const CHAR_SELECT = 'char_select';
const MAIN_GAME = 'main_game';

let imageMap = new Map();
let selectedChar = null;
let debugToggle = false;

let pageVisible = document.visibilityState === 'visible';
let lastTimestamp = null;

let leftPressed = false;
let rightPressed = false;
let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('visibilitychange', function() {
  pageVisible = document.visibilityState === 'visible';
  if (pageVisible) {
    console.log('Page visible');
    window.requestAnimationFrame(gameRender);
  } else {
    console.log('Page not visible');
    lastTimestamp = null;
  }
});

canvas.addEventListener('mousemove', function(e) {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

canvas.addEventListener('click', function(e) {
  if (currentGameHandler.click) {
    currentGameHandler.click(e);
  }
});

window.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft') {
    leftPressed = true;
  } else if (e.code === 'ArrowRight') {
    rightPressed = true;
  }
});

window.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft') {
    leftPressed = false;
  } else if (e.code === 'ArrowRight') {
    rightPressed = false;
  }
});

window.addEventListener('keypress', function(e) {
  if (e.code === 'KeyI') {
    debugToggle = !debugToggle;
  }
});

let currentGameHandler = new CharSelectHandler();

/**
 * Main game rendering function. Renders the current render set in currentGameRenderer.
 */
function gameRender(newTimestamp) {
  // Calculate time passed
  let timePassed = lastTimestamp ? (newTimestamp - lastTimestamp) : 0;
  lastTimestamp = newTimestamp;

  // Render
  currentGameHandler.render(timePassed);

  // Request next frame
  if (pageVisible) {
    window.requestAnimationFrame(gameRender);
  }
}

// Image and music loading process
let loadingPromises = [];
for (const imagePath of imagePaths) {
  let promise = new Promise((resolve, reject) => {
    const imageUrl = imagePrefix + imagePath;
    let image = new Image();
    image.src = imageUrl;
    image.addEventListener('load', () => {
      console.log(`Loaded ${imageUrl}`);
      resolve()
    });
    image.addEventListener('error', (err) => {
      console.error(`Error loading ${imageUrl}, with: ${err}`);
      reject();
    });
    imageMap.set(imagePath, image);
  });
  loadingPromises.push(promise);
}

const audioElements = document.querySelectorAll('audio');
for (const audioElem of audioElements) {
  let promise = new Promise((resolve, reject) => {
    audioElem.addEventListener('canplaythrough', function() {
      console.log(`Loaded ${audioElem.src}`);
      resolve();
    });
    audioElem.addEventListener('error', (err) => {
      let propString = '';
      for (prop in e.currentTarget.error) {
        if (propString.length !== 0) {
          propString += ', ';
        }
        propString += `${prop}=${e.currentTarget.error[prop]}`;
      }
      console.error(`Audio error for ${audioElem.src}: ${e.currentTarget.error.code}.\nError props: ${propString}`);
      reject();
    });
  });
  loadingPromises.push(promise);
}

Promise.all(loadingPromises).then(() => {
  if (pageVisible) {
    window.requestAnimationFrame(gameRender);
  }
});