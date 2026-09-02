import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
	it("returns the message of an Error", () => {
		expect(getErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("returns a string thrown directly", () => {
		expect(getErrorMessage("plain string failure")).toBe(
			"plain string failure",
		);
	});

	it("reads .message off an error-shaped object", () => {
		expect(getErrorMessage({ message: "from an object" })).toBe(
			"from an object",
		);
	});

	it("stringifies anything else", () => {
		expect(getErrorMessage(42)).toBe("42");
		expect(getErrorMessage(null)).toBe("null");
	});

	it("never throws on a circular value", () => {
		const circular: Record<string, unknown> = { a: 1 };
		circular.self = circular;
		expect(typeof getErrorMessage(circular)).toBe("string");
	});
});
