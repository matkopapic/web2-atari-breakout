import {handleBrickCollision} from "./brickCollision.js";
import {handlePaddleCollision} from "./paddleCollision.js";
import {coerceIn} from "./utils.js";

// Array of colors for each brick row
const brickColors = [
    "rgb(153, 51, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 153, 204)",
    "rgb(0, 255, 0)",
    "rgb(255, 255, 153)"
];

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const bricksConfig = {
    rows: 5,                 // Number of rows of bricks
    countPerRow: 10,         // Number of bricks in each row
    height: 20,              // Height of each brick in pixels
    verticalSpacing: 15,     // Space between rows vertically
    horizontalSpacing: 30,   // Space between bricks horizontally
    initialY: 50             // Y position of the first row of bricks
}

// 2D array representing the state of each brick (1 = visible, 0 = broken)
const bricks = Array.from(
    {length: bricksConfig.rows},
    () => Array(bricksConfig.countPerRow).fill(1)
);

const paddle = {
    x: canvas.width / 2 - 60, // Initial X position (centered horizontally)
    y: canvas.height - 50,    // Y position near the bottom of the canvas
    velocity: 0,              // Current horizontal velocity of the paddle
    maxAbsVelocity: 500,      // Maximum speed the paddle can move
    width: 120,               // Paddle width in pixels
    height: 10,               // Paddle height in pixels
    color: "rgb(255, 255, 255)", // Paddle color
};

const initialBallVelocity = 300
const ball = {
    width: 30,                // Width of the ball
    height: 30,               // Height of the ball
    x: paddle.x + paddle.width / 2 - 15, // Initial X position (centered on paddle)
    y: paddle.y - 20,         // Initial Y position (just above the paddle)
    xVelocity: 0,             // Current horizontal velocity
    yVelocity: 0,             // Current vertical velocity
    maxAbsVelocity: 400,      // Maximum speed of the ball
    color: "rgb(255, 255, 255)", // Ball color
};

const gameState = {
    isGameOver: false,        // True if the game is over
    isInitialMenu: true,      // True if the initial menu is displayed
    currentScore: 0,          // Player's current score
}

function main() {
    run();
}

function setInitialState() {
    gameState.isInitialMenu = false;
    gameState.isGameOver = false;
    gameState.currentScore = 0;

    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.velocity = 0;

    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;
    // either 1 or -1, multiples with the initialBallVelocity to intially launch ball to the left or right
    const initialBallDirection = Math.random() < 0.5 ? 1 : -1;
    ball.xVelocity = initialBallDirection * initialBallVelocity;
    ball.yVelocity = -initialBallVelocity;

    for (let row = 0; row < bricksConfig.rows; row++) {
        for (let col = 0; col < bricksConfig.countPerRow; col++) {
            bricks[row][col] = 1;
        }
    }
}

function gameOver() {
    gameState.isGameOver = true;
}

function drawBackground() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function drawPaddle() {
    ctx.save();
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.restore();
}

function drawBall() {
    ctx.save();
    ctx.fillStyle = ball.color;
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    ctx.restore();
}

function drawBricks() {
    ctx.save();
    const {
        rows,
        countPerRow,
        verticalSpacing,
        horizontalSpacing,
        height
    } = bricksConfig;

    // calculates individual brickWidth based on canvas width and horizontal spacing between bricks
    const totalSpacing = horizontalSpacing * (countPerRow + 1);
    const brickWidth = (canvas.width - totalSpacing) / countPerRow;
    for (let row = 0; row < rows; row++) {
        // y coordinate for the current row of bricks
        const y = row * (height + verticalSpacing) + bricksConfig.initialY;

        for (let col = 0; col < countPerRow; col++) {
            // if present draw the brick
            if (bricks[row][col] === 1) {
                const x = horizontalSpacing + col * (brickWidth + horizontalSpacing);

                ctx.fillStyle = brickColors[row];
                ctx.fillRect(x, y, brickWidth, height);
            }
        }
    }
    ctx.restore();
}

