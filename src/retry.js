import { RetriError, AbortError } from "./error";
import { delay } from "./delay";
import { backoff } from "./backoff";
import { jitter } from "./jitter";
import { createContext } from "./retryContext";

async function retry(fn, options = {}) {
    const retries = options.retries ?? 3;
    const errors = [];
    const delayms = options.delay ?? 300;
    const backoffSelection = options.backoff ?? "fixed"
    let currentDelay = delayms;
    const factor = options.factor ?? 2;
    const jitterVal = options.jitter ?? 0;
    const maxAttempts = retries + 1;
    let currentDelaywithJitter = currentDelay;
    const startTime = Date.now();
    const signal = options?.signal ?? null
    function runHooks(hook, payload) {
        try {
            hook?.(payload);
        } catch (error) {

        }
    }

    function throwIfAborted() {
        if (signal?.aborted) {
            throw new DOMException("Aborted", "AbortError");
        }
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        throwIfAborted();
        try {
            const result = await fn();
            const ctx = createContext({ attempt, retries, startTime, error: null })
            runHooks(options.onSuccess, { ...ctx, result });
            return result;
        } catch (error) {
            errors.push(error);

            const ctx = createContext({ attempt, retries, startTime, error })
            const allowretry = options.shouldRetry ? options.shouldRetry(error, ctx) : true;
            if (allowretry != true || attempt === maxAttempts) {
                runHooks(options.onFail, { ...ctx, errors });
                if (attempt === maxAttempts) {
                    throw new RetriError("Maximum Retries Exceeded", attempt, errors);
                }
                throw new RetriError("Error not allowed to retry", attempt, errors);
            }

            runHooks(options.onRetry, { ...ctx })

            if (jitterVal) {
                currentDelaywithJitter = await jitter(currentDelay, jitterVal);
            }

        }

        await delay(currentDelaywithJitter);
        if (backoffSelection === "fixed") {
            currentDelay = await backoff(backoffSelection, delayms)
        }
        else if (backoffSelection === "linear") {
            currentDelay = await backoff(backoffSelection, delayms, attempt + 1)
        }
        else if (backoffSelection === "exponential") {
            // console.log(factor);

            currentDelay = await backoff(backoffSelection, delayms, attempt, factor)
        }
        throwIfAborted();
    }

}

export { retry }