'use strict';

const imagePrefix = './img/';
const imagePaths = [
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
  'items/donut1.png',
  'items/donut2.png',
  'items/donut3.png',
  'items/donut4.png',
  'items/donut5.png',
  'items/donut6.png',
  'text/text_char_select.png',
];

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

/** Checks if the given character is at location x y */
function overlapsCharacter(char, x, y) {
  return (x > char.x) &&
    (x < char.x + char.width) &&
    (y > char.y) &&
    (y < char.y + char.height);
}

let entityIdCounter = 0;

class Entity {
  constructor(x, y, width, height, physWidth, physHeight, speedX=0, speedY=0, spin=0, spinSpeed=0) {
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
    this.id = entityIdCounter++;
  }

  render(ctx, scrollTop, timePassed) {
    const img = this.getCurrentImg(timePassed);

    ctx.save();
    const drawX = this.x + (this.width / 2) - ((this.width - this.physWidth) / 2);
    const drawY = this.y - scrollTop + (this.height / 2) - ((this.height - this.physHeight) / 2);
    ctx.setTransform(1, 0, 0, 1, drawX, drawY); // sets scale and origin
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
const gravitySpeedFraction = 1000;
const maxSpin = 0.16;

class PlayerEntity extends Entity {
  constructor(x, y, charInfo, bedTop) {
    super(x, y, charInfo.width, charInfo.height, charInfo.physWidth, charInfo.physHeight);
    this.playerImg = imageMap.get(`chars/${charInfo.name}.png`);
    this.bedBounceTop = bedTop + 60;
    this.bounceSpeed = 1;
  }

  getCurrentImg(_timePassed) {
    return this.playerImg;
  }

  gameLogic(timePassed) {
    // Adjust player position based on existing speed
    this.x += this.speedX * timePassed;
    if (this.x <= 0) {
      this.x = 0;
      this.speedX = 0;
    } else if (this.x >= width - this.physWidth) {
      this.x = width - this.physWidth;
      this.speedX = 0;
    }

    this.y += this.speedY * timePassed;

    // If they touched the bed, apply current bounce
    if (this.y + this.physHeight >= this.bedBounceTop) {
      this.y = this.bedBounceTop - this.physHeight;
      this.speedY = -1 * this.bounceSpeed;
    }

    // Adjust spin
    this.spin += this.spinSpeed;

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

    // Apply gravity
    this.speedY += (timePassed / gravitySpeedFraction);
  }
}

class DonutEntity extends Entity {
  constructor(donutNumber, x, y) {
    super(x, y, 50, 50, 50, 50);
    this.donutImg = imageMap.get(`items/donut${donutNumber}.png`);
  }

  getCurrentImg(_timePassed) {
    return this.donutImg;
  }

  handlePlayerInteraction(playerEntity) {

  }
}

class EnemyEntity extends Entity {

  getCurrentImg(_timePassed) {
    return this.playerImg;
  }

  handlePlayerInteraction(playerEntity) {

  }
}

/**
 * Renderer for character selection
 */
class CharSelectHandler {
  render(timePassed) {
    ctx.fillStyle = '000';
    ctx.fillRect(0, 0, width, height);
  
    ctx.drawImage(imageMap.get('text/text_char_select.png'), 100, 100, 300, 100);
  
    for (const char of charInfo) {
      const overlaps = overlapsCharacter(char, lastMouseX, lastMouseY);    
      const imagePath = overlaps ? `chars/${char.name}_border.png` : `chars/${char.name}.png`;
      ctx.drawImage(imageMap.get(imagePath), char.x, char.y, char.width, char.height);
    }
  }

  click(e) {
    // If a character was clicked, note which was picked and change state
    for (const char of charInfo) {
      const overlaps = overlapsCharacter(char, e.clientX, e.clientY);
      if (overlaps) {
        console.log(`Selected ${char.name}`);
        selectedChar = char;
        currentGameHandler = new MainGameHandler();
        break;
      }
    }
  }
}

/**
 * Renderer for the main game
 */
class MainGameHandler {
  constructor() {
    this.levelImg = imageMap.get('level.png');
    this.bedImg = imageMap.get(`chars/${selectedChar.name}_bed.png`);

    this.bedWidth = width;
    this.bedHeight = this.bedImg.height / (this.bedImg.width / width);
    this.bedTop = this.levelImg.height - this.bedHeight - 20;

    const playerX = (width / 2) - (selectedChar.physWidth / 2);
    const playerY = this.levelImg.height - selectedChar.physHeight - 300;
    this.player = new PlayerEntity(playerX, playerY, selectedChar, this.bedTop);
    this.playerHealth = 3;
    this.playerFoodCollect = 0;

    this.entityList = [this.player];
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
  }

  gameLogic(timePassed) {
    if (!timePassed) {
      return;
    }

    for (const entity of this.entityList) {
      entity.gameLogic(timePassed);
    }
  }

  spawnDonut(startingOut) {

  }
}

const canvas = document.getElementById('canvas');
const width = canvas.getAttribute('width');
const height = canvas.getAttribute('height');

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
let imagePromises = [];
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
  imagePromises.push(promise);
}

Promise.all(imagePromises).then(() => {
  if (pageVisible) {
    window.requestAnimationFrame(gameRender);
  }
});