"use client";
import { useState } from "react";
import type { Room, StayEvent } from "../app/gm/reception/rooms-actions";
import { setRoomCheckout, getStayEvents } from "../app/gm/reception/rooms-actions";
import CountryPicker from "./CountryPicker";
import { DIAL_CODES } from "../lib/dialCodes";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621";
const TYPES = ["Standard", "Deluxe", "Suite", "Executive", "Presidential"];

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
/** An ISO instant as the value a datetime-local input wants, in the browser's own timezone. */
function toLocalInput(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}
function shiftInput(value: string, ms: number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return toLocalInput(new Date(d.getTime() + ms).toISOString());
}
function defaultCheckout(): string {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0);
  return toLocalInput(d.toISOString());
}

type Handlers = {
  onCheckIn: (roomNumber: string, guestName: string, guestPhone: string, partySize: number, checkOut: string) => Promise<void>;
  onCheckOut: (roomNumber: string) => Promise<void>;
  onClean: (roomNumber: string) => Promise<void>;
  onEdit: (roomNumber: string, changes: { room_type?: string; floor?: number; newNumber?: string }) => Promise<void>;
  onDelete: (roomNumber: string) => Promise<void>;
  onClose: () => void;
};

export default function RoomModal({ room, handlers }: { room: Room; handlers: Handlers }) {
  const [guestName, setGuestName] = useState("");
  const [dial, setDial] = useState("+91");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [checkOut, setCheckOut] = useState(defaultCheckout());
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"main" | "edit">("main");
  // edit fields
  const [eType, setEType] = useState(room.room_type);
  const [eFloor, setEFloor] = useState(room.floor);
  const [eNumber, setENumber] = useState(room.room_number);
  // changing the checkout time of a stay in progress
  const [coOpen, setCoOpen] = useState(false);
  const [coValue, setCoValue] = useState(toLocalInput(room.check_out));
  const [coBusy, setCoBusy] = useState(false);
  const [coError, setCoError] = useState<string | null>(null);
  const [coNote, setCoNote] = useState<string | null>(null);
  const [coNow, setCoNow] = useState<string | null>(null);
  const [events, setEvents] = useState<StayEvent[]>([]);

  const st = room.status;
  const statusColor = st === "occupied" ? RED : st === "cleaning" ? AMBER : GREEN;
  const statusBg = st === "occupied" ? "#FBEDE9" : st === "cleaning" ? "#F7F0E0" : "#EAF3EE";
  const statusLabel = st === "occupied" ? "Occupied" : st === "cleaning" ? "Cleaning" : "Available";
  const liveCheckout = coNow ?? room.check_out;

  async function checkIn() {
    if (!guestName.trim()) return;
    setBusy(true);
    const iso = new Date(checkOut).toISOString();
    await handlers.onCheckIn(room.room_number, guestName.trim(), guestPhone.trim() ? dial + guestPhone.replace(/[^0-9]/g, "") : "", partySize, iso);
    setBusy(false);
  }
  async function act(fn: () => Promise<void>) { setBusy(true); await fn(); setBusy(false); }
  async function saveEdit() {
    setBusy(true);
    await handlers.onEdit(room.room_number, { room_type: eType, floor: Number(eFloor), newNumber: eNumber !== room.room_number ? eNumber : undefined });
    setBusy(false);
  }
  async function del() {
    if (!confirm("Delete Room " + room.room_number + "? This cannot be undone.")) return;
    setBusy(true);
    await handlers.onDelete(room.room_number);
    setBusy(false);
  }

  async function openCheckoutEditor() {
    setCoOpen(true);
    setCoError(null); setCoNote(null);
    setCoValue(toLocalInput(liveCheckout));
    setEvents(await getStayEvents(room.hotel_id, room.room_number));
  }
  async function saveCheckout() {
    const parsed = new Date(coValue);
    if (Number.isNaN(parsed.getTime())) { setCoError("Pick a date and time first."); return; }
    setCoBusy(true); setCoError(null); setCoNote(null);
    const r = await setRoomCheckout(room.hotel_id, room.room_number, parsed.toISOString(), "GM console");
    setCoBusy(false);
    if (!r.ok) { setCoError(r.message || "Could not change the checkout time."); return; }
    setCoNow(r.checkout ?? parsed.toISOString());
    setCoNote(r.guestMessage ?? null);
    setEvents(await getStayEvents(room.hotel_id, room.room_number));
  }

  const field = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const };
  const lbl = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 5, display: "block" };
  const chip = { flex: 1, borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 600 as const, color: GREEN, background: "#EAF3EE", border: "1px solid #D6E6DD", cursor: "pointer" };

  return (
    <div onClick={handlers.onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(27,38,33,.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, maxWidth: "100%", background: "#fff", borderRadius: 18, boxShadow: "0 24px 60px rgba(27,38,33,.28)", overflow: "hidden" }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid #F0F0EA", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: INK }}>Room {room.room_number}</div>
            <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>{room.room_type} &middot; Floor {room.floor}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, background: statusBg, borderRadius: 8, padding: "5px 11px" }}>{statusLabel}</span>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {mode === "edit" ? (
            <>
              <div style={{ fontSize: 13, color: INK, fontWeight: 600, marginBottom: 14 }}>Edit room</div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Room number</label>
                <input value={eNumber} onChange={(e) => setENumber(e.target.value)} style={field} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div><label style={lbl}>Floor</label><input type="number" value={eFloor} onChange={(e) => setEFloor(parseInt(e.target.value) || 1)} style={field} /></div>
                <div><label style={lbl}>Type</label><select value={eType} onChange={(e) => setEType(e.target.value)} style={{ ...field, cursor: "pointer" }}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <button onClick={saveEdit} disabled={busy} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1, marginBottom: 8 }}>{busy ? "Saving..." : "Save changes"}</button>
              <button onClick={() => setMode("main")} style={{ width: "100%", borderRadius: 9, padding: "10px", fontSize: 13, color: "#6E756F", background: "#F5F5F0", border: "1px solid #EAEAE4", cursor: "pointer" }}>Back</button>
            </>
          ) : st === "available" ? (
            <>
              <div style={{ fontSize: 13, color: INK, fontWeight: 600, marginBottom: 14 }}>Check in a guest</div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Guest name</label>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. A. Sharma" style={field} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>WhatsApp number</label>
                <div style={{ display: "flex", gap: 7 }}>
                  <CountryPicker options={DIAL_CODES} value={dial} onChange={setDial} width={112} gap={0} />
                  <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Number only" inputMode="numeric" style={{ ...field, flex: 1 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 18 }}>
                <div><label style={lbl}>Checkout</label><input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={field} /></div>
              </div>
              <button onClick={checkIn} disabled={busy || !guestName.trim()} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !guestName.trim() ? 0.6 : 1 }}>{busy ? "Checking in..." : "Check in guest"}</button>
            </>
          ) : st === "occupied" ? (
            <>
              <div style={{ background: "#FBFAF5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: INK }}>{room.guest_name || "Guest"}</div>
                {room.guest_phone ? <div style={{ fontSize: 12, color: GREEN, marginTop: 2 }}>{room.guest_phone}</div> : null}
                {room.party_size ? <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>{room.party_size} guest{room.party_size === 1 ? "" : "s"}</div> : null}
                <div style={{ fontSize: 12, color: "#6E756F", marginTop: 10 }}>Checkout: {fmtTime(liveCheckout)}</div>
                {(() => { const h = hoursLeft(liveCheckout); return h.text ? <div style={{ fontSize: 14, fontWeight: 700, color: h.urgent ? RED : GREEN, marginTop: 3 }}>{h.text}</div> : null; })()}

                {!coOpen ? (
                  <button onClick={openCheckoutEditor} style={{ marginTop: 12, borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, color: GREEN, background: "#EAF3EE", border: "1px solid #D6E6DD", cursor: "pointer" }}>Change checkout</button>
                ) : (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #EFEDE3" }}>
                    <label style={lbl}>New checkout</label>
                    <input type="datetime-local" value={coValue} onChange={(e) => { setCoValue(e.target.value); setCoError(null); setCoNote(null); }} style={{ ...field, background: "#fff" }} />
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => setCoValue(shiftInput(coValue, 86400000))} style={chip}>+1 day</button>
                      <button onClick={() => setCoValue(shiftInput(coValue, 7200000))} style={chip}>+2 hrs</button>
                      <button onClick={() => setCoValue(shiftInput(coValue, -86400000))} style={{ ...chip, color: "#6E756F", background: "#F5F5F0", border: "1px solid #EAEAE4" }}>-1 day</button>
                    </div>
                    {coError ? <div style={{ fontSize: 12, color: RED, marginTop: 10, lineHeight: 1.45 }}>{coError}</div> : null}
                    {coNote ? <div style={{ fontSize: 12, color: GREEN, marginTop: 10, lineHeight: 1.45 }}>Saved. To tell the guest: &ldquo;{coNote}&rdquo;</div> : null}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={saveCheckout} disabled={coBusy} style={{ flex: 2, borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: coBusy ? 0.6 : 1 }}>{coBusy ? "Saving..." : "Save checkout"}</button>
                      <button onClick={() => { setCoOpen(false); setCoError(null); setCoNote(null); }} style={{ flex: 1, borderRadius: 9, padding: "10px", fontSize: 13, color: "#6E756F", background: "#F5F5F0", border: "1px solid #EAEAE4", cursor: "pointer" }}>Done</button>
                    </div>
                    {events.length ? (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ ...lbl, marginBottom: 6 }}>Changes to this stay</div>
                        {events.slice(0, 3).map((ev, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: "#8A8577", lineHeight: 1.5 }}>
                            {fmtTime(ev.previousAt)} &rarr; {fmtTime(ev.newAt)}{ev.by ? " - " + ev.by : ""}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <button onClick={() => act(() => handlers.onCheckOut(room.room_number))} disabled={busy} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: RED, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "..." : "Check out guest"}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "#8A8577", marginBottom: 16, textAlign: "center", padding: "8px 0" }}>This room is being cleaned. Mark it ready once housekeeping is done.</div>
              <button onClick={() => act(() => handlers.onClean(room.room_number))} disabled={busy} style={{ width: "100%", borderRadius: 11, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "..." : "Mark as ready"}</button>
            </>
          )}
        </div>

        {/* edit + delete actions (not while editing, not on occupied) */}
        {mode === "main" ? (
          <div style={{ padding: "0 24px 18px", display: "flex", gap: 8 }}>
            <button onClick={() => setMode("edit")} style={{ flex: 1, borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 500, color: "#6E756F", background: "#F5F5F0", border: "1px solid #EAEAE4", cursor: "pointer" }}>Edit room</button>
            {st !== "occupied" ? <button onClick={del} disabled={busy} style={{ flex: 1, borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 500, color: RED, background: "#FBEDE9", border: "1px solid #EED7D0", cursor: "pointer" }}>Delete</button> : null}
            <button onClick={handlers.onClose} style={{ flex: 1, borderRadius: 9, padding: "10px", fontSize: 13, fontWeight: 500, color: "#6E756F", background: "#fff", border: "1px solid #EAEAE4", cursor: "pointer" }}>Close</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
