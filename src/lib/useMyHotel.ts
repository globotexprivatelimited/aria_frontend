"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "aria_token";
const CACHE_KEY = "aria_my_hotel_cache";

let inMemoryHotelId: string | null = null;
let inMemoryHotelName = "";
let inMemoryLoaded = false;

function getInitialHotel(): { id: string | null; name: string } {
  if (inMemoryHotelId) {
    return { id: inMemoryHotelId, name: inMemoryHotelName };
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.hotelId) {
          inMemoryHotelId = parsed.hotelId;
          inMemoryHotelName = parsed.hotelName || "";
          return { id: parsed.hotelId, name: parsed.hotelName || "" };
        }
      }
    } catch {
      /* ignore */
    }
  }
  return { id: null, name: "" };
}

// Returns the logged-in user's own hotel id + name, with instant local caching
export function useMyHotel(): { hotelId: string | null; hotelName: string; loading: boolean } {
  const initial = getInitialHotel();
  const [hotelId, setHotelId] = useState<string | null>(initial.id);
  const [hotelName, setHotelName] = useState<string>(initial.name);
  const [loading, setLoading] = useState<boolean>(!initial.id && !inMemoryLoaded);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
      if (!token) {
        if (alive) setLoading(false);
        return;
      }

      // If we already loaded in this session, skip redundant blocking calls
      if (inMemoryLoaded && inMemoryHotelId) {
        if (alive) {
          setHotelId(inMemoryHotelId);
          setHotelName(inMemoryHotelName);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(API + "/api/auth/me", {
          headers: { authorization: "Bearer " + token },
        });
        const j = await res.json();
        if (!alive) return;
        if (j.ok && j.data) {
          const hId = j.data.hotelId || null;
          const hName = j.data.hotelName || j.data.hotelId || "";
          inMemoryHotelId = hId;
          inMemoryHotelName = hName;
          inMemoryLoaded = true;
          setHotelId(hId);
          setHotelName(hName);
          if (typeof window !== "undefined" && hId) {
            try {
              window.localStorage.setItem(CACHE_KEY, JSON.stringify({ hotelId: hId, hotelName: hName }));
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { hotelId, hotelName, loading };
}