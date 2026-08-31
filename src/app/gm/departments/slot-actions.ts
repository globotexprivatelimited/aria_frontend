"use server";

import { apiGet, apiPost } from "@/lib/api";

export type Slot = { id: string; label: string; start_time: string; capacity: number; active: boolean; sort_order: number };

export async function getSlots(hotelId: string, dept: string): Promise<{ ok: boolean; slots: Slot[] }> {
  if (!hotelId) return { ok: false, slots: [] };
  try {
    const res = await apiGet<{ ok: boolean; data?: Slot[] }>("/api/slots?hotelId=" + encodeURIComponent(hotelId) + "&dept=" + encodeURIComponent(dept));
    if (!res.ok || !res.data) return { ok: false, slots: [] };
    return { ok: true, slots: res.data };
  } catch { return { ok: false, slots: [] }; }
}
export async function addSlot(hotelId: string, dept: string, slot: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try { const res = await apiPost<{ ok: boolean; error?: string }>("/api/slots", { hotelId, dept, slot }); return res.ok ? { ok: true } : { ok: false, message: res.error }; }
  catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not add." }; }
}
export async function patchSlot(hotelId: string, id: string, fields: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try { const res = await apiPost<{ ok: boolean; error?: string }>("/api/slots/patch", { hotelId, id, fields }); return res.ok ? { ok: true } : { ok: false, message: res.error }; }
  catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not update." }; }
}
export async function deleteSlot(hotelId: string, id: string): Promise<{ ok: boolean; message?: string }> {
  try { const res = await apiPost<{ ok: boolean; error?: string }>("/api/slots/delete", { hotelId, id }); return res.ok ? { ok: true } : { ok: false, message: res.error }; }
  catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not delete." }; }
}