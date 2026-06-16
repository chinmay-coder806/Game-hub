// const aiBtn = document.getElementById('aiBtn');
let localCommentTimer = null;
let isGeneratingComment = false;
const commentaryBox = document.getElementById('commentary');
const GEMINI_API_KEY = 'Your_API_key'; 

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const localComments = [
    "The crowd is waiting for the next big play.",
    "Steady hands win long games.",
    "One wrong turn changes everything.",
    "The apples aren't feeling safe.",
    "Pressure is building.",
    "The snake looks focused.",
    "Every move matters now.",
    "The arena has gone quiet.",
    "A calm player is a dangerous player.",
    "Nobody blink."
];

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
    clearTimeout(localCommentTimer);
commentaryBox.textContent = "";
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
    getAICommentary("start");

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

        if (score % 50 === 0) {
            getAICommentary("playing");
        }

        spawnFood();

    } else {

        snake.pop();

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
    // clearInterval(commentaryInterval);
    isGameRunning = false;
    startBtn.textContent = 'Start Game';

    if (score > highScore) {

        highScore = score;
        highScoreElement.textContent = highScore;

        getAICommentary("highScore");

    } else {

        getAICommentary("gameOver");

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

// Keyboard controls 180deg directional fix
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;

    if ((e.key === 'ArrowUp' || e.key === 'w') && dy !== 1) {
        dx = 0;
        dy = -1;
    } else if ((e.key === 'ArrowDown' || e.key === 's') && dy !== -1) {
        dx = 0;
        dy = 1;
    } else if ((e.key === 'ArrowLeft' || e.key === 'a') && dx !== 1) {
        dx = -1;
        dy = 0;
    } else if ((e.key === 'ArrowRight' || e.key === 'd') && dx !== -1) {
        dx = 1;
        dy = 0;
    }
});

// AI Commentary Function
async function getAICommentary(event = "playing") {

    clearTimeout(localCommentTimer);

    if (isGeneratingComment) return;
    isGeneratingComment = true;

    let prompt = "";

    
    switch (event) {


        case "playing":
            prompt = `
You are a live esports commentator for a Snake game.

Current Score: ${score}
High Score: ${highScore}
Snake Length: ${snake.length}

Give one short, witty commentary.
Keep it under 12 words.
Mix praise, sarcasm, and playful roasts.
Never mention you're an AI.
Never introduce yourself.
`;
            break;

        case "gameOver":

            prompt = `
The Snake game has just ended.

Final Score: ${score}

React like a live esports commentator.
One funny sentence.
Under 12 words.
`;
            break;

        case "highScore":
            prompt = `
The player just achieved a new high score of ${score}.

React like an excited esports commentator.
One sentence.
Under 12 words.
`;
            break;

        case "start":
            prompt = `
The Snake game is about to begin.

Write one exciting opening line.

Maximum 10 words.
`;
            break;
    }



    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const data = await response.json();

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No commentary available.";

        commentaryBox.textContent = `🤖 ${text}`;
        // Cancel any previous timer
        clearTimeout(localCommentTimer);

        // After 10 seconds, replace AI comment with a local one
        localCommentTimer = setTimeout(() => {

            if (isGameRunning && commentaryBox.textContent.startsWith("🤖")) {
                showLocalComment();
            }

        }, 10000);


    } catch (err) {
    console.error(err);
    showLocalComment();

    } finally {
        isGeneratingComment = false;
    }
}

// local comments
function showLocalComment() {

    const random =
        localComments[Math.floor(Math.random() * localComments.length)];

    commentaryBox.textContent = `💬 ${random}`;
}


// Button listener
startBtn.addEventListener('click', initGame);