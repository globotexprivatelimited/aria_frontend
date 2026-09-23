"use server";
import { apiPost, hotelId as defaultHotelId } from "@/lib/api";

export async function setStaffDeptAccess(args: { staffId: string; dept: string; active: boolean; hotelId?: string }): Promise<{ ok: boolean; message?: string }> {
  const { staffId, dept, active } = args;
  const hid = args.hotelId || defaultHotelId;
  if (!staffId || !dept) return { ok: false, message: "missing staffId/dept in action" };
  try {
    const r = await apiPost<{ ok: boolean; error?: string }>("/api/staff-access/set", { hotelId: hid, staffId, dept, active });
    return r.ok ? { ok: true } : { ok: false, message: r.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
