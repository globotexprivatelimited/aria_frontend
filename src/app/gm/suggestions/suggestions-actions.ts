"use server";
import { apiGet } from "@/lib/api";

export type OfferRow = { id: string; guestPhone: string; itemName: string; dept: string; price: number; reason: string | null; basis: string | null; status: "proposed" | "offered" | "skipped" | "accepted" | "declined"; proposedAt: string; offeredAt: string | null; resolvedAt: string | null; revenue: number };
export type OfferReport = { days: number; proposed: number; offered: number; accepted: number; declined: number; skipped: number; acceptanceRate: number; revenue: number; byItem: { itemName: string; offered: number; accepted: number; revenue: number }[]; recent: OfferRow[] };

export async function getOfferReport(hotelId: string, days: number): Promise<OfferReport | null> {
  if (!hotelId) return null;
  try { const r = await apiGet<{ ok: boolean; data?: OfferReport }>("/api/revenue/offers?hotelId=" + encodeURIComponent(hotelId) + "&days=" + encodeURIComponent(String(days))); return r.ok && r.data ? r.data : null; } catch { return null; }
}
