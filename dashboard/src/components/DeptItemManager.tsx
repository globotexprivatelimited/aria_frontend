"use client";
import { useEffect, useState, useCallback } from "react";
import { getDeptItems, createDeptItem, updateDeptItem, deleteDeptItem, type DeptItem } from "../app/gm/departments/deptitem-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";
const rupee = "\u20B9";

// which "kinds" each department offers
const DEPT_KINDS: Record<string, { kind: string; label: string; hasStock: boolean; hasPrice: boolean; hasDuration: boolean }[]> = {
  housekeeping: [
    { kind: "service", label: "Services", hasStock: false, hasPrice: true, hasDuration: false },
    { kind: "amenity", label: "Amenities & Supplies", hasStock: true, hasPrice: false, hasDuration: false },
  ],
  spa: [
    { kind: "treatment", label: "Treatments", hasStock: false, hasPrice: true, hasDuration: true },
  ],
  front_desk: [
    { kind: "service", label: "Services", hasStock: false, hasPrice: true, hasDuration: false },
  ],
};

export default function DeptItemManager({ hotelId, dept, deptLabel }: { hotelId: string; dept: string; deptLabel: string }) {
  const kinds = DEPT_KINDS[dept] ?? DEPT_KINDS.front_desk;
  const [items, setItems] = useState<DeptItem[]>([]);
  const [activeKind, setActiveKind] = useState(kinds[0].kind);
  const [toast, setToast] = useState<string | null>(null);
  // new-item form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2000); };
  const load = useCallback(async () => { if (hotelId) setItems(await getDeptItems(hotelId, dept)); }, [hotelId, dept]);
  useEffect(() => { load(); }, [load]);

  const cfg = kinds.find((k) => k.kind === activeKind)!;
  const shown = items.filter((i) => i.kind === activeKind);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const r = await createDeptItem(hotelId, dept, {
      kind: activeKind, name: name.trim(), description: desc.trim() || undefined,
      price: cfg.hasPrice && price ? Number(price) : undefined,
      stock: cfg.hasStock && stock ? Number(stock) : undefined,
      duration_min: cfg.hasDuration && duration ? Number(duration) : undefined,
    });
    setBusy(false);
    if (r.ok) { setName(""); setDesc(""); setPrice(""); setStock(""); setDuration(""); flash("Added"); load(); } else flash(r.message ?? "failed");
  }
  async function toggle(it: DeptItem) { const r = await updateDeptItem(hotelId, it.id, { available: !it.available }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function adjustStock(it: DeptItem, delta: number) { const r = await updateDeptItem(hotelId, it.id, { stock: Math.max(0, (it.stock ?? 0) + delta) }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function del(it: DeptItem) { if (!confirm("Delete " + it.name + "?")) return; const r = await deleteDeptItem(hotelId, it.id); if (r.ok) { flash("Deleted"); load(); } else flash(r.message ?? "failed"); }

  const field = { borderRadius: 8, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "9px 11px", fontSize: 13, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {toast ? <div style={{ marginBottom: 12, borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{toast}</div> : null}

      {/* kind tabs (Services / Amenities) */}
      {kinds.length > 1 ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {kinds.map((k) => (
            <button key={k.kind} onClick={() => setActiveKind(k.kind)} style={{ borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid " + (activeKind === k.kind ? GREEN : "#E3DECF"), background: activeKind === k.kind ? "#EAF2ED" : "#fff", color: activeKind === k.kind ? GREEN : "#6E756F" }}>{k.label}</button>
          ))}
        </div>
      ) : null}

      {/* add form */}
      <div style={{ background: "#FBFAF5", borderRadius: 12, padding: 16, marginBottom: 18, border: "1px solid #F0ECE0" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginBottom: 10 }}>Add {cfg.label.replace(/s$/, "").toLowerCase()}</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr", gap: 10, marginBottom: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={field} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" style={field} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {cfg.hasPrice ? <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder={rupee + " Price (optional)"} style={{ ...field, width: 150 }} /> : null}
          {cfg.hasStock ? <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock qty" style={{ ...field, width: 120 }} /> : null}
          {cfg.hasDuration ? <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" placeholder="Duration (min)" style={{ ...field, width: 140 }} /> : null}
          <button onClick={add} disabled={busy || !name.trim()} style={{ marginLeft: "auto", borderRadius: 9, padding: "9px 20px", fontSize: 13, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !name.trim() ? 0.6 : 1 }}>{busy ? "Adding..." : "Add"}</button>
        </div>
      </div>

      {/* item list */}
      {shown.length === 0 ? (
        <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No {cfg.label.toLowerCase()} yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shown.map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", border: "1px solid #EEE", borderRadius: 10, opacity: it.available ? 1 : 0.55 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>{it.name}
                  {it.duration_min ? <span style={{ fontSize: 11, color: GOLD, marginLeft: 8 }}>{it.duration_min} min</span> : null}
                </div>
                {it.description ? <div style={{ fontSize: 11.5, color: "#8A8577", marginTop: 1 }}>{it.description}</div> : null}
              </div>
              {it.price != null ? <span style={{ fontSize: 14, fontWeight: 600, color: INK, fontFamily: "Georgia, serif" }}>{rupee}{it.price}{it.unit ? <span style={{ fontSize: 10, color: "#B4B9B3" }}> {it.unit}</span> : null}</span> : null}
              {cfg.hasStock ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => adjustStock(it, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E3DECF", background: "#fff", cursor: "pointer", color: "#8A8577" }}>&minus;</button>
                  <span style={{ minWidth: 34, textAlign: "center", fontSize: 13, fontWeight: 600, color: (it.stock ?? 0) < 5 ? RED : INK }}>{it.stock ?? 0}</span>
                  <button onClick={() => adjustStock(it, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E3DECF", background: "#fff", cursor: "pointer", color: "#8A8577" }}>+</button>
                </div>
              ) : null}
              <button onClick={() => toggle(it)} title={it.available ? "Hide from guests" : "Show to guests"} style={{ borderRadius: 999, padding: "4px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (it.available ? "#CFE5DC" : "#E3DECF"), background: it.available ? "#EAF2ED" : "#F5F5F0", color: it.available ? GREEN : "#8A8577" }}>{it.available ? "Active" : "Hidden"}</button>
              <button onClick={() => del(it)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #EED7D0", background: "#FBEDE9", cursor: "pointer", color: RED, fontSize: 15 }}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}