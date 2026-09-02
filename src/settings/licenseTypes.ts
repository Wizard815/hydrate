/**
 * Shapes returned by the Hydrate backend's licensing endpoints.
 *
 * Every field is optional: the backend has shipped several revisions and
 * older deployments omit `status` and `next_reset`. Treat absence as
 * "unknown", never as an error.
 */
export interface LicenseInfo {
	tier?: string;
	status?: "active" | "expired" | "inactive";
	is_active?: boolean;
	expires_at?: string;
}

export interface RegistrationQuota {
	registration_count?: number;
	max_reregistrations?: number;
	next_reset?: string;
}

export interface ApiErrorBody {
	detail?: string;
	message?: string;
}

/**
 * Read a JSON body without letting a non-JSON response throw.
 *
 * A 502 from a proxy returns HTML, and `response.json()` rejects on it. The
 * settings tab wants to render "something went wrong", not crash.
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
	try {
		return (await response.json()) as T;
	} catch {
		return {} as T;
	}
}
