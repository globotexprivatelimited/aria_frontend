"use client";
import { useMemo } from "react";
import type { Req } from "../app/_actions/requests";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";

export default function GMFloorGrid({ active }: { active: Req[] }) {
  // build room status from active requests keyed by roomNumber
  const rooms = useMemo(() => {
    const map: Record<string, { urgent: boolean; working: boolean; open: boolean; count: number }> = {};
    for (const r of active) {
      const rm = (r.roomNumber || "").trim();
      if (!rm) continue;
      if (!map[rm]) map[rm] = { urgent: false, working: false, open: false, count: 0 };
      map[rm].count += 1;
      if (r.priority === "urgent" && r.status !== "resolved") map[rm].urgent = true;
      if (r.status === "in_progress") map[rm].working = true;
      if (r.status === "received") map[rm].open = true;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  }, [active]);

  const colorOf = (s: { urgent: boolean; working: boolean; open: boolean }) =>
    s.urgent ? RED : s.open ? GREEN : s.working ? GOLD : "#D8D8D0";
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600 }}>Rooms with activity</div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#9AA09A" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: RED }} />Urgent</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: GREEN }} />New</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: GOLD }} />Working</span>
        </div>
      </div>
      {rooms.length === 0 ? (
        <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No rooms with open requests</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 8 }}>
          {rooms.map(([rm, s]) => (
            <div key={rm} title={s.count + " request(s)"} style={{ aspectRatio: "1", borderRadius: 10, background: colorOf(s) + "1A", border: "1.5px solid " + colorOf(s), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "default" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: colorOf(s), fontFamily: "Georgia, serif" }}>{rm}</span>
              {s.count > 1 ? <span style={{ fontSize: 9, color: colorOf(s), opacity: 0.8 }}>{s.count}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}