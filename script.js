const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state variables
let snake = [];
let dx = 0;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let highScore = 0;
let gameLoop;
let isGameRunning = false;

// Initialize the game
function initGame() {
    snake = [
        { x: 10, y: 10 } // Starting position
    ];
    dx = 1; // Moving right initially
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    
    spawnFood();
    isGameRunning = true;
    startBtn.textContent = 'Restart Game';
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 150); // Game speed
}

// Main game loop
function update() {
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    checkFood();
    draw();
}

// Update snake coordinates
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Check if food is eaten
function checkFood() {
    const head = snake[0];
    if (head.x === foodX && head.y === foodY) {
        score += 10;
        scoreElement.textContent = score;
        spawnFood();
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

// Generate food in a random location
function spawnFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // Ensure food doesn't spawn on the snake
    snake.forEach(segment => {
        if (segment.x === foodX && segment.y === foodY) {
            spawnFood();
        }
    });
}

// End the game
function gameOver() {
    clearInterval(gameLoop);
    isGameRunning = false;
    startBtn.textContent = 'Start Game';
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
    }
    
    // Draw Game Over text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

// Draw the game frame
function draw() {
    // Clear canvas (Dark Gray background)
    ctx.fillStyle = '#111827'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food (Red)
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw snake (Green)
    ctx.fillStyle = '#10B981';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// Keyboard controls 
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    if (e.key === 'ArrowUp') {
        dx = 0;
        dy = -1;
    } else if (e.key === 'ArrowDown') {
        dx = 0;
        dy = 1;
    } else if (e.key === 'ArrowLeft') {
        dx = -1;
        dy = 0;
    } else if (e.key === 'ArrowRight') {
        dx = 1;
        dy = 0;
    }
});

// Button listener
startBtn.addEventListener('click', initGame);