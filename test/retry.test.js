import { describe, it, expect, vi } from "vitest";
import { retry } from "../src/retry.js";
import { delay } from "../src/delay.js";
import { jitter } from "../src/jitter.js";

it("retries until the function succeeds", async () => {
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
        result = await retry(fn, { retries: 3 });
    } catch (error) {
        error.errors.forEach(e => console.log(e.message));
    }


    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});


it("Retries and prints all the error masseges", async () => {
    let attempt = 0;
    let result

    const fn = vi.fn(async () => {
        attempt++
        if (attempt < 5) {
            throw new Error(`This is error ${attempt}`)
        }
        return "success"
    })

    try {
        result = await retry(fn, { retries: 3 })
    } catch (error) {
        error.errors.forEach(element => {
            console.log(element.message);
        });
    }

    expect(fn).toHaveBeenCalledTimes(4);
})

it("retries until the function succeeds with delay", async () => {
    let attempt = 0;
    let result

    const fn = vi.fn(async () => {
        attempt++
        if (attempt < 4) {
            throw new Error(`This is error ${attempt}`)
        }
        return "success"
    })

    try {
        result = await retry(fn, { retries: 3, delay: 500 });
    } catch (error) {
        error.errors.forEach(e => console.log(e.message));
    }


    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
})

it("retries until the function succeeds with delay and jitter ", async () => {
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
        result = await retry(fn, { retries: 3, delay: 300, jitter: 0.1 });
    } catch (error) {
        error?.errors?.forEach(e => console.log(e.message));
    }


    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(4);
});
