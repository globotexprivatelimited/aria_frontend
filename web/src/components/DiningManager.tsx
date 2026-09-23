"use client";
import { useEffect, useState, useCallback } from "react";
import { getDeptItems, createDeptItem, updateDeptItem, deleteDeptItem, type DeptItem } from "../app/gm/departments/deptitem-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";
const rupee = "\u20B9";

const TABS = [
  { kind: "table", label: "Tables & Seating" },
  { kind: "sitting", label: "Service Sittings" },
  { kind: "menu", label: "Restaurant Menu" },
];
const LOCATIONS = ["Indoor", "Terrace", "Poolside", "Private Room", "Garden"];
const MENU_CATS = ["Starters", "Mains", "Desserts", "Beverages", "Specials"];
const DIETS = [
  { key: "veg", label: "Veg", color: "#0F7A3D", ring: "#0F7A3D" },
  { key: "non_veg", label: "Non-veg", color: "#B23A2A", ring: "#B23A2A" },
  { key: "egg", label: "Egg", color: "#B08A4F", ring: "#B08A4F" },
  { key: "vegan", label: "Vegan", color: "#2E7D5B", ring: "#2E7D5B" },
];
const SPICES = [
  { key: "mild", label: "Mild" },
  { key: "medium", label: "Medium" },
  { key: "hot", label: "Hot" },
];
const dietOf = (k: string | null) => DIETS.find((d) => d.key === k) ?? null;
function DietDot({ diet }: { diet: string | null }) {
  const d = dietOf(diet);
  if (!d) return null;
  return (
    <span title={d.label} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, border: "1.6px solid " + d.ring, borderRadius: 3, marginRight: 7, flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: d.color, display: "block" }} />
    </span>
  );
}