function drawCurrentScore() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.textAlign = "start";
    ctx.font = "bold 16px Verdana";
    ctx.fillText("Current score: " + gameState.currentScore, 20, 20 + 8);
    ctx.restore();
}

function drawHighScore()  {
    ctx.save();
    let highScore = localStorage['highScore'];
    if (!highScore) highScore = 0;
    ctx.fillStyle = "white";
    ctx.textAlign = "end";
    ctx.font = "bold 16px Verdana";
    ctx.fillText("High score: " + highScore, canvas.width - 100, 20 + 8);
    ctx.restore();
}

function drawGameOver() {
    const isVictory = gameState.currentScore === bricksConfig.rows * bricksConfig.countPerRow;
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.font = "bold 40px Verdana";
    const text = isVictory ? "Congratulations, you are victorious" : "GAME OVER"
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.font = "bold 18px Verdana";
    ctx.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 10 + 20);
    ctx.restore();
}

function drawInitialMenu() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "italic bold 36px Verdana";
    ctx.fillText("BREAKOUT", canvas.width / 2, canvas.height / 2);
    ctx.font = "italic bold 18px Verdana";
    ctx.fillText("Press SPACE to begin", canvas.width / 2, canvas.height / 2 + 10 + 18);
    ctx.restore();
}

function draw() {
    drawBackground();
    if (gameState.isInitialMenu) return drawInitialMenu();
    drawPaddle();
    drawBricks();
    drawBall();
    drawCurrentScore();
    drawHighScore();
    if (gameState.isGameOver) drawGameOver();
}

// update position of game objects, delta is used as the time while calculating coordinates with velocity
function update(delta) {
    // update paddle position if it has velocity
    if (paddle.velocity !== 0) {
        paddle.x = coerceIn(0, paddle.x + paddle.velocity * delta, canvas.width - paddle.width)
    }
    // update ball x position if it has xVelocity
    if (ball.xVelocity !== 0) {
        ball.x = coerceIn(0, ball.x + ball.xVelocity * delta, canvas.width - ball.width)
        if (ball.x <= 0 || ball.x >= canvas.width - ball.width) ball.xVelocity = -ball.xVelocity;
    }
    // update ball y position if it has yVelocity
    if (ball.yVelocity !== 0) {
        ball.y = coerceIn(0, ball.y + ball.yVelocity * delta, canvas.height - ball.height)
        if (ball.y <= 0) {
            ball.yVelocity = -ball.yVelocity;
        } else if (ball.y >= canvas.height - ball.height) {
            // if ball is touching the canvas bottom border, end game and potentially set high score
            gameOver()
            if (!localStorage['highScore'] || localStorage['highScore'] < gameState.currentScore) {
                localStorage['highScore'] = gameState.currentScore
            }
        }
    }

    handleBrickCollision(ball, bricks, bricksConfig, canvas, gameState);
    handlePaddleCollision(ball, paddle, paddle);
}

let lastFrame = 0;

// main game loop, each frame has its timestamp
function run(timestamp) {
    // delta is the time since last frame (used when updating position so that speed is independent of refresh rate)
    const delta = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;
    if (!gameState.isGameOver && !gameState.isInitialMenu) update(delta);
    draw();
    requestAnimationFrame(run);
}

window.addEventListener('keydown', e => {
    // move paddle left and right
    if (e.key === 'ArrowLeft') paddle.velocity = -paddle.maxAbsVelocity;
    if (e.key === 'ArrowRight') paddle.velocity = paddle.maxAbsVelocity;
    // if game is over it is restarted by pressing space
    if (e.key === " " && (gameState.isGameOver || gameState.isInitialMenu)) {
        setInitialState()
    }
});

window.addEventListener('keyup', e => {
    // if paddle is moving in direction of key that's being released, stop moving it
    if (e.key === 'ArrowLeft' && paddle.velocity < 0) paddle.velocity = 0;
    if (e.key === 'ArrowRight' && paddle.velocity > 0) paddle.velocity = 0;
});

main();
