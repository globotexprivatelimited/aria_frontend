"use client";
import { useMemo } from "react";
import type { Req } from "../app/_actions/requests";

const GREEN = "#0F5F4C", INK = "#1B2621";

export default function GMHeatmap({ week }: { week: Req[] }) {
  const now = new Date();
  const { grid, days, max } = useMemo(() => {
    const days: string[] = [];
    const grid: number[][] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { weekday: "short" }));
      const key = d.toDateString();
      const hours = Array.from({ length: 24 }, () => 0);
      for (const r of week) { const rd = new Date(r.createdAt); if (rd.toDateString() === key) hours[rd.getHours()] += 1; }
      grid.push(hours);
    }
    const max = Math.max(1, ...grid.flat());
    return { grid, days, max };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const shade = (v: number) => v === 0 ? "#F3F3ED" : `rgba(15,95,76,${0.15 + (v / max) * 0.85})`;
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  const hourLabels = [0, 6, 12, 18];

  return (
    <div style={card}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600, marginBottom: 16 }}>Activity heatmap &middot; 7 days &times; 24 hours</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {grid.map((hours, di) => (
          <div key={di} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 28, fontSize: 10, color: "#9AA09A", textAlign: "right" }}>{days[di]}</span>
            <div style={{ display: "flex", gap: 2, flex: 1 }}>
              {hours.map((v, hi) => (
                <div key={hi} title={days[di] + " " + hi + ":00 - " + v + " requests"} style={{ flex: 1, aspectRatio: "1", borderRadius: 2, background: shade(v), minWidth: 0 }} />
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <span style={{ width: 28 }} />
          <div style={{ display: "flex", flex: 1, justifyContent: "space-between", fontSize: 9, color: "#B4B9B3", paddingRight: 4 }}>
            <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
          </div>
        </div>
      </div>
    </div>
  );
}