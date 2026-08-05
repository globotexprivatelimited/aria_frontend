"use server";

import { apiPost } from "@/lib/api";

export async function doCheckIn(input: { hotelId: string; room: string; name: string; phone: string; checkoutAt?: string }) {
  const room = input.room.trim(), name = input.name.trim(), phone = input.phone.trim();
  if (!room || !name || !phone) return { ok: false, message: "Room, name and phone are all required." };
  try {
    if (!input.hotelId) return { ok: false, message: "No hotel selected." };
    const body: Record<string, unknown> = { hotelId: input.hotelId, room, name, phone };
    if (input.checkoutAt) body.checkoutAt = input.checkoutAt;
    await apiPost("/api/checkin", body);
    return { ok: true, message: "Checked in " + name + " to room " + room + "." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Check-in failed." };
  }
}

export async function doCheckOut(hotelId: string, room: string) {
  const r = room.trim();
  if (!r) return { ok: false, message: "Room is required." };
  try {
    const res = await apiPost<{ closed: boolean }>("/api/checkout", { hotelId, room: r });
    return { ok: res.closed, message: res.closed ? "Room " + r + " checked out." : "No active guest in room " + r + "." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Check-out failed." };
  }
}