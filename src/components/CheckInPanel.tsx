"use client";
import { useState } from "react";
import { checkInGuest } from "../app/gm/reception/rooms-actions";
import type { Room } from "../app/gm/reception/rooms-actions";
import CountryPicker from "./CountryPicker";
import { DIAL_CODES } from "../lib/dialCodes";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621", RED = "#B23A2A";

const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const shortWhen = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "no checkout set";

export default function CheckInPanel({ hotelId, rooms, onDone }: { hotelId: string; rooms: Room[]; onDone: () => void }) {
  const [open, setOpen] = useState(true);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState("");
  const [checkOut, setCheckOut] = useState(tomorrow());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const free = rooms.filter((r) => r.status === "available").length;
  const match = rooms.find((r) => r.room_number.toLowerCase() === room.trim().toLowerCase());
  const taken = match && match.status === "occupied" ? match : null;
  const unknown = room.trim() !== "" && !match;

  async function submit() {
    if (!room.trim()) { setErr("Which room?"); return; }
    if (unknown) { setErr("There is no room " + room.trim() + " in this hotel."); return; }
    if (taken) { setErr("Room " + room.trim() + " is occupied. Check " + (taken.guest_name ?? "the guest") + " out first."); return; }
    if (!name.trim()) { setErr("Enter the guest name."); return; }
    setBusy(true); setErr(null); setMsg(null);
    const r = await checkInGuest({
      hotelId, roomNumber: match!.room_number, guestName: name.trim(),
      guestPhone: phone.trim() ? dial + phone.replace(/[^0-9]/g, "") : undefined,
      checkOut: checkOut || undefined,
    });
    setBusy(false);
    if (r.ok) {
      setMsg(name.trim() + " is in room " + match!.room_number + ".");
      setRoom(""); setName(""); setPhone(""); setCheckOut(tomorrow());
      onDone();
      setTimeout(() => setMsg(null), 5000);
    } else setErr(r.message ?? "That did not go through.");
  }

  const fld = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const, color: INK };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 5, display: "block" };
  const blocked = !!taken || unknown;

  return (
    <div style={{ background: "#fff", border: "1px solid #EAE7DE", borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
      <button onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "14px 18px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: "#EAF2ED", border: "1px solid #CFE5DC", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" /></svg>
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 600, color: INK }}>Check in a guest</span>
          <span style={{ fontSize: 11.5, color: "#9AA09A" }}>{free} room{free === 1 ? "" : "s"} free right now</span>
        </span>
        {msg && !open ? <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{msg}</span> : null}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B9B3" strokeWidth="2.6" strokeLinecap="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {open ? (
        <div style={{ borderTop: "1px solid #F1EEE6", padding: "16px 18px 18px", background: "#FDFCFA" }}>
          {err ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}
          {msg ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{msg}</div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.4fr 1.3fr 1.1fr auto", gap: 11, alignItems: "end" }}>
            <div>
              <label style={lbl}>Room</label>
              <input value={room} onChange={(e) => { setRoom(e.target.value); setErr(null); }} placeholder="e.g. 204"
                style={{ ...fld, borderColor: blocked ? "#EED7D0" : "#E3DECF", background: blocked ? "#FDF4F2" : "#FBFAF5" }} />
            </div>
            <div><label style={lbl}>Guest name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A. Sharma" style={fld} /></div>
            <div>
              <label style={lbl}>WhatsApp number</label>
              <div style={{ display: "flex", gap: 7 }}>
                <CountryPicker options={DIAL_CODES} value={dial} onChange={setDial} width={104} gap={0} />
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Number only" inputMode="numeric" style={{ ...fld, flex: 1 }} />
              </div>
            </div>
            <div><label style={lbl}>Checking out</label><input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={fld} /></div>
            <button onClick={submit} disabled={busy || blocked || !room.trim() || !name.trim()}
              style={{ borderRadius: 9, padding: "11px 24px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: busy || blocked ? "default" : "pointer", opacity: busy || blocked || !room.trim() || !name.trim() ? .5 : 1, whiteSpace: "nowrap" }}>
              {busy ? "Checking in\u2026" : "Check in"}
            </button>
          </div>

          {taken ? (
            <div style={{ marginTop: 12, borderRadius: 10, padding: "11px 14px", background: "#FBF3E6", border: "1px solid #EDD9B4", color: "#8A6420", fontSize: 13.5, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <span><b>Room {taken.room_number} is occupied.</b> {taken.guest_name ?? "A guest"} is in there until <b>{shortWhen(taken.check_out)}</b>. Check them out before putting someone new in.</span>
            </div>
          ) : null}

          {unknown ? (
            <div style={{ marginTop: 12, borderRadius: 10, padding: "11px 14px", background: "#FBEDE9", border: "1px solid #EED7D0", color: RED, fontSize: 13.5 }}>
              There is no room <b>{room.trim()}</b> in this hotel.
            </div>
          ) : null}

          {match && match.status === "available" ? (
            <div style={{ marginTop: 12, fontSize: 12.5, color: GREEN }}>
              Room {match.room_number} is free &middot; {match.room_type ?? "room"} on floor {match.floor ?? "\u2014"}
            </div>
          ) : null}

          <p style={{ fontSize: 11, color: "#A8A395", marginTop: 12 }}>
            The WhatsApp number lets Aria recognise this guest the moment they message.
          </p>
        </div>
      ) : null}
    </div>
  );
}
