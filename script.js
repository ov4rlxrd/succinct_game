
const TILE_SIZE = 25;
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 1.5;
const bgMusic = new Audio("music/background_music.mp3");  



let canvas, ctx;
let gameState = 'start'; 
let currentLevel = 1;
let score = 0;
let highScore = 0;
let player = {
    x: 0,
    y: 0,
    width: TILE_SIZE - 4,
    height: TILE_SIZE- 4,
    speed: PLAYER_SPEED
};

let keysPressed = {};
let fragments = [];
let fragmentsCollected = 0;
let walls = [];
let enemies = [];
let exit = null;
let exitOpen = false;
let lastTime = 0;
let currentMenuIndex = 0;
let fragmentImage = new Image();
let playerImage = new Image();

fragmentImage.src = "imgs/Succinct Logo.svg"
playerImage.src = "imgs/player_crab.png"


const startScreen = document.getElementById('start-screen');
const levelCompleteScreen = document.getElementById('level-complete');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const levelDisplay = document.getElementById('level');
const fragmentsCollectedDisplay = document.getElementById('fragments-collected');
const fragmentsTotalDisplay = document.getElementById('fragments-total');
const scoreDisplay = document.getElementById('score');
const levelScoreDisplay = document.getElementById('level-score');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const menuItems = document.querySelectorAll('.menu-item');
const indicatorDots = document.querySelectorAll('.indicator-dot');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const menuItemsContainer = document.querySelector('.menu-items');


function initMenu() {
    
    updateActiveMenuItem();
    
    
    prevBtn.addEventListener('click', () => {
        navigateMenu(-1);
    });
    
    nextBtn.addEventListener('click', () => {
        navigateMenu(1);
    });
    
   
    indicatorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            goToMenuSlide(index);
        });
    });
    
    
    
}

function navigateMenu(step) {
    currentMenuIndex = (currentMenuIndex + step + menuItems.length) % menuItems.length;
    updateActiveMenuItem();
}


function goToMenuSlide(index) {
    currentMenuIndex = index;
    updateActiveMenuItem();
}


