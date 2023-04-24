'use strict';

const imagePrefix = './img/';
const imagePaths = [
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
  'text/text_char_select.png',
  'level.png'
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

const keyPressSpeedFraction = 1500;
const keyPressSpinFraction = 10000;
const dragSpeedFraction = 10000;
const gravitySpeedFraction = 1000;
const maxSpin = 0.16;

/**
 * Renderer for the main game
 */
class MainGameHandler {
  constructor() {
    this.levelImg = imageMap.get('level.png');
    this.playerImg = imageMap.get(`chars/${selectedChar.name}.png`);
    this.bedImg = imageMap.get(`chars/${selectedChar.name}_bed.png`);

    this.playerX = (width / 2) - (selectedChar.physWidth / 2);
    this.playerY = this.levelImg.height - selectedChar.physHeight - 300;
    this.playerSpin = 0;
    this.playerSpinSpeed = 0;
    this.playerSpeedX = 0;
    this.playerSpeedY = 0;
    this.playerHealth = 3;
    this.playerFoodCollect = 0;
    this.bounceSpeed = 1;

    this.bedWidth = width;
    this.bedHeight = this.bedImg.height / (this.bedImg.width / width);
    this.bedTop = this.levelImg.height - this.bedHeight - 20;
    this.bedBounceTop = this.bedTop + 50;
  }

  render(timePassed) {
    this.gameLogic(timePassed);

    ctx.fillStyle = '000';
    ctx.fillRect(0, 0, width, height);

    const playerMiddle = this.playerY + (selectedChar.height / 2);
    let scrollTop = playerMiddle - (height / 2);
    scrollTop = Math.max(scrollTop, 0);
    scrollTop = Math.min(scrollTop, this.levelImg.height - height);

    // Draw the level
    ctx.drawImage(this.levelImg, 0, -1 * scrollTop, this.levelImg.width, this.levelImg.height);

    // Draw the bed
    ctx.drawImage(this.bedImg, (width / 2) - (this.bedWidth / 2), this.bedTop - scrollTop, this.bedWidth, this.bedHeight);

    // Draw the player
    ctx.save();
    const playerDrawX = this.playerX + (selectedChar.width - selectedChar.physWidth);
    const playerDrawY = this.playerY - scrollTop + (selectedChar.height - selectedChar.physHeight);
    ctx.setTransform(1, 0, 0, 1, playerDrawX, playerDrawY); // sets scale and origin
    ctx.rotate(this.playerSpin);
    ctx.drawImage(this.playerImg, -1 * (selectedChar.width / 2), -1 * (selectedChar.height / 2), selectedChar.width, selectedChar.height);

    if (debugToggle) {
      ctx.beginPath();
      ctx.lineWidth = '1';
      ctx.strokeStyle = 'red';
      ctx.rect(-1 * (selectedChar.physWidth / 2), -1 * (selectedChar.physHeight / 2), selectedChar.physWidth, selectedChar.physHeight);
      ctx.stroke();
    }

    ctx.restore();
  }

  gameLogic(timePassed) {
    if (!timePassed) {
      return;
    }

    // Adjust player position based on existing speed
    this.playerX += this.playerSpeedX * timePassed;
    if (this.playerX <= 0) {
      this.playerX = 0;
      this.playerSpeedX = 0;
    } else if (this.playerX >= width - selectedChar.physWidth) {
      this.playerX = width - selectedChar.physWidth;
      this.playerSpeedX = 0;
    }

    this.playerY += this.playerSpeedY * timePassed;

    // If they touched the bed, apply current bounce
    if (this.playerY + selectedChar.physHeight >= this.bedBounceTop) {
      this.playerY = this.bedBounceTop - selectedChar.physHeight;
      this.playerSpeedY = -1 * this.bounceSpeed;
    }

    // Adjust spin
    this.playerSpin += this.playerSpinSpeed;

    // If pressing left or right, effect speed
    if (leftPressed) {
      this.playerSpeedX -= (timePassed / keyPressSpeedFraction);
      if (this.playerX > 0) {
        this.playerSpinSpeed -= (timePassed / keyPressSpinFraction);
        this.playerSpinSpeed = Math.max(this.playerSpinSpeed, -1 * maxSpin);
      }
    } else if (rightPressed) {
      this.playerSpeedX += (timePassed / keyPressSpeedFraction);
      if (this.playerX < width - selectedChar.physWidth) {
        this.playerSpinSpeed += (timePassed / keyPressSpinFraction);
        this.playerSpinSpeed = Math.min(this.playerSpinSpeed, maxSpin);
      }
    } else {
      // If not pressing a key, apply drag
      if (this.playerSpeedX < 0) {
        this.playerSpeedX += (timePassed / dragSpeedFraction);
        this.playerSpeedX = Math.min(this.playerSpeedX, 0);
      } else {
        this.playerSpeedX -= (timePassed / dragSpeedFraction);
        this.playerSpeedX = Math.max(this.playerSpeedX, 0);
      }
    }

    // Apply gravity
    this.playerSpeedY += (timePassed / gravitySpeedFraction);
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