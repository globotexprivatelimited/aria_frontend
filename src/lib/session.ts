import { cookies } from "next/headers";

/** What the browser keeps in place of the session token: it only says someone is signed in. The token itself is in an httpOnly cookie. */
export const SESSION_MARKER = "session";

/**
 * The signed-in person's token, read on the server from the httpOnly cookie. A token a page hands in is used only when
 * there is no cookie - a session that began before the cookie existed - and the browser's marker never is.
 */
export async function sessionToken(given?: string | null): Promise<string> {
  try { const c = (await cookies()).get("aria_token")?.value; if (c) return c; } catch { /* outside a request */ }
  return given && given !== SESSION_MARKER ? given : "";
}
