"use client";
import { useRouter } from "next/navigation";
import type { Insights } from "../app/founder/insights-actions";
import { DEPT_SKIN } from "./DeptCard";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");
const DEPT_LABEL: Record<string, string> = { fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa", front_desk: "Front Desk", dining: "Dining", maintenance: "Maintenance" };
const dur = (m: number | null) => m == null ? "\u2014" : m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m";
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  return h < 24 ? h + "h ago" : Math.floor(h / 24) + "d ago";
};

/** Smooth path through values - same wave language as the revenue page. */
function wave(vals: number[], w: number, h: number) {
  if (vals.length < 2) return { line: "", area: "" };
  const max = Math.max(...vals, 1);
  const step = w / (vals.length - 1);
  const pts = vals.map((v, i) => [i * step, h - 3 - (v / max) * (h - 10)] as [number, number]);
  let d = "M" + pts[0][0] + "," + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += " C" + cx + "," + y0 + " " + cx + "," + y1 + " " + x1 + "," + y1;
  }
  return { line: d, area: d + " L" + w + "," + h + " L0," + h + " Z" };
}

const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 19 };
const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };

export default function FounderInsights({ ins }: { ins: Insights }) {
  const router = useRouter();
  const W = 640, H = 90;
  const rev = wave(ins.series.map((s) => s.revenue), W, H);
  const req = wave(ins.series.map((s) => s.requests), W, H);
  const totalReq = ins.series.reduce((s, x) => s + x.requests, 0);
  const totalRev = ins.series.reduce((s, x) => s + x.revenue, 0);
  const maxGap = Math.max(1, ...ins.gaps.map((g) => g.times));
  const maxDem = Math.max(1, ...ins.demand.map((d) => d.times));
  const maxDept = Math.max(1, ...ins.byDepartment.map((d) => d.requests));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>

      {ins.attention.length > 0 ? (
        <div style={{ ...card, borderLeft: "4px solid " + RED, padding: "16px 19px" }}>
          <div style={{ ...lbl, color: RED, marginBottom: 11 }}>Needs a look</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {ins.attention.map((a, i) => (
              <button key={i} onClick={() => router.push("/founder/hotels/" + a.hotelId)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: 0, cursor: "pointer", padding: 0, textAlign: "left" }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: a.severity === "high" ? RED : GOLD, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>{a.name}</span>
                <span style={{ fontSize: 13, color: "#6E756F" }}>{a.issue}</span>
                <span style={{ fontSize: 11.5, color: "#B4B9B3", marginLeft: "auto" }}>open &rarr;</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 14 }} className="ins-grid">
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <div style={lbl}>Last 30 days</div>
            <div style={{ fontSize: 12, color: "#6E756F" }}>
              <b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 15 }}>{money(totalRev)}</b> earned &middot;
              <b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 15, marginLeft: 6 }}>{totalReq}</b> requests
            </div>
          </div>
          <svg viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" style={{ width: "100%", height: 92, display: "block", marginTop: 12 }}>
            <defs>
              <linearGradient id="insRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity=".22" /><stop offset="100%" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>
            </defs>
            {rev.area ? <path d={rev.area} fill="url(#insRev)" /> : null}
            {rev.line ? <path d={rev.line} fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" /> : null}
            {req.line ? <path d={req.line} fill="none" stroke={GOLD} strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" /> : null}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#B4B9B3", marginTop: 4 }}>
            <span>{ins.series[0]?.label}</span>
            <span style={{ color: GREEN }}>&mdash; revenue</span>
            <span style={{ color: GOLD }}>- - requests</span>
            <span>{ins.series[ins.series.length - 1]?.label}</span>
          </div>
        </div>

        <div style={card}>
          <div style={lbl}>How fast, platform-wide</div>
          <div style={{ display: "flex", gap: 20, marginTop: 11 }}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1 }}>{dur(ins.speed.avgResponseMins)}</div>
              <div style={{ fontSize: 10.5, color: "#9AA09A", marginTop: 3 }}>to pick up</div>
            </div>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1 }}>{dur(ins.speed.avgResolveMins)}</div>
              <div style={{ fontSize: 10.5, color: "#9AA09A", marginTop: 3 }}>to finish</div>
            </div>
          </div>
          {ins.speed.byHotel.length > 0 ? (
            <div style={{ marginTop: 13, paddingTop: 11, borderTop: "1px solid #F1EEE6" }}>
              {ins.speed.byHotel.slice(0, 5).map((h) => (
                <div key={h.hotelId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6E756F", padding: "4px 0" }}>
                  <span>{h.name}</span><span>{dur(h.response)} &middot; {h.handled} done</span>
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: 12, color: "#B4B9B3", marginTop: 12 }}>No completed work yet to measure.</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 14 }}>
        <div style={card}>
          <div style={{ ...lbl, marginBottom: 11 }}>Most asked for</div>
          {ins.demand.length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>Nothing yet.</div> :
            ins.demand.slice(0, 6).map((d) => (
              <div key={d.item} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#3A413B", marginBottom: 3 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "72%" }}>{d.item}</span>
                  <span style={{ color: "#8A8577" }}>{d.times}&times;{d.revenue > 0 ? " \u00b7 " + money(d.revenue) : ""}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "#F3F1EA" }}>
                  <span style={{ display: "block", height: "100%", width: (d.times / maxDem) * 100 + "%", background: GREEN, borderRadius: 999 }} />
                </div>
              </div>
            ))}
        </div>

        <div style={card}>
          <div style={{ ...lbl, marginBottom: 11, color: RED }}>Asked for, not available</div>
          {ins.gaps.length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>Nothing missed.</div> :
            ins.gaps.slice(0, 6).map((g) => (
              <div key={g.item} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#3A413B", marginBottom: 3 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "66%" }}>{g.item}</span>
                  <span style={{ color: "#8A8577" }}>{g.times}&times; &middot; {g.hotels} hotel{g.hotels === 1 ? "" : "s"}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "#F3F1EA" }}>
                  <span style={{ display: "block", height: "100%", width: (g.times / maxGap) * 100 + "%", background: RED, borderRadius: 999 }} />
                </div>
              </div>
            ))}
        </div>

        <div style={card}>
          <div style={{ ...lbl, marginBottom: 11 }}>By department</div>
          {ins.byDepartment.length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>No requests yet.</div> :
            ins.byDepartment.map((d) => {
              const sk = DEPT_SKIN[d.dept] ?? DEPT_SKIN.front_desk;
              return (
                <div key={d.dept} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#3A413B", marginBottom: 3 }}>
                    <span>{DEPT_LABEL[d.dept] ?? d.dept}</span>
                    <span style={{ color: "#8A8577" }}>{d.requests}{d.declined > 0 ? " \u00b7 " + d.declined + " declined" : ""}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: "#F3F1EA" }}>
                    <span style={{ display: "block", height: "100%", width: (d.requests / maxDept) * 100 + "%", background: sk.accent, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={card}>
        <div style={{ ...lbl, marginBottom: 11 }}>Happening across the portfolio</div>
        {ins.activity.length === 0 ? <div style={{ fontSize: 12.5, color: "#B4B9B3" }}>Nothing in the last 30 days.</div> :
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ins.activity.slice(0, 12).map((a, i) => {
              const sk = DEPT_SKIN[a.dept ?? ""] ?? DEPT_SKIN.front_desk;
              return (
                <div key={i} onClick={() => router.push("/founder/hotels/" + a.hotelId)}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: i ? "1px solid #F4F2EC" : "none", cursor: "pointer", flexWrap: "wrap" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: sk.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: INK, minWidth: 106 }}>{a.hotelName}</span>
                  <span style={{ fontSize: 12.5, color: "#8A8577", minWidth: 34 }}>{a.room ?? "\u2014"}</span>
                  <span style={{ flex: 1, minWidth: 150, fontSize: 12.5, color: "#3A413B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail ?? "\u2014"}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: a.status === "declined" ? RED : a.status === "resolved" ? GREEN : GOLD }}>{a.status}</span>
                  <span style={{ fontSize: 11, color: "#B4B9B3", whiteSpace: "nowrap" }}>{ago(a.at)}</span>
                </div>
              );
            })}
          </div>}
      </div>

      <style>{`@media (max-width: 900px) { .ins-grid { grid-template-columns: minmax(0,1fr) !important; } }`}</style>
    </div>
  );
}
