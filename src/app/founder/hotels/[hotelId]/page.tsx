"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHotelDetail, type HotelDetail } from "./detail-actions";
import { getPlans, setPlan, setShare, setActive, type PlanRow } from "./settings-actions";
import { DEPT_SKIN } from "../../../../components/DeptCard";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");
const DEPT_LABEL: Record<string, string> = { fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa", front_desk: "Front Desk", dining: "Dining", maintenance: "Maintenance" };
const MODE_LABEL: Record<string, string> = { auto: "Auto", accept_decline: "Approve", maintenance: "Always on" };
const clock = (iso: string | null) => iso ? new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "\u2014";
const ROOM_TONE: Record<string, { bg: string; bd: string; fg: string }> = {
  occupied:  { bg: "#EDF4F0", bd: "#BFD9CB", fg: "#0F5F4C" },
  available: { bg: "#FBFAF5", bd: "#EAE7DE", fg: "#A8A395" },
  cleaning:  { bg: "#FBF2E9", bd: "#EDD9B4", fg: "#B4703A" },
};

export default function FounderHotelPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = String(params?.hotelId ?? "");
  const [d, setD] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rooms" | "people" | "work" | "money">("rooms");
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [shareDraft, setShareDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk || !hotelId) return;
    const det = await getHotelDetail(tk, hotelId);
    setD(det); setLoading(false);
    setPlans(await getPlans(tk));
    if (det && shareDraft === "") setShareDraft(String(det.hotel.revenueSharePercent));
  }, [hotelId]);
  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [load]);

  if (loading) return <div style={{ padding: 40, color: "#B4B9B3" }}>Loading&hellip;</div>;
  if (!d) return <div style={{ padding: 40, color: RED }}>Could not load this hotel.</div>;

  const occupied = d.rooms.filter((r) => r.status === "occupied");
  const floors = Array.from(new Set(d.rooms.map((r) => r.floor ?? 0))).sort((a, b) => a - b);
  const onDuty = d.staff.filter((s) => s.onDuty);
  const openReq = d.requests.filter((r) => r.status !== "resolved");
  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 18 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };

  const TABS = [
    { k: "rooms", label: "Rooms", n: d.rooms.length },
    { k: "people", label: "People", n: d.staff.length },
    { k: "work", label: "Requests", n: openReq.length },
    { k: "money", label: "Money", n: 0 },
  ] as const;

  return (
    <div style={{ padding: "30px 30px 60px", maxWidth: 1240, margin: "0 auto" }}>
      <button onClick={() => router.push("/founder")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: 0, cursor: "pointer", color: "#9AA09A", fontSize: 12.5, padding: 0, marginBottom: 12 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg> Portfolio
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, margin: 0, letterSpacing: "-.5px" }}>{d.hotel.name}</h1>
          <div style={{ fontSize: 13, color: "#6E756F", marginTop: 5 }}>
            {[d.hotel.city, d.hotel.address].filter(Boolean).join(" \u00b7 ") || "No address on file"}
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" }}>
            {[
              { on: d.hotel.isActive, yes: "Active", no: "Inactive" },
              { on: d.hotel.onboarded, yes: "Onboarded", no: "Not onboarded" },
              { on: d.hotel.emailVerified, yes: "Email confirmed", no: "Email unconfirmed" },
            ].map((b) => (
              <span key={b.yes} style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10.5, fontWeight: 600, background: b.on ? "#EDF4F0" : "#FBF2E9", color: b.on ? GREEN : "#B4703A", border: "1px solid " + (b.on ? "#CFE5DC" : "#EDD9B4") }}>{b.on ? b.yes : b.no}</span>
            ))}
          </div>
        </div>
        <div style={{ ...card, minWidth: 250, padding: 15 }}>
          <div style={lbl}>Contact</div>
          <div style={{ fontSize: 13, color: INK, marginTop: 7, lineHeight: 1.75 }}>
            <div>WhatsApp <b>{d.hotel.whatsappNumber ?? "\u2014"}</b></div>
            <div>Email <b>{d.hotel.contactEmail ?? "\u2014"}</b></div>
            <div>Check-in {d.hotel.checkInTime ?? "\u2014"} &middot; out {d.hotel.checkOutTime ?? "\u2014"}</div>
            <div>Share <b>{d.hotel.revenueSharePercent}%</b></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginTop: 20 }}>
        {[
          { l: "Rooms", v: String(d.rooms.length), s: (d.hotel.roomTarget ?? d.rooms.length) + " planned", c: GREEN },
          { l: "Occupied", v: String(occupied.length), s: d.rooms.length ? Math.round((occupied.length / d.rooms.length) * 100) + "% full" : "\u2014", c: "#B4703A" },
          { l: "Guests", v: String(occupied.reduce((s, r) => s + (r.partySize ?? 0), 0)), s: "in house", c: "#6B6FA0" },
          { l: "On duty", v: String(onDuty.length), s: "of " + d.staff.length + " staff", c: onDuty.length ? "#5B8C6E" : "#C8CCC6" },
          { l: "Open work", v: String(openReq.length), s: "requests", c: openReq.length ? RED : "#C8CCC6" },
          { l: "Revenue", v: money(d.revenue.month), s: "last 30 days", c: GOLD },
        ].map((x) => (
          <div key={x.l} style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
            <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 3 }}>{x.s}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div style={lbl}>Account</div>
          {saved ? <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{saved}</span> : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: "#6E756F", marginBottom: 8 }}>Plan</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {plans.map((p) => {
                const on = d.hotel.planCode === p.code;
                return (
                  <button key={p.code} disabled={saving}
                    onClick={async () => {
                      const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
                      setSaving(true); const r = await setPlan(tk, hotelId, p.code); setSaving(false);
                      setSaved(r.ok ? "Moved to " + p.name : (r.error ?? "Did not save"));
                      setTimeout(() => setSaved(null), 3000); load();
                    }}
                    style={{ borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                      border: "1px solid " + (on ? GREEN : "#E3DECF"), background: on ? "#EAF2ED" : "#fff", color: on ? GREEN : "#6E756F" }}>
                    {p.name}<span style={{ opacity: .6, marginLeft: 5 }}>{p.monthlyPrice ? money(p.monthlyPrice) : "free"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, color: "#6E756F", marginBottom: 8 }}>Your share of their revenue</div>
            <div style={{ display: "flex", gap: 7 }}>
              <input value={shareDraft} onChange={(e) => setShareDraft(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{ width: 90, borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "9px 12px", fontSize: 14, outline: "none", color: INK }} />
              <span style={{ alignSelf: "center", fontSize: 13, color: "#9AA09A" }}>%</span>
              <button disabled={saving}
                onClick={async () => {
                  const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
                  setSaving(true); const r = await setShare(tk, hotelId, Number(shareDraft || 0)); setSaving(false);
                  setSaved(r.ok ? "Share set to " + (shareDraft || 0) + "%" : (r.error ?? "Did not save"));
                  setTimeout(() => setSaved(null), 3000); load();
                }}
                style={{ borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: 0, background: GREEN, color: "#fff" }}>Save</button>
            </div>
            <div style={{ fontSize: 11, color: "#A8A395", marginTop: 6 }}>
              {money(d.revenue.month * (Number(shareDraft || 0) / 100))} on the last 30 days
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11.5, color: "#6E756F", marginBottom: 8 }}>Account state</div>
            <button disabled={saving}
              onClick={async () => {
                const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
                setSaving(true); const r = await setActive(tk, hotelId, !d.hotel.isActive); setSaving(false);
                setSaved(r.ok ? (d.hotel.isActive ? "Switched off" : "Switched back on") : (r.error ?? "Did not save"));
                setTimeout(() => setSaved(null), 3000); load();
              }}
              style={{ borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: "1px solid " + (d.hotel.isActive ? "#EED7D0" : "#CFE5DC"),
                background: d.hotel.isActive ? "#FBEDE9" : "#EAF2ED", color: d.hotel.isActive ? RED : GREEN }}>
              {d.hotel.isActive ? "Suspend this hotel" : "Switch back on"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 7, marginTop: 24, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid " + (tab === t.k ? GREEN : "#E3DECF"), background: tab === t.k ? "#EAF2ED" : "#fff", color: tab === t.k ? GREEN : "#6E756F" }}>
            {t.label}{t.n > 0 ? <span style={{ opacity: .6 }}> {t.n}</span> : null}
          </button>
        ))}
      </div>

      {tab === "rooms" ? (
        d.rooms.length === 0 ? <div style={{ ...card, textAlign: "center", color: "#B4B9B3", padding: 34 }}>No rooms set up yet.</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {floors.map((f) => (
            <div key={f}>
              <div style={{ ...lbl, marginBottom: 8 }}>Floor {f}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 9 }}>
                {d.rooms.filter((r) => (r.floor ?? 0) === f).map((r) => {
                  const t = ROOM_TONE[r.status] ?? ROOM_TONE.available;
                  return (
                    <div key={r.roomNumber} style={{ background: t.bg, border: "1px solid " + t.bd, borderRadius: 11, padding: "11px 12px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: INK }}>{r.roomNumber}</span>
                        <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: t.fg, fontWeight: 700 }}>{r.status}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: "#A8A395", marginTop: 2 }}>{r.type ?? "\u2014"}</div>
                      {r.guestName ? (
                        <div style={{ marginTop: 7, paddingTop: 7, borderTop: "1px solid rgba(0,0,0,.05)" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.guestName}</div>
                          <div style={{ fontSize: 10.5, color: "#8A8577" }}>{r.partySize ?? 1} guest{(r.partySize ?? 1) === 1 ? "" : "s"} &middot; out {r.checkOut ? new Date(r.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "\u2014"}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "people" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {d.staff.map((s) => (
            <div key={s.name + s.role} style={{ ...card, display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap", padding: "14px 16px" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: s.onDuty ? "#2ECC71" : "#CDC8BC", boxShadow: s.onDuty ? "0 0 0 3px rgba(46,204,113,.18)" : "none", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{s.name}
                  <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".07em", color: GOLD, marginLeft: 8 }}>{s.role}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 2 }}>{s.email ?? "\u2014"}{s.phone ? " \u00b7 " + s.phone : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {s.departments.length === 0 ? <span style={{ fontSize: 11, color: "#C8CCC6" }}>no departments</span> :
                  s.departments.map((dep) => {
                    const sk = DEPT_SKIN[dep] ?? DEPT_SKIN.front_desk;
                    return <span key={dep} style={{ borderRadius: 7, padding: "3px 9px", fontSize: 10.5, fontWeight: 600, background: sk.tint, color: sk.accent }}>{DEPT_LABEL[dep] ?? dep}</span>;
                  })}
              </div>
              <span style={{ fontSize: 11, color: "#B4B9B3", whiteSpace: "nowrap" }}>{s.onDuty ? "on duty" : s.lastSeen ? "seen " + clock(s.lastSeen) : "never signed in"}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "work" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10 }}>
            {d.departments.map((dep) => {
              const sk = DEPT_SKIN[dep.dept] ?? DEPT_SKIN.front_desk;
              return (
                <div key={dep.dept} style={{ ...card, padding: "13px 15px", borderLeft: "3px solid " + sk.accent }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{DEPT_LABEL[dep.dept] ?? dep.dept}</div>
                  <div style={{ fontSize: 10.5, color: sk.accent, marginTop: 2 }}>{MODE_LABEL[dep.mode] ?? dep.mode} &middot; {dep.offerings} offering{dep.offerings === 1 ? "" : "s"}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 9 }}>
                    {[["open", dep.open], ["doing", dep.inProgress], ["done", dep.resolvedToday]].map(([l, n]) => (
                      <span key={l as string} style={{ fontSize: 11.5, color: "#6E756F" }}><b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 14 }}>{n as number}</b> {l as string}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{ ...lbl, marginBottom: 8 }}>Recent requests</div>
            {d.requests.length === 0 ? <div style={{ ...card, textAlign: "center", color: "#B4B9B3", padding: 30 }}>Nothing in the last 30 days.</div> :
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {d.requests.slice(0, 40).map((r) => {
                  const sk = DEPT_SKIN[r.department ?? ""] ?? DEPT_SKIN.front_desk;
                  return (
                    <div key={r.id} style={{ ...card, padding: "12px 15px", borderLeft: "3px solid " + (r.priority === "urgent" ? RED : sk.accent), display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: INK, minWidth: 42 }}>{r.room ?? "\u2014"}</span>
                      <span style={{ flex: 1, minWidth: 180, fontSize: 13.5, color: "#3A413B" }}>{r.detail ?? "\u2014"}</span>
                      <span style={{ fontSize: 11, color: sk.accent, fontWeight: 600 }}>{DEPT_LABEL[r.department ?? ""] ?? r.department}</span>
                      <span style={{ fontSize: 11, color: "#9AA09A" }}>{r.claimedBy ?? "unclaimed"}</span>
                      <span style={{ borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: r.declined ? "#FBEDE9" : r.status === "resolved" ? "#EAF2ED" : r.status === "in_progress" ? "#F7F1E4" : "#FBEDE9", color: r.declined ? RED : r.status === "resolved" ? GREEN : r.status === "in_progress" ? GOLD : RED }}>{r.declined ? "declined" : r.status === "in_progress" ? "doing" : r.status}</span>
                      <span style={{ fontSize: 10.5, color: "#B4B9B3", whiteSpace: "nowrap" }}>{clock(r.createdAt)}</span>
                    </div>
                  );
                })}
              </div>}
          </div>
        </div>
      ) : null}

      {tab === "money" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 11 }}>
            {[["Today", d.revenue.today], ["This week", d.revenue.week], ["30 days", d.revenue.month]].map(([l, v]) => (
              <div key={l as string} style={{ ...card, padding: "14px 16px" }}>
                <div style={lbl}>{l as string}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, marginTop: 6 }}>{money(v as number)}</div>
              </div>
            ))}
            <div style={{ ...card, padding: "14px 16px" }}>
              <div style={lbl}>Your share</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: GOLD, marginTop: 6 }}>{money(d.revenue.month * (d.hotel.revenueSharePercent / 100))}</div>
              <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 3 }}>{d.hotel.revenueSharePercent}% of 30 days</div>
            </div>
          </div>

          {d.revenue.byDept.length > 0 ? (
            <div style={card}>
              <div style={{ ...lbl, marginBottom: 10 }}>Where it comes from</div>
              {d.revenue.byDept.map((x) => {
                const sk = DEPT_SKIN[x.dept] ?? DEPT_SKIN.front_desk;
                const pct = Math.round((x.amount / Math.max(1, d.revenue.month)) * 100);
                return (
                  <div key={x.dept} style={{ marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6E756F", marginBottom: 4 }}>
                      <span>{DEPT_LABEL[x.dept] ?? x.dept}</span><span><b style={{ color: INK }}>{money(x.amount)}</b> {pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "#F3F1EA", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: pct + "%", background: sk.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div style={card}>
            <div style={{ ...lbl, marginBottom: 10, color: RED }}>Demand they could not serve</div>
            {d.missed.length === 0 ? <div style={{ color: "#B4B9B3", fontSize: 13 }}>Nothing missed.</div> :
              d.missed.map((m) => (
                <div key={m.item + m.department} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F4F2EC", fontSize: 13 }}>
                  <span style={{ color: INK }}>{m.item} <span style={{ color: "#9AA09A", fontSize: 11.5 }}>{DEPT_LABEL[m.department ?? ""] ?? m.department}</span></span>
                  <span style={{ color: "#6E756F" }}>{m.times}&times; &middot; <b style={{ color: RED }}>{m.loss ? money(m.loss) : "unpriced"}</b></span>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
