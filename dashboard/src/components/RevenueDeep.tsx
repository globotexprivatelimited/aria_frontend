"use client";
import type { RevDept, RevHour, RevRoom } from "../app/gm/revenue/revenue-actions";
import { DEPARTMENTS } from "../lib/departments";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621";
const rupee = "\u20B9";
const fmt = (n: number) => rupee + n.toLocaleString("en-IN");
const DEPT_COLORS: Record<string, string> = { fb: "#0F5F4C", housekeeping: "#3A6EA5", spa: "#8E5AA8", front_desk: "#B08A4F" , dining: "#B0763A", maintenance: "#7A6A55" };
const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;

export default function RevenueDeep({ byDept, byHour, byRoom }: { byDept: RevDept[]; byHour: RevHour[]; byRoom: RevRoom[] }) {
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  const cardTitle = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 16 };
  const maxDept = Math.max(1, ...byDept.map((d) => d.revenue));
  const maxHour = Math.max(1, ...byHour.map((h) => h.revenue));
  const maxRoom = Math.max(1, ...byRoom.map((r) => r.revenue));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Revenue by department */}
      <div style={card}>
        <div style={cardTitle}>Revenue by department</div>
        {byDept.length === 0 ? <div style={{ color: "#B4B9B3", fontSize: 13, padding: "16px 0", textAlign: "center" }}>No orders yet</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {byDept.map((d) => (
              <div key={d.dept}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: INK }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: DEPT_COLORS[d.dept] ?? GOLD }} />
                    {deptLabel(d.dept)}<span style={{ color: "#B4B9B3", fontSize: 11 }}>&middot; {d.orders} orders</span>
                  </span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: INK }}>{fmt(d.revenue)}</span>
                </div>
                <div style={{ height: 8, background: "#F0F0EA", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: (d.revenue / maxDept) * 100 + "%", height: "100%", background: DEPT_COLORS[d.dept] ?? GOLD, borderRadius: 999, transition: "width .6s" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly revenue + top rooms */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={cardTitle}>Revenue by hour &middot; when money comes in</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130 }}>
            {byHour.map((h) => (
              <div key={h.hour} title={h.label + ": " + fmt(h.revenue)} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                <div style={{ width: "100%", height: (h.revenue / maxHour) * 100 + "%", minHeight: h.revenue > 0 ? 3 : 0, background: h.revenue > 0 ? GREEN : "transparent", borderRadius: "3px 3px 0 0", transition: "height .5s" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#B4B9B3", marginTop: 6 }}>
            <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
          </div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Top rooms by spend</div>
          {byRoom.length === 0 ? <div style={{ color: "#B4B9B3", fontSize: 13, padding: "16px 0", textAlign: "center" }}>No room orders</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {byRoom.slice(0, 6).map((r, i) => (
                <div key={r.room} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? GREEN + "18" : "#F3F3ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i === 0 ? GREEN : "#8A8577", fontFamily: "Georgia, serif" }}>{r.room}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ height: 6, background: "#F0F0EA", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: (r.revenue / maxRoom) * 100 + "%", height: "100%", background: GREEN, borderRadius: 999 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: INK, fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>{fmt(r.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}