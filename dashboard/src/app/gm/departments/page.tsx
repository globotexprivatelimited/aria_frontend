"use client";

import { useEffect, useState, useCallback } from "react";
import { getHotelActive, type Req as RequestRow } from "../../_actions/requests";
import { DEPARTMENTS } from "../../../lib/departments";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import MenuEditor from "../../../components/MenuEditor";
import DeptItemManager from "../../../components/DeptItemManager";
import SlotEditor from "../../../components/SlotEditor";
import type { DeptConfig } from "../../../lib/departments";


export default function GMDepartments() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [managing, setManaging] = useState<DeptConfig | null>(null);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getHotelActive(HOTEL_ID));
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
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Departments</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; a live overview of every department
        </p>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr 1fr", gap: 16, marginTop: 24 }}>
          {DEPARTMENTS.map((d) => {
            const s = statFor(d.dept);
            return (
              <div key={d.dept} style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621" }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: "#9AA09A", marginTop: 2 }}>{d.type === "auto" ? "Auto \u00b7 Claim / Done" : "Accept / Decline"}</div>
                  </div>
                  {s.urgent > 0 ? <span style={{ borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600, background: "#FBEDE9", color: "#B23A2A" }}>{s.urgent} urgent</span> : null}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
                  <div><div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, color: s.open > 0 ? "#0F5F4C" : "#C4C9C2" }}>{s.open}</div><div style={{ fontSize: 11, color: "#9AA09A" }}>open</div></div>
                  <div><div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, color: "#B08A4F" }}>{s.inProgress}</div><div style={{ fontSize: 11, color: "#9AA09A" }}>in progress</div></div>
                  <div><div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, color: "#9AA09A" }}>{s.resolved}</div><div style={{ fontSize: 11, color: "#9AA09A" }}>resolved</div></div>
                </div>
                <button onClick={() => setManaging(d)} style={{ marginTop: 16, width: "100%", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 600, color: "#0F5F4C", background: "#F1F6F2", border: "1px solid #DCEBE1", cursor: "pointer" }}>{d.type === "auto" ? "Manage menu & stock" : "Manage time slots"}</button>
              </div>
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
                {managing.dept === "fb"
                  ? <MenuEditor hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                  : (managing.dept === "housekeeping" || managing.dept === "spa" || managing.dept === "front_desk")
                  ? <DeptItemManager hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />
                  : <SlotEditor hotelId={HOTEL_ID} dept={managing.dept} deptLabel={managing.label} />}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}