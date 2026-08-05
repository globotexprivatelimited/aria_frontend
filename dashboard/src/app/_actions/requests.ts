"use server";

import { apiGet } from "@/lib/api";

export type Req = {
  id: string; roomNumber: string | null; requestDetail: string; department: string;
  priority: string; status: string; createdAt: string; claimedBy?: string | null;
};

function deptsParam(depts: string[]): string { return depts.join(","); }

export async function getActiveRequests(hotelId: string, depts: string[]): Promise<Req[]> {
  if (!hotelId || depts.length === 0) return [];
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/active?hotelId=" + encodeURIComponent(hotelId) + "&depts=" + encodeURIComponent(deptsParam(depts)));
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}
export async function getHistory(hotelId: string, depts: string[]): Promise<Req[]> {
  if (!hotelId || depts.length === 0) return [];
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/history?hotelId=" + encodeURIComponent(hotelId) + "&depts=" + encodeURIComponent(deptsParam(depts)));
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}
export async function getAnalytics(hotelId: string, depts: string[], days = 7): Promise<Req[]> {
  if (!hotelId || depts.length === 0) return [];
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/analytics?hotelId=" + encodeURIComponent(hotelId) + "&depts=" + encodeURIComponent(deptsParam(depts)) + "&days=" + days);
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}
export async function getHotelActive(hotelId: string): Promise<Req[]> {
  if (!hotelId) return [];
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/hotel-active?hotelId=" + encodeURIComponent(hotelId));
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}
export async function getAllActive(): Promise<Req[]> {
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/all-active");
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}
export async function getAllSince(days = 30): Promise<Req[]> {
  try {
    const res = await apiGet<{ ok: boolean; data?: Req[] }>("/api/requests/all-since?days=" + days);
    return res.ok && res.data ? res.data : [];
  } catch { return []; }
}