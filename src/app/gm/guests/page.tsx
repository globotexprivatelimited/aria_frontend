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

const ink = "#0D1F1A";
const body = "#4A5D56";
const muted = "#72837C";
const faint = "#8A9792";
const line = "#E2EBE7";
const lineSoft = "#F1F6F4";

export default function GMGuests() {
  const { isMobile } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
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
    const iv = setInterval(load, 15000);
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

  const table: CSSProperties = { marginTop: 16, background: "#FFFFFF", border: "1px solid " + line, borderRadius: 18, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05)", overflow: "hidden" };
  const headRow = (cols: string): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, minWidth: isMobile ? 640 : "auto", padding: "14px 24px", borderBottom: "1px solid " + line, fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", color: faint, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, background: "#FAFBFB" });
  const bodyRow = (cols: string): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, minWidth: isMobile ? 640 : "auto", padding: "16px 24px", borderBottom: "1px solid " + lineSoft, fontSize: 13.5, alignItems: "center", textDecoration: "none", cursor: "pointer", transition: "background .15s" });
  const openBadge = (n: number) => n > 0
    ? <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 11.5, fontWeight: 700, background: "#EBF3F0", color: "#2F5D50", border: "1px solid #C0DDD3" }}>{n} open</span>
    : <span style={{ color: "#B4C2BC" }}>&mdash;</span>;
  const chatHref = (phone: string) => "/gm/conversations/" + encodeURIComponent(phone);

  const inHouseCols = "1fr 2fr 3fr 1.2fr 1.2fr";
  const unregCols = "2fr 2fr 1.2fr 1.2fr 1.2fr";

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>
        
        {/* Grandoria Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: "#B08A4F", fontSize: 11, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Guest Registry &middot; In-House</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: ink, margin: 0, letterSpacing: "-0.01em" }}>
              {hotelName || "Grandoria Resort"} &middot; Guests
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4A5D56", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 999, padding: "7px 16px", boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: connected ? "#2ECC71" : "#F0B429", boxShadow: connected ? "0 0 0 3px rgba(46,204,113,.2)" : "none" }} />
            {connected ? "Live &middot; " + guests.length + " in house" : "Connecting..."}
          </div>
        </div>

        <div style={{ overflowX: "auto", borderRadius: 18 }}>
          <div style={table}>
            <div style={headRow(inHouseCols)}>
              <span>Suite</span><span>Guest</span><span>Last interaction</span><span>Status</span><span>Active</span>
            </div>
            {guests.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: faint, fontSize: 14 }}>No guests currently checked in. Check someone in at Reception to see them here.</div>
            ) : guests.map((g) => (
              <Link key={g.room} href={chatHref(g.phone)} style={bodyRow(inHouseCols)}>
                <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#2F5D50" }}>Suite {g.room}</span>
                <span style={{ color: ink, fontWeight: 600 }}>{g.name || "Guest"}</span>
                <span style={{ color: body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.lastDetail || "No requests submitted yet"}</span>
                <span>{openBadge(g.openCount)}</span>
                <span style={{ color: faint, fontSize: 12.5 }}>{timeAgo(g.lastAt)}</span>
              </Link>
            ))}
          </div>
        </div>

        {unregistered.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif", marginBottom: 4 }}>Unassigned Contacts</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: ink, margin: 0 }}>Messaged but not verified</h2>
            <p style={{ fontSize: 13, color: muted, marginTop: 4, maxWidth: 720 }}>
              These numbers messaged the hotel concierge but have not been formally linked at check-in. Register their key at Reception to authorize full concierge services.
            </p>
            <div style={{ overflowX: "auto", borderRadius: 18, marginTop: 14 }}>
              <div style={table}>
                <div style={headRow(unregCols)}>
                  <span>Guest</span><span>WhatsApp</span><span>Claims Suite</span><span>Status</span><span>Last seen</span>
                </div>
                {unregistered.map((u) => (
                  <Link key={u.phone} href={chatHref(u.phone)} style={bodyRow(unregCols)}>
                    <span style={{ color: ink, fontWeight: 600 }}>{u.name || "Unknown"}</span>
                    <span style={{ color: body, fontFamily: "monospace", fontSize: 13 }}>{u.phone}</span>
                    <span style={{ color: u.claimedRoom ? "#B08A4F" : faint, fontWeight: u.claimedRoom ? 600 : 400 }}>{u.claimedRoom ? "Suite " + u.claimedRoom : "Unspecified"}</span>
                    <span>{openBadge(u.openCount)}</span>
                    <span style={{ color: faint, fontSize: 12.5 }}>{timeAgo(u.lastAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