function updateActiveMenuItem() {
    
    menuItems.forEach((item, index) => {
        if (index === currentMenuIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    indicatorDots.forEach((dot, index) => {
        if (index === currentMenuIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

   
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('active-btn', 'glow');
        btn.onclick = null; 
    });

 
    const activeMenuItem = menuItems[currentMenuIndex];
    const activeBtn = activeMenuItem.querySelector('.btn');

    if (activeBtn) {
        activeBtn.classList.add('active-btn', 'glow');


        activeBtn.onclick = () => {
            const link = activeBtn.getAttribute('data-link');
            if (link) {
                window.open(link, '_blank');
            } else if (activeBtn.id === 'start-btn') {
                startGame();
            }
        };
    }
}


function initMatrixBackground() {
    const matrixBg = document.getElementById('matrix-background');
    const numColumns = 15; 
    
    for (let i = 0; i < numColumns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = `${Math.random() * 100}%`;
        column.style.animationDuration = `${Math.random() * 5 + 3}s`;
        
    
        let matrixText = '';
        for (let j = 0; j < 20; j++) {
            
            matrixText += ['0', '1', '>', '<', '/', '?', '|', '#', '&'][Math.floor(Math.random() * 9)];
            matrixText += '<br>';
        }
        
        column.innerHTML = matrixText;
        matrixBg.appendChild(column);
    }
}


function updateGameColors() {
    
    const enemyGradientColor = "#b06060"; 
    
    const exitOpenColor = "#60b070"; 
    const exitClosedColor = "#7e68a8"; 
    
    
}


function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
   
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    
    if (localStorage.getItem('proofEscapeHighScore')) {
        highScore = parseInt(localStorage.getItem('proofEscapeHighScore'));
        highScoreDisplay.textContent = 'High Score: ' + highScore;
    }
    
    
    window.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        
        if (e.key === 'r' && gameState === 'playing') {
            restartGame();
        }
        
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });
    
 
    startBtn.addEventListener('click', startGame);
    nextLevelBtn.addEventListener('click', nextLevel);
    restartBtn.addEventListener('click', restartGame);
    menuBtn.addEventListener('click', returnToMenu); 
    
    initMenu();
    
 
    initMatrixBackground();
    

    updateGameColors();
    
    
}


function startGame() {
    bgMusic.loop = true;  
    bgMusic.volume = 0.07; 
    bgMusic.play();
    gameState = 'playing';
    currentLevel = 1;
    score = 0;
    loadLevel(currentLevel);
    startScreen.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function nextLevel() {
    currentLevel++;
    loadLevel(currentLevel);
    gameState = 'playing';
    levelCompleteScreen.style.display = 'none';
    requestAnimationFrame(gameLoop);
}


function restartGame() {
    gameState = 'playing';
    currentLevel = 1;
    score = 0;
    loadLevel(currentLevel);
    gameOverScreen.style.display = 'none';
    requestAnimationFrame(gameLoop);
}


function returnToMenu() {
    gameState = 'start';
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
    
 
    score = 0;
    scoreDisplay.textContent = score;
    
   
    initMenu();
}



function loadLevel(level) {
    
    fragments = [];
    fragmentsCollected = 0;
    walls = [];
    enemies = [];
    exitOpen = false;
    

    levelDisplay.textContent = level;

    generateMaze(level);
   
    fragmentsTotalDisplay.textContent = fragments.length;
    fragmentsCollectedDisplay.textContent = fragmentsCollected;
}

function generateMaze(level) {

    let mazeWidth = Math.min(30, 15 + level * 2);
    let mazeHeight = Math.min(23, 13 + level);
    if (mazeWidth % 2 === 0) mazeWidth--;
    if (mazeHeight % 2 === 0) mazeHeight--;

   
    const grid = Array(mazeHeight).fill().map(() => Array(mazeWidth).fill(0));

   
    const startX = 1;
    const startY = 1;
    
   
    const safeZoneRadius = 1; 
    for (let dy = -safeZoneRadius; dy <= safeZoneRadius; dy++) {
        for (let dx = -safeZoneRadius; dx <= safeZoneRadius; dx++) {
            const sx = startX + dx;
            const sy = startY + dy;
            if (sx >= 0 && sx < mazeWidth && sy >= 0 && sy < mazeHeight) {
                grid[sy][sx] = 1;
            }
        }
    }


    const stack = [{ x: startX, y: startY }];
 
    const directions = [
        { dx: 0, dy: -2 },
        { dx: 2, dy: 0 },
        { dx: 0, dy: 2 },
        { dx: -2, dy: 0 }
    ];
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const { x, y } = current;
        const neighbors = [];
       
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            if (nx > 0 && nx < mazeWidth - 1 && ny > 0 && ny < mazeHeight - 1 && grid[ny][nx] === 0) {
                neighbors.push({ nx, ny, dx: dir.dx, dy: dir.dy });
            }
        }
        
        if (neighbors.length > 0) {
         
            const roomChance = Math.min(0.08, 0.05 + level * 0.005);
            
            if (Math.random() < roomChance) {
                
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                
                const roomWidth = Math.min(5, 3 + Math.floor(Math.random() * 2) * 2);
                const roomHeight = Math.min(5, 3 + Math.floor(Math.random() * 2) * 2);
                
                
                let roomX = next.nx - Math.floor(roomWidth / 2);
                let roomY = next.ny - Math.floor(roomHeight / 2);
                
                
                roomX = Math.max(1, Math.min(roomX, mazeWidth - roomWidth - 1));
                roomY = Math.max(1, Math.min(roomY, mazeHeight - roomHeight - 1));
                
               
                const validRoom = roomX + roomWidth < mazeWidth - 1 && roomY + roomHeight < mazeHeight - 1;
                
                if (validRoom) {
                    
                    for (let ry = roomY; ry < roomY + roomHeight; ry++) {
                        for (let rx = roomX; rx < roomX + roomWidth; rx++) {
                            grid[ry][rx] = 1;
                        }
                    }
                   
                    const centerX = roomX + Math.floor(roomWidth / 2);
                    const centerY = roomY + Math.floor(roomHeight / 2);
                    
                   
                    grid[y + next.dy / 2][x + next.dx / 2] = 1;
                    
                    stack.push({ x: centerX, y: centerY });
                } else {
                    
                    grid[y + next.dy / 2][x + next.dx / 2] = 1;
                    grid[next.ny][next.nx] = 1;
                    stack.push({ x: next.nx, y: next.ny });
                }
            } else {
                
                const corridorChance = 0.2;
                
                if (Math.random() < corridorChance && neighbors.length > 0) {
                    
                    const dirIndex = Math.floor(Math.random() * directions.length);
                    const dir = directions[dirIndex];
                    
                    
                    let maxLength = 2 + Math.floor(Math.random() * 2) * 2;
                    let nx = x, ny = y;
                    
                  
                    for (let i = 1; i <= maxLength; i++) {
                        const nextX = nx + dir.dx;
                        const nextY = ny + dir.dy;
                        
                        
                        if (nextX > 0 && nextX < mazeWidth - 1 && 
                            nextY > 0 && nextY < mazeHeight - 1 && 
                            grid[nextY][nextX] === 0) {
                            
                           
                            grid[ny + dir.dy / 2][nx + dir.dx / 2] = 1;
                            grid[nextY][nextX] = 1;
                            
                            
                            nx = nextX;
                            ny = nextY;
                        } else {
                            break;
                        }
                    }
                    
                    
                    if (nx !== x || ny !== y) {
                        stack.push({ x: nx, y: ny });
                    }
                } else {
                    
                    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                    grid[y + next.dy / 2][x + next.dx / 2] = 1;
                    grid[next.ny][next.nx] = 1;
                    stack.push({ x: next.nx, y: next.ny });
                }
            }
        } else {
            stack.pop();
        }
    }
    
   
    const extraPathsCount = Math.min(5 + level, 15);
    
    for (let i = 0; i < extraPathsCount; i++) {
        
        let wallX, wallY;
        let validWall = false;
        let attempts = 0;
        
        while (!validWall && attempts < 100) {
            wallX = 1 + Math.floor(Math.random() * (mazeWidth - 2));
            wallY = 1 + Math.floor(Math.random() * (mazeHeight - 2));
            attempts++;
            
        
            if (grid[wallY][wallX] === 0) {
                
                if (wallX > 1 && wallX < mazeWidth - 2 && 
                    grid[wallY][wallX - 1] === 1 && grid[wallY][wallX + 1] === 1) {
                    validWall = true;
                }
              
                else if (wallY > 1 && wallY < mazeHeight - 2 && 
                         grid[wallY - 1][wallX] === 1 && grid[wallY + 1][wallX] === 1) {
                    validWall = true;
                }
            }
        }
        
   
        if (validWall) {
            grid[wallY][wallX] = 1;
        }
    }
    
   
    for (let dy = -safeZoneRadius; dy <= safeZoneRadius; dy++) {
        for (let dx = -safeZoneRadius; dx <= safeZoneRadius; dx++) {
            const sx = startX + dx;
            const sy = startY + dy;
            if (sx >= 0 && sx < mazeWidth && sy >= 0 && sy < mazeHeight) {
                grid[sy][sx] = 1;
            }
        }
    }

    const exitX = mazeWidth - 2;
    const exitY = mazeHeight - 2;
    const exitSafeRadius = 0;
    
    for (let dy = -exitSafeRadius; dy <= exitSafeRadius; dy++) {
        for (let dx = -exitSafeRadius; dx <= exitSafeRadius; dx++) {
            const ex = exitX + dx;
            const ey = exitY + dy;
            if (ex >= 0 && ex < mazeWidth && ey >= 0 && ey < mazeHeight) {
                grid[ey][ex] = 1;
            }
        }
    }

    const wallsSet = new Set();
    

    walls = [];
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            if (grid[y][x] === 0) {
                walls.push({
                    x: x * TILE_SIZE,
                    y: y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                });
                wallsSet.add(`${x},${y}`); 
            }
        }
    }

 
    player.x = TILE_SIZE * (startX + 0.5);
    player.y = TILE_SIZE * (startY + 0.5);

  
    exit = {
        x: exitX * TILE_SIZE,
        y: exitY * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE
    };


    fragments = []; 
    const numFragments = 3 + level;
    const fragmentsPositions = new Set();
    
    const validFragmentPositions = [];
    for (let y = 1; y < mazeHeight - 1; y++) {
        for (let x = 1; x < mazeWidth - 1; x++) {
            if (grid[y][x] === 1) {
                const pixelX = x * TILE_SIZE;
                const pixelY = y * TILE_SIZE;
                const distFromStart = Math.hypot(pixelX - player.x, pixelY - player.y);
                const distFromExit = Math.hypot(pixelX - exit.x, pixelY - exit.y);
                
                if (distFromStart >= TILE_SIZE * 3 && distFromExit >= TILE_SIZE * 2) {
                    validFragmentPositions.push({ x, y });
                }
            }
        }
    }
    

    for (let i = validFragmentPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validFragmentPositions[i], validFragmentPositions[j]] = 
        [validFragmentPositions[j], validFragmentPositions[i]];
    }
    
 
    let fragmentType = 0;
    if (validFragmentPositions.length > 0) {
        for (let i = 0; i < Math.min(numFragments, validFragmentPositions.length); i++) {
            const position = validFragmentPositions[i];
            
            
            fragments.push({
                x: position.x * TILE_SIZE,
                y: position.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                collected: false,
                type: fragmentType
            });
            
            
            fragmentsPositions.add(`${position.x},${position.y}`);
            
            
            fragmentType = (fragmentType + 1) % 3;
        }
    }

    
    enemies = addEnemies(mazeWidth, mazeHeight, grid, fragmentsPositions, wallsSet, level);
}


