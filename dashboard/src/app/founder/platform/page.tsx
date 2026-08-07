"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getBilling, getPlans, getStations, getIncidents, resolveIncident,
  type Billing, type PlanRow, type Station, type Incident } from "./platform-actions";
import { DEPT_SKIN } from "../../../components/DeptCard";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const offlineFor = (m: number | null) => m == null ? "never seen" : m < 60 ? m + " min ago" : Math.floor(m / 60) + "h ago";

export default function PlatformPage() {
  const router = useRouter();
  const [bill, setBill] = useState<Billing | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [st, setSt] = useState<{ stations: Station[]; totals: Record<string, number> } | null>(null);
  const [inc, setInc] = useState<{ incidents: Incident[]; open: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    const [b, p, s, i] = await Promise.all([getBilling(tk), getPlans(tk), getStations(tk), getIncidents(tk)]);
    setBill(b); setPlans(p ?? []); setSt(s); setInc(i);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  async function resolve(id: string) {
    const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
    setBusy(id); await resolveIncident(tk, id); setBusy(null); load();
  }

  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 19 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };
  const offline = (st?.stations ?? []).filter((s) => !s.online);

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1240 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Infrastructure and money</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Platform</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 11, marginTop: 20 }}>
        {[
          { l: "MRR", v: money(bill?.mrr ?? 0), c: GREEN, s: "recurring" },
          { l: "Cost to serve", v: money(bill?.costToServe ?? 0), c: "#B4703A", s: "last 30 days" },
          { l: "Gross margin", v: (bill?.grossMarginPct ?? 0) + "%", c: (bill?.grossMarginPct ?? 0) > 50 ? GREEN : RED },
          { l: "Pilots running", v: String(bill?.pilotsRunning ?? 0), c: GOLD, s: "convert before they lapse" },
          { l: "Stations offline", v: String(st?.totals.offline ?? 0), c: (st?.totals.offline ?? 0) > 0 ? RED : "#C8CCC6", s: "of " + (st?.totals.total ?? 0) },
          { l: "Open incidents", v: String(inc?.open ?? 0), c: (inc?.open ?? 0) > 0 ? RED : "#C8CCC6" },
        ].map((x) => (
          <div key={x.l} style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
            {x.s ? <div style={{ fontSize: 10.5, color: "#9AA09A", marginTop: 3 }}>{x.s}</div> : null}
          </div>
        ))}
      </div>

      {(bill?.grossMarginPct ?? 100) < 30 ? (
        <div style={{ marginTop: 14, borderRadius: 12, padding: "11px 16px", background: "#FBEDE9", border: "1px solid #EED7D0", color: "#8A3A2A", fontSize: 13.5 }}>
          Costs are eating <b>{100 - (bill?.grossMarginPct ?? 0)}%</b> of revenue. Converting the {bill?.pilotsRunning ?? 0} pilots would change that.
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginTop: 18 }}>
        <div style={card}>
          <div style={{ ...lbl, marginBottom: 12 }}>Stations</div>
          {(st?.stations ?? []).length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>No stations paired yet.</div> :
            (st?.stations ?? []).map((s) => {
              const sk = DEPT_SKIN[s.dept ?? ""] ?? DEPT_SKIN.front_desk;
              return (
                <div key={s.id} onClick={() => router.push("/founder/hotels/" + s.hotelId)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #F4F2EC", cursor: "pointer" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: s.online ? "#2ECC71" : RED, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: INK, fontWeight: 600, minWidth: 96 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: sk.accent, flex: 1 }}>{s.hotelName}</span>
                  <span style={{ fontSize: 11, color: s.online ? "#9AA09A" : RED }}>{s.online ? "online" : offlineFor(s.minutesOffline)}</span>
                </div>
              );
            })}
        </div>

        <div style={card}>
          <div style={{ ...lbl, marginBottom: 12 }}>Cost to serve, 30 days</div>
          {(bill?.costs ?? []).length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>Nothing recorded.</div> :
            (bill?.costs ?? []).map((c) => {
              const pct = Math.round((c.amount / Math.max(1, bill?.costToServe ?? 1)) * 100);
              return (
                <div key={c.category} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#3A413B", marginBottom: 4 }}>
                    <span>{c.category}</span><span><b style={{ color: INK }}>{money(c.amount)}</b> {pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: "#F3F1EA" }}>
                    <span style={{ display: "block", height: "100%", width: pct + "%", background: "#B4703A", borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={lbl}>Incidents</div>
          {offline.length > 0 ? <span style={{ fontSize: 11.5, color: RED }}>{offline.length} station{offline.length === 1 ? "" : "s"} offline right now</span> : null}
        </div>
        {(inc?.incidents ?? []).length === 0 ? (
          <div style={{ fontSize: 12.5, color: "#B4B9B3", marginTop: 10 }}>No incidents logged.</div>
        ) : (inc?.incidents ?? []).map((x, i) => (
          <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid #F4F2EC" : "none", flexWrap: "wrap" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: x.state === "open" ? RED : "#C8CCC6", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>{x.title}</div>
              <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 2 }}>{x.hotelName ?? "Platform"} &middot; {when(x.createdAt)}</div>
              {x.detail ? <div style={{ fontSize: 12, color: "#6E756F", marginTop: 3 }}>{x.detail}</div> : null}
            </div>
            {x.state === "open" ? (
              <button disabled={busy === x.id} onClick={() => resolve(x.id)}
                style={{ borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #CFE5DC", background: "#EAF2ED", color: GREEN }}>Mark resolved</button>
            ) : <span style={{ fontSize: 11, color: "#B4B9B3" }}>resolved</span>}
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ ...lbl, marginBottom: 4 }}>Plan catalogue</div>
        <div style={{ fontSize: 12.5, color: "#9AA09A", marginBottom: 14 }}>What each plan includes. Set a hotel&apos;s plan on its own page.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
          {plans.map((p) => {
            const usage = bill?.byPlan.find((b) => b.code === p.code);
            return (
              <div key={p.code} style={{ border: "1px solid #EFEBE2", borderRadius: 13, padding: 15, background: "#FDFCFA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: INK }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.monthlyPrice ? GREEN : GOLD }}>{p.monthlyPrice ? money(p.monthlyPrice) + "/mo" : "Free"}</span>
                </div>
                <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 3 }}>
                  {usage ? usage.hotels + " hotel" + (usage.hotels === 1 ? "" : "s") + " \u00b7 " + money(usage.mrr) : "no hotels"}
                  {p.maxStations ? " \u00b7 up to " + p.maxStations + " stations" : " \u00b7 unlimited stations"}
                </div>
                <ul style={{ margin: "11px 0 0", padding: 0, listStyle: "none" }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 12, color: "#6E756F", padding: "3px 0", display: "flex", gap: 7 }}>
                      <span style={{ color: GREEN }}>&middot;</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
