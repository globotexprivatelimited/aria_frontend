"use client";

import { useEffect, useState, useCallback } from "react";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import { DEPT_SKIN } from "../../../components/DeptCard";
import { getAllOpen, type GmReq } from "./requests-actions";
import { actOnRequest } from "../departments/action-actions";
import { getDeptModes, type DeptModeRow } from "../departments/mode-actions";
import { Skeleton, SkeletonCard } from "../../../components/Skeleton";

const INK = "#0D1F1A", GREEN = "#2F5D50", GOLD = "#B08A4F", RED = "#B23A2A";
const LABEL: Record<string, string> = {
  fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa",
  front_desk: "Front Desk", dining: "Dining", maintenance: "Maintenance",
};
const waited = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m";
};
const waitedMins = (iso: string) => Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);

export default function GmRequestsPage() {
  const { isMobile } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<GmReq[]>([]);
  const [modes, setModes] = useState<DeptModeRow[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    try {
      const [r, m] = await Promise.all([getAllOpen(HOTEL_ID), getDeptModes(HOTEL_ID)]);
      setRows(r);
      setModes(m);
    } finally {
      setLoading(false);
    }
  }, [HOTEL_ID]);
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [HOTEL_ID, load]);

  async function act(id: string, command: "ACCEPT" | "CLAIM" | "DONE" | "REJECT") {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setActing(id); setErr(null);
    const r = await actOnRequest({ token: tk, requestId: id, command });
    setActing(null);
    if (!r.ok) setErr(r.message ?? "That did not go through.");
    load();
  }

  const sorted = [...rows].sort((a, b) => {
    if ((a.priority === "urgent") !== (b.priority === "urgent")) return a.priority === "urgent" ? -1 : 1;
    return waitedMins(b.createdAt) - waitedMins(a.createdAt);
  });
  const waiting = sorted.filter((r) => r.status === "received").length;
  const working = sorted.filter((r) => r.status === "in_progress").length;

  const btn = (bg: string, bd: string, fg: string) => ({ borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + bd, background: bg, color: fg, transition: "all .15s ease" });

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", width: "100%", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>

        {/* Grandoria Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: GOLD, fontSize: 11, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: GOLD, fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Service Operations &middot; Queue</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em" }}>
              {hotelName} &middot; Guest Requests
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4A5D56", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 999, padding: "7px 16px", boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71", boxShadow: "0 0 0 3px rgba(46,204,113,.2)" }} />Live Synced
          </div>
        </div>

        {loading ? (
          <>
            <div style={{ display: "flex", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
              <SkeletonCard height={90} style={{ width: 170 }} />
              <SkeletonCard height={90} style={{ width: 170 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 16px rgba(47,93,80,0.04)" }}>
                  <Skeleton width={64} height={24} borderRadius={6} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="45%" height={16} style={{ marginBottom: 6 }} />
                    <Skeleton width="25%" height={12} />
                  </div>
                  <Skeleton width={80} height={18} />
                  <Skeleton width={100} height={32} borderRadius={999} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Grandoria KPI Metric Tiles */}
            <div style={{ display: "flex", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 16, padding: "16px 22px", minWidth: 150, boxShadow: "0 4px 16px rgba(47,93,80,0.04)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "#8A9792", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Awaiting Dispatch</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: waiting > 0 ? RED : INK, marginTop: 4 }}>{waiting}</div>
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 16, padding: "16px 22px", minWidth: 150, boxShadow: "0 4px 16px rgba(47,93,80,0.04)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "#8A9792", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>In Fulfillment</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: working > 0 ? GOLD : INK, marginTop: 4 }}>{working}</div>
              </div>
            </div>

            {err ? <div style={{ marginBottom: 16, borderRadius: 12, padding: "11px 16px", fontSize: 13, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}

            {sorted.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#8A9792", fontSize: 14, background: "#FFFFFF", border: "1px dashed #E2EBE7", borderRadius: 18 }}>
                No pending requests. All guest services are fulfilled.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sorted.map((r) => {
                  const skin = DEPT_SKIN[r.department ?? ""] ?? DEPT_SKIN.front_desk;
                  const mode = modes.find((m) => m.dept === r.department)?.mode ?? "accept_decline";
                  const approve = mode === "accept_decline";
                  const urgent = r.priority === "urgent";
                  const mins = waitedMins(r.createdAt);
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "#FFFFFF", border: "1px solid #E2EBE7", borderLeft: "4px solid " + (urgent ? RED : skin.accent), borderRadius: 16, padding: "16px 20px", boxShadow: "0 4px 16px rgba(47,93,80,0.04)" }}>
                      <div style={{ minWidth: 64 }}>
                        <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "#2F5D50", lineHeight: 1 }}>Suite {r.roomNumber ?? "\u2014"}</div>
                        <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#8A9792", marginTop: 4 }}>key</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 14, color: INK, fontWeight: 600 }}>{r.requestDetail ?? "\u2014"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: skin.accent, fontWeight: 600 }}>
                            <span style={{ width: 7, height: 7, borderRadius: 2, background: skin.accent }} />
                            {LABEL[r.department ?? ""] ?? r.department}
                          </span>
                          {urgent ? <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: ".08em", background: "#FBEDE9", border: "1px solid #EED7D0", borderRadius: 999, padding: "1px 8px" }}>URGENT</span> : null}
                          {r.claimedBy ? <span style={{ fontSize: 11.5, color: "#72837C" }}>handled by {r.claimedBy}</span> : null}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 70 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: mins > 20 ? RED : mins > 10 ? GOLD : "#72837C" }}>{waited(r.createdAt)}</div>
                        <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#8A9792", marginTop: 2 }}>waiting</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {r.status === "received" && approve ? (
                          <>
                            <button disabled={acting === r.id} onClick={() => act(r.id, "ACCEPT")} style={btn("#EBF3F0", "#C0DDD3", GREEN)}>Accept</button>
                            <button disabled={acting === r.id} onClick={() => act(r.id, "REJECT")} style={btn("#FBEDE9", "#EED7D0", RED)}>Decline</button>
                          </>
                        ) : r.status === "received" ? (
                          <button disabled={acting === r.id} onClick={() => act(r.id, "CLAIM")} style={btn("#FDF7E7", "#EAD69E", GOLD)}>Claim</button>
                        ) : null}
                        {r.status === "in_progress" ? (
                          <button disabled={acting === r.id} onClick={() => act(r.id, "DONE")} style={btn("#EBF3F0", "#C0DDD3", GREEN)}>Mark Done</button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
