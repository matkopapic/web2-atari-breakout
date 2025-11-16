import {coerceIn} from "./utils.js";

export function handlePaddleCollision(ball, paddle) {
    const ballLeft = ball.x;
    const ballRight = ball.x + ball.width;
    const ballBottom = ball.y + ball.height;

    const paddleTop = paddle.y;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;

    if (
        ballRight < paddleLeft ||
        ballLeft > paddleRight ||
        ballBottom < paddleTop
    ) {
        return false;
    }

    ball.yVelocity = -Math.abs(ball.yVelocity);
    if (paddle.velocity !== 0) {
        const newVelocity = ball.xVelocity + 0.25 * ball.maxAbsVelocity * Math.abs(paddle.velocity) / paddle.velocity
        ball.xVelocity = coerceIn(-ball.maxAbsVelocity, newVelocity, ball.maxAbsVelocity);
    }

    return true;
}