function addEnemies(mazeWidth, mazeHeight, grid, fragmentsPositions, wallsSet, level) {
    const numEnemies = Math.min(level, 10);
    const result = [];
    
   
    const validEnemyPositions = [];
    
    for (let y = 2; y < mazeHeight - 2; y++) {
        for (let x = 2; x < mazeWidth - 2; x++) {
            
            if (grid[y][x] === 1 && !fragmentsPositions.has(`${x},${y}`)) {
                const pixelX = x * TILE_SIZE;
                const pixelY = y * TILE_SIZE;
                
               
                const distFromStart = Math.hypot(pixelX - player.x, pixelY - player.y);
                const distFromExit = Math.hypot(pixelX - exit.x, pixelY - exit.y);
                
                if (distFromStart >= TILE_SIZE * 2.5 && distFromExit >= TILE_SIZE * 1) {
                    validEnemyPositions.push({ x, y });
                }
            }
        }
    }
    
   
    for (let i = validEnemyPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validEnemyPositions[i], validEnemyPositions[j]] = 
        [validEnemyPositions[j], validEnemyPositions[i]];
    }
    
    if (validEnemyPositions.length > 0) {
        for (let i = 0; i < Math.min(numEnemies, validEnemyPositions.length); i++) {
            const position = validEnemyPositions[i];
            
            result.push({
                x: position.x * TILE_SIZE,
                y: position.y * TILE_SIZE,
                width: TILE_SIZE - 6,
                height: TILE_SIZE - 6,
                dirX: Math.random() > 0.5 ? 1 : -1,
                dirY: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    
    return result;
}


function gameLoop(timestamp) {
    if (gameState !== 'playing') return;
    
  
    const deltaTime = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;
    
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
  
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    checkCollisions();
    
   
    drawMaze();
    drawFragments();
    drawExit();
    drawEnemies();
    drawPlayer();
    
    
    requestAnimationFrame(gameLoop);
}


function updatePlayer(deltaTime) {
   
    let moveX = 0;
    let moveY = 0;
    
    if (keysPressed['ArrowUp'] || keysPressed['w']) moveY = -1;
    if (keysPressed['ArrowDown'] || keysPressed['s']) moveY = 1;
    if (keysPressed['ArrowLeft'] || keysPressed['a']) moveX = -1;
    if (keysPressed['ArrowRight'] || keysPressed['d']) moveX = 1;
    
 
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071; 
        moveY *= 0.7071;
    }
    

    const newX = player.x + moveX * player.speed * deltaTime * 60;
    const newY = player.y + moveY * player.speed * deltaTime * 60;
    

    let collisionX = false;
    walls.forEach(wall => {
        if (
            newX < wall.x + wall.width &&
            newX + player.width > wall.x &&
            player.y < wall.y + wall.height &&
            player.y + player.height > wall.y
        ) {
            collisionX = true;
        }
    });
    
  
    let collisionY = false;
    walls.forEach(wall => {
        if (
            player.x < wall.x + wall.width &&
            player.x + player.width > wall.x &&
            newY < wall.y + wall.height &&
            newY + player.height > wall.y
        ) {
            collisionY = true;
        }
    });
    

    if (!collisionX) player.x = newX;
    if (!collisionY) player.y = newY;
    

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}


function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        
        const newX = enemy.x + enemy.dirX * ENEMY_SPEED * deltaTime * 60;
        const newY = enemy.y + enemy.dirY * ENEMY_SPEED * deltaTime * 60;
        
       
        let collisionX = false;
        walls.forEach(wall => {
            if (
                newX < wall.x + wall.width &&
                newX + enemy.width > wall.x &&
                enemy.y < wall.y + wall.height &&
                enemy.y + enemy.height > wall.y
            ) {
                collisionX = true;
            }
        });
        
        let collisionY = false;
        walls.forEach(wall => {
            if (
                enemy.x < wall.x + wall.width &&
                enemy.x + enemy.width > wall.x &&
                newY < wall.y + wall.height &&
                newY + enemy.height > wall.y
            ) {
                collisionY = true;
            }
        });
        

        if (collisionX) enemy.dirX *= -1;
        if (collisionY) enemy.dirY *= -1;
        
   
        if (!collisionX) enemy.x = newX;
        if (!collisionY) enemy.y = newY;
        
     
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.dirX *= -1;
        }
        if (enemy.y <= 0 || enemy.y + enemy.height >= canvas.height) {
            enemy.dirY *= -1;
        }
    });
}


