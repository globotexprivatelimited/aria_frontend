"use client";

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


export default function GMDepartments() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [managing, setManaging] = useState<DeptConfig | null>(null);
  const [presence, setPresence] = useState<DeptPresence[]>([]);
  const [modes, setModes] = useState<DeptModeRow[]>([]);
  const [detailFor, setDetailFor] = useState<DeptConfig | null>(null);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getHotelActive(HOTEL_ID));
    setPresence(await getDepartmentPresence(HOTEL_ID));
    setModes(await getDeptModes(HOTEL_ID));
  }, [HOTEL_ID]);

  useEffect(() => {
    load();
    if (!HOTEL_ID) return;
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID]);

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
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Departments</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; a live overview of every department
        </p>

        {(() => {
          const label = (k: string) => DEPARTMENTS.find((x) => x.dept === k)?.label ?? k;
          const unattended = presence.filter((p) => p.assignedCount > 0 && !p.online).map((p) => label(p.dept));
          const unstaffed = presence.filter((p) => p.assignedCount === 0).map((p) => label(p.dept));
          if (presence.length === 0) return null;
          if (unattended.length === 0 && unstaffed.length === 0) {
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16, borderRadius: 12, padding: "11px 16px", background: "#EAF2ED", border: "1px solid #CFE5DC", color: "#0F5F4C", fontSize: 13.5, fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                Every department is staffed right now.
              </div>
            );
          }
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {unattended.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: "12px 16px", background: "#FBF3E6", border: "1px solid #EDD9B4", color: "#8A6420", fontSize: 13.5 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span><b>{unattended.length} department{unattended.length === 1 ? "" : "s"} unattended</b> &mdash; {unattended.join(", ")} {unattended.length === 1 ? "has" : "have"} staff assigned but no one is on duty.</span>
                </div>
              ) : null}
              {unstaffed.length > 0 ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: "12px 16px", background: "#F5F5F0", border: "1px solid #E7E3D8", color: "#6E756F", fontSize: 13.5 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                  <span><b>{unstaffed.join(", ")}</b> {unstaffed.length === 1 ? "has" : "have"} no staff assigned yet. Assign someone from the Staff page.</span>
                </div>
              ) : null}
            </div>
          );
        })()}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr 1fr", gap: 16, marginTop: 24 }}>
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
                  const res = await setDeptMode({ hotelId: HOTEL_ID as string, dept: d.dept, mode });
                  if (!res.ok) setModes(await getDeptModes(HOTEL_ID as string));
                }}
              />
            );
          })}
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "#9AA09A" }}>
          Each department team works its own board. You see live counts here for oversight.
        </p>

        {managing && HOTEL_ID ? (
          <div onClick={() => setManaging(null)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", zIndex: 60, overflowY: "auto" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 760, background: "#F4F1EA", borderRadius: 18, boxShadow: "0 24px 70px rgba(0,0,0,.28)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", background: "#FEFDFB", borderBottom: "1px solid #E9E4D8" }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#B08A4F" }}>{managing.dept === "fb" ? "Menu & inventory" : (managing.dept === "housekeeping" || managing.dept === "spa" || managing.dept === "front_desk") ? "Services & offerings" : "Bookable time slots"}</div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: 23, fontWeight: 600, color: "#1B2621", marginTop: 3 }}>{managing.label}</h2>
                </div>
                <button onClick={() => setManaging(null)} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F1E8", border: "1px solid #E9E4D8", cursor: "pointer", color: "#6E756F", fontSize: 18, lineHeight: 1 }}>&times;</button>
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
      </div>
    </div>
  );
}