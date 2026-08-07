"use client";
import { useState } from "react";
import { checkInGuest } from "../app/gm/reception/rooms-actions";
import type { Room } from "../app/gm/reception/rooms-actions";
import CountryPicker from "./CountryPicker";
import { DIAL_CODES } from "../lib/dialCodes";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621", RED = "#B23A2A";

const nowLocal = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function CheckInPanel({ hotelId, rooms, onDone }: { hotelId: string; rooms: Room[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [dial, setDial] = useState("+91");
  const [phone, setPhone] = useState("");
  const [party, setParty] = useState("2");
  const [checkIn, setCheckIn] = useState(nowLocal());
  const [checkOut, setCheckOut] = useState(tomorrow());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const vacant = rooms.filter((r) => r.status === "available").sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }));

  async function submit() {
    if (!room) { setErr("Pick a room."); return; }
    if (!name.trim()) { setErr("Enter the guest name."); return; }
    setBusy(true); setErr(null); setMsg(null);
    const r = await checkInGuest({
      hotelId, roomNumber: room, guestName: name.trim(),
      guestPhone: phone.trim() ? dial + phone.replace(/[^0-9]/g, "") : undefined,
      partySize: party ? Number(party) : undefined,
      checkIn: checkIn ? new Date(checkIn).toISOString() : undefined,
      checkOut: checkOut || undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (r.ok) {
      setMsg(name.trim() + " is checked into room " + room + ".");
      setRoom(""); setName(""); setPhone(""); setParty("2"); setNotes(""); setCheckIn(nowLocal()); setCheckOut(tomorrow());
      onDone();
      setTimeout(() => setMsg(null), 4000);
    } else setErr(r.message ?? "That did not go through.");
  }

  const fld = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const, color: INK };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 5, display: "block" };

  return (
    <div style={{ background: "#fff", border: "1px solid #EAE7DE", borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
      <button onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "14px 18px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: "#EAF2ED", border: "1px solid #CFE5DC", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" /></svg>
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 600, color: INK }}>Check in a guest</span>
          <span style={{ fontSize: 11.5, color: "#9AA09A" }}>{vacant.length} room{vacant.length === 1 ? "" : "s"} free right now</span>
        </span>
        {msg && !open ? <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{msg}</span> : null}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B9B3" strokeWidth="2.6" strokeLinecap="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {open ? (
        <div style={{ borderTop: "1px solid #F1EEE6", padding: "16px 18px 18px", background: "#FDFCFA" }}>
          {err ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}
          {msg ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{msg}</div> : null}

          {vacant.length === 0 ? (
            <div style={{ textAlign: "center", padding: "22px 0", color: "#B4B9B3", fontSize: 13.5 }}>Every room is occupied. Check someone out first.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1.2fr .7fr", gap: 11, marginBottom: 11 }}>
                <div>
                  <label style={lbl}>Room</label>
                  <select value={room} onChange={(e) => setRoom(e.target.value)} style={{ ...fld, cursor: "pointer" }}>
                    <option value="">Choose&hellip;</option>
                    {vacant.map((r) => <option key={r.id} value={r.room_number}>{r.room_number} &middot; {r.room_type} &middot; floor {r.floor}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Guest name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A. Sharma" style={fld} /></div>
                <div>
                  <label style={lbl}>WhatsApp number</label>
                  <div style={{ display: "flex", gap: 7 }}>
                    <CountryPicker options={DIAL_CODES} value={dial} onChange={setDial} width={112} gap={0} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Number only" inputMode="numeric" style={{ ...fld, flex: 1 }} />
                  </div>
                </div>
                <div><label style={lbl}>Guests</label><input value={party} onChange={(e) => setParty(e.target.value.replace(/[^0-9]/g, ""))} style={fld} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 2fr auto", gap: 11, alignItems: "end" }}>
                <div><label style={lbl}>Arriving</label><input type="datetime-local" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={fld} /></div>
                <div><label style={lbl}>Leaving</label><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={fld} /></div>
                <div><label style={lbl}>Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Late arrival, allergies, anything worth knowing" style={fld} /></div>
                <button onClick={submit} disabled={busy || !room || !name.trim()}
                  style={{ borderRadius: 9, padding: "11px 24px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: busy ? "default" : "pointer", opacity: busy || !room || !name.trim() ? .55 : 1, whiteSpace: "nowrap" }}>
                  {busy ? "Checking in\u2026" : "Check in"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#A8A395", marginTop: 10 }}>
                Adding the WhatsApp number lets Aria recognise this guest the moment they message.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
