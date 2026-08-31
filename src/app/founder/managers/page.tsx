"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAllPeople, type PeopleData } from "./people-actions";
import { DEPT_SKIN } from "../../../components/DeptCard";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F";
const DEPT_LABEL: Record<string, string> = { fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa", front_desk: "Front Desk", dining: "Dining", maintenance: "Maintenance" };
const ROLE_TONE: Record<string, { bg: string; fg: string }> = {
  founder: { bg: "#F1F1F7", fg: "#6B6FA0" },
  gm: { bg: "#EDF4F0", fg: GREEN },
  staff: { bg: "#FBF2E9", fg: "#B4703A" },
};
const seen = (iso: string | null) => {
  if (!iso) return "never signed in";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  return h < 24 ? h + "h ago" : Math.floor(h / 24) + "d ago";
};

export default function FounderPeoplePage() {
  const router = useRouter();
  const [d, setD] = useState<PeopleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("all");
  const [hotel, setHotel] = useState<string>("all");

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setD(await getAllPeople(tk)); setLoading(false);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  const people = d?.people ?? [];
  const hotels = Array.from(new Set(people.map((p) => p.hotelName))).sort();
  const shown = people.filter((p) => (role === "all" || p.role === role) && (hotel === "all" || p.hotelName === hotel));
  const t = d?.totals ?? {};
  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };
  const chip = (on: boolean) => ({ borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (on ? GREEN : "#E3DECF"), background: on ? "#EAF2ED" : "#fff", color: on ? GREEN : "#6E756F" });

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Everyone, everywhere</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>People</h1>

      {loading ? <div style={{ color: "#B4B9B3", marginTop: 24 }}>Loading&hellip;</div> : null}

      {!loading && d ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginTop: 20 }}>
            {[
              { l: "Everyone", v: t.total ?? 0, c: GREEN },
              { l: "On duty now", v: t.onDuty ?? 0, c: (t.onDuty ?? 0) > 0 ? "#2ECC71" : "#C8CCC6" },
              { l: "Managers", v: t.gms ?? 0, c: GREEN },
              { l: "Staff", v: t.staff ?? 0, c: "#B4703A" },
              { l: "Never signed in", v: t.neverSignedIn ?? 0, c: (t.neverSignedIn ?? 0) > 0 ? "#B23A2A" : "#C8CCC6" },
            ].map((x) => (
              <div key={x.l} style={{ ...card, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 7, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
            {["all", "gm", "staff"].map((r) => (
              <button key={r} onClick={() => setRole(r)} style={chip(role === r)}>{r === "all" ? "All roles" : r === "gm" ? "Managers" : r === "founder" ? "Founders" : "Staff"}</button>
            ))}
            <span style={{ width: 1, height: 22, background: "#E3DECF", margin: "0 4px" }} />
            <button onClick={() => setHotel("all")} style={chip(hotel === "all")}>All hotels</button>
            {hotels.map((h) => <button key={h} onClick={() => setHotel(h)} style={chip(hotel === h)}>{h}</button>)}
          </div>

          <div style={{ ...card, marginTop: 16, overflow: "hidden" }}>
            {shown.length === 0 ? <div style={{ padding: 34, textAlign: "center", color: "#B4B9B3", fontSize: 13.5 }}>Nobody matches that filter.</div> :
              shown.map((p, i) => {
                const rt = ROLE_TONE[p.role] ?? ROLE_TONE.staff;
                return (
                  <div key={p.hotelId + p.name + p.role} style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap", padding: "14px 17px", borderTop: i ? "1px solid #F2F0EA" : "none" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: p.onDuty ? "#2ECC71" : "#CDC8BC", boxShadow: p.onDuty ? "0 0 0 3px rgba(46,204,113,.18)" : "none", flexShrink: 0 }} />
                    <div style={{ minWidth: 180, flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 2 }}>{p.email ?? "\u2014"}{p.phone ? " \u00b7 " + p.phone : ""}</div>
                    </div>
                    <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", background: rt.bg, color: rt.fg }}>{p.role === "gm" ? "manager" : p.role}</span>
                    <button onClick={() => router.push("/founder/hotels/" + p.hotelId)}
                      style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 12.5, color: "#6E756F", padding: 0, minWidth: 110, textAlign: "left" }}>{p.hotelName} &rarr;</button>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", minWidth: 150 }}>
                      {p.departments.length === 0 ? <span style={{ fontSize: 11, color: "#C8CCC6" }}>{"\u2014"}</span> :
                        p.departments.map((dep) => {
                          const sk = DEPT_SKIN[dep] ?? DEPT_SKIN.front_desk;
                          return <span key={dep} style={{ borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, background: sk.tint, color: sk.accent }}>{DEPT_LABEL[dep] ?? dep}</span>;
                        })}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 92 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.handled30d > 0 ? INK : "#C8CCC6", fontFamily: "Georgia, serif" }}>{p.handled30d}</div>
                      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".07em", color: "#B4B9B3" }}>handled 30d</div>
                    </div>
                    <span style={{ fontSize: 11, color: p.onDuty ? GREEN : "#B4B9B3", minWidth: 96, textAlign: "right" }}>{p.onDuty ? "on duty" : seen(p.lastSeen)}</span>
                  </div>
                );
              })}
          </div>
        </>
      ) : null}
    </div>
  );
}
