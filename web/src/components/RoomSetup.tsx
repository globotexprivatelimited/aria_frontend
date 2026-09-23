"use client";
import { useState } from "react";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";
const TYPES = ["Standard", "Deluxe", "Suite", "Executive", "Presidential"];

type FloorRow = { floor: number; count: number; type: string; prefix: string };

export default function RoomSetup({ onSave, existingCount, target }: { onSave: (floors: FloorRow[]) => Promise<void>; existingCount: number; target: number }) {
  const [floors, setFloors] = useState<FloorRow[]>([{ floor: 1, count: target > 0 ? Math.min(target, 10) : 10, type: "Standard", prefix: "1" }]);
  const [saving, setSaving] = useState(false);

  const addFloor = () => {
    const nextFloor = floors.length ? Math.max(...floors.map((f) => f.floor)) + 1 : 1;
    setFloors([...floors, { floor: nextFloor, count: 10, type: "Standard", prefix: String(nextFloor) }]);
  };
  const removeFloor = (i: number) => setFloors(floors.filter((_, idx) => idx !== i));
  const update = (i: number, key: keyof FloorRow, val: string | number) => {
    setFloors(floors.map((f, idx) => idx === i ? { ...f, [key]: val, ...(key === "floor" ? { prefix: String(val) } : {}) } : f));
  };

  const totalRooms = floors.reduce((s, f) => s + (Number(f.count) || 0), 0);
  const placed = existingCount + totalRooms;
  const remaining = target - existingCount - totalRooms;
  const preview = (f: FloorRow) => {
    const nums = [];
    for (let i = 1; i <= Math.min(3, f.count); i++) nums.push((f.prefix || String(f.floor)) + String(i).padStart(2, "0"));
    return nums.join(", ") + (f.count > 3 ? " ... " + (f.prefix || String(f.floor)) + String(f.count).padStart(2, "0") : "");
  };

  async function save() { setSaving(true); await onSave(floors); setSaving(false); }

  const field = { borderRadius: 8, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "8px 10px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" as const };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 4, display: "block" };
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 };

  // status of the placed-vs-target counter
  const matchColor = target === 0 ? INK : remaining === 0 ? GREEN : remaining < 0 ? RED : GOLD;
  const matchMsg = target === 0 ? "" : remaining === 0 ? "All rooms placed" : remaining > 0 ? remaining + " room" + (remaining === 1 ? "" : "s") + " left to place" : Math.abs(remaining) + " room" + (Math.abs(remaining) === 1 ? "" : "s") + " over your registered count";

  return (
    <div style={card}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: INK, margin: 0 }}>{existingCount > 0 ? "Add more rooms" : "Organize your rooms"}</h2>
        <p style={{ fontSize: 13, color: "#8A8577", marginTop: 4 }}>
          {target > 0
            ? "You registered " + target + " rooms for this hotel. Lay them out across your floors \u2014 ground floor first, then up. Only you know which floor has how many."
            : "Tell us how many floors your hotel has, and how many rooms are on each floor."}
        </p>
      </div>

      {/* target progress bar */}
      {target > 0 ? (
        <div style={{ background: "#FBFAF5", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #F0ECE0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: INK }}>Placing <b style={{ fontFamily: "Georgia, serif", fontSize: 17, color: matchColor }}>{placed}</b> of <b>{target}</b> registered rooms</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: matchColor }}>{matchMsg}</span>
          </div>
          <div style={{ height: 8, background: "#EDE8DA", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: Math.min(100, (placed / target) * 100) + "%", height: "100%", background: matchColor, borderRadius: 999, transition: "width .3s" }} />
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.3fr 1fr 1.4fr 0.4fr", gap: 10, padding: "0 4px 8px", borderBottom: "1px solid #F0F0EA", marginBottom: 10 }}>
        <span style={lbl}>Floor</span><span style={lbl}>Rooms</span><span style={lbl}>Type</span><span style={lbl}>Room prefix</span><span style={lbl}>Preview</span><span></span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {floors.map((f, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.3fr 1fr 1.4fr 0.4fr", gap: 10, alignItems: "center" }}>
            <input type="number" value={f.floor} onChange={(e) => update(i, "floor", parseInt(e.target.value) || 1)} style={field} />
            <input type="number" value={f.count} onChange={(e) => update(i, "count", parseInt(e.target.value) || 0)} style={field} />
            <select value={f.type} onChange={(e) => update(i, "type", e.target.value)} style={{ ...field, cursor: "pointer" }}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <input value={f.prefix} onChange={(e) => update(i, "prefix", e.target.value)} placeholder={String(f.floor)} style={field} />
            <span style={{ fontSize: 12, color: "#8A8577", fontFamily: "monospace" }}>{preview(f)}</span>
            <button onClick={() => removeFloor(i)} disabled={floors.length === 1} aria-label="Remove floor" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #EED7D0", background: floors.length === 1 ? "#F5F5F0" : "#fff", cursor: floors.length === 1 ? "not-allowed" : "pointer", color: floors.length === 1 ? "#CCC" : "#C0563E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>&times;</button>
          </div>
        ))}
      </div>

      <button onClick={addFloor} style={{ marginTop: 12, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: GREEN, background: "#EAF2ED", border: "1px solid #CFE5DC", cursor: "pointer" }}>+ Add another floor</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: "1px solid #F0F0EA" }}>
        <div style={{ fontSize: 14, color: INK }}>
          Creating <b style={{ fontFamily: "Georgia, serif", fontSize: 20, color: GREEN }}>{totalRooms}</b> rooms across <b>{floors.length}</b> floor{floors.length === 1 ? "" : "s"}
        </div>
        <button onClick={save} disabled={saving || totalRooms === 0} style={{ borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: saving || totalRooms === 0 ? 0.6 : 1 }}>{saving ? "Creating rooms..." : "Create " + totalRooms + " rooms"}</button>
      </div>
    </div>
  );
}