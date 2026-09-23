"use server";
import { apiGet } from "@/lib/api";

export type RevSummary = { total: number; today: number; week: number; month: number; transactions: number; avgOrder: number };
export type RevChannel = { channel: string; value: number; color: string };
export type RevPoint = { date: string; label: string; revenue: number };
export type RevItem = { name: string; qty: number; revenue: number };

export async function getRevenueSummary(hotelId: string): Promise<RevSummary> {
  const zero = { total: 0, today: 0, week: 0, month: 0, transactions: 0, avgOrder: 0 };
  if (!hotelId) return zero;
  try { const r = await apiGet<{ ok: boolean; data?: RevSummary }>("/api/revenue/summary?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : zero; } catch { return zero; }
}
export async function getByChannel(hotelId: string): Promise<RevChannel[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevChannel[] }>("/api/revenue/by-channel?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function getTimeseries(hotelId: string, days = 30): Promise<RevPoint[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevPoint[] }>("/api/revenue/timeseries?hotelId=" + encodeURIComponent(hotelId) + "&days=" + days); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function getTopItems(hotelId: string): Promise<RevItem[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevItem[] }>("/api/revenue/top-items?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}

export type RevDept = { dept: string; revenue: number; orders: number };
export type RevHour = { hour: number; label: string; revenue: number };
export type RevRoom = { room: string; revenue: number; orders: number };

export async function getByDept(hotelId: string): Promise<RevDept[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevDept[] }>("/api/revenue/by-dept?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function getByHour(hotelId: string): Promise<RevHour[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevHour[] }>("/api/revenue/by-hour?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function getByRoom(hotelId: string): Promise<RevRoom[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: RevRoom[] }>("/api/revenue/by-room?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}