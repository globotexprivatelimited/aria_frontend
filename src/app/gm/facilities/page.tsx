"use client";
import { useEffect, useState, useCallback } from "react";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";
import { getFacilities, addFacility, updateFacility, deleteFacility, type Facility, type FacilityDraft, type FacilityStatus } from "./facilities-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621", MUTED = "#8A8577";
const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 } as const;
const field = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E4DECF", background: "#FEFDFB", fontSize: 13, color: INK, colorScheme: "light", boxSizing: "border-box" } as const;
const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 5, display: "block" } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }) as const;
const empty: FacilityDraft = { name: "", status: "open", closedUntil: null, closureNote: null, openTime: null, closeTime: null, weekendOpenTime: null, weekendCloseTime: null, location: null, price: null, notes: null };
const today = () => new Date().toISOString().slice(0, 10);

function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => { const f = () => setM(window.innerWidth < 760); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return m;
}

function StatusPill({ f }: { f: Facility }) {
  const past = f.status === "closed" && f.closedUntil && f.closedUntil < today();
  const st: FacilityStatus = past ? "open" : f.status;
  const color = st === "open" ? GREEN : st === "closed" ? RED : AMBER;
  const text = st === "open" ? "Open" : st === "closed" ? "Closed" + (f.closedUntil ? " until " + f.closedUntil : " today") : "Limited hours";
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "14", border: "1px solid " + color + "55", borderRadius: 999, padding: "3px 10px" }}>{text}</span>;
}

