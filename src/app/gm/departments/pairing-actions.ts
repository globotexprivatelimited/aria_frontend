"use server";
import { apiGet, apiPost } from "@/lib/api";

/** Knowledge base Form 3, kept beside each menu item: what it goes well with (up to two), never suggest, what it contains. */
export type Pairing = { itemId: string; itemName: string; pairsWith: string[]; neverSuggest: boolean; contains: string | null; updatedAt: string; updatedBy: string | null };
type Reply<T> = { ok: boolean; data?: T; error?: string };

export async function getPairings(hotelId: string): Promise<Pairing[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<Reply<Pairing[]>>("/api/menu/pairings?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function savePairing(hotelId: string, p: { itemId: string; itemName: string; pairsWith: string[]; neverSuggest: boolean; contains: string | null }): Promise<{ ok: boolean; data?: Pairing; message?: string }> {
  try { const r = await apiPost<Reply<Pairing>>("/api/menu/pairings", { hotelId, ...p }); return r.ok ? { ok: true, data: r.data } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function removePairing(hotelId: string, itemId: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<Reply<never>>("/api/menu/pairings/delete", { hotelId, itemId }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
