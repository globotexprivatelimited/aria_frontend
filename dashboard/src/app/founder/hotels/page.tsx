"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllActive, type Req as RequestRow } from "../../_actions/requests";
import FounderSidebar from "../../../components/FounderSidebar";

export default function HotelsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    setRows(await getAllActive());
  }, []);

  useEffect(() => {
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load]);

  const byHotel: Record<string, { open: number; inProgress: number; total: number }> = {};
  for (const r of rows) {
    if (!byHotel[r.hotelId]) byHotel[r.hotelId] = { open: 0, inProgress: 0, total: 0 };
    byHotel[r.hotelId].total += 1;
    if (r.status === "received") byHotel[r.hotelId].open += 1;
    if (r.status === "in_progress") byHotel[r.hotelId].inProgress += 1;
  }
  const hotels = Object.entries(byHotel).sort((a, b) => b[1].total - a[1].total);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <FounderSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 600, color: "#1B2621" }}>All Hotels</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live" : "Connecting..."} &middot; {hotels.length} active
        </p>

        <div style={{ marginTop: 24, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: "1px solid #EAEAE4", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>
            <span>Hotel</span><span>Open</span><span>In progress</span><span>Total</span>
          </div>
          {hotels.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No hotels with activity yet.</div>
          ) : hotels.map(([id, s]) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 24px", borderBottom: "1px solid #F4F4F1", fontSize: 14, alignItems: "center" }}>
              <span style={{ fontWeight: 500, color: "#1B2621" }}>{id}</span>
              <span style={{ color: s.open > 0 ? "#0F5F4C" : "#9AA09A", fontWeight: 600 }}>{s.open}</span>
              <span style={{ color: "#B08A4F", fontWeight: 600 }}>{s.inProgress}</span>
              <span style={{ color: "#3A413B" }}>{s.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}