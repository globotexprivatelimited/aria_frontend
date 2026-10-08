const BASE = process.env.ARIA_API_URL ?? "http://localhost:4000";
const HOTEL = process.env.ARIA_HOTEL_ID ?? "demo";

export const hotelId = HOTEL;
export const apiBase = BASE;

/*
 * The console holds no platform key: every call is made as the signed-in person, and the API holds them to their own
 * hotel and their role (item 11). ARIA_ADMIN_KEY is no longer read anywhere in the console and can be removed from Vercel.
 */

/** The reason the server gave when it refuses a call ("Floor 1 has occupied rooms..."), not a bare status code. */
async function apiError(res: Response, path: string): Promise<Error> {
  try {
    const j = await res.json();
    const reason = typeof j?.error === "string" ? j.error : typeof j?.message === "string" ? j.message : "";
    if (reason) return new Error(reason);
  } catch { /* the body was not JSON */ }
  return new Error("API " + res.status + " on " + path);
}

/** The signed-in person's token from the cookie set at login - the API verifies it and takes the hotel from it, not from the browser. */
async function bearer(): Promise<Record<string, string>> {
  try {
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get("aria_token")?.value;
    return token ? { authorization: "Bearer " + token } : {};
  } catch { return {}; }
}

/**
 * The hotel in the signed-in person's own token, so a call that names no hotel asks for theirs and not the console's
 * default. Founders have no single hotel and keep the default. This only picks what to ask for - the API verifies the
 * token and refuses any other hotel.
 */
async function ownHotel(): Promise<string> {
  try {
    const { cookies } = await import("next/headers");
    const part = ((await cookies()).get("aria_token")?.value ?? "").split(".")[1];
    if (!part) return "";
    const claims = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as { role?: unknown; hotelId?: unknown };
    return claims.role !== "founder" && typeof claims.hotelId === "string" ? claims.hotelId : "";
  } catch { return ""; }
}


/** Every console call is made as a signed-in person. No session, no call - the platform key alone must never act on a hotel. */
async function session(path: string): Promise<Record<string, string>> {
  const h = await bearer();
  // logging in, accepting an invite, confirming an email: no session exists yet, so these stay open
  const open = /^\/api\/(auth|public|register|invite|confirm)\b/.test(path);
  if (!h.authorization && !open) throw new Error("Not signed in - please log in again.");
  return h;
}

export async function apiGet<T>(path: string): Promise<T> {
  // a call that names no hotel asks for the signed-in person's own; founders, who have no single hotel, get the console's default
  const url = path.includes("hotelId=") ? BASE + path : BASE + path + (path.includes("?") ? "&" : "?") + "hotelId=" + encodeURIComponent((await ownHotel()) || HOTEL);
  const res = await fetch(url, {
    headers: { ...(await session(path)) },
    cache: "no-store",
  });
  if (!res.ok) throw await apiError(res, path);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await session(path)) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw await apiError(res, path);
  return (await res.json()) as T;
}
