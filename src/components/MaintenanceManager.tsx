"use client";
import { useEffect, useState, useCallback } from "react";
import { getDeptItems, createDeptItem, updateDeptItem, deleteDeptItem, type DeptItem } from "../app/gm/departments/deptitem-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";

const CATEGORIES = ["Electrical", "Plumbing", "HVAC / Cooling", "Carpentry", "Appliance", "Networking", "General"];
const URGENCY = [
  { key: "routine", label: "Routine", color: "#5B7C6B", bg: "#EDF3EF", hint: "Within a day or two" },
  { key: "same_day", label: "Same day", color: GOLD, bg: "#F7F1E4", hint: "Handled today" },
  { key: "emergency", label: "Emergency", color: RED, bg: "#FBEDE9", hint: "Immediate response" },
];
const urgencyOf = (k: string | null) => URGENCY.find((u) => u.key === k) ?? URGENCY[0];

export default function MaintenanceManager({ hotelId, dept, deptLabel }: { hotelId: string; dept: string; deptLabel: string }) {
  const [items, setItems] = useState<DeptItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [urgency, setUrgency] = useState("routine");
  const [responseMin, setResponseMin] = useState("");
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const load = useCallback(async () => { if (hotelId) setItems(await getDeptItems(hotelId, dept)); }, [hotelId, dept]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const r = await createDeptItem(hotelId, dept, {
      kind: "service", name: name.trim(), description: desc.trim() || undefined,
      category, urgency,
      duration_min: responseMin ? Number(responseMin) : undefined,
    });
    setBusy(false);
    if (r.ok) { setName(""); setDesc(""); setResponseMin(""); flash("Service added"); load(); } else flash(r.message ?? "failed");
  }
  async function toggle(it: DeptItem) { const r = await updateDeptItem(hotelId, it.id, { available: !it.available }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function bumpUrgency(it: DeptItem, key: string) { const r = await updateDeptItem(hotelId, it.id, { urgency: key }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function del(it: DeptItem) { if (!confirm("Remove " + it.name + "?")) return; const r = await deleteDeptItem(hotelId, it.id); if (r.ok) { flash("Removed"); load(); } else flash(r.message ?? "failed"); }

  const field = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const, width: "100%", color: INK };
  const lbl = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 6, display: "block" };

  // group services by category
  const grouped = CATEGORIES.map((cat) => ({ cat, list: items.filter((i) => (i.category ?? "General") === cat) })).filter((g) => g.list.length > 0);
  const uncategorised = items.filter((i) => !CATEGORIES.includes(i.category ?? "General"));

  return (
    <div>
      {toast ? <div style={{ marginBottom: 14, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{toast}</div> : null}

      <div style={{ background: "#FBFAF5", borderRadius: 13, padding: 18, marginBottom: 20, border: "1px solid #F0ECE0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".06em" }}>Add a maintenance service</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: 12, marginBottom: 12 }}>
          <div><label style={lbl}>Service</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Air-conditioner repair" style={field} /></div>
          <div><label style={lbl}>Description</label><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What this covers (optional)" style={field} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={lbl}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...field, cursor: "pointer" }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Urgency</label>
            <div style={{ display: "flex", gap: 6 }}>
              {URGENCY.map((u) => (
                <button key={u.key} type="button" onClick={() => setUrgency(u.key)} title={u.hint}
                  style={{ flex: 1, borderRadius: 8, padding: "9px 4px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                    border: "1px solid " + (urgency === u.key ? u.color : "#E3DECF"),
                    background: urgency === u.key ? u.bg : "#fff", color: urgency === u.key ? u.color : "#9AA09A" }}>{u.label}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Response (min)</label><input value={responseMin} onChange={(e) => setResponseMin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="optional" style={field} /></div>
          <button onClick={add} disabled={busy || !name.trim()} style={{ borderRadius: 9, padding: "11px 22px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !name.trim() ? 0.55 : 1, whiteSpace: "nowrap" }}>{busy ? "Adding..." : "Add service"}</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ color: "#B4B9B3", fontSize: 13.5, textAlign: "center", padding: "34px 0" }}>No maintenance services yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {grouped.map(({ cat, list }) => (
            <div key={cat}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: GOLD, marginBottom: 9 }}>{cat} <span style={{ color: "#C8CCC6", fontWeight: 500 }}>&middot; {list.length}</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {list.map((it) => {
                  const u = urgencyOf(it.urgency);
                  return (
                    <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: "#fff", border: "1px solid #EEE", borderLeft: "3px solid " + u.color, borderRadius: 10, opacity: it.available ? 1 : 0.5 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{it.name}
                          {it.duration_min ? <span style={{ fontSize: 11, color: "#8A8577", marginLeft: 9, fontWeight: 500 }}>responds in {it.duration_min} min</span> : null}
                        </div>
                        {it.description ? <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>{it.description}</div> : null}
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {URGENCY.map((x) => (
                          <button key={x.key} onClick={() => bumpUrgency(it, x.key)} title={"Set " + x.label}
                            style={{ borderRadius: 999, padding: "4px 9px", fontSize: 10.5, fontWeight: 600, cursor: "pointer",
                              border: "1px solid " + (it.urgency === x.key ? x.color : "#EDEAE1"),
                              background: it.urgency === x.key ? x.bg : "#fff", color: it.urgency === x.key ? x.color : "#B4B9B3" }}>{x.label}</button>
                        ))}
                      </div>
                      <button onClick={() => toggle(it)} style={{ borderRadius: 999, padding: "4px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (it.available ? "#CFE5DC" : "#E3DECF"), background: it.available ? "#EAF2ED" : "#F5F5F0", color: it.available ? GREEN : "#8A8577" }}>{it.available ? "Active" : "Paused"}</button>
                      <button onClick={() => del(it)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #EED7D0", background: "#FBEDE9", cursor: "pointer", color: RED, fontSize: 15, lineHeight: 1 }}>&times;</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {uncategorised.length > 0 ? <div style={{ fontSize: 12, color: "#B4B9B3" }}>{uncategorised.length} uncategorised item(s)</div> : null}
        </div>
      )}
    </div>
  );
}
