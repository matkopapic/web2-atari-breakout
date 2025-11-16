export function handleBrickCollision(ball, bricks, bricksConfig, canvas, gameState) {
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

                // if there is a brick collision, remove it in bricks array, increase score, and check if all bricks are removed
                if (brickCollision(ball, x, y, brickWidth, height)) {
                    bricks[row][col] = 0;
                    gameState.currentScore++;
                    if (gameState.currentScore === bricksConfig.rows * bricksConfig.countPerRow) {
                        gameState.isGameOver = true;
                    }
                    // increase ball velocity by 2% if brick is hit
                    ball.yVelocity *= 1.02;
                }
            }
        }
    }
}

function brickCollision(ball, brickX, brickY, brickW, brickH) {
    const ballLeft = ball.x;
    const ballRight = ball.x + ball.width;
    const ballTop = ball.y;
    const ballBottom = ball.y + ball.height;

    const brickLeft = brickX;
    const brickRight = brickX + brickW;
    const brickTop = brickY;
    const brickBottom = brickY + brickH;

    // early return if we are not overlapping
    if (
        ballRight < brickLeft ||
        ballLeft > brickRight ||
        ballBottom < brickTop ||
        ballTop > brickBottom
    ) {
        return false;
    }

    const overlapLeft = ballRight - brickLeft;
    const overlapRight = brickRight - ballLeft;
    const overlapTop = ballBottom - brickTop;
    const overlapBottom = brickBottom - ballTop;

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    // depending on which side of brick is hit, deflect the ball in appropriate direction
    if (minOverlap === overlapLeft) {
        ball.xVelocity = -Math.abs(ball.xVelocity);
    } else if (minOverlap === overlapRight) {
        ball.xVelocity = Math.abs(ball.xVelocity);
    } else if (minOverlap === overlapTop) {
        ball.yVelocity = -Math.abs(ball.yVelocity);
    } else {
        ball.yVelocity = Math.abs(ball.yVelocity);
    }

    return true;
}
