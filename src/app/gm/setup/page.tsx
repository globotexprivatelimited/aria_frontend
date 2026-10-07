"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";
import { getProfile, saveProfile, getSpaRules, saveSpaRules, getServices, addService, updateService, deleteService, getGoLive, goLive, type ProfileDraft, type SpaRules, type Service, type ServiceDraft, type GoLive } from "./setup-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621", MUTED = "#8A8577";
const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 } as const;
const field = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E4DECF", background: "#FEFDFB", fontSize: 13, color: INK, colorScheme: "light", boxSizing: "border-box" } as const;
const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 5, display: "block" } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }) as const;
const title = { fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK } as const;
const emptyProfile: ProfileDraft = { checkInTime: "", checkOutTime: "", frontDeskPhone: "", emergencyPhone: "", wifiName: "", wifiPassword: "", breakfastHours: "", breakfastPlace: "", address: "", parking: "", pets: "", smoking: "", lateCheckout: "", earlyCheckin: "", currency: "", languages: "", notes: "" };
const emptyService: ServiceDraft = { name: "", price: "", unit: "", hours: "", dept: "", how: "" };
type ProfileKey = keyof ProfileDraft;
const FIELDS: { key: ProfileKey; label: string; placeholder: string; type?: string }[] = [
  { key: "checkInTime", label: "Check-in from", placeholder: "14:00", type: "time" }, { key: "checkOutTime", label: "Check-out by", placeholder: "11:00", type: "time" },
  { key: "frontDeskPhone", label: "Front desk phone", placeholder: "+91 33 4000 1000" }, { key: "emergencyPhone", label: "Emergency / duty manager", placeholder: "+91 98300 00000" },
  { key: "wifiName", label: "Wi-Fi network", placeholder: "Sunanda-Guest" }, { key: "wifiPassword", label: "Wi-Fi password", placeholder: "leave empty if none" },
  { key: "breakfastHours", label: "Breakfast hours", placeholder: "07:00-10:30" }, { key: "breakfastPlace", label: "Breakfast where", placeholder: "The Terrace, 1st floor" },
  { key: "address", label: "Address", placeholder: "12 Park Street, Kolkata 700016" }, { key: "parking", label: "Parking", placeholder: "free for guests, basement, valet 24h" },
  { key: "pets", label: "Pets", placeholder: "not allowed / small dogs on request" }, { key: "smoking", label: "Smoking", placeholder: "non-smoking rooms; terrace only" },
  { key: "lateCheckout", label: "Late check-out", placeholder: "until 14:00 subject to availability, Rs 1,500" }, { key: "earlyCheckin", label: "Early check-in", placeholder: "from 10:00 when a room is ready" },
  { key: "currency", label: "Currency", placeholder: "INR" }, { key: "languages", label: "Languages the team speaks", placeholder: "English, Hindi, Bengali" },
];

function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => { const f = () => setM(window.innerWidth < 760); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return m;
}

