"use client";
import { useEffect, useState } from "react";
import { getMyRole } from "./auth";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "aria_token";

// Returns the logged-in user's own hotel id + name, via the aria-api session (no Supabase).
export function useMyHotel(): { hotelId: string | null; hotelName: string; loading: boolean } {
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotelName, setHotelName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
      if (!token) { if (alive) setLoading(false); return; }
      try {
        const res = await fetch(API + "/api/auth/me", { headers: { authorization: "Bearer " + token } });
        const j = await res.json();
        if (!alive) return;
        if (j.ok && j.data) { setHotelId(j.data.hotelId); setHotelName(j.data.hotelName || j.data.hotelId); }
      } catch { /* ignore */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { hotelId, hotelName, loading };
}