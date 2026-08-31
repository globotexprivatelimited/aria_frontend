const BASE = process.env.ARIA_API_URL ?? "http://localhost:4000";
const KEY = process.env.ARIA_ADMIN_KEY ?? "";
const HOTEL = process.env.ARIA_HOTEL_ID ?? "demo";

export const hotelId = HOTEL;

export async function apiGet<T>(path: string): Promise<T> {
  // only append the default hotelId when the caller has not already specified one
  const url = path.includes("hotelId=") ? BASE + path : BASE + path + (path.includes("?") ? "&" : "?") + "hotelId=" + HOTEL;
  const res = await fetch(url, {
    headers: { "x-admin-key": KEY },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("API " + res.status + " on " + path);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "x-admin-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("API " + res.status + " on " + path);
  return (await res.json()) as T;
}
