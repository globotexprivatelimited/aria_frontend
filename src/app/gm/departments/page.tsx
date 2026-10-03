"use client";
import { whoAmI } from "../../../lib/whoami";

import { useEffect, useState, useCallback } from "react";
import { getHotelActive, type Req as RequestRow } from "../../_actions/requests";
import { DEPARTMENTS } from "../../../lib/departments";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import MenuEditor from "../../../components/MenuEditor";
import DeptItemManager from "../../../components/DeptItemManager";
import MaintenanceManager from "../../../components/MaintenanceManager";
import { getDepartmentPresence, type DeptPresence } from "./presence-actions";
import { getDeptModes, setDeptMode, type DeptMode, type DeptModeRow } from "./mode-actions";
import DeptDetailDrawer from "../../../components/DeptDetailDrawer";
import DeptCard from "../../../components/DeptCard";
import DiningManager from "../../../components/DiningManager";
import SlotEditor from "../../../components/SlotEditor";
import type { DeptConfig } from "../../../lib/departments";
import { DepartmentsSkeleton } from "../../../components/Skeleton";
import { LuxuryStars } from "../../../components/LuxuryStars";

export default function GMDepartments() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName, loading: hotelLoading } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [managing, setManaging] = useState<DeptConfig | null>(null);
  const [presence, setPresence] = useState<DeptPresence[]>([]);
  const [modes, setModes] = useState<DeptModeRow[]>([]);
  const [detailFor, setDetailFor] = useState<DeptConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    try {
      const [r, p, m] = await Promise.all([getHotelActive(HOTEL_ID), getDepartmentPresence(HOTEL_ID), getDeptModes(HOTEL_ID)]);
      setRows(r);
      setPresence(p);
      setModes(m);
      setConnected(true);
    } finally {
      setLoading(false);
    }
  }, [HOTEL_ID]);

  useEffect(() => {
    if (!HOTEL_ID) {
      if (!hotelLoading) setLoading(false);
      return;
    }
    load();
    const iv = setInterval(load, 15000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID, hotelLoading]);

  const statFor = (dept: string) => {
    const list = rows.filter((r) => r.department === dept);
    return {
      open: list.filter((r) => r.status === "received").length,
      inProgress: list.filter((r) => r.status === "in_progress").length,
      resolved: list.filter((r) => r.status === "resolved").length,
      urgent: list.filter((r) => r.priority === "urgent" && r.status !== "resolved").length,
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>
        {loading ? (
          <DepartmentsSkeleton />
        ) : (
          <>
            {/* Grandoria Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <LuxuryStars count={5} size={11} color="#B08A4F" gap={2} />
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Operations &middot; Divisions</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: "#0D1F1A", margin: 0, letterSpacing: "-0.01em" }}>
                  {hotelName} &middot; Departments
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4A5D56", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 999, padding: "7px 16px", boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: connected ? "#2ECC71" : "#F0B429", boxShadow: connected ? "0 0 0 3px rgba(46,204,113,.2)" : "none" }} />
                {connected ? "Live &middot; Synced" : "Connecting..."}
              </div>
            </div>

            {(() => {
              const label = (k: string) => DEPARTMENTS.find((x) => x.dept === k)?.label ?? k;
              const unattended = presence.filter((p) => p.assignedCount > 0 && !p.online).map((p) => label(p.dept));
              const unstaffed = presence.filter((p) => p.assignedCount === 0).map((p) => label(p.dept));
              if (presence.length === 0) return null;
              if (unattended.length === 0 && unstaffed.length === 0) {
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, borderRadius: 14, padding: "12px 18px", background: "#EBF3F0", border: "1px solid #C0DDD3", color: "#2F5D50", fontSize: 13.5, fontWeight: 500, boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                    Every department is actively staffed right now.
                  </div>
                );
              }
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {unattended.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 14, padding: "12px 18px", background: "#FDF7E7", border: "1px solid #EAD69E", color: "#8A6420", fontSize: 13.5, boxShadow: "0 2px 8px rgba(176,138,79,.08)" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                      <span><b>{unattended.length} department{unattended.length === 1 ? "" : "s"} unattended</b> &mdash; {unattended.join(", ")} {unattended.length === 1 ? "has" : "have"} staff assigned but no one is on duty.</span>
                    </div>
                  ) : null}
                  {unstaffed.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 14, padding: "12px 18px", background: "#FFFFFF", border: "1px solid #E2EBE7", color: "#4A5D56", fontSize: 13.5, boxShadow: "0 2px 8px rgba(0,0,0,.03)" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                      <span><b>{unstaffed.join(", ")}</b> {unstaffed.length === 1 ? "has" : "have"} no staff assigned yet. Assign staff from the Staff portal.</span>
                    </div>
                  ) : null}
                </div>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr 1fr", gap: 16, marginTop: 16 }}>
              {DEPARTMENTS.map((d) => {
                const s = statFor(d.dept);
                return (
                  <DeptCard
                    key={d.dept}
                    d={d}
                    stats={{ open: s.open, inProgress: s.inProgress, resolved: s.resolved, urgent: s.urgent }}
                    presence={presence.find((p) => p.dept === d.dept)}
                    modes={modes}
                    onOpenDetail={() => setDetailFor(d)}
                    onManage={() => setManaging(d)}
                    onSetMode={async (mode) => {
                      setModes((prev) => [...prev.filter((x) => x.dept !== d.dept), { dept: d.dept, mode }]);
                      const res = await setDeptMode({ changedBy: whoAmI(), hotelId: HOTEL_ID as string, dept: d.dept, mode });
                      if (!res.ok) setModes(await getDeptModes(HOTEL_ID as string));
                    }}
                  />
                );
              })}
            </div>

            <p style={{ marginTop: 20, fontSize: 13, color: "#8A9792", fontFamily: "'Poppins', sans-serif" }}>
              Each department team operates its dedicated board. Live volume metrics are synced in real time.
            </p>

            {managing && HOTEL_ID ? (
              <div onClick={() => setManaging(null)} style={{ position: "fixed", inset: 0, background: "rgba(13,31,26,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", zIndex: 60, overflowY: "auto" }}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 760, background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2EBE7", boxShadow: "0 24px 70px rgba(13,31,26,.32)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "#FAFBFB", borderBottom: "1px solid #E2EBE7" }}>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#B08A4F", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700 }}>{managing.dept === "fb" ? "Menu & inventory" : (managing.dept === "housekeeping" || managing.dept === "spa" || managing.dept === "front_desk") ? "Services & offerings" : "Bookable time slots"}</div>
                      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#0D1F1A", marginTop: 3 }}>{managing.label}</h2>
                    </div>
                    <button onClick={() => setManaging(null)} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F6F4", border: "1px solid #E2EBE7", cursor: "pointer", color: "#4A5D56", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>&times;</button>
                  </div>
                  <div style={{ padding: 24 }}>
                    {managing.dept === "dining"
                      ? <DiningManager hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                      : managing.dept === "maintenance"
                        ? <MaintenanceManager hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                        : managing.dept === "fb"
                          ? <MenuEditor hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                          : (managing.dept === "housekeeping" || managing.dept === "spa" || managing.dept === "front_desk")
                            ? <DeptItemManager hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                            : <SlotEditor hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />}
                  </div>
                </div>
              </div>
            ) : null}
            {detailFor ? (
              <DeptDetailDrawer hotelId={HOTEL_ID as string} dept={detailFor.dept} deptLabel={detailFor.label} mode={modes.find((m) => m.dept === detailFor.dept)?.mode ?? detailFor.type} onClose={() => setDetailFor(null)} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}