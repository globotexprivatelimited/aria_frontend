"use client";
import type { RevSummary, RevPoint, RevDept, RevHour } from "../app/gm/revenue/revenue-actions";

const INK = "#1B2621", GOLD = "#B08A4F", GREEN = "#0F5F4C";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");

const DEPT_TONE: Record<string, { c: string; label: string }> = {
  fb:          { c: "#B4703A", label: "In-Room Dining" },
  housekeeping:{ c: "#5B8C6E", label: "Housekeeping" },
  spa:         { c: "#7C7FA8", label: "Spa" },
  front_desk:  { c: "#0F5F4C", label: "Front Desk" },
  dining:      { c: "#9B4A52", label: "Dining" },
  maintenance: { c: "#4E6B84", label: "Maintenance" },
};
const tone = (d: string) => DEPT_TONE[d] ?? { c: "#8A8577", label: d };

/** Smooth cubic path through points - the wave language used across this page. */
function wavePath(vals: number[], w: number, h: number, pad = 2): { line: string; area: string } {
  if (vals.length < 2) return { line: "", area: "" };
  const max = Math.max(...vals, 1);
  const step = w / (vals.length - 1);
  const pts = vals.map((v, i) => [i * step, h - pad - (v / max) * (h - pad * 2)] as [number, number]);
  let d = "M" + pts[0][0] + "," + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += " C" + cx + "," + y0 + " " + cx + "," + y1 + " " + x1 + "," + y1;
  }
  return { line: d, area: d + " L" + w + "," + h + " L0," + h + " Z" };
}

export default function RevenueFlow({
  summary, series, byDept, byHour,
}: { summary: RevSummary; series: RevPoint[]; byDept: RevDept[]; byHour: RevHour[] }) {
  const vals = series.map((p) => p.revenue);
  const W = 900, H = 150;
  const { line, area } = wavePath(vals.length ? vals : [0, 0], W, H);
  const deptTotal = byDept.reduce((s, d) => s + d.revenue, 0) || 1;
  const peak = byHour.reduce((a, b) => (b.revenue > (a?.revenue ?? -1) ? b : a), byHour[0]);

  const tiles = [
    { label: "Today", value: money(summary.today), tint: "#B4703A" },
    { label: "This week", value: money(summary.week), tint: "#5B8C6E" },
    { label: "Orders", value: String(summary.transactions), tint: "#7C7FA8" },
    { label: "Average order", value: money(summary.avgOrder), tint: GOLD },
  ];

  return (
    <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid #EAE7DE", background: "#fff" }}>
      {/* headline over the wave */}
      <div style={{ position: "relative", padding: "26px 26px 0", background: "linear-gradient(180deg,#FEFDFB 0%,#FBFAF6 100%)" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Revenue in motion</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 46, fontWeight: 700, color: INK, lineHeight: 1, letterSpacing: "-1px" }}>{money(summary.total)}</span>
          <span style={{ fontSize: 13, color: "#8A8577" }}>all time &middot; {summary.transactions} orders</span>
          {peak && peak.revenue > 0 ? (
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#6E756F" }}>
              busiest at <b style={{ color: INK }}>{peak.label}</b>
            </span>
          ) : null}
        </div>

        <svg viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" style={{ width: "100%", height: 150, display: "block", marginTop: 14 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity=".26" />
              <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={GREEN} />
              <stop offset="70%" stopColor="#2E7D5B" />
              <stop offset="100%" stopColor={GOLD} />
            </linearGradient>
          </defs>
          {area ? <path d={area} fill="url(#revFill)" /> : null}
          {line ? <path d={line} fill="none" stroke="url(#revStroke)" strokeWidth="2.5" strokeLinecap="round" /> : null}
        </svg>
      </div>

      {/* wave divider */}
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: "100%", height: 26, display: "block", marginTop: -1 }}>
        <path d="M0,20 C240,42 480,-2 720,18 C960,38 1200,4 1440,20 L1440,40 L0,40 Z" fill="#FBFAF6" />
      </svg>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", background: "#FBFAF6", borderTop: "1px solid #F1EEE6" }}>
        {tiles.map((t, i) => (
          <div key={t.label} style={{ padding: "16px 20px", borderLeft: i ? "1px solid #F1EEE6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 2, background: t.tint }} />
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395" }}>{t.label}</span>
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: INK, marginTop: 5 }}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* department mix - a real proportion bar, not a decorative one */}
      {byDept.length > 0 ? (
        <div style={{ padding: "18px 26px 24px", borderTop: "1px solid #F1EEE6" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginBottom: 10 }}>Where it comes from</div>
          <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", background: "#F3F1EA" }}>
            {byDept.map((d) => (
              <span key={d.dept} title={tone(d.dept).label + " " + money(d.revenue)}
                style={{ width: (d.revenue / deptTotal) * 100 + "%", background: tone(d.dept).c, transition: "width .5s" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 11 }}>
            {byDept.map((d) => (
              <span key={d.dept} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#6E756F" }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: tone(d.dept).c }} />
                {tone(d.dept).label}
                <b style={{ color: INK }}>{money(d.revenue)}</b>
                <span style={{ color: "#B4B9B3" }}>{Math.round((d.revenue / deptTotal) * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
