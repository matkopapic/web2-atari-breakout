import {handleBrickCollision} from "./brickCollision.js";
import {handlePaddleCollision} from "./paddleCollision.js";
import {coerceIn} from "./utils.js";

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
    rows: 5,
    countPerRow: 10,
    height: 20,
    verticalSpacing: 15,
    horizontalSpacing: 30,
    initialY: 50
}

const bricks = Array.from(
    {length: bricksConfig.rows},
    () => Array(bricksConfig.countPerRow).fill(1)
);

const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 50,
    velocity: 0,
    maxAbsVelocity: 500,
    width: 120,
    height: 10,
    color: "rgb(255, 255, 255)",
}

const initialBallVelocity = 300
const ball = {
    width: 30,
    height: 30,
    x: paddle.x + paddle.width / 2 - 15,
    y: paddle.y - 20,
    xVelocity: 0,
    yVelocity: 0,
    maxAbsVelocity: 400,
    velocityMultiplier: 1,
    color: "rgb(255, 255, 255)",
};

const gameState = {
    isGameOver: false,
    isInitialMenu: true,
    currentScore: 0,
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

    const totalSpacing = horizontalSpacing * (countPerRow + 1);
    const brickWidth = (canvas.width - totalSpacing) / countPerRow;
    for (let row = 0; row < rows; row++) {
        const y = row * (height + verticalSpacing) + bricksConfig.initialY;

        for (let col = 0; col < countPerRow; col++) {
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

function update(delta) {
    if (paddle.velocity !== 0) {
        paddle.x = coerceIn(0, paddle.x + paddle.velocity * delta, canvas.width - paddle.width)
    }
    if (ball.xVelocity !== 0) {
        ball.x = coerceIn(0, ball.x + ball.xVelocity * delta, canvas.width - ball.width)
        if (ball.x <= 0 || ball.x >= canvas.width - ball.width) ball.xVelocity = -ball.xVelocity;
    }
    if (ball.yVelocity !== 0) {
        ball.y = coerceIn(0, ball.y + ball.yVelocity * delta, canvas.height - ball.height)
        if (ball.y <= 0) {
            ball.yVelocity = -ball.yVelocity;
        } else if (ball.y >= canvas.height - ball.height) {
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

function run(timestamp) {
    const delta = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;
    if (!gameState.isGameOver && !gameState.isInitialMenu) update(delta);
    draw();
    requestAnimationFrame(run);
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') paddle.velocity = -paddle.maxAbsVelocity;
    if (e.key === 'ArrowRight') paddle.velocity = paddle.maxAbsVelocity;
    if (e.key === " " && (gameState.isGameOver || gameState.isInitialMenu)) {
        setInitialState()
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' && paddle.velocity < 0) paddle.velocity = 0;
    if (e.key === 'ArrowRight' && paddle.velocity > 0) paddle.velocity = 0;
});

main();
