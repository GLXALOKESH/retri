import { RetriError } from "./error";
import { delay } from "./delay";
import { backoff } from "./backoff";
import { jitter } from "./jitter";
import { createContext } from "./retryContext";

async function retry(fn, options) {
    const retries = options.retries ? options.retries : 3;
    const errors = [];
    const dealyms = options.delay ? options.delay : 300;
    const backoffSelection = options.backoff ? options.backoff : "fixed"
    let currentDelay = dealyms;
    const factor = options.factor ? options.factor : 2;
    const jitterVal = options.jitter ? options.jitter : 0;
    const maxAttempts = retries + 1;
    let currentDelaywithJitter = currentDelay;
    const startTime = Date.now();


    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log("attempt: ", attempt);
        if (jitterVal) {
            currentDelaywithJitter = await jitter(currentDelay, jitterVal);
        }
        try {
            const result = await fn();
            return result;
        } catch (error) {
            errors.push(error);
            if (attempt === maxAttempts) {
                throw new RetriError("Maximum Retries Exceeded", attempt, errors);
            }
            const ctx = createContext({ attempt, retries, startTime, error })
            const allowretry = options.shouldRetry ? options.shouldRetry(error, ctx) : true;

            if (!allowretry) {

                throw new RetriError("Error not allowed to retry", attempt, errors);
            }
        }
        console.log(currentDelay);

        await delay(currentDelaywithJitter);
        if (backoffSelection === "fixed") {
            currentDelay = await backoff(backoffSelection, dealyms)
        }
        else if (backoffSelection === "linear") {
            currentDelay = await backoff(backoffSelection, dealyms, attempt + 1)
        }
        else if (backoffSelection === "exponential") {
            // console.log(factor);

            currentDelay = await backoff(backoffSelection, currentDelay, attempt, factor)
        }
    }

}

export { retry }