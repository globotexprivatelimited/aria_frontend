"use client";
import { getRoomStats } from "./reception/rooms-actions";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getHotelActive, getHotelSince, type Req as RequestRow } from "../_actions/requests";
import { DEPARTMENTS } from "../../lib/departments";
import GMSidebar from "../../components/GMSidebar";
import { LuxuryStars } from "../../components/LuxuryStars";
import { useBreakpoint } from "../../lib/useBreakpoint";
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
import VerifyEmailBanner from "../../components/VerifyEmailBanner";
import GMKpiCards from "../../components/GMKpiCards";
import { DashboardSkeleton } from "../../components/Skeleton";

const GREEN = "#0F5F4C";
const GOLD = "#B08A4F";
const INK = "#1B2621";
const RED = "#B23A2A";
const DEPT_COLORS: Record<string, string> = { fb: "#0F5F4C", housekeeping: "#3A6EA5", spa: "#8E5AA8", front_desk: "#B08A4F", dining: "#B0763A", maintenance: "#7A6A55" };

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
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName, loading: hotelLoading } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [history, setHistory] = useState<RequestRow[]>([]);
  const [occupied, setOccupied] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const [prevActive, setPrevActive] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    try {
      const [active, since, stats] = await Promise.all([getHotelActive(HOTEL_ID), getHotelSince(HOTEL_ID, 7), getRoomStats(HOTEL_ID)]);
      setRows((prev) => { if (active.length > prev.length && prev.length > 0) { setPulse(true); setTimeout(() => setPulse(false), 1500); } return active; });
      setHistory(since); setOccupied(stats.occupied);
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

  // ---- live KPIs from active rows ----
  const open = rows.filter((r) => r.status === "received").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const urgent = rows.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const guests = occupied ?? 0; // rooms occupied on the board - the number Reception and the founder view show

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

  const kpiTotal = Math.max(1, open + inProgress + resolvedToday + urgent);
  const kpis = [
    { key: "guests", label: "Guests in house", value: guests, caption: "rooms occupied", share: 0 },
    { key: "open", label: "Open requests", value: open, caption: "awaiting action", share: open / kpiTotal },
    { key: "progress", label: "In progress", value: inProgress, caption: "being handled", share: inProgress / kpiTotal },
    { key: "resolved", label: "Resolved today", value: resolvedToday, caption: "completed", share: resolvedToday / kpiTotal },
    { key: "urgent", label: "Urgent", value: urgent, caption: "need attention", share: urgent / kpiTotal },
  ];

  const card = {
    background: "#FFFFFF",
    border: "1px solid #E2EBE7",
    borderRadius: 18,
    padding: isMobile ? "16px 14px" : "22px 24px",
    boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05), 0 1px 3px rgba(0,0,0,0.02)",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
  };
  const cardSectionTag = {
    fontSize: 10,
    letterSpacing: ".16em",
    textTransform: "uppercase" as const,
    color: "#B08A4F",
    fontWeight: 700 as const,
    fontFamily: "'Josefin Sans', sans-serif",
    marginBottom: 4,
  };
  const cardTitle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 17,
    fontWeight: 700 as const,
    color: "#0D1F1A",
    marginBottom: 14,
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>
        <VerifyEmailBanner />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Grandoria Luxury Hotel Hero Banner */}
            <div style={{ marginBottom: 24, background: "linear-gradient(135deg, #1A3E34 0%, #2F5D50 55%, #3B7262 100%)", borderRadius: 20, padding: isMobile ? "20px 18px" : "28px 32px", color: "#FFFFFF", boxShadow: "0 12px 34px -4px rgba(47,93,80,0.22)", position: "relative", overflow: "hidden" }}>
              {/* Ambient Glow */}
              <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 280, height: 280, borderRadius: 999, background: "radial-gradient(circle, rgba(176,138,79,0.28) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <LuxuryStars count={5} size={12} color="#E5C890" gap={3} />
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", color: "rgba(255,255,255,0.78)", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Luxury Hotel Intelligence</span>
                  </div>
                  <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 34, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", color: "#FFFFFF" }}>{hotelName}</h1>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.85)", maxWidth: 540, fontWeight: 300 }}>
                    Real-time guest operations, in-house concierge velocity, and room service command.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#EBF3F0", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "7px 16px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71", boxShadow: "0 0 0 3px rgba(46,204,113,.3)" }} />
                    Live &middot; Synced every 4s
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", fontFamily: "'Josefin Sans', sans-serif", letterSpacing: ".06em" }}>
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Grandoria Quick Operations Strip */}
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#E5C890", fontWeight: 700, marginRight: 4 }}>Quick Actions:</span>
                <Link href="/gm/reception" style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, background: "rgba(255,255,255,0.18)", color: "#FFFFFF", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "background .2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" /></svg>
                  <span>Reception &amp; Rooms</span>
                </Link>
                <Link href="/gm/requests" style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, background: open > 0 ? "rgba(178,58,42,0.35)" : "rgba(255,255,255,0.12)", color: "#FFFFFF", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "background .2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></svg>
                  <span>Requests</span> {open > 0 ? <span style={{ background: "#B23A2A", borderRadius: 999, padding: "1px 7px", fontSize: 11, marginLeft: 2 }}>{open} open</span> : null}
                </Link>
                <Link href="/gm/guests" style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "#FFFFFF", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "background .2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  <span>Guests ({guests} in house)</span>
                </Link>
                <Link href="/gm/departments" style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "#FFFFFF", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "background .2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v3M2 18h20M4 18a8 8 0 0 1 16 0" /><circle cx="12" cy="3" r="1" /></svg>
                  <span>Departments</span>
                </Link>
                <Link href="/gm/revenue" style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "#FFFFFF", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", transition: "background .2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  <span>Revenue Folio</span>
                </Link>
              </div>
            </div>

            {/* Section 1: Executive KPI Tiles */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>OPERATIONAL OVERVIEW</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>Executive Indicators</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Real-time live hotel stats</div>
            </div>

            <div style={{ marginBottom: 24, borderRadius: 18, transition: "box-shadow .4s", boxShadow: pulse ? "0 0 0 3px rgba(46,204,113,.25)" : "none" }}>
              <GMKpiCards items={kpis} columns={isMobile ? "repeat(2, minmax(0, 1fr))" : isTablet ? "repeat(3, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))"} />
            </div>

            {/* Section 2: Area Chart + Donut */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>SERVICE VELOCITY</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>7-Day Trajectory &amp; Departmental Mix</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Weekly volume trends</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1.6fr minmax(0, 1fr)", gap: 16, marginBottom: 24 }}>
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={cardTitle}>Requests &middot; last 7 days</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: trend >= 0 ? GREEN : RED, fontWeight: 600 }}>
                    {trend >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(trend)}% <span style={{ color: "#B4B9B3", fontWeight: 400 }}>vs yesterday</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: INK, marginBottom: 8 }}>{weekTotal} <span style={{ fontSize: 13, color: "#8A9490", fontFamily: "system-ui" }}>total this week</span></div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={daySeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.32} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GOLD} stopOpacity={0.24} />
                        <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBF0ED" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A9490" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#8A9490" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2EBE7", fontSize: 12, boxShadow: "0 8px 24px rgba(47,93,80,.08)" }} />
                    <Area type="monotone" dataKey="total" name="Total" stroke={GREEN} strokeWidth={2.5} fill="url(#gTotal)" />
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke={GOLD} strokeWidth={2} fill="url(#gRes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={card}>
                <div style={cardTitle}>By department &middot; this week</div>
                {deptData.length === 0 ? (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#B4B9B3", fontSize: 13 }}>No data yet</div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <ResponsiveContainer width="58%" height={200}>
                      <PieChart>
                        <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">
                          {deptData.map((d) => <Cell key={d.dept} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2EBE7", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {deptData.map((d) => (
                        <div key={d.dept} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                          <span style={{ color: INK, flex: 1, fontWeight: 500 }}>{d.name}</span>
                          <span style={{ color: "#7B8782", fontWeight: 700 }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Performance Rings & Staff Leaderboard */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>QUALITY &amp; BENCHMARKS</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>Resolution Ratios &amp; Department Standings</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Team efficiency</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1.6fr minmax(0, 1fr)", gap: 16, marginBottom: 24 }}>
              <GMRings active={rows} week={history} />
              <GMLeaderboard week={history} />
            </div>

            {/* Section 4: Department Performance */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>HOTEL DEPARTMENTS</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>Service Center Health</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Live load vs 7-day sparklines</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <GMDeptCards active={rows} week={history} />
            </div>

            {/* Section 5: Floor Grid & Heatmap */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>PROPERTY MAPPING</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>Room Floor Grid &amp; Weekly Heatmap</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Room activity status</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <GMFloorGrid active={rows} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <GMHeatmap week={history} />
            </div>

            {/* Section 6: Peak Hours & Live Activity Stream */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={cardSectionTag}>REAL-TIME CONCIERGE PULSE</div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0D1F1A", margin: 0 }}>Peak Traffic &amp; Live Feed</h2>
              </div>
              <div style={{ fontSize: 11.5, color: "#7B8782" }}>Click request to view conversation</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1.6fr minmax(0, 1fr)", gap: 16 }}>
              <div style={card}>
                <div style={cardTitle}>Peak hours &middot; this week</div>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={hourData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBF0ED" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9.5, fill: "#8A9490" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 11, fill: "#8A9490" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2EBE7", fontSize: 12 }} cursor={{ fill: "rgba(47,93,80,.05)" }} />
                    <Bar dataKey="count" name="Requests" fill={GREEN} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...card, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ ...cardTitle, marginBottom: 0 }}>Live guest activity</div>
                  <span style={{ fontSize: 11, color: GREEN, fontWeight: 700, background: GREEN + "14", padding: "3px 9px", borderRadius: 999 }}>{rows.length} active</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 290, WebkitOverflowScrolling: "touch" }}>
                  {feed.length === 0 ? (
                    <div style={{ color: "#A0ABA6", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, opacity: 0.45 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2F5D50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v3M2 18h20M4 18a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="3" r="1" />
                        </svg>
                      </div>
                      All quiet &mdash; no active requests
                    </div>
                  ) : feed.map((r) => (
                    <Link
                      key={r.id}
                      href={r.guestPhone ? `/gm/conversations/${encodeURIComponent(r.guestPhone)}` : "/gm/requests"}
                      style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, textDecoration: "none", background: "#FAFBF9", border: "1px solid #EBF0ED", transition: "background .15s, border-color .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F6F4"; e.currentTarget.style.borderColor = "#D0DFDA"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#FAFBF9"; e.currentTarget.style.borderColor = "#EBF0ED"; }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: DEPT_COLORS[r.department] ?? GOLD, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: INK, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.requestDetail}</div>
                        <div style={{ fontSize: 11, color: "#7B8782", marginTop: 2 }}>
                          {r.roomNumber ? "Room " + r.roomNumber + " \u00B7 " : ""}{deptLabel(r.department)} &middot; {timeAgo(r.createdAt)}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(r.status), background: statusColor(r.status) + "18", borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>{statusLabel(r.status)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}