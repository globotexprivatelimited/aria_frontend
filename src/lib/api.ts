const BASE = process.env.ARIA_API_URL ?? "http://localhost:4000";
const KEY = process.env.ARIA_ADMIN_KEY ?? "";
const HOTEL = process.env.ARIA_HOTEL_ID ?? "demo";

export const hotelId = HOTEL;

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


/** Every console call is made as a signed-in person. No session, no call - the platform key alone must never act on a hotel. */
async function session(): Promise<Record<string, string>> {
  const h = await bearer();
  if (!h.authorization) throw new Error("Not signed in - please log in again.");
  return h;
}

export async function apiGet<T>(path: string): Promise<T> {
  // only append the default hotelId when the caller has not already specified one
  const url = path.includes("hotelId=") ? BASE + path : BASE + path + (path.includes("?") ? "&" : "?") + "hotelId=" + HOTEL;
  const res = await fetch(url, {
    headers: { "x-admin-key": KEY, ...(await session()) },
    cache: "no-store",
  });
  if (!res.ok) throw await apiError(res, path);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "x-admin-key": KEY, "Content-Type": "application/json", ...(await session()) },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw await apiError(res, path);
  return (await res.json()) as T;
}
