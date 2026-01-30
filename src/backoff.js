

async function backoff(type, delay, attempt, factor) {

    attempt = attempt ? attempt : 0;
    factor = factor ? factor : 2;

    if (type === "fixed") {

        return delay;
    }
    else if (type === "linear") {

        return delay * attempt;
    }
    else if (type === "exponential") {
        return delay * factor;
    }


}


export { backoff }