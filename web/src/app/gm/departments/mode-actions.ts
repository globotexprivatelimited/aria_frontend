"use server";
import { apiGet, apiPost } from "@/lib/api";

export type DeptMode = "accept_decline" | "auto" | "maintenance";
export type DeptModeRow = { dept: string; mode: DeptMode };

export async function getDeptModes(hotelId: string): Promise<DeptModeRow[]> {
  if (!hotelId) return [];
  try {
    const r = await apiGet<{ ok: boolean; data?: DeptModeRow[] }>("/api/dept-config?hotelId=" + encodeURIComponent(hotelId));
    return r.ok && r.data ? r.data : [];
  } catch { return []; }
}

export async function setDeptMode(args: { hotelId: string; dept: string; mode: DeptMode }): Promise<{ ok: boolean; message?: string }> {
  try {
    const r = await apiPost<{ ok: boolean; error?: string }>("/api/dept-config/set", args);
    return r.ok ? { ok: true } : { ok: false, message: r.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
