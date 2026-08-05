"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 5 } },
});

export type RequestRow = {
  id: string;
  hotelId: string;
  roomNumber: string | null;
  guestPhone: string;
  department: string | null;
  requestDetail: string | null;
  priority: string;
  status: string;
  claimedBy: string | null;
  createdAt: string;
};