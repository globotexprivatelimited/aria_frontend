"use server";

import { apiPost, apiGet } from "@/lib/api";



export async function createStaff(input: { hotelId: string; departments: string[]; fullName: string; email: string; password: string; phone?: string }) {
  const fullName = input.fullName.trim(), email = input.email.trim();
  if (!input.departments || input.departments.length === 0 || !fullName || !email || !input.password) return { ok: false, message: "Pick at least one department, and fill name, email and password." };
  if (input.password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("/api/admin/staff", {
      hotelId: input.hotelId, departments: input.departments, email, password: input.password, fullName, phone: input.phone,
    });
    if (!res.ok) return { ok: false, message: res.error ?? "Could not create the staff login." };
    return { ok: true, message: fullName + " added to " + input.departments.join(", ") + "." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." };
  }
}


export async function getStaff(hotelId: string): Promise<{ ok: boolean; staff: { id: string; fullName: string; email: string; departments: string[] }[] }> {
  if (!hotelId) return { ok: false, staff: [] };
  try {
    const res = await apiGet<{ ok: boolean; data?: { id: string; fullName: string; email: string; departments: string[] }[] }>("/api/admin/staff?hotelId=" + encodeURIComponent(hotelId));
    if (!res.ok || !res.data) return { ok: false, staff: [] };
    return { ok: true, staff: res.data };
  } catch {
    return { ok: false, staff: [] };
  }
}


export async function resetPassword(hotelId: string, staffId: string, newPassword: string): Promise<{ ok: boolean; message: string }> {
  if (!hotelId || !staffId) return { ok: false, message: "Missing details." };
  if (newPassword.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("/api/admin/staff/reset-password", { hotelId, staffId, newPassword });
    if (!res.ok) return { ok: false, message: res.error ?? "Could not reset password." };
    return { ok: true, message: "Password updated." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." };
  }
}
