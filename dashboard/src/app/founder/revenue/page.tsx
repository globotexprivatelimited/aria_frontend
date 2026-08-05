"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSince, type Req as RequestRow } from "../../_actions/requests";
import FounderSidebar from "../../../components/FounderSidebar";

type Row = { hotelId: string; department: string | null; status: string; revenueGenerated: number | string | null; createdAt: string };

export default function RevenuePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    setRows(await getAllSince(30));
  }, []);

  useEffect(() => {
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load]);

  const num = (v: number | string | null) => (v == null ? 0 : typeof v === "string" ? parseFloat(v) || 0 : v);
  const total = rows.reduce((sum, r) => sum + num(r.revenueGenerated), 0);

  const byHotel: Record<string, number> = {};
  const byDept: Record<string, number> = {};
  for (const r of rows) {
    const amt = num(r.revenueGenerated);
    if (amt <= 0) continue;
    byHotel[r.hotelId] = (byHotel[r.hotelId] ?? 0) + amt;
    byDept[r.department ?? "?"] = (byDept[r.department ?? "?"] ?? 0) + amt;
  }
  const fmt = (n: number) => "Rs " + n.toLocaleString("en-IN");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <FounderSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 600, color: "#1B2621" }}>Revenue</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
          <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
          {connected ? "Live across every hotel" : "Connecting..."}
        </p>

        <div style={{ marginTop: 24, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>Total recorded revenue</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 48, fontWeight: 600, marginTop: 8, color: "#0F5F4C" }}>{fmt(total)}</div>
          <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 4 }}>From confirmed dining and activity bookings</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>By hotel</h2>
            <ul style={{ listStyle: "none", marginTop: 16, padding: 0 }}>
              {Object.entries(byHotel).sort((a, b) => b[1] - a[1]).map(([h, n]) => (
                <li key={h} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F0EA", paddingBottom: 8, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#3A413B" }}>{h}</span><span style={{ fontWeight: 600, color: "#0F5F4C" }}>{fmt(n)}</span>
                </li>
              ))}
              {Object.keys(byHotel).length === 0 && <li style={{ color: "#9AA09A", fontSize: 14 }}>No revenue recorded yet.</li>}
            </ul>
          </div>
          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>By department</h2>
            <ul style={{ listStyle: "none", marginTop: 16, padding: 0 }}>
              {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([d, n]) => (
                <li key={d} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F0F0EA", paddingBottom: 8, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: "#3A413B" }}>{d}</span><span style={{ fontWeight: 600, color: "#0F5F4C" }}>{fmt(n)}</span>
                </li>
              ))}
              {Object.keys(byDept).length === 0 && <li style={{ color: "#9AA09A", fontSize: 14 }}>No revenue recorded yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}