export default function DiningManager({ hotelId, dept, deptLabel }: { hotelId: string; dept: string; deptLabel: string }) {
  const [items, setItems] = useState<DeptItem[]>([]);
  const [tab, setTab] = useState("table");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // shared
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  // table
  const [seats, setSeats] = useState("");
  const [count, setCount] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  // sitting
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // menu
  const [price, setPrice] = useState("");
  const [menuCat, setMenuCat] = useState(MENU_CATS[0]);
  const [diet, setDiet] = useState("veg");
  const [spice, setSpice] = useState("mild");
  const [allergens, setAllergens] = useState("");
  const [signature, setSignature] = useState(false);
  const [prepMins, setPrepMins] = useState("");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const load = useCallback(async () => { if (hotelId) setItems(await getDeptItems(hotelId, dept)); }, [hotelId, dept]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const base: Record<string, unknown> = { kind: tab, name: name.trim(), description: desc.trim() || undefined };
    if (tab === "table") { base.seats = seats ? Number(seats) : undefined; base.stock = count ? Number(count) : undefined; base.category = location; }
    if (tab === "sitting") { base.time_from = from || undefined; base.time_to = to || undefined; }
    if (tab === "menu") { base.price = price ? Number(price) : undefined; base.category = menuCat; base.diet = diet; base.spice = spice; base.allergens = allergens.trim() || undefined; base.is_signature = signature; base.prep_mins = prepMins ? Number(prepMins) : undefined; }
    const r = await createDeptItem(hotelId, dept, base as never);
    setBusy(false);
    if (r.ok) { setName(""); setDesc(""); setSeats(""); setCount(""); setFrom(""); setTo(""); setPrice(""); setAllergens(""); setPrepMins(""); setSignature(false); flash("Added"); load(); }
    else flash(r.message ?? "failed");
  }
  async function toggle(it: DeptItem) { const r = await updateDeptItem(hotelId, it.id, { available: !it.available }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function adjust(it: DeptItem, d: number) { const r = await updateDeptItem(hotelId, it.id, { stock: Math.max(0, (it.stock ?? 0) + d) }); if (r.ok) load(); else flash(r.message ?? "failed"); }
  async function del(it: DeptItem) { if (!confirm("Remove " + it.name + "?")) return; const r = await deleteDeptItem(hotelId, it.id); if (r.ok) { flash("Removed"); load(); } else flash(r.message ?? "failed"); }

  const fld = { borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const, color: INK };
  const lbl = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".05em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 6, display: "block" };
  const shown = items.filter((i) => i.kind === tab);
  const totalSeats = items.filter((i) => i.kind === "table" && i.available).reduce((s, i) => s + ((i.seats ?? 0) * (i.stock ?? 0)), 0);

  return (
    <div>
      {toast ? <div style={{ marginBottom: 14, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{toast}</div> : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.kind} onClick={() => setTab(t.kind)} style={{ borderRadius: 999, padding: "8px 17px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid " + (tab === t.kind ? GREEN : "#E3DECF"), background: tab === t.kind ? "#EAF2ED" : "#fff", color: tab === t.kind ? GREEN : "#6E756F" }}>{t.label}</button>
        ))}
        {totalSeats > 0 ? <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12.5, color: GOLD, fontWeight: 600 }}>{totalSeats} seats total</span> : null}
      </div>

      <div style={{ background: "#FBFAF5", borderRadius: 13, padding: 18, marginBottom: 20, border: "1px solid #F0ECE0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".06em" }}>
          {tab === "table" ? "Add a table type" : tab === "sitting" ? "Add a service sitting" : "Add a menu item"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr", gap: 12, marginBottom: 12 }}>
          <div><label style={lbl}>{tab === "table" ? "Table name" : tab === "sitting" ? "Sitting" : "Dish"}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tab === "table" ? "e.g. Window 2-seater" : tab === "sitting" ? "e.g. Dinner" : "e.g. Butter Chicken"} style={fld} /></div>
          <div><label style={lbl}>Description</label><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="optional" style={fld} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: tab === "table" ? "1fr 1fr 1.3fr auto" : tab === "sitting" ? "1fr 1fr auto" : "1fr 1.3fr auto", gap: 12, alignItems: "end" }}>
          {tab === "table" ? (<>
            <div><label style={lbl}>Seats each</label><input value={seats} onChange={(e) => setSeats(e.target.value.replace(/[^0-9]/g, ""))} placeholder="2" style={fld} /></div>
            <div><label style={lbl}>How many</label><input value={count} onChange={(e) => setCount(e.target.value.replace(/[^0-9]/g, ""))} placeholder="6" style={fld} /></div>
            <div><label style={lbl}>Location</label><select value={location} onChange={(e) => setLocation(e.target.value)} style={{ ...fld, cursor: "pointer" }}>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
          </>) : tab === "sitting" ? (<>
            <div><label style={lbl}>From</label><input type="time" value={from} onChange={(e) => setFrom(e.target.value)} style={fld} /></div>
            <div><label style={lbl}>To</label><input type="time" value={to} onChange={(e) => setTo(e.target.value)} style={fld} /></div>
          </>) : (<>
            <div><label style={lbl}>Price ({rupee})</label><input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" style={fld} /></div>
            <div><label style={lbl}>Category</label><select value={menuCat} onChange={(e) => setMenuCat(e.target.value)} style={{ ...fld, cursor: "pointer" }}>{MENU_CATS.map((m) => <option key={m}>{m}</option>)}</select></div>
          </>)}
          <button onClick={add} disabled={busy || !name.trim()} style={{ borderRadius: 9, padding: "11px 22px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !name.trim() ? 0.55 : 1, whiteSpace: "nowrap" }}>{busy ? "Adding..." : "Add"}</button>
        </div>
        {tab === "menu" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.2fr 1.6fr 1fr", gap: 12, alignItems: "end", marginTop: 12, paddingTop: 14, borderTop: "1px solid #EFEBDF" }}>
            <div>
              <label style={lbl}>Diet</label>
              <div style={{ display: "flex", gap: 5 }}>
                {DIETS.map((d) => (
                  <button key={d.key} type="button" onClick={() => setDiet(d.key)} style={{ flex: 1, borderRadius: 8, padding: "8px 3px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (diet === d.key ? d.ring : "#E3DECF"), background: diet === d.key ? "#fff" : "#fff", color: diet === d.key ? d.color : "#9AA09A", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ width: 11, height: 11, border: "1.5px solid " + (diet === d.key ? d.ring : "#C8CCC6"), borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 5, height: 5, borderRadius: 999, background: diet === d.key ? d.color : "#C8CCC6" }} /></span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Spice</label>
              <div style={{ display: "flex", gap: 5 }}>
                {SPICES.map((s) => (
                  <button key={s.key} type="button" onClick={() => setSpice(s.key)} style={{ flex: 1, borderRadius: 8, padding: "8px 3px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (spice === s.key ? RED : "#E3DECF"), background: spice === s.key ? "#FBEDE9" : "#fff", color: spice === s.key ? RED : "#9AA09A" }}>{s.label}</button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Allergens</label><input value={allergens} onChange={(e) => setAllergens(e.target.value)} placeholder="nuts, dairy, gluten" style={fld} /></div>
            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <div style={{ flex: 1 }}><label style={lbl}>Prep (min)</label><input value={prepMins} onChange={(e) => setPrepMins(e.target.value.replace(/[^0-9]/g, ""))} placeholder="20" style={fld} /></div>
              <button type="button" onClick={() => setSignature((v) => !v)} title="Chef&apos;s signature dish" style={{ borderRadius: 9, padding: "10px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (signature ? GOLD : "#E3DECF"), background: signature ? "#F7F1E4" : "#fff", color: signature ? GOLD : "#9AA09A", whiteSpace: "nowrap" }}>&#9733; Signature</button>
            </div>
          </div>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <div style={{ color: "#B4B9B3", fontSize: 13.5, textAlign: "center", padding: "34px 0" }}>Nothing here yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {shown.map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: "#fff", border: "1px solid #EEE", borderRadius: 10, opacity: it.available ? 1 : 0.5 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {it.kind === "menu" ? <DietDot diet={it.diet} /> : null}
                  {it.name}
                  {it.is_signature ? <span title="Signature dish" style={{ color: GOLD, marginLeft: 7, fontSize: 13 }}>&#9733;</span> : null}
                  {it.kind === "menu" && it.spice && it.spice !== "mild" ? <span style={{ fontSize: 10, fontWeight: 600, color: RED, background: "#FBEDE9", borderRadius: 999, padding: "2px 7px", marginLeft: 7 }}>{it.spice === "hot" ? "HOT" : "MEDIUM"}</span> : null}
                  {it.kind === "menu" && it.prep_mins ? <span style={{ fontSize: 10.5, color: "#8A8577", marginLeft: 7, fontWeight: 500 }}>~{it.prep_mins} min</span> : null}
                  {it.kind === "table" && it.seats ? <span style={{ fontSize: 11.5, color: GOLD, marginLeft: 9 }}>{it.seats} seats</span> : null}
                  {it.kind === "sitting" && it.time_from ? <span style={{ fontSize: 11.5, color: GOLD, marginLeft: 9 }}>{it.time_from}{it.time_to ? " \u2013 " + it.time_to : ""}</span> : null}
                  {it.category ? <span style={{ fontSize: 10.5, color: "#9AA09A", marginLeft: 9, background: "#F5F3ED", borderRadius: 999, padding: "2px 8px" }}>{it.category}</span> : null}
                </div>
                {it.description ? <div style={{ fontSize: 12, color: "#8A8577", marginTop: 2 }}>{it.description}</div> : null}
                {it.kind === "menu" && it.allergens ? <div style={{ fontSize: 10.5, color: "#B0763A", marginTop: 3 }}>Contains: {it.allergens}</div> : null}
              </div>
              {it.price != null ? <span style={{ fontSize: 14.5, fontWeight: 600, color: INK, fontFamily: "Georgia, serif" }}>{rupee}{it.price}</span> : null}
              {it.kind === "table" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => adjust(it, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E3DECF", background: "#fff", cursor: "pointer", color: "#8A8577" }}>&minus;</button>
                  <span style={{ minWidth: 30, textAlign: "center", fontSize: 13, fontWeight: 600, color: INK }}>{it.stock ?? 0}</span>
                  <button onClick={() => adjust(it, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #E3DECF", background: "#fff", cursor: "pointer", color: "#8A8577" }}>+</button>
                </div>
              ) : null}
              <button onClick={() => toggle(it)} style={{ borderRadius: 999, padding: "4px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid " + (it.available ? "#CFE5DC" : "#E3DECF"), background: it.available ? "#EAF2ED" : "#F5F5F0", color: it.available ? GREEN : "#8A8577" }}>{it.available ? "Active" : "Paused"}</button>
              <button onClick={() => del(it)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #EED7D0", background: "#FBEDE9", cursor: "pointer", color: RED, fontSize: 15, lineHeight: 1 }}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
