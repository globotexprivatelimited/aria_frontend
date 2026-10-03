"use client";
import { useEffect, useState, useCallback } from "react";
import { getRevenueSummary, getByChannel, getTimeseries, getTopItems, getByDept, getByHour, getByRoom, type RevSummary, type RevChannel, type RevPoint, type RevItem, type RevDept, type RevHour, type RevRoom } from "./revenue-actions";
import RevenueDeep from "../../../components/RevenueDeep";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import MissedRevenuePanel from "../../../components/MissedRevenuePanel";
import RevenueFlow from "../../../components/RevenueFlow";

const GREEN = "#2F5D50", GOLD = "#B08A4F", INK = "#0D1F1A";
const rupee = "\u20B9";
const fmt = (n: number) => rupee + n.toLocaleString("en-IN");

function useCountUp(target: number): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 800;
    const tick = (t: number) => { const k = Math.min(1, (t - start) / dur); setV(Math.round(target * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

export default function RevenuePage() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [sum, setSum] = useState<RevSummary>({ total: 0, today: 0, week: 0, month: 0, transactions: 0, avgOrder: 0 });
  const [channels, setChannels] = useState<RevChannel[]>([]);
  const [series, setSeries] = useState<RevPoint[]>([]);
  const [items, setItems] = useState<RevItem[]>([]);
  const [byDept, setByDept] = useState<RevDept[]>([]);
  const [byHour, setByHour] = useState<RevHour[]>([]);
  const [byRoom, setByRoom] = useState<RevRoom[]>([]);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [s, c, t, i, d, h, rm] = await Promise.all([getRevenueSummary(HOTEL_ID), getByChannel(HOTEL_ID), getTimeseries(HOTEL_ID, 30), getTopItems(HOTEL_ID), getByDept(HOTEL_ID), getByHour(HOTEL_ID), getByRoom(HOTEL_ID)]);
    setSum(s); setChannels(c); setSeries(t); setItems(i); setByDept(d); setByHour(h); setByRoom(rm);
  }, [HOTEL_ID]);
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load, HOTEL_ID]);

  const totalUp = useCountUp(sum.total);
  const card = {
    background: "#FFFFFF",
    border: "1px solid #E2EBE7",
    borderRadius: 18,
    padding: isMobile ? "16px 14px" : "22px 24px",
    boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05), 0 1px 3px rgba(0,0,0,0.02)",
  };
  const cardTitle = {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: ".14em",
    color: GOLD,
    fontWeight: 700 as const,
    fontFamily: "'Josefin Sans', sans-serif",
    marginBottom: 14,
  };
  const maxItem = Math.max(1, ...items.map((i) => i.revenue));

  const kpis = [
    { label: "Today", value: sum.today, color: GREEN },
    { label: "This week", value: sum.week, color: INK },
    { label: "This month", value: sum.month, color: GOLD },
    { label: "Avg order", value: sum.avgOrder, color: INK },
  ];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>
        
        {/* Grandoria Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: GOLD, fontSize: 11, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: GOLD, fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Financial Intelligence &middot; Folio</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em" }}>
              {hotelName || "Grandoria Resort"} &middot; Earnings
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4A5D56", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 999, padding: "7px 16px", boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71", boxShadow: "0 0 0 3px rgba(46,204,113,.2)" }} />Live &middot; Synced 15s
          </div>
        </div>

        {/* Revenue in motion - real series, real department mix */}
        <RevenueFlow summary={sum} series={series} byDept={byDept} byHour={byHour} />

        {/* Area chart + channel donut */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1.7fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={cardTitle}>Revenue &middot; last 30 days</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: INK }}>{fmt(sum.month)}</div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={series} margin={{ top: 4, right: 6, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GREEN} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBF0ED" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8A9792" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#8A9792" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => rupee + v} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2EBE7", fontSize: 12, boxShadow: "0 8px 24px rgba(47,93,80,.08)" }} formatter={(v) => [fmt(Number(v)), "Revenue"] as [string, string]} />
                <Area type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <div style={cardTitle}>By channel</div>
            {channels.length === 0 ? (
              <div style={{ height: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9792", fontSize: 13, gap: 6 }}>
                <span style={{ fontSize: 30, opacity: 0.3 }}>{rupee}</span>No revenue recorded yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={channels} dataKey="value" nameKey="channel" cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={2} stroke="none">
                      {channels.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 12, border: "1px solid #E2EBE7", fontSize: 12, boxShadow: "0 8px 24px rgba(47,93,80,.08)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                  {channels.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />
                      <span style={{ color: INK, flex: 1, fontWeight: 500 }}>{c.channel}</span>
                      <span style={{ color: "#8A9792", fontWeight: 600 }}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top earning items */}
        <div style={card}>
          <div style={cardTitle}>Top-earning items &middot; signature selections</div>
          {items.length === 0 ? (
            <div style={{ color: "#8A9792", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No orders yet &mdash; top items appear as dining and concierge orders come in</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? "linear-gradient(135deg, #B08A4F, #8D6B35)" : "#F1F6F4", color: i === 0 ? "#FFFFFF" : "#5A6E67", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, color: INK, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                      <span style={{ fontSize: 11, color: "#8A9792", marginLeft: 8, whiteSpace: "nowrap" }}>{it.qty} sold</span>
                    </div>
                    <div style={{ height: 6, background: "#F1F6F4", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: (it.revenue / maxItem) * 100 + "%", height: "100%", background: "linear-gradient(90deg, #2F5D50, #B08A4F)", borderRadius: 999, transition: "width .6s ease" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: "nowrap" }}>{fmt(it.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced breakdowns - real data */}
        <div style={{ marginTop: 16 }}>
          <RevenueDeep byDept={byDept} byHour={byHour} byRoom={byRoom} />
        </div>

          <MissedRevenuePanel hotelId={HOTEL_ID as string} />
      </div>
    </div>
  );
}