// make value min if smaller than min or make value max if larger than max
export function coerceIn(min, value, max) {
    return Math.min(Math.max(value, min), max);
}