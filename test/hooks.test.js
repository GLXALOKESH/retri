import { describe, it, expect, vi } from "vitest";
import { retry } from "../src/retry.js";

describe("retry hooks", () => {
    it("should call onSuccess hook with correct context when successful", async () => {
        const fn = vi.fn().mockResolvedValue("success");
        const onSuccess = vi.fn();

        await retry(fn, { retries: 3, onSuccess });

        expect(onSuccess).toHaveBeenCalledTimes(1);

        const callArgs = onSuccess.mock.calls[0][0];

        expect(callArgs.result).toBe("success");
        expect(callArgs.attempt).toBe(1);
        expect(callArgs.retriesLeft).toBe(3);
    });


    it("should call onRetry hook on intermediate failure", async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error("fail 1"))
            .mockResolvedValue("success");

        const onRetry = vi.fn();

        await retry(fn, { retries: 3, onRetry });

        expect(onRetry).toHaveBeenCalledTimes(1);

        const callArgs = onRetry.mock.calls[0][0];
        expect(callArgs.attempt).toBe(1);
        expect(callArgs.error.message).toBe("fail 1");
    });


    it("should call onFail hook once on final failure", async () => {
        const fn = vi.fn().mockRejectedValue(new Error("fail always"));
        const onFail = vi.fn();

        await expect(
            retry(fn, { retries: 2, onFail })
        ).rejects.toThrow();

        expect(onFail).toHaveBeenCalledTimes(1);

        const callArgs = onFail.mock.calls[0][0];
        expect(callArgs.attempt).toBe(3); // retries + 1
    });

});
