"use server";

import { revalidatePath } from "next/cache";
import { apiPost, hotelId } from "@/lib/api";

export async function checkIn(_prev: unknown, formData: FormData) {
  const room = String(formData.get("room") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!room || !name || !phone) return { ok: false, message: "Room, name and phone are all required." };

  try {
    await apiPost("/api/checkin", { hotelId, room, name, phone });
    revalidatePath("/guests");
    revalidatePath("/");
    return { ok: true, message: "Checked in " + name + " to room " + room + "." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Check-in failed." };
  }
}

export async function checkOut(_prev: unknown, formData: FormData) {
  const room = String(formData.get("room") ?? "").trim();
  if (!room) return { ok: false, message: "Room is required." };

  try {
    const res = await apiPost<{ closed: boolean }>("/api/checkout", { hotelId, room });
    revalidatePath("/guests");
    revalidatePath("/");
    return { ok: res.closed, message: res.closed ? "Room " + room + " checked out." : "No active guest in room " + room + "." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Check-out failed." };
  }
}
