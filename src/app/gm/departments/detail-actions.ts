"use server";
import { apiGet } from "@/lib/api";

export type DetailRequest = {
  id: string; room: string | null; detail: string | null; status: string; priority: string;
  claimedBy: string | null; createdAt: string; claimedAt: string | null; resolvedAt: string | null;
  waitingMins: number | null; timeToClaimMins: number | null; timeToResolveMins: number | null;
};
export type StaffStat = { name: string; handledToday: number; avgResponseMins: number | null; avgResolveMins: number | null };
export type DeptDetail = {
  requests: DetailRequest[]; staff: StaffStat[];
  counts: { open: number; inProgress: number; resolvedToday: number };
};

export async function getDepartmentDetail(hotelId: string, dept: string): Promise<DeptDetail | null> {
  if (!hotelId || !dept) return null;
  try {
    const r = await apiGet<{ ok: boolean; data?: DeptDetail }>("/api/requests/department-detail?hotelId=" + encodeURIComponent(hotelId) + "&dept=" + encodeURIComponent(dept));
    return r.ok && r.data ? r.data : null;
  } catch { return null; }
}
