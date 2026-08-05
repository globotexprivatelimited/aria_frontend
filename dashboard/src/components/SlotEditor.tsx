"use client";

import { useEffect, useState, useCallback } from "react";
import { getSlots, addSlot, patchSlot, deleteSlot, type Slot } from "../app/gm/departments/slot-actions";

export default function SlotEditor({ hotelId, dept, deptLabel }: { hotelId: string; dept: string; deptLabel: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const load = useCallback(async () => {
    const res = await getSlots(hotelId, dept);
    setSlots(res.slots); setLoading(false);
  }, [hotelId, dept]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!startTime.trim()) { flash("Enter a start time."); return; }
    setBusy(true);
    const res = await addSlot(hotelId, dept, { label: label.trim() || startTime.trim(), start_time: startTime.trim(), capacity: parseInt(capacity) || 1, sort_order: slots.length });
    setBusy(false);
    if (!res.ok) { flash("Could not add: " + (res.message ?? "")); return; }
    setLabel(""); setStartTime(""); setCapacity(""); flash("Slot added"); load();
  }
  async function patch(id: string, fields: Record<string, unknown>) { const res = await patchSlot(hotelId, id, fields); if (!res.ok) flash("Update failed"); else load(); }
  async function remove(id: string) { const res = await deleteSlot(hotelId, id); if (!res.ok) flash("Delete failed"); else { flash("Removed"); load(); } }

  const field = { borderRadius: 9, borderWidth: 1, borderStyle: "solid" as const, borderColor: "#E3DECF", background: "#FBFAF5", padding: "9px 11px", fontSize: 14, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {toast ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 500, background: "#EAF2ED", color: "#0F5F4C", border: "1px solid #CFE5DC" }}>{toast}</div> : null}
      <div style={{ background: "#F9F6EF", border: "1px solid #EDE7DA", borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#B08A4F", marginBottom: 10 }}>Add a time slot</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr auto", gap: 8, alignItems: "center" }}>
          <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="e.g. 10:00 AM" style={{ ...field, width: "100%" }} />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" style={{ ...field, width: "100%" }} />
          <input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Capacity" inputMode="numeric" style={{ ...field, width: "100%" }} />
          <button onClick={add} disabled={busy} style={{ borderRadius: 9, padding: "9px 16px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer", whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}>Add</button>
        </div>
      </div>
      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#A8A395", fontSize: 14 }}>Loading slots...</div>
      ) : slots.length === 0 ? (
        <div style={{ borderRadius: 12, padding: 32, textAlign: "center", border: "1px dashed #D9D3C3", background: "#FBF9F3", color: "#A8A395", fontSize: 14 }}>No time slots yet. Add {deptLabel} availability above.</div>
      ) : (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {slots.map((s) => (
            <div key={s.id} style={{ border: "1px solid " + (s.active ? "#EBE6D9" : "#E9E2D2"), borderRadius: 12, padding: 14, background: s.active ? "#fff" : "#FBFAF7" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>{s.start_time}</div>
                  {s.label && s.label !== s.start_time ? <div style={{ fontSize: 12, color: "#6E756F", marginTop: 3 }}>{s.label}</div> : null}
                </div>
                <button onClick={() => remove(s.id)} aria-label="Delete" style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #EED7D0", background: "#fff", cursor: "pointer", color: "#C0563E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6E756F" }}>
                  <button onClick={() => patch(s.id, { capacity: Math.max(1, s.capacity - 1) })} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #DED8C8", background: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, color: "#6E756F" }}>&minus;</button>
                  <span style={{ fontWeight: 600, color: "#1B2621" }}>{s.capacity}</span> seat{s.capacity === 1 ? "" : "s"}
                  <button onClick={() => patch(s.id, { capacity: s.capacity + 1 })} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #DED8C8", background: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, color: "#6E756F" }}>+</button>
                </span>
                <button onClick={() => patch(s.id, { active: !s.active })} style={{ borderRadius: 999, padding: "3px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (s.active ? "#CFE5DC" : "#E5D6BD"), background: s.active ? "#EAF2ED" : "#F6EEDD", color: s.active ? "#0F5F4C" : "#96733C" }}>{s.active ? "Open" : "Closed"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}