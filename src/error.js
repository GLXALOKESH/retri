export class RetriError extends Error {

    constructor(message, attempt, errors) {
        super(message);
        this.name = 'RetriError';
        this.attempt = attempt;
        this.errors = errors;
        this.lastError = errors[errors.length - 1];
    }
}

export class AbortError extends Error {

    constructor(message, attempt, errors) {
        super(message);
        this.name = 'AbortError';
        this.attempt = attempt;
        this.errors = errors;
        this.lastError = errors[errors.length - 1];
    }
}