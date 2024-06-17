export function rgb1to256(value) {
    return Math.round(parseFloat(value.toFixed(4)) * 255)
}
