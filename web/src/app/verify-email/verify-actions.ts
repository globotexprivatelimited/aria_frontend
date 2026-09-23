"use server";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export async function confirmEmail(token: string): Promise<{ ok: boolean; hotelName?: string; alreadyDone?: boolean; message?: string }> {
  try {
    const res = await fetch(API + "/api/auth/verify?token=" + encodeURIComponent(token), { cache: "no-store" });
    const j = await res.json();
    if (!j.ok) return { ok: false, message: j.error ?? "This link did not work." };
    return { ok: true, hotelName: j.data?.hotelName, alreadyDone: j.data?.alreadyDone };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." }; }
}
