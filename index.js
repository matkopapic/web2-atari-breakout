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
    horizontalSpacing: 15,
}

const bricks = Array.from(
    {length: bricksConfig.rows},
    () => Array(bricksConfig.countPerRow).fill(1)
);

const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 50,
    velocity: 0,
    width: 100,
    height: 10,
    color: "rgb(255, 255, 255)",
}

const ball = {
    width: 15,
    height: 15,
    x: paddle.x + paddle.width / 2 - 7.5,
    y: paddle.y - 20,
    xVelocity: 0,
    yVelocity: 0,
    maxAbsVelocity: 5,
    velocityMultiplier: 1,
    color: "rgb(255, 255, 255)",
};

const gameState = {
    isGameOver: false,
    isInitialMenu: true,
}

function main() {
    run();
}

function setInitialState() {
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.velocity = 0;

    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;
    ball.xVelocity = 3;
    ball.yVelocity = -3;

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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle() {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
}

function drawBricks() {
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
        const y = row * (height + verticalSpacing) + verticalSpacing;

        for (let col = 0; col < countPerRow; col++) {
            if (bricks[row][col] === 1) {
                const x = horizontalSpacing + col * (brickWidth + horizontalSpacing);

                ctx.fillStyle = brickColors[row];
                ctx.fillRect(x, y, brickWidth, height);
            }
        }
    }
}

function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game over, press space to restart", canvas.width / 2, canvas.height / 2);
}

function drawInitialMenu() {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Press space to start", canvas.width / 2, canvas.height / 2);
}

function draw() {
    drawBackground();
    drawPaddle();
    drawBricks();
    drawBall();
    if (gameState.isGameOver) drawGameOver();
    if (gameState.isInitialMenu) drawInitialMenu();
}

function update() {
    if (paddle.velocity !== 0) {
        paddle.x = coerceIn(0, paddle.x + paddle.velocity, canvas.width - paddle.width)
    }
    if (ball.xVelocity !== 0) {
        ball.x = coerceIn(0, ball.x + ball.xVelocity, canvas.width - ball.width)
        if (ball.x <= 0 || ball.x >= canvas.width - ball.width) ball.xVelocity = -ball.xVelocity;
    }
    if (ball.yVelocity !== 0) {
        ball.y = coerceIn(0, ball.y + ball.yVelocity, canvas.height - ball.height)
        if (ball.y <= 0) {
            ball.yVelocity = -ball.yVelocity;
        } else if (ball.y >= canvas.height - ball.height) {
            gameOver()
        }
    }

    handleBrickCollision(ball, bricks, bricksConfig, canvas);
    handlePaddleCollision(ball, paddle, paddle);
}

function run() {
    if (!gameState.isGameOver && !gameState.isInitialMenu) update();
    draw();
    requestAnimationFrame(run);
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') paddle.velocity = -4;
    if (e.key === 'ArrowRight') paddle.velocity = 4;
    if (e.key === " " && (gameState.isGameOver || gameState.isInitialMenu)) {
        gameState.isInitialMenu = false;
        gameState.isGameOver = false;
        setInitialState()
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' && paddle.velocity < 0) paddle.velocity = 0;
    if (e.key === 'ArrowRight' && paddle.velocity > 0) paddle.velocity = 0;
});

main();
