"use server";

import { apiGet, apiPost } from "@/lib/api";

export type ThreadMessage = { at: string; direction: string; type: string | null; body: string | null };

export type ThreadSession = {
  id?: string;
  state: string;
  room: string | null;
  name: string | null;
  verified: boolean;
  verificationMethod?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  lastMessageAt?: string | null;
};

export type Thread = { phone: string; session: ThreadSession | null; messageCount: number; messages: ThreadMessage[] };

/** The full thread for one guest at one hotel - the dispute record. */
export async function getConversation(hotelId: string, phone: string): Promise<Thread | null> {
  if (!hotelId || !phone) return null;
  try {
    return await apiGet<Thread>("/api/dashboard/conversations/" + encodeURIComponent(phone) + "?hotelId=" + encodeURIComponent(hotelId));
  } catch { return null; }
}

/** GM sends a WhatsApp message to the guest from the console. Plain text, so WhatsApp only accepts it inside the 24 hour window. */
export async function replyToGuest(hotelId: string, phone: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const body = text.trim();
  if (!hotelId || !phone || !body) return { ok: false, error: "Nothing to send." };
  try {
    const r = await apiPost<{ ok: boolean; error?: string }>(
      "/api/dashboard/conversations/" + encodeURIComponent(phone) + "/reply?hotelId=" + encodeURIComponent(hotelId),
      { hotelId, text: body }
    );
    return r.ok ? { ok: true } : { ok: false, error: r.error ?? "Could not send." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not send." };
  }
}
