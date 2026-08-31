"use server";
import { apiGet } from "@/lib/api";

export type GmReq = {
  id: string; roomNumber: string | null; requestDetail: string | null; department: string | null;
  status: string; priority: string; claimedBy: string | null; createdAt: string;
};

export async function getAllOpen(hotelId: string): Promise<GmReq[]> {
  if (!hotelId) return [];
  try {
    const r = await apiGet<{ ok: boolean; data?: GmReq[] }>("/api/requests/hotel-active?hotelId=" + encodeURIComponent(hotelId));
    return r.ok && r.data ? r.data : [];
  } catch { return []; }
}
