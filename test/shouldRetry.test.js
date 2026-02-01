import { it, expect, vi } from "vitest";
import { retry } from "../src/retry.js";
import { RetriError } from "../src/error.js";

it("does not retry when shouldRetry returns false", async () => {
    const fn = vi.fn(async () => {
        const err = new Error("Bad Request");
        err.status = 400;
        throw err;
    });

    await expect(
        retry(fn, {
            retries: 5,
            shouldRetry: (error) => error.status >= 500
        })
    ).rejects.toBeInstanceOf(RetriError);

    // ❗ only ONE call
    expect(fn).toHaveBeenCalledTimes(1);
});

it("retries when shouldRetry allows retry", async () => {
    let attempts = 0;

    const fn = vi.fn(async () => {
        attempts++;
        const err = new Error("Server Error");
        err.status = attempts < 3 ? 500 : null;

        if (attempts < 3) throw err;
        return "success";
    });

    const result = await retry(fn, {
        retries: 5,
        shouldRetry: (error) => error.status >= 500
    });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
});

it("stops retrying when shouldRetry returns false mid-way", async () => {
    let attempts = 0;

    const fn = vi.fn(async () => {
        attempts++;

        const err = new Error("Error");
        err.status = attempts === 1 ? 500 : 400;

        throw err;
    });

    await expect(
        retry(fn, {
            retries: 5,
            shouldRetry: (error) => error.status >= 500
        })
    ).rejects.toBeInstanceOf(RetriError);

    // ❗ first retry allowed, second blocked
    expect(fn).toHaveBeenCalledTimes(2);
});

it("passes retry context to shouldRetry", async () => {
    const fn = vi.fn(async () => {
        throw new Error("fail");
    });

    const shouldRetry = vi.fn(() => false);

    await expect(
        retry(fn, {
            retries: 3,
            shouldRetry
        })
    ).rejects.toBeInstanceOf(RetriError);

    expect(shouldRetry).toHaveBeenCalledTimes(1);

    const [error, ctx] = shouldRetry.mock.calls[0];

    expect(ctx.attempt).toBe(1);
});
