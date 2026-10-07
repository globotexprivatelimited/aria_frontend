"use server";
import { apiGet, apiPost } from "@/lib/api";

export type Hours = { quietFrom: string; quietTo: string; nudgeFrom: string; nudgeTo: string; offerGapHours: number; offersPerDay: number; updatedAt: string | null; updatedBy: string | null };
export type DeptHours = { id: string; dept: string; label: string; openTime: string | null; closeTime: string | null; weekendOpenTime: string | null; weekendCloseTime: string | null; closedDays: string[]; outOfHours: string | null; active: boolean; updatedAt: string; updatedBy: string | null };
export type DeptHoursDraft = { dept: string; openTime: string; closeTime: string; weekendOpenTime: string; weekendCloseTime: string; closedDays: string[]; outOfHours: string };
type Reply<T> = { ok: boolean; data?: T; error?: string; departments?: { dept: string; label: string }[] };
type Result = { ok: boolean; message?: string };
const fail = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : "failed" });

export async function getHours(hotelId: string): Promise<Hours | null> {
  if (!hotelId) return null;
  try { const r = await apiGet<Reply<Hours>>("/api/settings/hours?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : null; } catch { return null; }
}
export async function saveHours(hotelId: string, h: Partial<Hours>): Promise<Result & { data?: Hours }> {
  try { const r = await apiPost<Reply<Hours>>("/api/settings/hours", { hotelId, ...h }); return r.ok ? { ok: true, data: r.data } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function getDeptHours(hotelId: string): Promise<{ rows: DeptHours[]; departments: { dept: string; label: string }[] }> {
  if (!hotelId) return { rows: [], departments: [] };
  try { const r = await apiGet<Reply<DeptHours[]>>("/api/settings/dept-hours?hotelId=" + encodeURIComponent(hotelId)); return { rows: r.ok && r.data ? r.data : [], departments: r.departments ?? [] }; } catch { return { rows: [], departments: [] }; }
}
export async function saveDeptHours(hotelId: string, d: DeptHoursDraft): Promise<Result> {
  try {
    const r = await apiPost<Reply<DeptHours>>("/api/settings/dept-hours", { hotelId, dept: d.dept, openTime: d.openTime || null, closeTime: d.closeTime || null, weekendOpenTime: d.weekendOpenTime || null, weekendCloseTime: d.weekendCloseTime || null, closedDays: d.closedDays, outOfHours: d.outOfHours || null });
    return r.ok ? { ok: true } : { ok: false, message: r.error };
  } catch (e) { return fail(e); }
}
export async function clearDeptHours(hotelId: string, dept: string): Promise<Result> {
  try { const r = await apiPost<Reply<never>>("/api/settings/dept-hours/delete", { hotelId, dept }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
