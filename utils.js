export function coerceIn(min, value, max) {
    return Math.min(Math.max(value, min), max);
}