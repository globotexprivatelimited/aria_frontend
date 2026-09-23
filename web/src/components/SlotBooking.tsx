"use client";
import { useState, useEffect, useCallback } from "react";
import { listSlots, availability, bookings, addSlot, patchSlot, removeSlot, book, cancelBooking,
  type Slot, type Availability, type BookingRow } from "../app/gm/departments/booking-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const DAYS = [["mon","M"],["tue","T"],["wed","W"],["thu","T"],["fri","F"],["sat","S"],["sun","S"]] as const;
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); };
const pretty = (d: string) => new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default function SlotBooking({ dept, itemId, itemName }: { dept: string; itemId: string; itemName: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [avail, setAvail] = useState<Availability[]>([]);
  const [books, setBooks] = useState<BookingRow[]>([]);
  const [date, setDate] = useState(today());
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("10:45");
  const [cap, setCap] = useState("2");
  const [days, setDays] = useState<string[]>(["mon","tue","wed","thu","fri","sat"]);
  const [bookFor, setBookFor] = useState<string | null>(null);
  const [room, setRoom] = useState("");
  const [guest, setGuest] = useState("");
  const [size, setSize] = useState("1");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, a, b] = await Promise.all([listSlots(dept), availability(dept, date, itemId), bookings(dept, date)]);
    setSlots((s ?? []).filter((x) => x.itemId === itemId));
    setAvail((a ?? []).filter((x) => x.itemId === itemId));
    setBooks((b ?? []).filter((x) => x.state !== "cancelled"));
  }, [dept, date, itemId]);
  useEffect(() => { load(); }, [load]);

  async function create() {
    setErr(null);
    if (!start) { setErr("Set a start time."); return; }
    const r = await addSlot({ dept, itemId, label: end ? start + "\u2013" + end : start, startTime: start, endTime: end || undefined, capacity: Number(cap) || 1, days });
    if (r.ok) { setAdding(false); setMsg("Time added"); setTimeout(() => setMsg(null), 2500); load(); }
    else setErr(r.error ?? "Could not add that time.");
  }
  async function makeBooking(slotId: string) {
    setErr(null);
    const r = await book({ slotId, onDate: date, roomNumber: room.trim() || undefined, guestName: guest.trim() || undefined, partySize: Number(size) || 1 });
    if (r.ok) { setBookFor(null); setRoom(""); setGuest(""); setSize("1"); setMsg("Booked"); setTimeout(() => setMsg(null), 2500); load(); }
    else setErr(r.error ?? "Could not book that time.");
  }

  const fld = { borderRadius: 8, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "7px 10px", fontSize: 13, outline: "none", color: INK };
  const mini = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#A8A395", fontWeight: 700 as const };
  const dayChip = (on: boolean) => ({ width: 26, height: 26, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
    border: "1px solid " + (on ? GREEN : "#E3DECF"), background: on ? "#EAF2ED" : "#fff", color: on ? GREEN : "#B4B9B3" });

  return (
    <div style={{ marginTop: 10, paddingTop: 11, borderTop: "1px dashed #E7E3D8" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <span style={mini}>When it is offered</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...fld, padding: "5px 8px", fontSize: 12 }} />
        <span style={{ fontSize: 11.5, color: "#9AA09A" }}>{pretty(date)}</span>
        <button onClick={() => setAdding((v) => !v)}
          style={{ marginLeft: "auto", borderRadius: 8, padding: "5px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "1px solid #CFE5DC", background: "#EAF2ED", color: GREEN }}>
          {adding ? "Cancel" : "Add a time"}
        </button>
      </div>

      {err ? <div style={{ marginTop: 8, borderRadius: 8, padding: "7px 11px", fontSize: 12.5, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}
      {msg ? <div style={{ marginTop: 8, borderRadius: 8, padding: "7px 11px", fontSize: 12.5, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{msg}</div> : null}

      {adding ? (
        <div style={{ marginTop: 10, background: "#FBFAF5", border: "1px solid #EFEBE2", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div><div style={{ ...mini, marginBottom: 4 }}>From</div><input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={fld} /></div>
            <div><div style={{ ...mini, marginBottom: 4 }}>To</div><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={fld} /></div>
            <div><div style={{ ...mini, marginBottom: 4 }}>How many at once</div><input value={cap} onChange={(e) => setCap(e.target.value.replace(/[^0-9]/g, ""))} style={{ ...fld, width: 64 }} /></div>
            <div>
              <div style={{ ...mini, marginBottom: 4 }}>Days</div>
              <div style={{ display: "flex", gap: 3 }}>
                {DAYS.map(([k, l], i) => (
                  <button key={k + i} onClick={() => setDays((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k])} style={dayChip(days.includes(k))}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={create} style={{ borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: 0, background: GREEN, color: "#fff" }}>Add</button>
          </div>
        </div>
      ) : null}

      {slots.length === 0 ? (
        <div style={{ marginTop: 9, fontSize: 12.5, color: "#B4B9B3" }}>No times set. Guests cannot book {itemName} until you add one.</div>
      ) : (
        <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 6 }}>
          {slots.map((s) => {
            const a = avail.find((x) => x.slotId === s.id);
            const full = a ? a.free === 0 : false;
            const runsToday = s.days.includes(["sun","mon","tue","wed","thu","fri","sat"][new Date(date + "T12:00:00").getDay()]);
            return (
              <div key={s.id} style={{ background: "#fff", border: "1px solid #EFEBE2", borderRadius: 9, padding: "9px 12px", opacity: s.active ? 1 : .5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: INK, minWidth: 96 }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, color: "#8A8577" }}>{s.capacity} at a time</span>
                  <span style={{ display: "flex", gap: 2 }}>
                    {DAYS.map(([k, l], i) => (
                      <span key={k + i} style={{ width: 17, height: 17, borderRadius: 4, fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: s.days.includes(k) ? "#EAF2ED" : "#F4F3EF", color: s.days.includes(k) ? GREEN : "#C8CCC6" }}>{l}</span>
                    ))}
                  </span>
                  {!runsToday ? <span style={{ fontSize: 11, color: "#B4B9B3" }}>not on this day</span> :
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: full ? RED : GREEN }}>
                      {a ? (full ? "fully booked" : a.free + " of " + a.capacity + " free") : "free"}
                    </span>}
                  <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                    {runsToday && !full ? (
                      <button onClick={() => { setBookFor(bookFor === s.id ? null : s.id); setErr(null); }}
                        style={{ borderRadius: 7, padding: "4px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "1px solid #CFE5DC", background: "#EAF2ED", color: GREEN }}>Book</button>
                    ) : null}
                    <button onClick={async () => { await patchSlot({ id: s.id, active: !s.active }); load(); }}
                      style={{ borderRadius: 7, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", border: "1px solid #E3DECF", background: "#fff", color: "#8A8577" }}>{s.active ? "Pause" : "Resume"}</button>
                    <button onClick={async () => { if (confirm("Remove " + s.label + "?")) { await removeSlot(s.id); load(); } }}
                      style={{ borderRadius: 7, padding: "4px 10px", fontSize: 11.5, cursor: "pointer", border: "1px solid #EED7D0", background: "#fff", color: RED }}>Remove</button>
                  </span>
                </div>

                {bookFor === s.id ? (
                  <div style={{ display: "flex", gap: 7, marginTop: 9, paddingTop: 9, borderTop: "1px solid #F4F2EC", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div><div style={{ ...mini, marginBottom: 4 }}>Room</div><input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="204" style={{ ...fld, width: 74 }} /></div>
                    <div><div style={{ ...mini, marginBottom: 4 }}>Guest</div><input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Name" style={{ ...fld, width: 140 }} /></div>
                    <div><div style={{ ...mini, marginBottom: 4 }}>People</div><input value={size} onChange={(e) => setSize(e.target.value.replace(/[^0-9]/g, ""))} style={{ ...fld, width: 58 }} /></div>
                    <button onClick={() => makeBooking(s.id)} style={{ borderRadius: 8, padding: "8px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: 0, background: GREEN, color: "#fff" }}>Book it</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {books.filter((b) => b.itemName === itemName).length > 0 ? (
        <div style={{ marginTop: 11 }}>
          <div style={{ ...mini, marginBottom: 6 }}>Booked on {pretty(date)}</div>
          {books.filter((b) => b.itemName === itemName).map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#3A413B", padding: "5px 0", borderBottom: "1px solid #F6F4EE" }}>
              <span style={{ fontWeight: 700, minWidth: 92 }}>{b.slotLabel}</span>
              <span style={{ minWidth: 44, color: "#8A8577" }}>{b.room ?? "\u2014"}</span>
              <span style={{ flex: 1 }}>{b.guestName ?? "Guest"}{b.partySize > 1 ? " \u00b7 " + b.partySize + " people" : ""}</span>
              <button onClick={async () => { await cancelBooking(b.id); load(); }}
                style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 11.5, color: RED }}>Cancel</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
