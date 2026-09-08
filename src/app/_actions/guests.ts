"use server";

import { apiGet } from "@/lib/api";

export type InHouseGuest = {
  sessionId: string; phone: string; room: string | null; name: string | null; state: string;
  verified: boolean; verificationMethod: string | null; checkInDate: string | null; lastMessageAt: string | null;
};

/** Every active or flagged session for the hotel - the in-house guest list, straight from the API. */
export async function getInHouseGuests(hotelId: string): Promise<InHouseGuest[]> {
  if (!hotelId) return [];
  try {
    const res = await apiGet<{ count: number; guests: InHouseGuest[] }>("/api/dashboard/guests?hotelId=" + encodeURIComponent(hotelId));
    return res.guests ?? [];
  } catch { return []; }
}
