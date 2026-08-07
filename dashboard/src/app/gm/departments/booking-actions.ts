"use client";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type Slot = {
  id: string; itemId: string | null; itemName: string | null;
  label: string; startTime: string; endTime: string | null;
  capacity: number; days: string[]; active: boolean;
};
export type Availability = {
  slotId: string; label: string; startTime: string; endTime: string | null;
  itemId: string | null; itemName: string | null; capacity: number; booked: number; free: number;
};
export type BookingRow = {
  id: string; slotLabel: string; startTime: string; itemName: string | null;
  onDate: string; room: string | null; guestName: string | null; partySize: number; state: string; note: string | null;
};

const tk = () => (typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null);

async function get<T>(path: string): Promise<T | null> {
  const t = tk(); if (!t) return null;
  try {
    const r = await fetch(API + "/api/booking/" + path, { headers: { authorization: "Bearer " + t }, cache: "no-store" });
    const j = await r.json();
    return j?.ok ? (j.data as T) : null;
  } catch { return null; }
}
async function post(path: string, body: unknown) {
  const t = tk(); if (!t) return { ok: false, error: "Not signed in." };
  try {
    const r = await fetch(API + "/api/booking/" + path, { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + t }, body: JSON.stringify(body) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}

export const listSlots = (dept: string) => get<Slot[]>("slots?dept=" + encodeURIComponent(dept));
export const availability = (dept: string, date: string, itemId?: string | null) =>
  get<Availability[]>("slots/availability?dept=" + encodeURIComponent(dept) + "&date=" + date + (itemId ? "&itemId=" + itemId : ""));
export const bookings = (dept: string, date: string) =>
  get<BookingRow[]>("slots/bookings?dept=" + encodeURIComponent(dept) + "&date=" + date);

export const addSlot = (b: { dept: string; itemId?: string | null; label: string; startTime: string; endTime?: string; capacity: number; days: string[] }) => post("slots/add", b);
export const patchSlot = (b: { id: string; capacity?: number; active?: boolean; days?: string[]; label?: string }) => post("slots/update", b);
export const removeSlot = (id: string) => post("slots/remove", { id });
export const book = (b: { slotId: string; onDate: string; roomNumber?: string; guestName?: string; guestPhone?: string; partySize?: number; note?: string }) => post("slots/book", b);
export const cancelBooking = (id: string) => post("slots/cancel", { id });
