import { RetriError } from "./error";


async function retry(fn, options) {
    const retries = options.retries ? options.retries : 3;
    const errors = [];

    const maxAttempts = retries + 1;


    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log("attempt: ", attempt);

        try {
            const result = await fn();
            return result;
        } catch (error) {
            errors.push(error);
            if (attempt === maxAttempts) {
                throw new RetriError("Maximum Retries Exceeded", attempt, errors);
            }
        }
    }

}

export { retry }