function checkCollisions() {
   
    fragments.forEach(fragment => {
        if (!fragment.collected && 
            player.x < fragment.x + fragment.width &&
            player.x + player.width > fragment.x &&
            player.y < fragment.y + fragment.height &&
            player.y + player.height > fragment.y) {
            
            fragment.collected = true;
            fragmentsCollected++;
            fragmentsCollectedDisplay.textContent = fragmentsCollected;
            
          
            const pointsGained = 100 * currentLevel;
            score += pointsGained;
            scoreDisplay.textContent = score;
            
            
            if (fragmentsCollected === fragments.length) {
                exitOpen = true;
            }
        }
    });
   
    enemies.forEach(enemy => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
           
            gameOver();
        }
    });
    
  
    if (exitOpen &&
        player.x < exit.x + exit.width &&
        player.x + player.width > exit.x &&
        player.y < exit.y + exit.height &&
        player.y + player.height > exit.y) {
        
        levelComplete();
    }
}


function levelComplete() {
    gameState = 'levelComplete';
    
   
    const levelBonus = 500 * currentLevel;
    score += levelBonus;
    

    scoreDisplay.textContent = score;
    levelScoreDisplay.textContent = score;
    

    levelCompleteScreen.style.display = 'flex';
}


function gameOver() {
    gameState = 'gameOver';
    
  
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('proofEscapeHighScore', highScore);
        highScoreDisplay.textContent = 'High Score: ' + highScore;
    }
    

    finalScoreDisplay.textContent = score;
    
 
    gameOverScreen.style.display = 'flex';
}


