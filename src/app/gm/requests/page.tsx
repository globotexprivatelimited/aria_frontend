"use client";

import { useEffect, useState, useCallback } from "react";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import { DEPT_SKIN } from "../../../components/DeptCard";
import { getAllOpen, type GmReq } from "./requests-actions";
import { actOnRequest } from "../departments/action-actions";
import { getDeptModes, type DeptModeRow } from "../departments/mode-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
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
  const { hotelId: HOTEL_ID } = useMyHotel();
  const [rows, setRows] = useState<GmReq[]>([]);
  const [modes, setModes] = useState<DeptModeRow[]>([]);
  const [acting, setActing] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getAllOpen(HOTEL_ID));
    setModes(await getDeptModes(HOTEL_ID));
  }, [HOTEL_ID]);
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, [HOTEL_ID, load]);

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

  const btn = (bg: string, bd: string, fg: string) => ({ borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + bd, background: bg, color: fg });

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", width: "100%", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "22px 16px 48px" : "40px 44px 64px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Everything open, everywhere</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: INK, marginTop: 4 }}>Requests</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 4 }}>
          Longest waiting first. You can cover any of these yourself when no one is on duty.
        </p>

        <div style={{ display: "flex", gap: 24, marginTop: 18, paddingBottom: 18, borderBottom: "1px solid #EAE7DE" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: waiting > 0 ? RED : "#C8CCC6", lineHeight: 1 }}>{waiting}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 4 }}>waiting</div>
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: working > 0 ? GOLD : "#C8CCC6", lineHeight: 1 }}>{working}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 4 }}>being handled</div>
          </div>
        </div>

        {err ? <div style={{ marginTop: 14, borderRadius: 10, padding: "10px 14px", fontSize: 13, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}

        {sorted.length === 0 ? (
          <div style={{ marginTop: 26, padding: "40px 0", textAlign: "center", color: "#B4B9B3", fontSize: 14, border: "1px dashed #E3DECF", borderRadius: 14 }}>
            Nothing open. Every request has been handled.
          </div>
        ) : (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
            {sorted.map((r) => {
              const skin = DEPT_SKIN[r.department ?? ""] ?? DEPT_SKIN.front_desk;
              const mode = modes.find((m) => m.dept === r.department)?.mode ?? "accept_decline";
              const approve = mode === "accept_decline";
              const urgent = r.priority === "urgent";
              const mins = waitedMins(r.createdAt);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", background: "#fff", border: "1px solid #EAE7DE", borderLeft: "4px solid " + (urgent ? RED : skin.accent), borderRadius: 13, padding: "14px 16px" }}>
                  <div style={{ minWidth: 52 }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, color: INK, lineHeight: 1 }}>{r.roomNumber ?? "\u2014"}</div>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#B4B9B3", marginTop: 3 }}>room</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 14, color: INK, fontWeight: 500 }}>{r.requestDetail ?? "\u2014"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: skin.accent, fontWeight: 600 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: skin.accent }} />
                        {LABEL[r.department ?? ""] ?? r.department}
                      </span>
                      {urgent ? <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: ".05em" }}>URGENT</span> : null}
                      {r.claimedBy ? <span style={{ fontSize: 11.5, color: "#8A8577" }}>with {r.claimedBy}</span> : null}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 66 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: mins > 20 ? RED : mins > 10 ? GOLD : "#8A8577" }}>{waited(r.createdAt)}</div>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "#B4B9B3", marginTop: 2 }}>waiting</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.status === "received" && approve ? (
                      <>
                        <button disabled={acting === r.id} onClick={() => act(r.id, "ACCEPT")} style={btn("#EAF2ED", "#CFE5DC", GREEN)}>Accept</button>
                        <button disabled={acting === r.id} onClick={() => act(r.id, "REJECT")} style={btn("#FBEDE9", "#EED7D0", RED)}>Decline</button>
                      </>
                    ) : r.status === "received" ? (
                      <button disabled={acting === r.id} onClick={() => act(r.id, "CLAIM")} style={btn("#F7F1E4", "#EDD9B4", GOLD)}>Claim</button>
                    ) : null}
                    {r.status === "in_progress" ? (
                      <button disabled={acting === r.id} onClick={() => act(r.id, "DONE")} style={btn("#EAF2ED", "#CFE5DC", GREEN)}>Mark done</button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
