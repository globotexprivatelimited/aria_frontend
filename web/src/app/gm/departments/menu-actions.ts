"use server";

import { apiGet, apiPost } from "@/lib/api";

export type MenuItem = {
  id: string; name: string; category: string | null; kind: string; price: number; stock: number;
  available: boolean; sort_order: number; image_url: string | null; diet: string | null; spice: string | null;
  prep_mins: number; available_from: string | null; available_to: string | null; low_stock_at: number;
  description: string | null; allergens: string | null; is_jain: boolean; is_halal: boolean; gluten_free: boolean;
  is_alcoholic: boolean; age_restricted: boolean; serving_size: string | null; calories: number | null;
  portion: string | null; tax_pct: number; is_signature: boolean; is_bestseller: boolean;
};

export async function getMenu(hotelId: string, dept: string): Promise<{ ok: boolean; items: MenuItem[] }> {
  if (!hotelId) return { ok: false, items: [] };
  try {
    const res = await apiGet<{ ok: boolean; data?: MenuItem[] }>("/api/menu?hotelId=" + encodeURIComponent(hotelId) + "&dept=" + encodeURIComponent(dept));
    if (!res.ok || !res.data) return { ok: false, items: [] };
    return { ok: true, items: res.data };
  } catch { return { ok: false, items: [] }; }
}

export async function addMenuItem(hotelId: string, dept: string, item: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("/api/menu", { hotelId, dept, item });
    return res.ok ? { ok: true } : { ok: false, message: res.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not add." }; }
}

export async function patchMenuItem(hotelId: string, id: string, fields: Record<string, unknown>): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("/api/menu/patch", { hotelId, id, fields });
    return res.ok ? { ok: true } : { ok: false, message: res.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not update." }; }
}

export async function deleteMenuItem(hotelId: string, id: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("/api/menu/delete", { hotelId, id });
    return res.ok ? { ok: true } : { ok: false, message: res.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not delete." }; }
}

export async function setAvailability(hotelId: string, id: string, available: boolean): Promise<{ ok: boolean; message?: string }> {
  return patchMenuItem(hotelId, id, { available });
}