function drawMaze() {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    
    for (let x = 0; x < canvas.width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    

    ctx.fillStyle = '#ff00ff';
    ctx.lineWidth = 0.001;
    
    walls.forEach(wall => {
      
        let gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x + wall.width, wall.y + wall.height);
        gradient.addColorStop(0, '#1e2437'); 
        gradient.addColorStop(1, '#2a3048'); 

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; 
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const radius = 5; 

        ctx.beginPath();
        ctx.moveTo(wall.x + radius, wall.y);
        ctx.lineTo(wall.x + wall.width - radius, wall.y);
        ctx.arcTo(wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + radius, radius);
        ctx.lineTo(wall.x + wall.width, wall.y + wall.height - radius);
        ctx.arcTo(wall.x + wall.width, wall.y + wall.height, wall.x + wall.width - radius, wall.y + wall.height, radius);
        ctx.lineTo(wall.x + radius, wall.y + wall.height);
        ctx.arcTo(wall.x, wall.y + wall.height, wall.x, wall.y + wall.height - radius, radius);
        ctx.lineTo(wall.x, wall.y + radius);
        ctx.arcTo(wall.x, wall.y, wall.x + radius, wall.y, radius);
        ctx.closePath();
        
        ctx.fill();


        ctx.strokeStyle = 'rgba(125, 198, 227, 0.15)'; 

        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

    
        ctx.shadowBlur = 0;
    });
}

