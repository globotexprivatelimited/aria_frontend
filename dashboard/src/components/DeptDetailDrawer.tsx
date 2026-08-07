"use client";
import { useEffect, useState, useCallback } from "react";
import { getDepartmentDetail, type DeptDetail } from "../app/gm/departments/detail-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A", INK = "#1B2621";
const clock = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;
const dur = (m: number | null) => m == null ? null : m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m";

export default function DeptDetailDrawer({ hotelId, dept, deptLabel, onClose }: { hotelId: string; dept: string; deptLabel: string; onClose: () => void }) {
  const [data, setData] = useState<DeptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const d = await getDepartmentDetail(hotelId, dept);
    setData(d); setLoading(false);
  }, [hotelId, dept]);
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, [load]);

  const statusPill = (s: string) => {
    const map: Record<string, { bg: string; fg: string; label: string }> = {
      received: { bg: "#FBEDE9", fg: RED, label: "Waiting" },
      in_progress: { bg: "#F7F1E4", fg: GOLD, label: "In progress" },
      resolved: { bg: "#EAF2ED", fg: GREEN, label: "Done" },
    };
    const c = map[s] ?? map.received;
    return <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10.5, fontWeight: 700, background: c.bg, color: c.fg, textTransform: "uppercase", letterSpacing: ".05em" }}>{c.label}</span>;
  };

  const step = (label: string, time: string | null, done: boolean, extra?: string | null) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: done ? GREEN : "#DDD9CE", flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: done ? INK : "#B4B9B3", whiteSpace: "nowrap" }}>
        {label}{time ? " " + time : ""}{extra ? <span style={{ color: GOLD, marginLeft: 4 }}>({extra})</span> : null}
      </span>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(27,38,33,.35)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: "94vw", background: "#F8F7F3", height: "100%", overflowY: "auto", boxShadow: "-20px 0 60px rgba(0,0,0,.2)", animation: "slideIn .28s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "#FEFDFB", borderBottom: "1px solid #EAEAE4", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: GOLD }}>Live activity</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 600, color: INK, marginTop: 3 }}>{deptLabel}</h2>
            </div>
            <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 10, background: "#F5F1E8", border: "1px solid #E9E4D8", cursor: "pointer", color: "#6E756F", fontSize: 17 }}>&times;</button>
          </div>
          {data ? (
            <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
              {[["Waiting", data.counts.open, RED], ["In progress", data.counts.inProgress, GOLD], ["Done today", data.counts.resolvedToday, GREEN]].map(([l, n, col]) => (
                <div key={l as string}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: col as string }}>{n as number}</div>
                  <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "#A8A395" }}>{l as string}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ padding: "20px 24px 40px" }}>
          {loading ? <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: 30 }}>Loading&hellip;</div> : null}

          {data && data.staff.length > 0 ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: GOLD, marginBottom: 9 }}>Staff today</div>
              <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 12, overflow: "hidden" }}>
                {data.staff.map((s, i) => (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr 1fr 1fr", padding: "11px 15px", borderTop: i ? "1px solid #F2F0EA" : "none", fontSize: 12.5, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: INK }}>{s.name}</span>
                    <span style={{ color: GREEN, fontWeight: 700 }}>{s.handledToday}</span>
                    <span style={{ color: "#6E756F" }}>resp {dur(s.avgResponseMins) ?? "\u2014"}</span>
                    <span style={{ color: "#6E756F" }}>done {dur(s.avgResolveMins) ?? "\u2014"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: GOLD, marginBottom: 9 }}>Requests</div>
          {data && data.requests.length === 0 ? (
            <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "30px 0", background: "#fff", borderRadius: 12, border: "1px dashed #E3DECF" }}>Nothing here in the last 7 days.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {data?.requests.map((r) => (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #EAEAE4", borderLeft: "3px solid " + (r.priority === "urgent" ? RED : r.status === "resolved" ? GREEN : GOLD), borderRadius: 11, padding: "13px 15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: INK }}>{r.room ?? "\u2014"}</span>
                    {statusPill(r.status)}
                    {r.priority === "urgent" ? <span style={{ fontSize: 10, fontWeight: 700, color: RED }}>URGENT</span> : null}
                    {r.waitingMins != null ? <span style={{ marginLeft: "auto", fontSize: 11.5, color: RED, fontWeight: 600 }}>waiting {dur(r.waitingMins)}</span> : null}
                    {r.claimedBy ? <span style={{ marginLeft: r.waitingMins != null ? 0 : "auto", fontSize: 11.5, color: "#6E756F" }}>{r.claimedBy}</span> : null}
                  </div>
                  <div style={{ fontSize: 13.5, color: "#3A413B", marginBottom: 9 }}>{r.detail ?? "\u2014"}</div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid #F4F2EC" }}>
                    {step("Received", clock(r.createdAt), true)}
                    {step("Claimed", clock(r.claimedAt), !!r.claimedAt, dur(r.timeToClaimMins))}
                    {step("Done", clock(r.resolvedAt), !!r.resolvedAt, dur(r.timeToResolveMins))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  );
}
