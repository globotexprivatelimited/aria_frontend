"use server";

import { apiGet, apiPost, hotelId } from "@/lib/api";

export async function exportGuest(_prev: unknown, formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { ok: false, message: "Phone is required.", data: null };
  try {
    const data = await apiGet<Record<string, unknown>>("/api/privacy/export?phone=" + encodeURIComponent(phone));
    return { ok: true, message: "Export ready.", data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Export failed.", data: null };
  }
}

export async function eraseGuest(_prev: unknown, formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { ok: false, message: "Phone is required." };
  try {
    const res = await apiPost<{ recordsWiped: number }>("/api/privacy/erase", { hotelId, phone, requestedBy: "console" });
    return { ok: true, message: "Erased. " + res.recordsWiped + " records affected." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erasure failed." };
  }
}
