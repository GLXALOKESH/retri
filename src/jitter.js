

async function jitter(delay, fraction) {
    const jitterAmount = delay * fraction;
    const min = delay - jitterAmount;
    const max = delay + jitterAmount;
    const result = Math.random() * (max - min) + min;
    console.log("jitter", result);

    return result;
}

export { jitter }