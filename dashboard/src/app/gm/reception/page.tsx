"use client";

import { useEffect, useState, useCallback } from "react";
import { getHotelActive, type Req as RequestRow } from "../../_actions/requests";
import GMSidebar from "../../../components/GMSidebar";
import { doCheckIn, doCheckOut } from "./actions";
import { useMyHotel } from "../../../lib/useMyHotel";

const HOTEL_ID = "demo";

export default function Reception() {
  const { hotelId: HOTEL_ID } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkout, setCheckout] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getHotelActive(HOTEL_ID));
  }, [HOTEL_ID]);

  useEffect(() => {
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load]);

  function flash(ok: boolean, msg: string) { setToast({ ok, msg }); setTimeout(() => setToast(null), 3000); }

  async function submitCheckIn() {
    setBusy(true);
    const res = await doCheckIn({ hotelId: HOTEL_ID || "", room, name, phone, checkoutAt: checkout || undefined });
    setBusy(false);
    flash(res.ok, res.message);
    if (res.ok) { setRoom(""); setName(""); setPhone(""); setCheckout(""); load(); }
  }

  async function checkOutRoom(r: string) {
    const res = await doCheckOut(HOTEL_ID || "", r);
    flash(res.ok, res.message);
    load();
  }

  // in-house rooms = rooms with any recent activity (real guests checked in)
  const rooms = Array.from(new Set(rows.map((r) => r.roomNumber).filter(Boolean))) as string[];
  const inHouse = rooms.map((rm) => {
    const last = rows.find((r) => r.roomNumber === rm);
    return { room: rm, last: last?.requestDetail ?? "", at: last?.createdAt ?? "" };
  }).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const inputStyle = { width: "100%", borderRadius: 9, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "10px 12px", fontSize: 14, outline: "none", marginTop: 6 } as const;
  const labelStyle = { fontSize: 12, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: ".04em", color: "#6E756F" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Reception</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; check guests in and out
        </p>

        {toast ? (
          <div style={{ marginTop: 16, borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 500, background: toast.ok ? "#E8F1ED" : "#FBEDE9", color: toast.ok ? "#0F5F4C" : "#B23A2A", border: "1px solid " + (toast.ok ? "#CFE5DC" : "#F0D5CD") }}>
            {toast.msg}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, marginTop: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24, height: "fit-content" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 600, color: "#1B2621" }}>New check-in</h2>
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Room number</label>
              <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="412" style={inputStyle} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Guest name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>WhatsApp number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" style={inputStyle} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Checkout date <span style={{ textTransform: "none", color: "#B4B9B3" }}>(optional)</span></label>
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={submitCheckIn} disabled={busy}
              style={{ marginTop: 20, width: "100%", borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
              {busy ? "Checking in..." : "Check in guest"}
            </button>
            <p style={{ marginTop: 12, fontSize: 12, color: "#9AA09A", lineHeight: 1.5 }}>
              This creates the guest&rsquo;s session, locks the room to their number, and sends the welcome message.
            </p>
          </div>

          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #EAEAE4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 600, color: "#1B2621" }}>In house</h2>
              <span style={{ fontSize: 12, color: "#9AA09A" }}>{inHouse.length} rooms</span>
            </div>
            {inHouse.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No guests checked in yet.</div>
            ) : inHouse.map((g) => (
              <div key={g.room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #F4F4F1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621", minWidth: 44 }}>{g.room}</span>
                  <span style={{ fontSize: 13, color: "#6E756F", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.last}</span>
                </div>
                <button onClick={() => checkOutRoom(g.room)}
                  style={{ borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#B23A2A", background: "#fff", border: "1px solid #E7B9A8", cursor: "pointer" }}>
                  Check out
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}