export default function SetupPage() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);
  const [mandatory, setMandatory] = useState<Set<string>>(new Set());
  const [spa, setSpa] = useState<SpaRules | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [svcDraft, setSvcDraft] = useState<ServiceDraft>(emptyService);
  const [editingSvc, setEditingSvc] = useState<string | null>(null);
  const [check, setCheck] = useState<GoLive | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };
  const grid = (cols: string) => ({ display: "grid", gridTemplateColumns: isMobile ? "1fr" : cols, gap: 10 });

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [p, s, list, c] = await Promise.all([getProfile(HOTEL_ID), getSpaRules(HOTEL_ID), getServices(HOTEL_ID), getGoLive(HOTEL_ID)]);
    if (p.profile) { const d = { ...emptyProfile }; for (const k of Object.keys(emptyProfile) as ProfileKey[]) d[k] = p.profile[k] ?? ""; setProfile(d); }
    setMandatory(new Set(p.mandatory.map((m) => m.key)));
    setSpa(s); setServices(list); setCheck(c);
  }, [HOTEL_ID]);
  useEffect(() => { void load(); }, [load]);

  async function doSaveProfile() { if (!HOTEL_ID) return; setSaving("profile"); const r = await saveProfile(HOTEL_ID, profile); setSaving(null); if (r.ok) { flash("Hotel essentials saved - Aria answers from them on the next message"); void load(); } else flash(r.message ?? "Could not save"); }
  async function doSaveSpa() { if (!HOTEL_ID || !spa) return; setSaving("spa"); const r = await saveSpaRules(HOTEL_ID, spa); setSaving(null); if (r.ok) { flash("Spa rules saved"); void load(); } else flash(r.message ?? "Could not save"); }
  async function doAddService() { if (!HOTEL_ID || !svcDraft.name.trim()) return; setSaving("svc"); const r = await addService(HOTEL_ID, svcDraft); setSaving(null); if (r.ok) { flash(svcDraft.name + " added"); setSvcDraft(emptyService); void load(); } else flash(r.message ?? "Could not add"); }
  async function doUpdateService(s: Service) { if (!HOTEL_ID) return; setSaving(s.id); const r = await updateService(HOTEL_ID, s.id, svcDraft); setSaving(null); if (r.ok) { flash(svcDraft.name + " updated"); setEditingSvc(null); setSvcDraft(emptyService); void load(); } else flash(r.message ?? "Could not save"); }
  async function doToggleService(s: Service) { if (!HOTEL_ID) return; const r = await updateService(HOTEL_ID, s.id, { active: !s.active }); if (r.ok) { flash(s.active ? s.name + " hidden from Aria" : s.name + " visible to Aria again"); void load(); } else flash(r.message ?? "Could not save"); }
  async function doDeleteService(s: Service) { if (!HOTEL_ID || !confirm("Remove " + s.name + "?")) return; const r = await deleteService(HOTEL_ID, s.id); if (r.ok) { flash(s.name + " removed"); void load(); } else flash(r.message ?? "Could not remove"); }
  async function doGoLive() { if (!HOTEL_ID || !confirm("Switch " + (hotelName || "this hotel") + " live? Guests will be answered by Aria from now on.")) return; setSaving("live"); const r = await goLive(HOTEL_ID); setSaving(null); if (r.ok) { flash("Live - Aria is answering guests"); } else flash(r.message ?? "Not yet"); void load(); }

  const svcForm = (onSave: () => void, label: string) => (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={grid("2fr 1fr 1fr")}>
        <div><label style={lbl}>Service</label><input style={field} placeholder="e.g. Airport pickup" value={svcDraft.name} onChange={(e) => setSvcDraft({ ...svcDraft, name: e.target.value })} /></div>
        <div><label style={lbl}>Price</label><input style={field} placeholder="Rs 1,500" value={svcDraft.price} onChange={(e) => setSvcDraft({ ...svcDraft, price: e.target.value })} /></div>
        <div><label style={lbl}>Per</label><input style={field} placeholder="per car / per piece / per hour" value={svcDraft.unit} onChange={(e) => setSvcDraft({ ...svcDraft, unit: e.target.value })} /></div>
      </div>
      <div style={grid("1fr 1fr 2fr")}>
        <div><label style={lbl}>Hours</label><input style={field} placeholder="24 hours / 08:00-20:00" value={svcDraft.hours} onChange={(e) => setSvcDraft({ ...svcDraft, hours: e.target.value })} /></div>
        <div><label style={lbl}>Department</label><input style={field} placeholder="concierge / housekeeping" value={svcDraft.dept} onChange={(e) => setSvcDraft({ ...svcDraft, dept: e.target.value })} /></div>
        <div><label style={lbl}>How to book, and anything else</label><input style={field} placeholder="book 6 hours ahead; same day if in by 10:00" value={svcDraft.how} onChange={(e) => setSvcDraft({ ...svcDraft, how: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={!svcDraft.name.trim() || saving === "svc"} style={{ ...btn(GREEN, "#fff"), opacity: !svcDraft.name.trim() || saving === "svc" ? 0.6 : 1 }}>{label}</button>
        {editingSvc ? <button onClick={() => { setEditingSvc(null); setSvcDraft(emptyService); }} style={btn("#F5F1E8", INK, "#E9E4D8")}>Cancel</button> : null}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK }}>Hotel setup</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>The facts Aria needs before it answers guests at {hotelName || "your hotel"}. Six fields are mandatory; the hotel cannot go live until they are filled. Everything here is read on the very next message.</div>
        </div>
        {toast ? <div style={{ ...card, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: GREEN, borderColor: GREEN + "55" }}>{toast}</div> : null}

        {check ? (
          <div style={{ ...card, marginBottom: 16, borderColor: check.live ? GREEN + "66" : check.ready ? AMBER + "88" : "#EAEAE4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={title}>{check.live ? "Live" : check.ready ? "Ready to go live" : "Not ready yet"}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{check.filled} of {check.total} mandatory fields filled{check.missing.length ? " - still missing: " + check.missing.map((m) => m.label).join(", ") : ""}. Also recorded: {check.counts.facilities} facilities, {check.counts.facts} knowledge facts, {check.counts.services} services, {check.counts.pairings} menu pairings{check.spaRulesSet ? ", spa rules" : ", no spa rules yet"}.</div>
              </div>
              {!check.live ? <button onClick={doGoLive} disabled={!check.ready || saving === "live"} style={{ ...btn(check.ready ? GREEN : "#F5F1E8", check.ready ? "#fff" : MUTED, check.ready ? GREEN : "#E9E4D8"), opacity: saving === "live" ? 0.6 : 1 }}>{check.ready ? "Go live" : "Fill the six fields to go live"}</button> : <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, background: GREEN + "14", border: "1px solid " + GREEN + "55", borderRadius: 999, padding: "4px 12px" }}>Aria is answering guests</span>}
            </div>
            <div style={{ height: 6, background: "#EEEBE2", borderRadius: 999, marginTop: 12, overflow: "hidden" }}><div style={{ width: Math.round((check.filled / Math.max(1, check.total)) * 100) + "%", height: "100%", background: check.ready ? GREEN : AMBER }} /></div>
          </div>
        ) : null}

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={title}>Form 1 - Hotel essentials</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 14px" }}>Quoted to guests exactly as written. Fields marked * are mandatory.</div>
          <div style={grid("1fr 1fr 1fr 1fr")}>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label style={{ ...lbl, color: mandatory.has(f.key) && !profile[f.key] ? RED : lbl.color }}>{f.label}{mandatory.has(f.key) ? " *" : ""}</label>
                <input type={f.type ?? "text"} style={field} placeholder={f.placeholder} value={profile[f.key] ?? ""} onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}><label style={lbl}>Anything else every guest should be told</label><input style={field} placeholder="e.g. the lift is being serviced on Tuesday mornings; the rooftop closes at 23:00" value={profile.notes ?? ""} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} /></div>
          <div style={{ marginTop: 14 }}><button onClick={doSaveProfile} disabled={saving === "profile"} style={{ ...btn(GREEN, "#fff"), opacity: saving === "profile" ? 0.6 : 1 }}>Save essentials</button></div>
        </div>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={title}>Form 4 - Spa rules</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 14px" }}>How far ahead a treatment must be booked, the first and last appointment, and whether a mention of pregnancy or a medical condition goes to a person instead of a booking.</div>
          {spa ? (
            <>
              <div style={grid("1fr 1fr 1fr 2fr")}>
                <div><label style={lbl}>Notice needed (minutes)</label><input type="number" min={0} max={10080} style={field} value={spa.advanceNoticeMins} onChange={(e) => setSpa({ ...spa, advanceNoticeMins: Math.max(0, parseInt(e.target.value) || 0) })} /></div>
                <div><label style={lbl}>First appointment</label><input type="time" style={field} value={spa.firstAppointment ?? ""} onChange={(e) => setSpa({ ...spa, firstAppointment: e.target.value || null })} /></div>
                <div><label style={lbl}>Last appointment</label><input type="time" style={field} value={spa.lastAppointment ?? ""} onChange={(e) => setSpa({ ...spa, lastAppointment: e.target.value || null })} /></div>
                <div><label style={lbl}>Cancellation</label><input style={field} placeholder="free up to 2 hours before; after that 50%" value={spa.cancellation ?? ""} onChange={(e) => setSpa({ ...spa, cancellation: e.target.value || null })} /></div>
              </div>
              <div style={{ ...grid("1fr 2fr"), marginTop: 10 }}>
                <div><label style={lbl}>Age rule</label><input style={field} placeholder="guests under 16 with a parent" value={spa.ageRule ?? ""} onChange={(e) => setSpa({ ...spa, ageRule: e.target.value || null })} /></div>
                <div><label style={lbl}>Anything else</label><input style={field} placeholder="couples room on request; robes and slippers provided" value={spa.notes ?? ""} onChange={(e) => setSpa({ ...spa, notes: e.target.value || null })} /></div>
              </div>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: INK, margin: "12px 0", cursor: "pointer", lineHeight: 1.4 }}><input type="checkbox" checked={spa.medicalToHuman} onChange={(e) => setSpa({ ...spa, medicalToHuman: e.target.checked })} style={{ marginTop: 2 }} /><span>If a guest mentions <b>pregnancy, a medical condition, an injury, surgery or medication</b>, Aria does not book anything - it says a therapist will call, and sends the request to the spa.</span></label>
              <button onClick={doSaveSpa} disabled={saving === "spa"} style={{ ...btn(GREEN, "#fff"), opacity: saving === "spa" ? 0.6 : 1 }}>Save spa rules</button>
              {spa.updatedBy ? <span style={{ fontSize: 11, color: MUTED, marginLeft: 10 }}>last changed by {spa.updatedBy}</span> : null}
            </>
          ) : <div style={{ fontSize: 13, color: MUTED }}>Loading...</div>}
        </div>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={title}>Form 5 - Services and prices</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 14px" }}>One line per service - airport pickup, laundry, a car for the day, an extra bed. Aria quotes the price exactly, and says a service that is not here is not offered.</div>
          {!editingSvc ? svcForm(doAddService, "+ Add service") : null}
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {services.map((s) => (
              <div key={s.id} style={{ border: "1px solid #EEEBE2", borderRadius: 12, padding: 12, opacity: s.active ? 1 : 0.6 }}>
                {editingSvc === s.id ? svcForm(() => doUpdateService(s), "Save changes") : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 13, color: INK }}><b>{s.name}</b>{s.price ? " - " + s.price + (s.unit ? " " + s.unit : "") : " - price on request"}{s.hours ? " - " + s.hours : ""}{s.how ? " - " + s.how : ""}{s.dept ? <span style={{ color: MUTED }}> ({s.dept})</span> : null}{!s.active ? <span style={{ color: MUTED, fontSize: 11 }}> hidden from Aria</span> : null}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditingSvc(s.id); setSvcDraft({ name: s.name, price: s.price ?? "", unit: s.unit ?? "", hours: s.hours ?? "", dept: s.dept ?? "", how: s.how ?? "" }); }} style={btn("#F5F1E8", INK, "#E9E4D8")}>Edit</button>
                      <button onClick={() => doToggleService(s)} style={btn("#F5F1E8", INK, "#E9E4D8")}>{s.active ? "Hide" : "Show"}</button>
                      <button onClick={() => doDeleteService(s)} style={btn("#fff", RED, "#F1C9C2")}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!services.length ? <div style={{ fontSize: 13, color: MUTED }}>No services yet.</div> : null}
          </div>
        </div>

        <div style={card}>
          <div style={title}>The other forms</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.7 }}>
            <div>Form 2 - <Link href="/gm/facilities" style={{ color: GREEN, fontWeight: 600 }}>Facilities</Link>: pool, gym, spa, restaurant, parking - open, closed until a date, or limited hours.</div>
            <div>Form 3 - <Link href="/gm/departments" style={{ color: GREEN, fontWeight: 600 }}>Menu pairings</Link>: on each menu item, what it goes well with, what never to suggest, what it contains.</div>
            <div>Form 6 - <Link href="/gm/knowledge" style={{ color: GREEN, fontWeight: 600 }}>Knowledge</Link>: the questions guests ask and the hotel's answers, or paste your brochure and let Aria propose them.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
