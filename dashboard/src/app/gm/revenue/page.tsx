"use client";
import { useEffect, useState, useCallback } from "react";
import { getRevenueSummary, getByChannel, getTimeseries, getTopItems, getByDept, getByHour, getByRoom, type RevSummary, type RevChannel, type RevPoint, type RevItem, type RevDept, type RevHour, type RevRoom } from "./revenue-actions";
import RevenueDeep from "../../../components/RevenueDeep";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621";
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
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [load, HOTEL_ID]);

  const totalUp = useCountUp(sum.total);
  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  const cardTitle = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".09em", color: "#9AA09A", fontWeight: 600 as const, marginBottom: 14 };
  const maxItem = Math.max(1, ...items.map((i) => i.revenue));

  const kpis = [
    { label: "Today", value: sum.today, color: GREEN },
    { label: "This week", value: sum.week, color: INK },
    { label: "This month", value: sum.month, color: GOLD },
    { label: "Avg order", value: sum.avgOrder, color: INK },
  ];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD, marginBottom: 4 }}>Revenue</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: INK, margin: 0 }}>{hotelName || "Your Hotel"} &middot; Earnings</h1>
        </div>

        {/* Total earnings hero */}
        <div style={{ ...card, background: "linear-gradient(135deg,#0F5F4C 0%,#0C4A3C 100%)", border: "none", marginBottom: 16, padding: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -20, fontSize: 160, opacity: 0.06, color: "#fff", fontWeight: 700, fontFamily: "Georgia, serif" }}>{rupee}</div>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.6)", marginBottom: 6 }}>Total revenue &middot; all channels</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{fmt(totalUp)}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 8 }}>{sum.transactions} transaction{sum.transactions === 1 ? "" : "s"} recorded</div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          {kpis.map((k) => (
            <div key={k.label} style={card}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "#9AA09A", fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: k.color, marginTop: 6 }}>{fmt(k.value)}</div>
            </div>
          ))}
        </div>

        {/* Area chart + channel donut */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1.7fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={cardTitle}>Revenue &middot; last 30 days</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={series} margin={{ top: 4, right: 6, left: -6, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity={0.3} /><stop offset="100%" stopColor={GREEN} stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFE9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9AA09A" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#9AA09A" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => rupee + v} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EAEAE4", fontSize: 12 }} formatter={(v: number) => [fmt(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={card}>
            <div style={cardTitle}>By channel</div>
            {channels.length === 0 ? (
              <div style={{ height: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#B4B9B3", fontSize: 13, gap: 6 }}>
                <span style={{ fontSize: 30, opacity: 0.3 }}>{rupee}</span>No revenue yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={channels} dataKey="value" nameKey="channel" cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={2} stroke="none">
                      {channels.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #EAEAE4", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                  {channels.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />
                      <span style={{ color: INK, flex: 1 }}>{c.channel}</span>
                      <span style={{ color: "#9AA09A", fontWeight: 600 }}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top earning items */}
        <div style={card}>
          <div style={cardTitle}>Top-earning items</div>
          {items.length === 0 ? (
            <div style={{ color: "#B4B9B3", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No orders yet &mdash; top items appear as dining orders come in</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {items.map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 20, fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: i === 0 ? GREEN : "#C7C2B4" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                      <span style={{ fontSize: 11, color: "#9AA09A", marginLeft: 8, whiteSpace: "nowrap" }}>{it.qty} sold</span>
                    </div>
                    <div style={{ height: 6, background: "#F0F0EA", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: (it.revenue / maxItem) * 100 + "%", height: "100%", background: GREEN, borderRadius: 999, transition: "width .6s" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>{fmt(it.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced breakdowns - real data */}
        <div style={{ marginTop: 16 }}>
          <RevenueDeep byDept={byDept} byHour={byHour} byRoom={byRoom} />
        </div>
      </div>
    </div>
  );
}