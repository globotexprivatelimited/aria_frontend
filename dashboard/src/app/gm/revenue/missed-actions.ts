"use server";
import { apiGet, apiPost } from "@/lib/api";

export type MissedInstance = { room: string | null; when: string; detail: string; source: string; reason: string | null; value: number | null };
export type MissedGroup = {
  item: string; department: string; timesAsked: number;
  estimatedLoss: number | null; estimateBasis: string | null; instances: MissedInstance[];
};
export type MissedData = { groups: MissedGroup[]; totalLoss: number; totalMissed: number; unpriced: number };

export async function getMissedDemand(hotelId: string, days = 30): Promise<MissedData | null> {
  if (!hotelId) return null;
  try {
    const r = await apiGet<{ ok: boolean; data?: MissedData }>("/api/revenue/missed?hotelId=" + encodeURIComponent(hotelId) + "&days=" + days);
    return r.ok && r.data ? r.data : null;
  } catch { return null; }
}

export async function markAddressed(args: { hotelId: string; department: string; item: string }): Promise<{ ok: boolean }> {
  try {
    const r = await apiPost<{ ok: boolean }>("/api/revenue/missed/addressed", args);
    return { ok: !!r.ok };
  } catch { return { ok: false }; }
}
