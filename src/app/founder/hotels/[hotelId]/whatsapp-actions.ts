/** Self-serve WhatsApp setup for a hotel - the founder's session token goes straight to the API, as the other founder actions do. */
const API = "/api/aria"; // the console route that adds the session token on the server - src/app/api/aria

export type PhoneInfo = { phoneNumberId: string; number: string; verifiedName: string; quality: string; codeVerification: string; nameStatus: string; platform: string };
export type HotelWhatsApp = { hotelId: string; connected: boolean; phoneNumberId: string | null; wabaId: string | null; number: string | null; live: PhoneInfo | null; liveError: string | null; platformDefault: boolean };
type Reply = { ok: boolean; data?: HotelWhatsApp; error?: string; note?: string; subscribed?: boolean | null };
const headers = (token: string) => ({ authorization: "Bearer " + token, "Content-Type": "application/json" });
const path = (hotelId: string) => API + "/api/founder/hotels/" + encodeURIComponent(hotelId) + "/whatsapp";

export async function getWhatsApp(token: string, hotelId: string): Promise<HotelWhatsApp | null> {
  try { const r = await fetch(path(hotelId), { headers: headers(token), cache: "no-store" }); const j = (await r.json()) as Reply; return j.ok && j.data ? j.data : null; } catch { return null; }
}
export async function connectWhatsApp(token: string, hotelId: string, phoneNumberId: string, wabaId: string): Promise<{ ok: boolean; message?: string; note?: string; data?: HotelWhatsApp }> {
  try {
    const r = await fetch(path(hotelId), { method: "POST", headers: headers(token), body: JSON.stringify({ phoneNumberId, wabaId: wabaId || null }), cache: "no-store" });
    const j = (await r.json()) as Reply;
    return j.ok ? { ok: true, note: j.note, data: j.data } : { ok: false, message: j.error ?? "API " + r.status };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function disconnectWhatsApp(token: string, hotelId: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await fetch(path(hotelId) + "/disconnect", { method: "POST", headers: headers(token), body: "{}", cache: "no-store" }); const j = (await r.json()) as Reply; return j.ok ? { ok: true } : { ok: false, message: j.error ?? "API " + r.status }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
