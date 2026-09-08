"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, type CSSProperties } from "react";
import { getHotelActive, type Req as RequestRow } from "../../_actions/requests";
import { getInHouseGuests, type InHouseGuest } from "../../_actions/guests";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

/** A guest reception registered at check-in: their room is a fact. */
type InHouse = { room: string; phone: string; name: string; lastDetail: string; lastAt: string; openCount: number };
/** A number that wrote to the hotel but was never registered: any room is only what they claimed. */
type Unregistered = { phone: string; name: string; claimedRoom: string; lastAt: string; openCount: number };

const EPOCH = new Date(0).toISOString();

const ink = "#1B2621";
const body = "#3A413B";
const muted = "#6E756F";
const faint = "#9AA09A";
const line = "#EAEAE4";
const lineSoft = "#F4F4F1";
const serif = "Georgia, serif";

export default function GMGuests() {
  const { isMobile } = useBreakpoint();
  const { hotelId: HOTEL_ID } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [sessions, setSessions] = useState<InHouseGuest[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [reqs, inHouse] = await Promise.all([getHotelActive(HOTEL_ID), getInHouseGuests(HOTEL_ID)]);
    setRows(reqs);
    setSessions(inHouse);
    setConnected(true);
  }, [HOTEL_ID]);

  useEffect(() => {
    load();
    if (!HOTEL_ID) return;
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID]);

  const inHouseByRoom: Record<string, InHouse> = {};
  const unregistered: Unregistered[] = [];
  for (const s of sessions) {
    const lastAt = s.lastMessageAt ?? s.checkInDate ?? EPOCH;
    if (s.verified && s.room) {
      inHouseByRoom[s.room] = { room: s.room, phone: s.phone, name: s.name ?? "", lastDetail: "", lastAt, openCount: 0 };
    } else {
      unregistered.push({ phone: s.phone, name: s.name ?? "", claimedRoom: s.room ?? "", lastAt, openCount: 0 });
    }
  }
  for (const r of rows) {
    const open = r.status !== "resolved";
    const room = r.roomNumber ?? "";
    const g = room ? inHouseByRoom[room] : undefined;
    if (g && (!r.guestPhone || r.guestPhone === g.phone)) {
      if (!g.lastDetail || new Date(r.createdAt).getTime() >= new Date(g.lastAt).getTime()) {
        g.lastDetail = r.requestDetail ?? "";
        g.lastAt = r.createdAt;
      }
      if (open) g.openCount += 1;
      continue;
    }
    const u = unregistered.find((x) => x.phone === (r.guestPhone ?? ""));
    if (u && open) u.openCount += 1;
  }
  const byRecent = (a: { lastAt: string }, b: { lastAt: string }) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
  const guests = Object.values(inHouseByRoom).sort(byRecent);
  unregistered.sort(byRecent);

  const table: CSSProperties = { marginTop: 16, background: "#fff", border: "1px solid " + line, borderRadius: 16, overflow: isMobile ? "auto" : "hidden" };
  const headRow = (cols: string): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, minWidth: isMobile ? 640 : "auto", padding: "14px 24px", borderBottom: "1px solid " + line, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: faint });
  const bodyRow = (cols: string): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, minWidth: isMobile ? 640 : "auto", padding: "16px 24px", borderBottom: "1px solid " + lineSoft, fontSize: 14, alignItems: "center", textDecoration: "none", cursor: "pointer" });
  const openBadge = (n: number) => n > 0
    ? <span style={{ borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600, background: "#E8F1ED", color: "#0F5F4C" }}>{n}</span>
    : <span style={{ color: "#C4C9C2" }}>&mdash;</span>;
  const chatHref = (phone: string) => "/gm/conversations/" + encodeURIComponent(phone);

  const inHouseCols = "1fr 2fr 3fr 1fr 1fr";
  const unregCols = "2fr 2fr 1fr 1fr 1fr";

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "32px" }}>
        <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: ink }}>Guests</h1>
        <p style={{ fontSize: 14, color: muted, marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; {guests.length} in house
          {unregistered.length > 0 ? " and " + unregistered.length + " unregistered" : ""} &middot; click a guest to read their chat
        </p>

        <div style={table}>
          <div style={headRow(inHouseCols)}>
            <span>Room</span><span>Guest</span><span>Last request</span><span>Open</span><span>Last seen</span>
          </div>
          {guests.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: faint, fontSize: 14 }}>No guests checked in yet. Check someone in at Reception and they appear here.</div>
          ) : guests.map((g) => (
            <Link key={g.room} href={chatHref(g.phone)} style={bodyRow(inHouseCols)}>
              <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: ink }}>{g.room}</span>
              <span style={{ color: ink }}>{g.name || "Guest"}</span>
              <span style={{ color: body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.lastDetail || "No requests yet"}</span>
              <span>{openBadge(g.openCount)}</span>
              <span style={{ color: faint, fontSize: 13 }}>{timeAgo(g.lastAt)}</span>
            </Link>
          ))}
        </div>

        {unregistered.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: ink, margin: 0 }}>Messaged but not registered</h2>
            <p style={{ fontSize: 13, color: muted, marginTop: 4, maxWidth: 720 }}>
              These numbers wrote to the hotel but were never added at check-in, so Aria asks them to see reception. Any room shown is what they claimed, not a confirmed stay. Register the number on the Reception board to let them chat.
            </p>
            <div style={table}>
              <div style={headRow(unregCols)}>
                <span>Guest</span><span>WhatsApp number</span><span>Claims room</span><span>Open</span><span>Last seen</span>
              </div>
              {unregistered.map((u) => (
                <Link key={u.phone} href={chatHref(u.phone)} style={bodyRow(unregCols)}>
                  <span style={{ color: ink }}>{u.name || "Unknown"}</span>
                  <span style={{ color: body }}>{u.phone}</span>
                  <span style={{ color: u.claimedRoom ? "#9A6B12" : faint }}>{u.claimedRoom || "None"}</span>
                  <span>{openBadge(u.openCount)}</span>
                  <span style={{ color: faint, fontSize: 13 }}>{timeAgo(u.lastAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
