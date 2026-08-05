"use client";

import { useEffect, useState, useCallback } from "react";
import { getHotelActive, type Req as RequestRow } from "../_actions/requests";
import { DEPARTMENTS } from "../../lib/departments";
import GMSidebar from "../../components/GMSidebar";
import { useMyHotel } from "../../lib/useMyHotel";



function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export default function GMDashboard() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    setRows(await getHotelActive(HOTEL_ID));
  }, [HOTEL_ID]);

  useEffect(() => {
    if (!HOTEL_ID) return;
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID]);

  const open = rows.filter((r) => r.status === "received").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const resolved = rows.filter((r) => r.status === "resolved").length;
  const urgent = rows.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const guests = new Set(rows.map((r) => r.roomNumber).filter(Boolean)).size;

  const byDept: Record<string, { open: number; total: number }> = {};
  for (const r of rows) {
    const d = r.department ?? "?";
    if (!byDept[d]) byDept[d] = { open: 0, total: 0 };
    byDept[d].total += 1;
    if (r.status !== "resolved") byDept[d].open += 1;
  }
  const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;
  const deptSlug = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.slug ?? d;

  const feed = rows.slice(0, 10);
  const statusColor = (s: string) => s === "received" ? "#0F5F4C" : s === "in_progress" ? "#B08A4F" : "#9AA09A";
  const statusLabel = (s: string) => s === "received" ? "New" : s === "in_progress" ? "Working" : "Done";

  const cards = [
    { label: "Guests in house", value: guests, color: "#0F5F4C", sub: "active rooms" },
    { label: "Open requests", value: open, color: "#1B2621", sub: "awaiting action" },
    { label: "In progress", value: inProgress, color: "#B08A4F", sub: "being handled" },
    { label: "Urgent", value: urgent, color: urgent > 0 ? "#B23A2A" : "#1B2621", sub: "need attention" },
    { label: "Resolved", value: resolved, color: "#0F5F4C", sub: "all time" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>{hotelName || "Your hotel"}</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
              <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
              {connected ? "Live" : "Connecting..."} &middot; your hotel at a glance
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {cards.map((c) => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>{c.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, marginTop: 6, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#B4B9B3", marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16, marginTop: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Departments</h2>
            <div style={{ marginTop: 16 }}>
              {DEPARTMENTS.map((d) => {
                const stat = byDept[d.dept] ?? { open: 0, total: 0 };
                return (
                  <a key={d.dept} href={"/portal/" + d.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginBottom: 8, borderRadius: 10, border: "1px solid #EEEEE8", textDecoration: "none", background: "#FCFCFA" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2621" }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 1 }}>{d.type === "auto" ? "Auto" : "Accept / Decline"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: stat.open > 0 ? "#0F5F4C" : "#C4C9C2" }}>{stat.open}</div>
                      <div style={{ fontSize: 10, color: "#B4B9B3" }}>open</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Live activity</h2>
            <div style={{ marginTop: 16 }}>
              {feed.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No activity yet.</div>
              ) : feed.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F4F4F1" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: statusColor(r.status), flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#1B2621", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontWeight: 600 }}>Room {r.roomNumber ?? "?"}</span>
                      <span style={{ color: "#6E756F" }}> &mdash; {r.requestDetail}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 1 }}>{deptLabel(r.department ?? "?")}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: statusColor(r.status), flexShrink: 0 }}>{statusLabel(r.status)}</span>
                  <span style={{ fontSize: 11, color: "#B4B9B3", flexShrink: 0, width: 54, textAlign: "right" }}>{timeAgo(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}