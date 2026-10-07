"use server";
import { apiGet, apiPost } from "@/lib/api";

export type FacilityStatus = "open" | "closed" | "limited";
export type Facility = {
  id: string; name: string; status: FacilityStatus; closedUntil: string | null; closureNote: string | null;
  openTime: string | null; closeTime: string | null; weekendOpenTime: string | null; weekendCloseTime: string | null;
  location: string | null; price: string | null; notes: string | null; active: boolean; sortOrder: number; updatedAt: string; updatedBy: string | null;
};
export type FacilityDraft = Omit<Facility, "id" | "updatedAt" | "updatedBy" | "active" | "sortOrder">;
type Reply<T> = { ok: boolean; data?: T; error?: string };
type Result = { ok: boolean; message?: string };
const fail = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : "failed" });

export async function getFacilities(hotelId: string): Promise<Facility[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<Reply<Facility[]>>("/api/facilities?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function addFacility(hotelId: string, f: FacilityDraft): Promise<Result> {
  try { const r = await apiPost<Reply<Facility>>("/api/facilities", { hotelId, ...f }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function updateFacility(hotelId: string, id: string, patch: Partial<FacilityDraft> & { active?: boolean }): Promise<Result> {
  try { const r = await apiPost<Reply<Facility>>("/api/facilities/update", { hotelId, id, ...patch }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function deleteFacility(hotelId: string, id: string): Promise<Result> {
  try { const r = await apiPost<Reply<never>>("/api/facilities/delete", { hotelId, id }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
