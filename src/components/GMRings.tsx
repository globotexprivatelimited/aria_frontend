"use client";
import { useEffect, useState } from "react";
import type { Req } from "../app/_actions/requests";
import { useBreakpoint } from "../lib/useBreakpoint";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";

function Ring({ pct, color, label, sub, size = 120 }: { pct: number; color: string; label: string; sub: string; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 900;
    const tick = (t: number) => { const k = Math.min(1, (t - start) / dur); setShown(pct * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [pct]);
  const strokeW = size < 100 ? 7 : 10;
  const r = (size - strokeW * 2) / 2, c = 2 * Math.PI * r, off = c * (1 - shown / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFEFE9" strokeWidth={strokeW} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: size < 100 ? 18 : 25, fontWeight: 700, color: INK }}>{Math.round(shown)}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: size < 100 ? 11 : 12, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontSize: 9.5, color: "#9AA09A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    </div>
  );
}

export default function GMRings({ active, week }: { active: Req[]; week: Req[] }) {
  const { isMobile } = useBreakpoint();
  const weekResolved = week.filter((r) => r.status === "resolved").length;
  const resolutionRate = week.length ? Math.round((weekResolved / week.length) * 100) : 0;
  const activeLoad = Math.min(100, Math.round((active.length / 20) * 100)); // 20 = "busy" ceiling
  const urgentActive = active.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const urgentRatio = active.length ? Math.round((urgentActive / active.length) * 100) : 0;
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: isMobile ? "16px 12px" : 20 };
  const ringSize = isMobile ? 84 : 116;
  return (
    <div style={card}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600, marginBottom: 16 }}>Performance at a glance</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: isMobile ? 8 : 12 }}>
        <Ring pct={resolutionRate} color={GREEN} label="Resolution" sub="this week" size={ringSize} />
        <Ring pct={activeLoad} color={GOLD} label="Current load" sub={active.length + " active"} size={ringSize} />
        <Ring pct={urgentRatio} color={urgentRatio > 0 ? RED : GREEN} label="Urgent share" sub={urgentActive + " urgent"} size={ringSize} />
      </div>
    </div>
  );
}