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
    { length: bricksConfig.rows },
    () => Array(bricksConfig.countPerRow).fill(1)
);

const paddle = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    velocity: 0,
    width: 50,
    height: 10,
    color: "rgb(255, 255, 255)",
}

const ball = {
    width: 20,
    height: 20,
    x: 0,
    y: 0,
    xVelocity: 4,
    yVelocity: -4,
    speedMultiplier: 1
};

function main() {
    run();
}

function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle(){
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
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

function draw() {
    drawBackground();
    drawPaddle();
    drawBricks();
}

function update() {
    if (paddle.velocity !== 0) {
        paddle.x = coerceIn(0, paddle.x + paddle.velocity, canvas.width - paddle.width)
    }
}

function run() {
    update();
    draw();
    requestAnimationFrame(run);
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') paddle.velocity = -4;
    if (e.key === 'ArrowRight') paddle.velocity = 4;
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' && paddle.velocity < 0) paddle.velocity = 0;
    if (e.key === 'ArrowRight' && paddle.velocity > 0) paddle.velocity = 0;
});

function coerceIn(min, value, max) {
    return Math.min(Math.max(value, min), max);
}

main();
