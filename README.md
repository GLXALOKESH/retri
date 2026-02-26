# retri
![npm](https://img.shields.io/npm/v/retri)
![license](https://img.shields.io/npm/l/retri)
![issues](https://img.shields.io/github/issues/GLXALOKESH/retri)

A lightweight, configurable retry utility for async JavaScript. Features built-in support for backoff strategies, jitter, lifecycle hooks, and abort signals.

## Features

- **Configurable retries**: Set max attempts, delay, and custom retry logic.
- **Backoff strategies**: Built-in support for `fixed`, `linear`, and `exponential` backoff.
- **Jitter**: Add randomness to delays to prevent thundering herd problems.
- **Lifecycle Hooks**: Track execution using `onSuccess`, `onFail`, and `onRetry` callbacks.
- **Abort controller support**: Cancel pending retries seamlessly using an `AbortSignal`.
- **Custom retry logic**: Determine dynamically whether an error is retryable using `shouldRetry`.

## Installation

```bash
npm install retri
```

## Usage

### Basic Usage

```javascript
import { retry } from 'retri';

async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
}

// Retries up to 3 times (4 attempts total) with a fixed delay of 300ms
const data = await retry(fetchData);
```

### Advanced Usage with Options

```javascript
import { retry } from 'retri';

const abortController = new AbortController();

const options = {
    retries: 5,                  // Number of retry attempts (default: 3)
    delay: 500,                  // Initial delay in ms (default: 300)
    backoff: 'exponential',      // Backoff strategy: 'fixed', 'linear', or 'exponential' (default: 'fixed')
    factor: 2,                   // Multiplier for exponential backoff (default: 2)
    jitter: 0.2,                 // Jitter fraction (e.g., 0.2 means +/- 20% randomness)
    signal: abortController.signal, // Pass an AbortSignal to cancel early

    // Only retry on specific errors
    shouldRetry: (error, ctx) => {
        if (error.message.includes('Fatal')) return false; // Stop retrying
        return true;
    },

    // Lifecycle hooks
    onRetry: (ctx) => console.log(`Retrying... attempt ${ctx.attempt}. Errors left: ${ctx.retriesLeft}`),
    onSuccess: (ctx) => console.log(`Success on attempt ${ctx.attempt}! Time elapsed: ${ctx.timeElapsed}ms`),
    onFail: (ctx) => console.error(`Failed after ${ctx.attempt} attempts.`)
};

try {
    const result = await retry(fetchData, options);
} catch (error) {
    console.error('Operation failed:', error);
}
```

## API Reference

### `retry(fn, options?)`

Executes the async function `fn` and automatically retries it upon failure according to the provided `options`.

#### Arguments

- `fn` *(Function)*: An asynchronous function that returns a Promise.
- `options` *(Object)*: Configuration options (optional).

#### Options Available

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `retries` | `number` | `3` | Maximum number of **retries** (total attempts will be `retries + 1`). |
| `delay` | `number` | `300` | Initial delay between attempts, in milliseconds. |
| `backoff` | `string` | `'fixed'` | Strategy for calculating delay: `'fixed'`, `'linear'`, or `'exponential'`. |
| `factor` | `number` | `2` | Multiplier used when `backoff` is `'exponential'`. |
| `jitter` | `number` | `0` | Fraction (`0` to `1`) of jitter to apply to the delay. `0.2` adds ±20% randomness. |
| `signal` | `AbortSignal` | `null` | Used to abort the retry process entirely. Throws a `DOMException` error. |
| `shouldRetry` | `Function`| `() => true`| Predicate function `(error, context)` returning a boolean. If `false`, retries are aborted. |
| `onSuccess` | `Function`| `-` | Hook executed when `fn` completes successfully. |
| `onRetry`   | `Function`| `-` | Hook executed right before a retry wait period begins. |
| `onFail`    | `Function`| `-` | Hook executed when all retries are exhausted or `shouldRetry` returns false. |


### Context Object (`ctx`)

Lifecycle hooks (`onSuccess`, `onRetry`, `onFail`) and the `shouldRetry` predicate receive a context object with useful properties:

- `ctx.attempt`: The current attempt number (starts at 1).
- `ctx.retriesLeft`: Number of remaining allowed retries.
- `ctx.timeElapsed`: Milliseconds elapsed since the primary execution started.
- `ctx.error`: The most recent error encountered (is `null` in `onSuccess`).
- `ctx.result`: The returned result (only available in `onSuccess`).
- `ctx.errors`: An array of all errors encountered so far (available in `onFail`).

### Errors

When exceptions bubble out of the `retry` utility, they might be custom Error classes depending on the reason:

- **`RetriError`**: Thrown when maximum retries are exceeded or if `shouldRetry` returns false. Contains properties `.attempt`, `.errors` (array of all caught errors), and `.lastError`.
- **`DOMException`**: Standard DOMException with name `"AbortError"` is thrown when the provided `AbortSignal` is aborted.
## Contributing 

retri is an **open-source project**, and contributions are welcome.

- Found a bug? → Open an issue
- Have a feature idea? → Start a discussion
- Want to improve code or docs? → Open a pull request

GitHub Repository:  
👉 **https://github.com/GLXALOKESH/retri**

The issue tracker is open to everyone — no contribution is too small.
## Stability & Versioning

retri follows semantic versioning:

- **PATCH**: Bug fixes
- **MINOR**: New features (may introduce new options)
- **MAJOR**: Breaking changes (will be clearly documented)

Breaking changes will be avoided where possible and clearly announced.
## License

MIT