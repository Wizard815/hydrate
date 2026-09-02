/**
 * Narrow an unknown thrown value to a displayable string.
 *
 * `catch` binds `unknown` under useUnknownInCatchVariables, so every call site
 * that wants `error.message` goes through here instead of an unsafe cast.
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}
	return String(error);
}
