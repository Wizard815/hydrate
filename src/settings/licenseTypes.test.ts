import { describe, expect, it } from "vitest";
import { parseJsonResponse, type LicenseInfo } from "./licenseTypes";

describe("parseJsonResponse", () => {
	it("returns the parsed body for valid JSON", async () => {
		const response = new Response(
			JSON.stringify({ tier: "pro", status: "active", is_active: true }),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
		const body = await parseJsonResponse<LicenseInfo>(response);
		expect(body.tier).toBe("pro");
		expect(body.status).toBe("active");
	});

	it("returns an empty object when the body is not JSON", async () => {
		const response = new Response("<html>gateway error</html>", {
			status: 502,
		});
		const body = await parseJsonResponse<LicenseInfo>(response);
		expect(body).toEqual({});
	});
});
