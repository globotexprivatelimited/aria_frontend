"use client";
import { useMemo } from "react";
import type { Req } from "../app/_actions/requests";
import { DEPARTMENTS } from "../lib/departments";

const DEPT_COLORS: Record<string, string> = { fb: "#0F5F4C", housekeeping: "#3A6EA5", spa: "#8E5AA8", front_desk: "#B08A4F" };
const INK = "#1B2621";

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data), w = 120, h = 34;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polygon points={area} fill={color} opacity={0.1} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function GMDeptCards({ active, week }: { active: Req[]; week: Req[] }) {
  const now = new Date();
  const cards = useMemo(() => DEPARTMENTS.map((dp) => {
    const series: number[] = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const key = d.toDateString(); series.push(week.filter((r) => r.department === dp.dept && new Date(r.createdAt).toDateString() === key).length); }
    const openCount = active.filter((r) => r.department === dp.dept && r.status !== "resolved").length;
    const weekCount = week.filter((r) => r.department === dp.dept).length;
    const resolved = week.filter((r) => r.department === dp.dept && r.status === "resolved").length;
    const rate = weekCount ? Math.round((resolved / weekCount) * 100) : 0;
    return { ...dp, series, openCount, weekCount, rate, color: DEPT_COLORS[dp.dept] ?? "#B08A4F" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [active, week]);
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  return (
    <div style={card}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600, marginBottom: 16 }}>Department performance</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {cards.map((c) => (
          <div key={c.dept} style={{ border: "1px solid #F0F0EA", borderRadius: 12, padding: 14, background: "#FCFCFA" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.label}</span>
              </div>
              {c.openCount > 0 ? <span style={{ fontSize: 10, fontWeight: 600, color: c.color, background: c.color + "16", borderRadius: 999, padding: "2px 8px" }}>{c.openCount} open</span> : <span style={{ fontSize: 10, color: "#B4B9B3" }}>clear</span>}
            </div>
            <Spark data={c.series} color={c.color} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#9AA09A" }}>
              <span><b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 15 }}>{c.weekCount}</b> this week</span>
              <span><b style={{ color: c.rate >= 70 ? "#0F5F4C" : "#B08A4F", fontFamily: "Georgia, serif", fontSize: 15 }}>{c.rate}%</b> resolved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}