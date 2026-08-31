"use client";
import { useMemo } from "react";
import type { Req } from "../app/_actions/requests";

const GREEN = "#0F5F4C", INK = "#1B2621";

export default function GMLeaderboard({ week }: { week: Req[] }) {
  const top = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of week) { const key = (r.requestDetail || "Other").trim().slice(0, 40); counts[key] = (counts[key] ?? 0) + 1; }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [week]);
  const max = Math.max(1, ...top.map((t) => t[1]));
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  return (
    <div style={card}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600, marginBottom: 16 }}>Top requests &middot; this week</div>
      {top.length === 0 ? (
        <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No requests yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {top.map(([label, count], i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: i === 0 ? GREEN : "#C7C2B4" }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: INK, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
                <div style={{ height: 6, background: "#F0F0EA", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: (count / max) * 100 + "%", height: "100%", background: GREEN, borderRadius: 999, transition: "width .6s" }} />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontFamily: "Georgia, serif" }}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}