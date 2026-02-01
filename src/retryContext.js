
function createContext({ attempt, retry, startTime, error }) {
    return {
        attempt,
        retriesLeft: retry - (attempt - 1),
        timeElapsed: Date.now() - startTime,
        error
    }

}

export { createContext }