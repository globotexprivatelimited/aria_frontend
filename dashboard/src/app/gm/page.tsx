"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getHotelActive, getHotelSince, type Req as RequestRow } from "../_actions/requests";
import { DEPARTMENTS } from "../../lib/departments";
import GMSidebar from "../../components/GMSidebar";
import GMRings from "../../components/GMRings";
import GMDeptCards from "../../components/GMDeptCards";
import GMLeaderboard from "../../components/GMLeaderboard";
import GMFloorGrid from "../../components/GMFloorGrid";
import GMHeatmap from "../../components/GMHeatmap";
import { useMyHotel } from "../../lib/useMyHotel";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";

const GREEN = "#0F5F4C";
const GOLD = "#B08A4F";
const INK = "#1B2621";
const RED = "#B23A2A";
const DEPT_COLORS: Record<string, string> = { fb: "#0F5F4C", housekeeping: "#3A6EA5", spa: "#8E5AA8", front_desk: "#B08A4F" };

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

function useCountUp(target: number): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const from = 0; const dur = 700;
    const tick = (t: number) => { const k = Math.min(1, (t - start) / dur); setVal(Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

export default function GMDashboard() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [history, setHistory] = useState<RequestRow[]>([]);
  const [pulse, setPulse] = useState(false);
  const [prevActive, setPrevActive] = useState(0);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [active, since] = await Promise.all([getHotelActive(HOTEL_ID), getHotelSince(HOTEL_ID, 7)]);
    setRows((prev) => { if (active.length > prev.length && prev.length > 0) { setPulse(true); setTimeout(() => setPulse(false), 1500); } return active; });
    setHistory(since);
  }, [HOTEL_ID]);

  useEffect(() => {
    if (!HOTEL_ID) return;
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load, HOTEL_ID]);

  // ---- live KPIs from active rows ----
  const open = rows.filter((r) => r.status === "received").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const urgent = rows.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const guests = new Set(rows.map((r) => r.roomNumber).filter(Boolean)).size;

  // ---- time-series (7 days) ----
  const now = new Date();
  const todayStr = now.toDateString();
  const resolvedToday = history.filter((r) => r.status === "resolved" && new Date(r.createdAt).toDateString() === todayStr).length;

  // avg response: for resolved-with-claim we approximate via created->now not available; use count-based proxy
  const daySeries = useMemo(() => {
    const days: { label: string; date: string; total: number; resolved: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toDateString();
      const dayRows = history.filter((r) => new Date(r.createdAt).toDateString() === key);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        date: key,
        total: dayRows.length,
        resolved: dayRows.filter((r) => r.status === "resolved").length,
      });
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const weekTotal = history.length;
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  const todayCount = history.filter((r) => new Date(r.createdAt).toDateString() === todayStr).length;
  const yesterdayCount = history.filter((r) => new Date(r.createdAt).toDateString() === yesterdayStr).length;
  const trend = yesterdayCount === 0 ? (todayCount > 0 ? 100 : 0) : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

  // department breakdown (from active + week)
  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of history) { const d = r.department ?? "?"; map[d] = (map[d] ?? 0) + 1; }
    return DEPARTMENTS.map((dp) => ({ name: dp.label, dept: dp.dept, value: map[dp.dept] ?? 0, color: DEPT_COLORS[dp.dept] ?? GOLD })).filter((x) => x.value > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // peak hours (0-23) from week
  const hourData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({ h, label: (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? "a" : "p"), count: 0 }));
    for (const r of history) { const h = new Date(r.createdAt).getHours(); hours[h].count += 1; }
    return hours;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;
  const feed = rows.slice(0, 8);
  const statusColor = (s: string) => s === "received" ? GREEN : s === "in_progress" ? GOLD : "#9AA09A";
  const statusLabel = (s: string) => s === "received" ? "New" : s === "in_progress" ? "Working" : "Done";

  const kpis = [
    { label: "Guests in house", value: guests, sub: "active rooms", color: GREEN, glyph: "\u2302" },
    { label: "Open requests", value: open, sub: "awaiting action", color: INK, glyph: "\u25CB" },
    { label: "In progress", value: inProgress, sub: "being handled", color: GOLD, glyph: "\u25D1" },
    { label: "Resolved today", value: resolvedToday, sub: "completed", color: GREEN, glyph: "\u2713" },
    { label: "Urgent", value: urgent, sub: "need attention", color: urgent > 0 ? RED : INK, glyph: "\u26A0" },
  ];

  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  const cardTitle = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 14 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "30px 34px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD, marginBottom: 4 }}>Command Center</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em" }}>{hotelName || "Your Hotel"}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6E756F", background: "#fff", border: "1px solid #EAEAE4", borderRadius: 999, padding: "7px 14px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71", boxShadow: "0 0 0 3px rgba(46,204,113,.18)" }} />
            Live &middot; updates every 4s
          </div>
        </div>

        {/* KPI hero tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 18, transition: "box-shadow .4s", boxShadow: pulse ? "0 0 0 3px rgba(46,204,113,.25)" : "none", borderRadius: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{ ...card, padding: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -8, right: -4, fontSize: 54, opacity: 0.06, color: k.color, fontWeight: 700 }}>{k.glyph}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#9AA09A", fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: k.color, lineHeight: 1.1, marginTop: 6 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "#B4B9B3", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Row: area chart + donut */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={cardTitle}>Requests &middot; last 7 days</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: trend >= 0 ? GREEN : RED, fontWeight: 600 }}>
                {trend >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(trend)}% <span style={{ color: "#B4B9B3", fontWeight: 400 }}>vs yesterday</span>
              </div>
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: INK, marginBottom: 8 }}>{weekTotal} <span style={{ fontSize: 13, color: "#9AA09A", fontFamily: "system-ui" }}>total this week</span></div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={daySeries} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GREEN} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFE9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9AA09A" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA09A" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EAEAE4", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)" }} />
                <Area type="monotone" dataKey="total" name="Total" stroke={GREEN} strokeWidth={2.5} fill="url(#gTotal)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke={GOLD} strokeWidth={2} fill="url(#gRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <div style={cardTitle}>By department &middot; this week</div>
            {deptData.length === 0 ? (
              <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center", color: "#B4B9B3", fontSize: 13 }}>No data yet</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ResponsiveContainer width="60%" height={190}>
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="none">
                      {deptData.map((d) => <Cell key={d.dept} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EAEAE4", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {deptData.map((d) => (
                    <div key={d.dept} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                      <span style={{ color: INK, flex: 1 }}>{d.name}</span>
                      <span style={{ color: "#9AA09A", fontWeight: 600 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row: rings + leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
          <GMRings active={rows} week={history} />
          <GMLeaderboard week={history} />
        </div>

        {/* Department performance cards */}
        <div style={{ marginBottom: 16 }}>
          <GMDeptCards active={rows} week={history} />
        </div>

        {/* Room floor grid */}
        <div style={{ marginBottom: 16 }}>
          <GMFloorGrid active={rows} />
        </div>

        {/* Activity heatmap */}
        <div style={{ marginBottom: 16 }}>
          <GMHeatmap week={history} />
        </div>

        {/* Row: peak hours + live feed */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <div style={card}>
            <div style={cardTitle}>Peak hours &middot; this week</div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={hourData} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFE9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9AA09A" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA09A" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EAEAE4", fontSize: 12 }} cursor={{ fill: "rgba(15,95,76,.05)" }} />
                <Bar dataKey="count" name="Requests" fill={GREEN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...card, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ ...cardTitle, marginBottom: 0 }}>Live activity</div>
              <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>{rows.length} active</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, overflowY: "auto", maxHeight: 260 }}>
              {feed.length === 0 ? (
                <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "30px 0" }}>All quiet &mdash; no active requests</div>
              ) : feed.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 9, borderBottom: "1px solid #F3F3ED" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: DEPT_COLORS[r.department] ?? GOLD, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: INK, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.requestDetail}</div>
                    <div style={{ fontSize: 10, color: "#9AA09A", marginTop: 2 }}>
                      {r.roomNumber ? "Room " + r.roomNumber + " \u00B7 " : ""}{deptLabel(r.department)} &middot; {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: statusColor(r.status), background: statusColor(r.status) + "18", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" }}>{statusLabel(r.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}