"use client";

import { useEffect, useState, useCallback } from "react";
import { getMenu, addMenuItem, patchMenuItem, deleteMenuItem, type MenuItem , setAvailability } from "../app/gm/departments/menu-actions";

const KINDS = [
  { v: "food", label: "Food" }, { v: "beverage", label: "Beverage" },
  { v: "alcohol", label: "Alcohol" }, { v: "dessert", label: "Dessert" },
];
const DIETS = [
  { v: "veg", label: "Veg", color: "#0F5F4C", bg: "#EAF2ED", dot: "#1F8A4C" },
  { v: "non_veg", label: "Non-veg", color: "#B23A2A", bg: "#FBEDE9", dot: "#C0392B" },
  { v: "vegan", label: "Vegan", color: "#3B7A4E", bg: "#EBF4EE", dot: "#2E7D46" },
  { v: "egg", label: "Egg", color: "#96733C", bg: "#F7F0E0", dot: "#C99A3A" },
  { v: "na", label: "N/A", color: "#8A8577", bg: "#F1EFE9", dot: "#B0AB9D" },
];
const SPICES = [{ v: "none", label: "None" }, { v: "mild", label: "Mild" }, { v: "medium", label: "Medium" }, { v: "hot", label: "Hot" }];
const PORTIONS = [{ v: "single", label: "Single" }, { v: "sharing", label: "Sharing" }];
const rupee = "\u20B9";

const BLANK = {
  name: "", category: "", kind: "food", diet: "veg", price: "", stock: "", spice: "none",
  prep: "", from: "", to: "", lowAt: "3", image: "", desc: "", allergens: "",
  serving: "", calories: "", portion: "single", tax: "", isJain: false, isHalal: false,
  glutenFree: false, ageRestricted: false, isSignature: false, isBestseller: false,
};

// veg/non-veg dot indicator like real Indian menus (square with a filled circle)
function DietDot({ diet }: { diet: string | null }) {
  const d = DIETS.find((x) => x.v === diet) ?? DIETS[4];
  return (
    <span title={d.label} style={{ display: "inline-flex", width: 14, height: 14, border: "1.5px solid " + d.dot, borderRadius: 3, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: d.dot }} />
    </span>
  );
}

