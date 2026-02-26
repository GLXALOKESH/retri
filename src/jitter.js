

async function jitter(delay, fraction) {
    const jitterAmount = delay * fraction;
    const min = delay - jitterAmount;
    const max = delay + jitterAmount;
    const result = Math.random() * (max - min) + min;

    return result;
}

export { jitter }