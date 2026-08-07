"use server";
import { apiGet } from "@/lib/api";

export type DeptPresence = { dept: string; online: boolean; staff: { name: string; lastSeen: string | null }[] };

export async function getDepartmentPresence(hotelId: string): Promise<DeptPresence[]> {
  if (!hotelId) return [];
  try {
    const r = await apiGet<{ ok: boolean; data?: DeptPresence[] }>("/api/presence/departments?hotelId=" + encodeURIComponent(hotelId));
    return r.ok && r.data ? r.data : [];
  } catch { return []; }
}