export default function MenuEditor({ hotelId, dept, deptLabel }: { hotelId: string; dept: string; deptLabel: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<typeof BLANK>({ ...BLANK });

  const set = (k: keyof typeof BLANK, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  async function toggleAvail(id: string, next: boolean) { await setAvailability(hotelId, id, next); await load(); }

  const load = useCallback(async () => {
    const res = await getMenu(hotelId, dept);
    setItems(res.items);
    setLoading(false);
  }, [hotelId, dept]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!f.name.trim()) { flash("Enter an item name."); return; }
    setBusy(true);
    const isAlc = f.kind === "alcohol";
    const res = await addMenuItem(hotelId, dept, {
      name: f.name.trim(), category: f.category.trim() || null, kind: f.kind, diet: f.diet,
      price: parseFloat(f.price) || 0, stock: parseInt(f.stock) || 0, sort_order: items.length,
      spice: f.spice, prep_mins: parseInt(f.prep) || 0,
      available_from: f.from.trim() || null, available_to: f.to.trim() || null,
      low_stock_at: parseInt(f.lowAt) || 3, image_url: f.image.trim() || null, description: f.desc.trim() || null,
      allergens: f.allergens.trim() || null, serving_size: f.serving.trim() || null,
      calories: f.calories ? parseInt(f.calories) : null, portion: f.portion, tax_pct: parseFloat(f.tax) || 0,
      is_jain: f.isJain, is_halal: f.isHalal, gluten_free: f.glutenFree,
      is_alcoholic: isAlc, age_restricted: isAlc || f.ageRestricted,
      is_signature: f.isSignature, is_bestseller: f.isBestseller,
    });
    setBusy(false);
    if (!res.ok) { flash("Could not add: " + (res.message ?? "")); return; }
    setF({ ...BLANK }); flash(f.name.trim() + " added"); load();
  }
  async function patch(id: string, fields: Record<string, unknown>) {
    const res = await patchMenuItem(hotelId, id, fields);
    if (!res.ok) flash("Update failed"); else load();
  }
  async function remove(id: string) {
    const res = await deleteMenuItem(hotelId, id);
    if (!res.ok) flash("Delete failed"); else { flash("Removed"); load(); }
  }

  const field = { borderRadius: 9, borderWidth: 1, borderStyle: "solid" as const, borderColor: "#E3DECF", background: "#FBFAF5", padding: "9px 11px", fontSize: 14, outline: "none", boxSizing: "border-box" as const, width: "100%" };
  const lbl = { fontSize: 11, fontWeight: 600 as const, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#8A8577", marginBottom: 5, display: "block" };
  const Chk = ({ k, label }: { k: keyof typeof BLANK; label: string }) => (
    <button type="button" onClick={() => set(k, !f[k])} style={{ display: "flex", alignItems: "center", gap: 7, borderRadius: 9, padding: "9px 11px", cursor: "pointer", border: "1.5px solid " + (f[k] ? "#0F5F4C" : "#E3DECF"), background: f[k] ? "#F1F6F2" : "#FBFAF5", fontSize: 13, color: "#1B2621", width: "100%" }}>
      <span style={{ width: 16, height: 16, borderRadius: 5, border: "1.5px solid " + (f[k] ? "#0F5F4C" : "#CFCFC7"), background: f[k] ? "#0F5F4C" : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{f[k] ? "\u2713" : ""}</span>
      {label}
    </button>
  );

  // FIX: group items into a Map by category so same-category items always cluster (no duplicate headers)
  const grouped = new Map<string, MenuItem[]>();
  for (const it of items) {
    const c = (it.category && it.category.trim()) || "Other";
    if (!grouped.has(c)) grouped.set(c, []);
    grouped.get(c)!.push(it);
  }
  const catNames = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      {toast ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 500, background: "#EAF2ED", color: "#0F5F4C", border: "1px solid #CFE5DC" }}>{toast}</div> : null}

      {/* ADD FORM - diet is now in the quick row */}
      <div style={{ background: "#F9F6EF", border: "1px solid #EDE7DA", borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#B08A4F", marginBottom: 12 }}>Add a menu item</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1.1fr 0.8fr 0.8fr", gap: 10, marginBottom: 10 }}>
          <div><label style={lbl}>Name</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chicken Tikka" style={field} /></div>
          <div><label style={lbl}>Type</label><select value={f.kind} onChange={(e) => set("kind", e.target.value)} style={{ ...field, cursor: "pointer" }}>{KINDS.map((k) => <option key={k.v} value={k.v}>{k.label}</option>)}</select></div>
          <div><label style={lbl}>Diet</label><select value={f.diet} onChange={(e) => set("diet", e.target.value)} style={{ ...field, cursor: "pointer" }}>{DIETS.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}</select></div>
          <div><label style={lbl}>Category</label><input value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Starters" style={field} /></div>
          <div><label style={lbl}>Price ({rupee})</label><input value={f.price} onChange={(e) => set("price", e.target.value)} inputMode="decimal" placeholder="0" style={field} /></div>
          <div><label style={lbl}>Stock</label><input value={f.stock} onChange={(e) => set("stock", e.target.value)} inputMode="numeric" placeholder="0" style={field} /></div>
        </div>

        {expanded ? (
          <div style={{ borderTop: "1px solid #EDE7DA", marginTop: 6, paddingTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div><label style={lbl}>Spice</label><select value={f.spice} onChange={(e) => set("spice", e.target.value)} style={{ ...field, cursor: "pointer" }}>{SPICES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}</select></div>
              <div><label style={lbl}>Portion</label><select value={f.portion} onChange={(e) => set("portion", e.target.value)} style={{ ...field, cursor: "pointer" }}>{PORTIONS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}</select></div>
              <div><label style={lbl}>Prep (min)</label><input value={f.prep} onChange={(e) => set("prep", e.target.value)} inputMode="numeric" placeholder="15" style={field} /></div>
              <div><label style={lbl}>Serving size</label><input value={f.serving} onChange={(e) => set("serving", e.target.value)} placeholder="250 ml / 2 pcs" style={field} /></div>
              <div><label style={lbl}>Calories</label><input value={f.calories} onChange={(e) => set("calories", e.target.value)} inputMode="numeric" placeholder="kcal" style={field} /></div>
              <div><label style={lbl}>Tax %</label><input value={f.tax} onChange={(e) => set("tax", e.target.value)} inputMode="decimal" placeholder="5" style={field} /></div>
              <div><label style={lbl}>Low-stock at</label><input value={f.lowAt} onChange={(e) => set("lowAt", e.target.value)} inputMode="numeric" placeholder="3" style={field} /></div>
              <div><label style={lbl}>Available window</label><div style={{ display: "flex", gap: 6 }}><input value={f.from} onChange={(e) => set("from", e.target.value)} placeholder="07:00" style={{ ...field }} /><input value={f.to} onChange={(e) => set("to", e.target.value)} placeholder="11:00" style={{ ...field }} /></div></div>
              <div style={{ gridColumn: "span 2" }}><label style={lbl}>Allergens</label><input value={f.allergens} onChange={(e) => set("allergens", e.target.value)} placeholder="nuts, dairy, gluten" style={field} /></div>
              <div style={{ gridColumn: "span 2" }}><label style={lbl}>Image URL</label><input value={f.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." style={field} /></div>
              <div style={{ gridColumn: "span 4" }}><label style={lbl}>Description (shown to guests)</label><input value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Tender chicken marinated in yogurt & spices, grilled in the tandoor" style={field} /></div>
            </div>
            <label style={lbl}>Dietary &amp; flags</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              <Chk k="isJain" label="Jain" /><Chk k="isHalal" label="Halal" /><Chk k="glutenFree" label="Gluten-free" />
              <Chk k="isSignature" label="Signature" /><Chk k="isBestseller" label="Bestseller" /><Chk k="ageRestricted" label="Age 18+" />
            </div>
            {f.kind === "alcohol" ? <div style={{ fontSize: 12, color: "#96733C", marginTop: 8 }}>Alcohol items are automatically age-restricted (18+).</div> : null}
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <button onClick={add} disabled={busy} style={{ borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>Add item</button>
          <button onClick={() => setExpanded((v) => !v)} style={{ fontSize: 13, color: "#96733C", background: "transparent", border: 0, cursor: "pointer", fontWeight: 500 }}>{expanded ? "Fewer options" : "All details (spice, allergens, nutrition, timing, flags)"}</button>
        </div>
      </div>

      {/* ITEMS grouped correctly */}
      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: "#A8A395", fontSize: 14 }}>Loading menu...</div>
      ) : items.length === 0 ? (
        <div style={{ borderRadius: 12, padding: 32, textAlign: "center", border: "1px dashed #D9D3C3", background: "#FBF9F3", color: "#A8A395", fontSize: 14 }}>No items yet. Add your first {deptLabel} item above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {catNames.map((cat) => (
            <div key={cat}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#B08A4F" }}>{cat}</span>
                <span style={{ fontSize: 11, color: "#C7C2B4" }}>{grouped.get(cat)!.length} item{grouped.get(cat)!.length === 1 ? "" : "s"}</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#E4DBC7,transparent)" }} />
              </div>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {grouped.get(cat)!.map((it) => {
                  const dcfg = DIETS.find((x) => x.v === it.diet) ?? DIETS[4];
                  const low = it.stock <= it.low_stock_at && it.stock > 0;
                  const out = it.stock === 0;
                  return (
                    <div key={it.id} style={{ display: "flex", gap: 12, border: "1px solid " + (out ? "#E7C4BB" : it.available ? "#EBE6D9" : "#E9E2D2"), borderRadius: 12, padding: 12, background: it.available && !out ? "#fff" : "#FBFAF7" }}>
                      {it.image_url ? <img src={it.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 9, objectFit: "cover", flexShrink: 0 }} /> : null}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                            <DietDot diet={it.diet} />
                            <span style={{ fontWeight: 600, color: "#1B2621", fontSize: 14 }}>{it.name}</span>
                            {it.is_signature ? <span style={{ borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 600, background: "#F6EEDD", color: "#96733C" }}>Signature</span> : null}
                            {it.is_bestseller ? <span style={{ borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 600, background: "#EAF1F7", color: "#3A6EA5" }}>Bestseller</span> : null}
                            {it.age_restricted ? <span style={{ borderRadius: 5, padding: "1px 7px", fontSize: 10, fontWeight: 600, background: "#FBEDE9", color: "#B23A2A" }}>18+</span> : null}
                          </div>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#1B2621", whiteSpace: "nowrap" }}>{rupee}{Number(it.price).toFixed(0)}</span>
                        </div>
                        {it.description ? <div style={{ fontSize: 12, color: "#8A8577", marginTop: 3, lineHeight: 1.4 }}>{it.description}</div> : null}
                        <div style={{ fontSize: 11, color: "#A8A395", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ color: dcfg.color, fontWeight: 600 }}>{dcfg.label}</span>
                          {it.kind && it.kind !== "food" ? <span style={{ textTransform: "capitalize" }}>{it.kind}</span> : null}
                          {it.portion === "sharing" ? <span>Sharing</span> : null}
                          {it.serving_size ? <span>{it.serving_size}</span> : null}
                          {it.calories ? <span>{it.calories} kcal</span> : null}
                          {it.prep_mins > 0 ? <span>{it.prep_mins} min</span> : null}
                          {it.spice && it.spice !== "none" ? <span style={{ color: "#C0563E", textTransform: "capitalize" }}>{it.spice}</span> : null}
                          {it.available_from && it.available_to ? <span>{it.available_from}&ndash;{it.available_to}</span> : null}
                          {it.tax_pct > 0 ? <span>+{Number(it.tax_pct)}% tax</span> : null}
                        </div>
                        {(it.allergens || it.is_jain || it.is_halal || it.gluten_free) ? (
                          <div style={{ fontSize: 10, marginTop: 5, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {it.is_jain ? <span style={{ background: "#F1F6F2", color: "#0F5F4C", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>Jain</span> : null}
                            {it.is_halal ? <span style={{ background: "#F1F6F2", color: "#0F5F4C", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>Halal</span> : null}
                            {it.gluten_free ? <span style={{ background: "#F1F6F2", color: "#0F5F4C", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>Gluten-free</span> : null}
                            {it.allergens ? <span style={{ color: "#B23A2A" }}>Contains: {it.allergens}</span> : null}
                          </div>
                        ) : null}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button onClick={() => patch(it.id, { stock: Math.max(0, it.stock - 1) })} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #DED8C8", background: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1, color: "#6E756F" }}>&minus;</button>
                            <span style={{ minWidth: 26, textAlign: "center", fontWeight: 600, fontSize: 13, color: out ? "#C0563E" : low ? "#96733C" : "#1B2621" }}>{it.stock}</span>
                            <button onClick={() => patch(it.id, { stock: it.stock + 1 })} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #DED8C8", background: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1, color: "#6E756F" }}>+</button>
                            {out ? <span style={{ fontSize: 10, fontWeight: 600, color: "#C0563E", marginLeft: 2 }}>OUT</span> : low ? <span style={{ fontSize: 10, fontWeight: 600, color: "#96733C", marginLeft: 2 }}>LOW</span> : null}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => patch(it.id, { available: !it.available })} style={{ borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (it.available ? "#CFE5DC" : "#E5D6BD"), background: it.available ? "#EAF2ED" : "#F6EEDD", color: it.available ? "#0F5F4C" : "#96733C" }}>{it.available ? "On" : "Off"}</button>
                            <button onClick={() => remove(it.id)} aria-label="Delete" style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #EED7D0", background: "#fff", cursor: "pointer", color: "#C0563E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}