function Form({ value, onChange, onSave, onCancel, saving, saveLabel }: { value: FacilityDraft; onChange: (v: FacilityDraft) => void; onSave: () => void; onCancel: () => void; saving: boolean; saveLabel: string }) {
  const set = (k: keyof FacilityDraft, v: string) => onChange({ ...value, [k]: v === "" ? null : v });
  const isMobile = useIsMobile();
  const grid = (cols: string) => ({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : cols, gap: 10 });
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={grid("2fr 1fr")}>
        <div><label style={lbl}>Facility</label><input style={field} placeholder="e.g. Swimming pool" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></div>
        <div><label style={lbl}>Status</label><select style={field} value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as FacilityStatus })}><option value="open">Open</option><option value="closed">Closed</option><option value="limited">Limited hours</option></select></div>
      </div>
      {value.status !== "open" ? (
        <div style={grid("1fr 2fr")}>
          <div><label style={lbl}>{value.status === "closed" ? "Closed until (reopens the day after)" : "Until"}</label><input type="date" style={field} value={value.closedUntil ?? ""} onChange={(e) => set("closedUntil", e.target.value)} /></div>
          <div><label style={lbl}>Reason the guest can be told</label><input style={field} placeholder="e.g. maintenance, private event" value={value.closureNote ?? ""} onChange={(e) => set("closureNote", e.target.value)} /></div>
        </div>
      ) : null}
      <div style={grid("1fr 1fr 1fr 1fr")}>
        <div><label style={lbl}>{value.status === "limited" ? "Opens today" : "Opens"}</label><input type="time" style={field} value={value.openTime ?? ""} onChange={(e) => set("openTime", e.target.value)} /></div>
        <div><label style={lbl}>{value.status === "limited" ? "Closes today" : "Closes"}</label><input type="time" style={field} value={value.closeTime ?? ""} onChange={(e) => set("closeTime", e.target.value)} /></div>
        <div><label style={lbl}>Weekend opens</label><input type="time" style={field} value={value.weekendOpenTime ?? ""} onChange={(e) => set("weekendOpenTime", e.target.value)} /></div>
        <div><label style={lbl}>Weekend closes</label><input type="time" style={field} value={value.weekendCloseTime ?? ""} onChange={(e) => set("weekendCloseTime", e.target.value)} /></div>
      </div>
      <div style={grid("1fr 1fr")}>
        <div><label style={lbl}>Where</label><input style={field} placeholder="e.g. Rooftop, 2nd floor" value={value.location ?? ""} onChange={(e) => set("location", e.target.value)} /></div>
        <div><label style={lbl}>Price</label><input style={field} placeholder="e.g. Free for guests, Rs 500 per session" value={value.price ?? ""} onChange={(e) => set("price", e.target.value)} /></div>
      </div>
      <div><label style={lbl}>Anything else Aria should say</label><input style={field} placeholder="e.g. towels provided, children under 12 with an adult" value={value.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={saving || !value.name.trim()} style={{ ...btn(GREEN, "#fff"), opacity: saving || !value.name.trim() ? 0.6 : 1 }}>{saveLabel}</button>
        <button onClick={onCancel} style={btn("#F5F1E8", INK, "#E9E4D8")}>Cancel</button>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const isMobile = useIsMobile();
  const [list, setList] = useState<Facility[]>([]);
  const [draft, setDraft] = useState<FacilityDraft>(empty);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [closeUntil, setCloseUntil] = useState(today());
  const [closeNote, setCloseNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500); };
  const load = useCallback(async () => { if (HOTEL_ID) setList(await getFacilities(HOTEL_ID)); }, [HOTEL_ID]);
  useEffect(() => { void load(); }, [load]);

  async function doAdd() { setSaving(true); const r = await addFacility(HOTEL_ID!, draft); setSaving(false); if (r.ok) { flash(draft.name + " added - Aria knows from the next message"); setDraft(empty); setShowAdd(false); void load(); } else flash(r.message ?? "Could not save"); }
  async function doPatch(f: Facility, patch: Partial<FacilityDraft> & { active?: boolean }, note: string) { setSaving(true); const r = await updateFacility(HOTEL_ID!, f.id, patch); setSaving(false); if (r.ok) { flash(note); setEditing(null); setClosing(null); void load(); } else flash(r.message ?? "Could not save"); }
  async function doDelete(f: Facility) { if (!confirm("Remove " + f.name + "? Aria will no longer know about it.")) return; const r = await deleteFacility(HOTEL_ID!, f.id); if (r.ok) { flash(f.name + " removed"); void load(); } else flash(r.message ?? "Could not remove"); }
  const hours = (f: Facility) => (f.openTime && f.closeTime ? f.openTime + "-" + f.closeTime + (f.weekendOpenTime && f.weekendCloseTime ? " (weekends " + f.weekendOpenTime + "-" + f.weekendCloseTime + ")" : "") : "hours not set");

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK }}>Facilities</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>What is open, closed or on limited hours at {hotelName || "your hotel"}. Aria reads this on every message - a change here takes effect on the very next reply, and a closed facility is never suggested or booked.</div>
          </div>
          <button onClick={() => { setShowAdd((v) => !v); setDraft(empty); setEditing(null); }} style={btn(GREEN, "#fff")}>{showAdd ? "Close" : "+ Add a facility"}</button>
        </div>
        {toast ? <div style={{ ...card, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: GREEN, borderColor: GREEN + "55" }}>{toast}</div> : null}
        {showAdd ? (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK, marginBottom: 12 }}>New facility</div>
            <Form value={draft} onChange={setDraft} onSave={doAdd} onCancel={() => setShowAdd(false)} saving={saving} saveLabel="Save facility" />
          </div>
        ) : null}
        {!list.length && !showAdd ? (
          <div style={{ ...card, color: MUTED, fontSize: 13 }}>No facilities yet. Add the pool, gym, spa, restaurant and parking once - then closing one for a day is two clicks, and Aria stops offering it immediately.</div>
        ) : null}
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((f) => (
            <div key={f.id} style={{ ...card, opacity: f.active ? 1 : 0.6 }}>
              {editing === f.id ? (
                <Form value={draft} onChange={setDraft} onSave={() => doPatch(f, draft, f.name + " updated")} onCancel={() => setEditing(null)} saving={saving} saveLabel="Save changes" />
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: INK }}>{f.name}</span>
                      <StatusPill f={f} />
                      {!f.active ? <span style={{ fontSize: 11, color: MUTED }}>hidden from Aria</span> : null}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {f.status !== "open" ? <button onClick={() => doPatch(f, { status: "open", closedUntil: null, closureNote: null }, f.name + " is open again")} style={btn(GREEN, "#fff")}>Reopen</button> : null}
                      {f.status === "open" ? <button onClick={() => doPatch(f, { status: "closed", closedUntil: today(), closureNote: f.closureNote }, f.name + " closed for today")} style={btn(RED, "#fff")}>Close today</button> : null}
                      <button onClick={() => { setClosing(closing === f.id ? null : f.id); setCloseUntil(f.closedUntil ?? today()); setCloseNote(f.closureNote ?? ""); }} style={btn("#FBEDE9", RED, "#F1C9C2")}>Close until...</button>
                      <button onClick={() => { setEditing(f.id); setDraft({ name: f.name, status: f.status, closedUntil: f.closedUntil, closureNote: f.closureNote, openTime: f.openTime, closeTime: f.closeTime, weekendOpenTime: f.weekendOpenTime, weekendCloseTime: f.weekendCloseTime, location: f.location, price: f.price, notes: f.notes }); setShowAdd(false); }} style={btn("#F5F1E8", INK, "#E9E4D8")}>Edit</button>
                      <button onClick={() => doPatch(f, { active: !f.active }, f.active ? f.name + " hidden from Aria" : f.name + " visible to Aria again")} style={btn("#F5F1E8", INK, "#E9E4D8")}>{f.active ? "Hide" : "Show"}</button>
                      <button onClick={() => doDelete(f)} style={btn("#fff", RED, "#F1C9C2")}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
                    {hours(f)}{f.location ? " - " + f.location : ""}{f.price ? " - " + f.price : ""}{f.closureNote && f.status !== "open" ? " - " + f.closureNote : ""}{f.notes ? " - " + f.notes : ""}
                    {f.updatedBy ? <span style={{ marginLeft: 8, fontSize: 11 }}>(last changed by {f.updatedBy})</span> : null}
                  </div>
                  {closing === f.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
                      <div><label style={lbl}>Closed until</label><input type="date" style={{ ...field, width: 170 }} value={closeUntil} onChange={(e) => setCloseUntil(e.target.value)} /></div>
                      <div style={{ flex: 1, minWidth: 180 }}><label style={lbl}>Reason the guest can be told</label><input style={field} placeholder="e.g. maintenance" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} /></div>
                      <button onClick={() => doPatch(f, { status: "closed", closedUntil: closeUntil, closureNote: closeNote || null }, f.name + " closed until " + closeUntil)} style={btn(RED, "#fff")}>Close it</button>
                      <button onClick={() => setClosing(null)} style={btn("#F5F1E8", INK, "#E9E4D8")}>Cancel</button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