function drawPlayer() {
    const scale = 2; 


    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;


    const drawWidth = player.width * scale;
    const drawHeight = player.height * scale;

  
    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;
    if (playerImage.complete){
        ctx.drawImage(playerImage, drawX, drawY, drawWidth, drawHeight);
    }
    
}

function drawFragments() {

        const pulseFactor = 0.1; 
        const pulse = 1 + Math.sin(Date.now() / 200) * pulseFactor;

        fragments.forEach(fragment => {
            if (!fragment.collected) {
                const centerX = fragment.x + fragment.width / 2;
                const centerY = fragment.y + fragment.height / 2;
                const drawWidth = fragment.width * pulse;
                const drawHeight = fragment.height * pulse;
                const drawX = centerX - drawWidth / 2;
                const drawY = centerY - drawHeight / 2;
            if (fragmentImage.complete) {
                ctx.drawImage(fragmentImage, drawX, drawY, drawWidth, drawHeight);
            } else {
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(fragment.x, fragment.y, fragment.width, fragment.height);
            }
        }

    });
}

function drawExit() {

    if (exitOpen) {
        ctx.fillStyle = '#60b070';
        ctx.strokeStyle = '#ffffff';

        const pulseSize = Math.sin(Date.now() / 300) * 3;
        
        ctx.shadowColor = '#60b070';
        ctx.shadowBlur = 15;
        

        ctx.beginPath();
        ctx.arc(
            exit.x + exit.width / 2,
            exit.y + exit.height / 2,
            (exit.width / 2) + pulseSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = '#7e68a8';
        ctx.strokeStyle = '#aa00aa';
        
        ctx.beginPath();
        ctx.arc(
            exit.x + exit.width / 2,
            exit.y + exit.height / 2,
            exit.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#b06060';
        ctx.strokeStyle = '#ffffff';
        
  
        const pulseSize = Math.sin(Date.now() / 400) * 2;
        
        ctx.shadowColor = '#b06060';
        ctx.shadowBlur = 10;
        

        ctx.beginPath();
        const centerX = enemy.x + enemy.width / 2;
        const centerY = enemy.y + enemy.height / 2;
        const size = (enemy.width / 2) + pulseSize;
        
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX + size, centerY);
        ctx.lineTo(centerX, centerY + size);
        ctx.lineTo(centerX - size, centerY);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
}

function drawStartScreen() {
    ctx.fillStyle = '#0a1021';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.fillStyle = '#9d78bd';
    ctx.font = '36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PROOF ESCAPE', canvas.width / 2, canvas.height / 3);
    
    
    ctx.fillStyle = '#7dc6e3';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('Press START to begin your escape', canvas.width / 2, canvas.height / 2);
}


window.onload = init;