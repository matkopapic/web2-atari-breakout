import {coerceIn} from "./utils.js";

export function handlePaddleCollision(ball, paddle) {
    const ballLeft = ball.x;
    const ballRight = ball.x + ball.width;
    const ballBottom = ball.y + ball.height;

    const paddleTop = paddle.y;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;

    // if ball is to the right, left or above the paddle, it's not colliding
    if (
        ballRight < paddleLeft ||
        ballLeft > paddleRight ||
        ballBottom < paddleTop
    ) {
        return false;
    }

    // ball will always deflect upwards
    ball.yVelocity = -Math.abs(ball.yVelocity);

    if (paddle.velocity !== 0) {
        // considering paddle velocity, nudge the ball in that direction
        const newVelocity = ball.xVelocity + 0.25 * ball.maxAbsVelocity * Math.abs(paddle.velocity) / paddle.velocity
        ball.xVelocity = coerceIn(-ball.maxAbsVelocity, newVelocity, ball.maxAbsVelocity);
    }

    return true;
}