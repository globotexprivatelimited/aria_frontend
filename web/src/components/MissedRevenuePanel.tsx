"use client";
import { useEffect, useState, useCallback } from "react";
import { getMissedDemand, markAddressed, type MissedData } from "../app/gm/revenue/missed-actions";
import { DEPT_SKIN } from "./DeptCard";

const INK = "#1B2621", RED = "#B23A2A", GOLD = "#B08A4F";
const rupee = "\u20B9";
const DEPT_LABEL: Record<string, string> = {
  fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa",
  front_desk: "Front Desk", dining: "Dining", maintenance: "Maintenance",
};
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function MissedRevenuePanel({ hotelId }: { hotelId: string }) {
  const [data, setData] = useState<MissedData | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => { if (hotelId) setData(await getMissedDemand(hotelId, days)); }, [hotelId, days]);
  useEffect(() => { load(); }, [load]);

  if (!data) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid #EAE7DE", borderRadius: 18, padding: 24, marginTop: 20, position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: RED, opacity: .85 }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: RED }}>Demand you could not serve</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 23, fontWeight: 600, color: INK, marginTop: 4 }}>What guests asked for and did not get</h3>
          <p style={{ fontSize: 13, color: "#6E756F", marginTop: 5, maxWidth: 520 }}>
            Every declined or unavailable request, grouped by what was wanted. Add the ones worth having.
          </p>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} style={{ borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (days === d ? INK : "#EAE7DE"), background: days === d ? "#F5F3EE" : "#fff", color: days === d ? INK : "#A8A395" }}>{d}d</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, marginTop: 18, paddingTop: 16, borderTop: "1px solid #F1EEE6" }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: RED, lineHeight: 1 }}>{rupee}{Math.round(data.totalLoss).toLocaleString()}</div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 4 }}>estimated loss</div>
        </div>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: INK, lineHeight: 1 }}>{data.totalMissed}</div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 4 }}>requests missed</div>
        </div>
        {data.unpriced > 0 ? (
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{data.unpriced}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 4 }}>not yet priceable</div>
          </div>
        ) : null}
      </div>

      {data.groups.length === 0 ? (
        <div style={{ marginTop: 20, padding: "28px 0", textAlign: "center", color: "#B4B9B3", fontSize: 13.5, border: "1px dashed #E3DECF", borderRadius: 12 }}>
          Nothing missed in this period. Every request was served.
        </div>
      ) : (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.groups.map((g) => {
            const skin = DEPT_SKIN[g.department] ?? DEPT_SKIN.front_desk;
            const isOpen = open === g.department + g.item;
            return (
              <div key={g.department + g.item} style={{ border: "1px solid #EFEBE2", borderRadius: 12, overflow: "hidden", background: "#FDFCFA" }}>
                <button onClick={() => setOpen(isOpen ? null : g.department + g.item)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: skin.accent, flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.item}</span>
                    <span style={{ fontSize: 11.5, color: "#9AA09A" }}>{DEPT_LABEL[g.department] ?? g.department}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>{g.timesAsked}&times; asked</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: g.estimatedLoss ? RED : "#C8CCC6", fontFamily: "Georgia, serif", minWidth: 74, textAlign: "right" }}>
                    {g.estimatedLoss ? "~" + rupee + Math.round(g.estimatedLoss).toLocaleString() : "unpriced"}
                  </span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B4B9B3" strokeWidth="2.6" strokeLinecap="round" style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .18s" }}><path d="M9 18l6-6-6-6" /></svg>
                </button>

                {isOpen ? (
                  <div style={{ borderTop: "1px solid #F1EEE6", padding: "12px 15px", background: "#fff" }}>
                    {g.estimateBasis ? <div style={{ fontSize: 11, color: "#A8A395", marginBottom: 9 }}>Estimate: {g.estimateBasis}</div> : null}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {g.instances.map((x, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: 12.5, color: "#3A413B", paddingBottom: 6, borderBottom: i < g.instances.length - 1 ? "1px solid #F6F4EE" : "none" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, minWidth: 42 }}>{x.room ?? "\u2014"}</span>
                          <span style={{ color: "#9AA09A", minWidth: 108 }}>{when(x.when)}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>{x.detail}{x.reason ? <em style={{ color: "#A8A395" }}> &mdash; {x.reason}</em> : null}</span>
                          <span style={{ fontSize: 10.5, color: x.source === "not_offered" ? GOLD : "#9AA09A", whiteSpace: "nowrap" }}>{x.source === "not_offered" ? "not offered" : "declined"}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={async () => { await markAddressed({ hotelId, department: g.department, item: g.item }); load(); }}
                      style={{ marginTop: 12, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + skin.accent + "44", background: skin.tint, color: skin.accent }}>
                      We offer this now &mdash; stop counting it
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
