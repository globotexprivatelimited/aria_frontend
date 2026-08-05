"use server";
import { apiGet, apiPost } from "@/lib/api";

export type Room = {
  id: string; room_number: string; room_type: string; floor: number; status: string;
  guest_name: string | null; guest_phone: string | null; party_size: number | null;
  check_in: string | null; check_out: string | null; notes: string | null;
};
export type RoomStats = { total: number; available: number; occupied: number; cleaning: number; occupancyPct: number };

export async function getRooms(hotelId: string): Promise<Room[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<{ ok: boolean; data?: Room[] }>("/api/rooms?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function getRoomStats(hotelId: string): Promise<RoomStats> {
  const z = { total: 0, available: 0, occupied: 0, cleaning: 0, occupancyPct: 0 };
  if (!hotelId) return z;
  try { const r = await apiGet<{ ok: boolean; data?: RoomStats }>("/api/rooms/stats?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : z; } catch { return z; }
}
export async function checkInRoom(hotelId: string, roomNumber: string, guestName: string, guestPhone: string, partySize: number, checkOut: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/rooms/checkin", { hotelId, roomNumber, guestName, guestPhone, partySize, checkOut }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function checkOutRoom(hotelId: string, roomNumber: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/rooms/checkout", { hotelId, roomNumber }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}
export async function markRoomClean(hotelId: string, roomNumber: string): Promise<{ ok: boolean; message?: string }> {
  try { const r = await apiPost<{ ok: boolean; error?: string }>("/api/rooms/clean", { hotelId, roomNumber }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}

export async function setupRooms(hotelId: string, floors: { floor: number; count: number; type: string; prefix: string }[]): Promise<{ ok: boolean; created?: number; message?: string }> {
  try {
    const r = await apiPost<{ ok: boolean; data?: { created: number }; error?: string }>("/api/rooms/setup", { hotelId, floors });
    return r.ok ? { ok: true, created: r.data?.created } : { ok: false, message: r.error };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "failed" }; }
}