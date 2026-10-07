"use server";

import { cookies } from "next/headers";
import { apiGet } from "@/lib/api";

export type SystemStatus = {
  commit: string;
  uptimeSeconds: number;
  schedulerOn: boolean;
  jobs: Record<string, string | null>;
  jobsRunning: boolean;
  aiDown: boolean;
  aiDetail: string | null;
  whatsappDown: boolean;
  whatsappDetail: string | null;
  token: { valid: boolean | null; type: string | null; expiresAt: string | null; daysLeft: number | null; checkedAt: string | null };
  alerts: { kind: string; detail: string; at: string }[];
};

/** The hotel in the signed-in person's token - the API verifies the token itself; this only picks the hotel to ask about. */
async function myHotelId(): Promise<string> {
  try {
    const token = (await cookies()).get("aria_token")?.value;
    if (!token) return "";
    const payload = JSON.parse(Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return String(payload.hotelId ?? "");
  } catch { return ""; }
}

/** Is the AI answering, is WhatsApp sending, are the scheduled jobs running, when does the token expire. Null when not signed in. */
export async function getSystemStatus(): Promise<SystemStatus | null> {
  try {
    const hotelId = await myHotelId();
    if (!hotelId) return null;
    const r = await apiGet<{ ok: boolean; data: SystemStatus }>("/api/system/status?hotelId=" + encodeURIComponent(hotelId));
    return r.ok ? r.data : null;
  } catch { return null; }
}
