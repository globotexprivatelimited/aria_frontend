"use server";
import { apiGet, apiPost } from "@/lib/api";

export type DeptItem = {
  id: string; dept: string; kind: string; name: string; description: string | null;
  price: number | null; stock: number | null; unit: string | null; duration_min: number | null;
  available: boolean; sort_order: number;
};

export async function getDeptItems(hotelId: string, dept: string): Promise<DeptItem[]> {
  if (!hotelId || !dept) return [];
  try { const r = await apiGet<{ ok: boolean; data?: DeptItem[] }>("/api/dept-items?hotelId=" + encodeURIComponent(hotelId) + "&dept=" + encodeURIComponent(dept)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function createDeptItem(hotelId: string, dept: string, item: { kind?: string; name: string; description?: string; price?: number; stock?: number; unit?: string; duration_min?: number }): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/dept-items/create", { hotelId, dept, ...item }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function updateDeptItem(hotelId: string, id: string, fields: { name?: string; description?: string; price?: number; stock?: number; unit?: string; duration_min?: number; available?: boolean }): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/dept-items/update", { hotelId, id, ...fields }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function deleteDeptItem(hotelId: string, id: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/dept-items/delete", { hotelId, id }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}