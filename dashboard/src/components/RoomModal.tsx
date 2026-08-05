"use client";
import { useState } from "react";
import type { Room } from "../app/gm/reception/rooms-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621";

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function hoursLeft(iso: string | null): { text: string; urgent: boolean } {
  if (!iso) return { text: "", urgent: false };
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { text: "Overdue", urgent: true };
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return { text: h >= 24 ? Math.floor(h / 24) + "d " + (h % 24) + "h remaining" : h + "h " + m + "m remaining", urgent: h < 2 };
}
// default checkout = tomorrow 11:00, as a datetime-local string
function defaultCheckout(): string {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

type Handlers = {
  onCheckIn: (roomNumber: string, guestName: string, guestPhone: string, partySize: number, checkOut: string) => Promise<void>;
  onCheckOut: (roomNumber: string) => Promise<void>;
  onClean: (roomNumber: string) => Promise<void>;
  onClose: () => void;
};

export default function RoomModal({ room, handlers }: { room: Room; handlers: Handlers }) {
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [guestPhone, setGuestPhone] = useState("");
  const [checkOut, setCheckOut] = useState(defaultCheckout());
  const [busy, setBusy] = useState(false);

  const st = room.status;
  const statusColor = st === "occupied" ? RED : st === "cleaning" ? AMBER : GREEN;
  const statusBg = st === "occupied" ? "#FBEDE9" : st === "cleaning" ? "#F7F0E0" : "#EAF3EE";
  const statusLabel = st === "occupied" ? "Occupied" : st === "cleaning" ? "Cleaning" : "Available";

  async function checkIn() {
    if (!guestName.trim()) return;
    setBusy(true);
    // convert datetime-local to ISO
    const iso = new Date(checkOut).toISOString();
    await handlers.onCheckIn(room.room_number, guestName.trim(), guestPhone.trim(), partySize, iso);
    setBusy(false);
  }
  async function act(fn: () => Promise<void>) { setBusy(true); await fn(); setBusy(false); }

  const field = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const };
  const lbl = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 5, display: "block" };

  return (
    <div onClick={handlers.onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(27,38,33,.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: "100%", background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(27,38,33,.28)", overflow: "hidden" }}>
        {/* header */}
        <div style={{ padding: "22px 24px", borderBottom: "1px solid #F0F0EA", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: INK }}>Room {room.room_number}</div>
            <div style={{ fontSize: 12.5, color: "#8A8577", marginTop: 2 }}>{room.room_type} &middot; Floor {room.floor}</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: statusColor, background: statusBg, borderRadius: 8, padding: "5px 11px" }}>{statusLabel}</span>
        </div>

        {/* body varies by status */}
        <div style={{ padding: "20px 24px" }}>
          {st === "available" ? (
            <>
              <div style={{ fontSize: 13, color: INK, fontWeight: 600, marginBottom: 14 }}>Check in a guest</div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Guest name</label>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. A. Sharma" style={field} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>WhatsApp number</label>
                <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 90000 00000" style={field} />
                <div style={{ fontSize: 10.5, color: "#B4B9B3", marginTop: 4 }}>Guest texts this number to reach Aria for dining, spa &amp; requests</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={lbl}>Guests</label>
                  <input type="number" min={1} value={partySize} onChange={(e) => setPartySize(parseInt(e.target.value) || 1)} style={field} />
                </div>
                <div>
                  <label style={lbl}>Checkout</label>
                  <input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={field} />
                </div>
              </div>
              <button onClick={checkIn} disabled={busy || !guestName.trim()} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !guestName.trim() ? 0.6 : 1 }}>{busy ? "Checking in..." : "Check in guest"}</button>
            </>
          ) : st === "occupied" ? (
            <>
              <div style={{ background: "#FBFAF5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>{room.guest_name || "Guest"}</div>
                {room.party_size ? <div style={{ fontSize: 12.5, color: "#8A8577", marginTop: 2 }}>{room.party_size} guest{room.party_size === 1 ? "" : "s"}</div> : null}
                <div style={{ fontSize: 12.5, color: "#6E756F", marginTop: 10 }}>Checkout: {fmtTime(room.check_out)}</div>
                {(() => { const h = hoursLeft(room.check_out); return h.text ? <div style={{ fontSize: 13.5, fontWeight: 700, color: h.urgent ? RED : GREEN, marginTop: 3 }}>{h.text}</div> : null; })()}
              </div>
              <button onClick={() => act(() => handlers.onCheckOut(room.room_number))} disabled={busy} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: RED, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "..." : "Check out guest"}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13.5, color: "#8A8577", marginBottom: 16, textAlign: "center", padding: "8px 0" }}>This room is being cleaned. Mark it ready once housekeeping is done.</div>
              <button onClick={() => act(() => handlers.onClean(room.room_number))} disabled={busy} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "..." : "Mark as ready"}</button>
            </>
          )}
        </div>

        <div style={{ padding: "0 24px 18px" }}>
          <button onClick={handlers.onClose} style={{ width: "100%", borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 500, color: "#6E756F", background: "#F5F5F0", border: "1px solid #EAEAE4", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}