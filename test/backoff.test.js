import { describe, it, expect, vi } from "vitest";
import { retry } from "../src/retry.js";
import { delay } from "../src/delay.js";
import { backoff } from "../src/backoff.js";
import { jitter } from "../src/jitter.js";


it("retries until the function succeeds with backoff fixed", async () => {
    let attempts = 0;
    let result

    const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 4) {
            throw new Error("Fail");
        }
        return "success";
    });

    try {
        result = await retry(fn, { retries: 3, delay: 500, backoff: "fixed" });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }


    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});

it("retries until the function succeeds with backoff linear", async () => {
    let attempts = 0;
    let result

    const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 4) {
            throw new Error("Fail");
        }
        return "success";
    });

    try {
        result = await retry(fn, { retries: 3, delay: 500, backoff: "linear" });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }


    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});

it("retries until the function succeeds with backoff exponential with factor", async () => {
    let attempts = 0;
    let result

    const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 4) {
            throw new Error("Fail");
        }
        return "success";
    });

    try {
        result = await retry(fn, { retries: 3, delay: 100, backoff: "exponential", factor: 3 });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }




    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});


it("retries until the function succeeds with backoff exponential without factor", async () => {
    let attempts = 0;
    let result

    const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 4) {
            throw new Error("Fail");
        }
        return "success";
    });

    try {
        result = await retry(fn, { retries: 3, delay: 100, backoff: "exponential" });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }




    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});

it("retries until the function succeeds with backoff exponential with factor and jitter", async () => {
    let attempts = 0;
    let result

    const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 4) {
            throw new Error("Fail");
        }
        return "success";
    });

    try {
        result = await retry(fn, { retries: 3, delay: 100, backoff: "exponential", factor: 3, jitter: 0.2 });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }




    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});
