"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { getHotelActive, type Req as RequestRow } from "../../_actions/requests";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";


function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

type Guest = { room: string; phone: string; lastDetail: string; lastAt: string; openCount: number };

export default function GMGuests() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getHotelActive(HOTEL_ID));
  }, [HOTEL_ID]);

  useEffect(() => {
    load();
    if (!HOTEL_ID) return;
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID]);

  const byRoom: Record<string, Guest> = {};
  for (const r of rows) {
    const room = r.roomNumber ?? "";
    if (!room) continue;
    if (!byRoom[room]) byRoom[room] = { room, phone: r.guestPhone, lastDetail: r.requestDetail ?? "", lastAt: r.createdAt, openCount: 0 };
    if (r.status !== "resolved") byRoom[room].openCount += 1;
  }
  const guests = Object.values(byRoom).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Guests</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; {guests.length} rooms with activity &middot; click a guest to read their chat
        </p>

        <div style={{ marginTop: 24, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr 1fr", padding: "14px 24px", borderBottom: "1px solid #EAEAE4", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>
            <span>Room</span><span>Last request</span><span>Open</span><span>Last seen</span>
          </div>
          {guests.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No guest activity yet.</div>
          ) : guests.map((g) => (
            <Link key={g.room} href={"/conversations/" + encodeURIComponent(g.phone)}
              style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr 1fr", padding: "16px 24px", borderBottom: "1px solid #F4F4F1", fontSize: 14, alignItems: "center", textDecoration: "none", cursor: "pointer" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: "#1B2621" }}>{g.room}</span>
              <span style={{ color: "#3A413B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.lastDetail}</span>
              <span>{g.openCount > 0 ? <span style={{ borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600, background: "#E8F1ED", color: "#0F5F4C" }}>{g.openCount}</span> : <span style={{ color: "#C4C9C2" }}>&mdash;</span>}</span>
              <span style={{ color: "#9AA09A", fontSize: 13 }}>{timeAgo(g.lastAt)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}