"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllActive, type Req as RequestRow } from "../_actions/requests";
import { DEPARTMENTS } from "../../lib/departments";
import FounderSidebar from "../../components/FounderSidebar";

type Win = "today" | "24h" | "7d" | "all";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

function windowStart(w: Win): number {
  const now = Date.now();
  if (w === "today") { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  if (w === "24h") return now - 24 * 3600 * 1000;
  if (w === "7d") return now - 7 * 86400 * 1000;
  return 0;
}

export default function FounderDashboard() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [win, setWin] = useState<Win>("24h");
  const [hotelFilter, setHotelFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(await getAllActive());
  }, []);

  useEffect(() => {
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load]);

  const num = (v: number | string | null) => (v == null ? 0 : typeof v === "string" ? parseFloat(v) || 0 : v);

  const filtered = useMemo(() => {
    const start = windowStart(win);
    return rows.filter((r) => new Date(r.createdAt).getTime() >= start && (!hotelFilter || r.hotelId === hotelFilter));
  }, [rows, win, hotelFilter]);

  const open = filtered.filter((r) => r.status === "received").length;
  const inProgress = filtered.filter((r) => r.status === "in_progress").length;
  const resolved = filtered.filter((r) => r.status === "resolved").length;
  const urgent = filtered.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const hotels = new Set(filtered.filter((r) => r.status !== "resolved").map((r) => r.hotelId)).size;
  const revenue = filtered.reduce((sum, r) => sum + num(r.revenueGenerated), 0);
  const resolutionRate = filtered.length > 0 ? Math.round((resolved / filtered.length) * 100) : 0;

  const allHotels = useMemo(() => Array.from(new Set(rows.map((r) => r.hotelId))).sort(), [rows]);

  const byDept: Record<string, number> = {};
  for (const r of filtered) { if (r.status !== "resolved") byDept[r.department ?? "?"] = (byDept[r.department ?? "?"] ?? 0) + 1; }
  const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;
  const deptEntries = Object.entries(byDept).sort((a, b) => b[1] - a[1]);
  const maxDept = Math.max(1, ...deptEntries.map((e) => e[1]));

  const alerts = filtered.filter((r) => {
    if (r.status === "resolved") return false;
    if (r.priority === "urgent") return true;
    const ageMin = (Date.now() - new Date(r.createdAt).getTime()) / 60000;
    return ageMin > 30 && r.status === "received";
  }).slice(0, 8);

  const feed = filtered.slice(0, 10);

  const cards = [
    { label: "Open", value: String(open), color: "#0F5F4C", sub: "awaiting action", big: true },
    { label: "In progress", value: String(inProgress), color: "#B08A4F", sub: "being handled", big: true },
    { label: "Urgent", value: String(urgent), color: urgent > 0 ? "#B23A2A" : "#1B2621", sub: "need attention", big: true },
    { label: "Hotels", value: String(hotels), color: "#1B2621", sub: "active now", big: true },
    { label: "Resolution", value: resolutionRate + "%", color: "#0F5F4C", sub: "completion", big: true },
    { label: "Revenue", value: "Rs " + revenue.toLocaleString("en-IN"), color: "#0F5F4C", sub: "in window", big: false },
  ];

  const statusColor = (s: string) => s === "received" ? "#0F5F4C" : s === "in_progress" ? "#B08A4F" : "#9AA09A";
  const statusLabel = (s: string) => s === "received" ? "New" : s === "in_progress" ? "Working" : "Done";
  const WINDOWS: { key: Win; label: string }[] = [
    { key: "today", label: "Today" }, { key: "24h", label: "24h" }, { key: "7d", label: "7 days" }, { key: "all", label: "All" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <FounderSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Operations</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
              <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
              {connected ? "Live across every hotel" : "Connecting..."}
              {hotelFilter ? <span> &middot; filtered to <b>{hotelFilter}</b> <span onClick={() => setHotelFilter(null)} style={{ color: "#0F5F4C", cursor: "pointer", textDecoration: "underline" }}>clear</span></span> : null}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 10, padding: 4 }}>
            {WINDOWS.map((w) => (
              <button key={w.key} onClick={() => setWin(w.key)}
                style={{ border: 0, borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: win === w.key ? "#0F5F4C" : "transparent", color: win === w.key ? "#fff" : "#5A615B" }}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
          {cards.map((c) => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>{c.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: c.big ? 32 : 22, fontWeight: 600, marginTop: 6, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#B4B9B3", marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {alerts.length > 0 ? (
          <div style={{ marginTop: 20, background: "#FDF6F4", border: "1px solid #F0D5CD", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#B23A2A" }} />
              <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#B23A2A", fontWeight: 700 }}>Needs attention &middot; {alerts.length}</h2>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              {alerts.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#1B2621" }}>Room {r.roomNumber ?? "?"}</span>
                  <span style={{ color: "#6E756F", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.requestDetail}</span>
                  {r.priority === "urgent" ? <span style={{ borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 600, background: "#FBEDE9", color: "#B23A2A" }}>Urgent</span> : null}
                  <span style={{ fontSize: 11, color: "#B4B9B3" }}>{timeAgo(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Live activity feed</h2>
            <div style={{ marginTop: 16 }}>
              {feed.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No activity in this window.</div>
              ) : feed.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F4F4F1" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: statusColor(r.status), flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#1B2621", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontWeight: 600 }}>Room {r.roomNumber ?? "?"}</span>
                      <span style={{ color: "#6E756F" }}> &mdash; {r.requestDetail}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 1 }}>{deptLabel(r.department ?? "?")} &middot; {r.hotelId}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: statusColor(r.status), flexShrink: 0 }}>{statusLabel(r.status)}</span>
                  <span style={{ fontSize: 11, color: "#B4B9B3", flexShrink: 0, width: 54, textAlign: "right" }}>{timeAgo(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Open by department</h2>
              <div style={{ marginTop: 16 }}>
                {deptEntries.length === 0 ? <div style={{ color: "#9AA09A", fontSize: 14 }}>Nothing open.</div> : deptEntries.map(([d, n]) => (
                  <div key={d} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: "#3A413B" }}>{deptLabel(d)}</span><span style={{ fontWeight: 600, color: "#1B2621" }}>{n}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "#F0F0EA", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: Math.round((n / maxDept) * 100) + "%", background: "linear-gradient(90deg,#0F5F4C,#1A8266)", borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Hotels &middot; click to filter</h2>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allHotels.length === 0 ? <span style={{ color: "#9AA09A", fontSize: 14 }}>None yet.</span> : allHotels.map((h) => (
                  <button key={h} onClick={() => setHotelFilter(hotelFilter === h ? null : h)}
                    style={{ border: "1px solid " + (hotelFilter === h ? "#0F5F4C" : "#E3E3DC"), background: hotelFilter === h ? "#E8F1ED" : "#fff", color: hotelFilter === h ? "#0F5F4C" : "#3A413B", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}