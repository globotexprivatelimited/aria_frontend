"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";
import { getHours, saveHours, getDeptHours, saveDeptHours, clearDeptHours, type Hours, type DeptHoursDraft } from "./settings-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", INK = "#1B2621", MUTED = "#8A8577";
const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 } as const;
const field = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E4DECF", background: "#FEFDFB", fontSize: 13, color: INK, colorScheme: "light", boxSizing: "border-box" } as const;
const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 5, display: "block" } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }) as const;
const title = { fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK } as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FALLBACK_DEPTS = [{ dept: "fb", label: "Room service (kitchen)" }, { dept: "dining", label: "Restaurant" }, { dept: "spa", label: "Spa" }, { dept: "housekeeping", label: "Housekeeping" }, { dept: "concierge", label: "Concierge" }, { dept: "maintenance", label: "Maintenance" }, { dept: "front_desk", label: "Front desk" }];
const blank = (dept: string): DeptHoursDraft => ({ dept, openTime: "", closeTime: "", weekendOpenTime: "", weekendCloseTime: "", closedDays: [], outOfHours: "" });

function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => { const f = () => setM(window.innerWidth < 760); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return m;
}

export default function SettingsPage() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const isMobile = useIsMobile();
  const [hours, setHours] = useState<Hours | null>(null);
  const [draft, setDraft] = useState<Hours | null>(null);
  const [depts, setDepts] = useState<{ dept: string; label: string }[]>(FALLBACK_DEPTS);
  const [rows, setRows] = useState<Record<string, DeptHoursDraft>>({});
  const [kept, setKept] = useState<Record<string, { by: string | null; at: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };
  const grid = (cols: string) => ({ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : cols, gap: 10 });

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [h, d] = await Promise.all([getHours(HOTEL_ID), getDeptHours(HOTEL_ID)]);
    setHours(h); setDraft(h);
    const list = d.departments.length ? d.departments : FALLBACK_DEPTS;
    setDepts(list);
    const next: Record<string, DeptHoursDraft> = {}; const stamp: Record<string, { by: string | null; at: string }> = {};
    for (const x of list) next[x.dept] = blank(x.dept);
    for (const r of d.rows) { next[r.dept] = { dept: r.dept, openTime: r.openTime ?? "", closeTime: r.closeTime ?? "", weekendOpenTime: r.weekendOpenTime ?? "", weekendCloseTime: r.weekendCloseTime ?? "", closedDays: r.closedDays, outOfHours: r.outOfHours ?? "" }; stamp[r.dept] = { by: r.updatedBy, at: r.updatedAt }; }
    setRows(next); setKept(stamp);
  }, [HOTEL_ID]);
  useEffect(() => { void load(); }, [load]);

  async function doSaveHours() {
    if (!draft || !HOTEL_ID) return;
    setSaving("hours");
    const r = await saveHours(HOTEL_ID, { quietFrom: draft.quietFrom, quietTo: draft.quietTo, nudgeFrom: draft.nudgeFrom, nudgeTo: draft.nudgeTo, offerGapHours: draft.offerGapHours, offersPerDay: draft.offersPerDay });
    setSaving(null);
    if (r.ok) { flash("Saved - Aria follows the new hours within a minute, no deploy needed"); if (r.data) { setHours(r.data); setDraft(r.data); } } else flash(r.message ?? "Could not save");
  }
  async function doSaveDept(dept: string) {
    const d = rows[dept]; if (!d || !HOTEL_ID) return;
    if (!!d.openTime !== !!d.closeTime) { flash("Give both an opening and a closing time, or neither for 24 hours"); return; }
    setSaving(dept);
    const r = await saveDeptHours(HOTEL_ID, d);
    setSaving(null);
    if (r.ok) { flash((depts.find((x) => x.dept === dept)?.label ?? dept) + " hours saved - Aria reads them on the next message"); void load(); } else flash(r.message ?? "Could not save");
  }
  async function doClearDept(dept: string) {
    if (!HOTEL_ID) return;
    const r = await clearDeptHours(HOTEL_ID, dept);
    if (r.ok) { flash("Hours cleared - treated as 24 hours"); void load(); } else flash(r.message ?? "Could not clear");
  }
  const setRow = (dept: string, patch: Partial<DeptHoursDraft>) => setRows((cur) => ({ ...cur, [dept]: { ...(cur[dept] ?? blank(dept)), ...patch } }));
  const toggleDay = (dept: string, day: string) => { const cur = rows[dept]?.closedDays ?? []; setRow(dept, { closedDays: cur.includes(day) ? cur.filter((x) => x !== day) : [...cur, day] }); };
  const dirty = !!draft && !!hours && JSON.stringify(draft) !== JSON.stringify(hours);

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK }}>Settings</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>How Aria behaves at {hotelName || "your hotel"}. Everything here takes effect without a deploy - hours within a minute, department hours on the next message.</div>
        </div>
        {toast ? <div style={{ ...card, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: GREEN, borderColor: GREEN + "55" }}>{toast}</div> : null}

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={title}>Quiet hours and the evening nudge</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 14px" }}>Nothing unprompted leaves during quiet hours - a reminder or follow-up due at night waits for the morning. The evening nudge (what is on tonight) is only ever sent inside its window, on the hotel's own clock.</div>
          {draft ? (
            <>
              <div style={grid("1fr 1fr 1fr 1fr")}>
                <div><label style={lbl}>Quiet from</label><input type="time" style={field} value={draft.quietFrom} onChange={(e) => setDraft({ ...draft, quietFrom: e.target.value })} /></div>
                <div><label style={lbl}>Quiet until</label><input type="time" style={field} value={draft.quietTo} onChange={(e) => setDraft({ ...draft, quietTo: e.target.value })} /></div>
                <div><label style={lbl}>Nudges from</label><input type="time" style={field} value={draft.nudgeFrom} onChange={(e) => setDraft({ ...draft, nudgeFrom: e.target.value })} /></div>
                <div><label style={lbl}>Nudges until</label><input type="time" style={field} value={draft.nudgeTo} onChange={(e) => setDraft({ ...draft, nudgeTo: e.target.value })} /></div>
              </div>
              <div style={{ ...title, fontSize: 14, marginTop: 18 }}>Suggestions</div>
              <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 10px" }}>Aria may suggest one item from your pairings or the moment - at most this many times a day per guest, and never closer together than this. Set the daily number to 0 to switch suggestions off.</div>
              <div style={grid("1fr 1fr 2fr")}>
                <div><label style={lbl}>Suggestions per day</label><input type="number" min={0} max={10} style={field} value={draft.offersPerDay} onChange={(e) => setDraft({ ...draft, offersPerDay: Math.max(0, Math.min(10, parseInt(e.target.value) || 0)) })} /></div>
                <div><label style={lbl}>Hours apart</label><input type="number" min={0} max={48} style={field} value={draft.offerGapHours} onChange={(e) => setDraft({ ...draft, offerGapHours: Math.max(0, Math.min(48, parseInt(e.target.value) || 0)) })} /></div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
                <button onClick={doSaveHours} disabled={saving === "hours" || !dirty} style={{ ...btn(GREEN, "#fff"), opacity: saving === "hours" || !dirty ? 0.6 : 1 }}>Save hours</button>
                {dirty ? <button onClick={() => setDraft(hours)} style={btn("#F5F1E8", INK, "#E9E4D8")}>Undo</button> : null}
                {hours?.updatedBy ? <span style={{ fontSize: 11, color: MUTED }}>last changed by {hours.updatedBy}{hours.updatedAt ? " on " + new Date(hours.updatedAt).toLocaleString("en-IN") : ""}</span> : <span style={{ fontSize: 11, color: MUTED }}>using the defaults - 21:30-08:00 quiet, 17:00-21:00 nudges</span>}
              </div>
            </>
          ) : <div style={{ fontSize: 13, color: MUTED }}>Loading...</div>}
        </div>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={title}>Department hours</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 14px" }}>Aria is told, on every message, which departments are open right now. Outside a department's hours it does not place the order or booking - it says when the department opens and offers what is open. Leave the times empty for 24 hours.</div>
          <div style={{ display: "grid", gap: 12 }}>
            {depts.map((x) => { const d = rows[x.dept] ?? blank(x.dept); const is24 = !d.openTime && !d.closeTime; return (
              <div key={x.dept} style={{ border: "1px solid #EEEBE2", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: INK }}>{x.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: is24 ? GREEN : INK, background: is24 ? GREEN + "14" : "#F5F1E8", border: "1px solid " + (is24 ? GREEN + "55" : "#E9E4D8"), borderRadius: 999, padding: "2px 9px" }}>{is24 ? "24 hours" : d.openTime + "-" + d.closeTime}</span>
                    {kept[x.dept]?.by ? <span style={{ fontSize: 11, color: MUTED }}>set by {kept[x.dept].by}</span> : null}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => doSaveDept(x.dept)} disabled={saving === x.dept} style={{ ...btn(GREEN, "#fff"), opacity: saving === x.dept ? 0.6 : 1 }}>Save</button>
                    {kept[x.dept] ? <button onClick={() => doClearDept(x.dept)} style={btn("#fff", RED, "#F1C9C2")}>Clear</button> : null}
                  </div>
                </div>
                <div style={grid("1fr 1fr 1fr 1fr")}>
                  <div><label style={lbl}>Opens</label><input type="time" style={field} value={d.openTime} onChange={(e) => setRow(x.dept, { openTime: e.target.value })} /></div>
                  <div><label style={lbl}>Closes</label><input type="time" style={field} value={d.closeTime} onChange={(e) => setRow(x.dept, { closeTime: e.target.value })} /></div>
                  <div><label style={lbl}>Weekend opens</label><input type="time" style={field} value={d.weekendOpenTime} onChange={(e) => setRow(x.dept, { weekendOpenTime: e.target.value })} /></div>
                  <div><label style={lbl}>Weekend closes</label><input type="time" style={field} value={d.weekendCloseTime} onChange={(e) => setRow(x.dept, { weekendCloseTime: e.target.value })} /></div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginTop: 10 }}>
                  <div>
                    <label style={lbl}>Closed on</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {DAYS.map((day) => { const on = d.closedDays.includes(day); return <button key={day} onClick={() => toggleDay(x.dept, day)} style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "4px 9px", cursor: "pointer", border: "1px solid " + (on ? RED : "#E4DECF"), background: on ? "#FBEDE9" : "#fff", color: on ? RED : MUTED }}>{day}</button>; })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}><label style={lbl}>What Aria says when it is closed</label><input style={field} placeholder="e.g. the kitchen reopens at 07:00 - the front desk can bring tea and biscuits" value={d.outOfHours} onChange={(e) => setRow(x.dept, { outOfHours: e.target.value })} /></div>
                </div>
              </div>
            ); })}
          </div>
        </div>

        <div style={card}>
          <div style={title}>Also set from the dashboard</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.7 }}>
            <div><Link href="/gm/departments" style={{ color: GREEN, fontWeight: 600 }}>Departments</Link> - accept/decline, auto-accept or maintenance mode for each department.</div>
            <div><Link href="/gm/facilities" style={{ color: GREEN, fontWeight: 600 }}>Facilities</Link> - close the pool or spa for a day, or set limited hours; Aria stops offering it from the next message.</div>
            <div><Link href="/gm/setup" style={{ color: GREEN, fontWeight: 600 }}>Hotel setup</Link> - check-in and check-out times, Wi-Fi, breakfast, spa rules, services and prices, and the go-live check.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
