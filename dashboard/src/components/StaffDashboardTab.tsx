"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadialBarChart, RadialBar,
} from "recharts";
import type { Req as RequestRow } from "../app/_actions/requests";

const DEPT_LABEL: Record<string, string> = { fb: "In-Room Dining", housekeeping: "Housekeeping", spa: "Spa", front_desk: "Front Desk" };
const SERIES = ["#0F5F4C", "#B08A4F", "#3B9E7E", "#C0563E"];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// animated count-up number
function Counter({ value, color, suffix }: { value: number; color: string; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 90, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v) + (suffix ?? ""));
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{display}</motion.span>;
}

function Tip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#1B2621", color: "#fff", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, boxShadow: "0 8px 20px rgba(0,0,0,.2)" }}>
      <div style={{ opacity: .7, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value} request{payload[0].value === 1 ? "" : "s"}</div>
    </div>
  );
}

export default function StaffDashboardTab({ analytics, rows, myDepts, myName }: { analytics: RequestRow[]; rows: RequestRow[]; myDepts: string[]; myName: string }) {
  const totalActive = rows.length;
  const urgentCount = rows.filter((r) => r.priority === "urgent").length;

  // ---- real metrics from the last 7 days ----
  const todayKey = new Date().toDateString();
  const completedToday = analytics.filter((r) => r.status === "resolved" && new Date(r.createdAt).toDateString() === todayKey).length;
  const weekResolved = analytics.filter((r) => r.status === "resolved").length;
  const weekTotal = analytics.length;
  const completionRate = weekTotal > 0 ? Math.round((weekResolved / weekTotal) * 100) : 0;

  // avg response time proxy: mean minutes from createdAt to now for resolved rows this week
  const resolvedRows = analytics.filter((r) => r.status === "resolved");
  const avgMins = resolvedRows.length > 0
    ? Math.round(resolvedRows.reduce((s, r) => s + (Date.now() - new Date(r.createdAt).getTime()) / 60000, 0) / resolvedRows.length)
    : 0;
  const avgLabel = avgMins < 60 ? avgMins + "m" : (avgMins / 60).toFixed(1) + "h";

  // 7-day series
  const days = [] as { label: string; count: number }[];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toDateString();
    days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), count: analytics.filter((r) => new Date(r.createdAt).toDateString() === key).length });
  }

  // department split (radial)
  const byDept = myDepts.map((dep, i) => ({ name: DEPT_LABEL[dep] ?? dep, value: analytics.filter((r) => r.department === dep).length, fill: SERIES[i % SERIES.length] }));

  // 24-hour peak distribution
  const hours = Array.from({ length: 24 }, (_, h) => ({ h, label: (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? "a" : "p"), count: analytics.filter((r) => new Date(r.createdAt).getHours() === h).length }));
  const peakHour = hours.reduce((mx, x) => (x.count > mx.count ? x : mx), hours[0]);
  const busiestDept = byDept.reduce((mx, x) => (x.value > (mx?.value ?? -1) ? x : mx), byDept[0]);

  const metrics = [
    { label: "Waiting now", value: totalActive, color: totalActive > 0 ? "#0F5F4C" : "#C7C2B4", sub: urgentCount > 0 ? urgentCount + " urgent" : "all steady" },
    { label: "Completed today", value: completedToday, color: "#0F5F4C", sub: "resolved" },
    { label: "Avg response", value: 0, color: "#B08A4F", sub: "this week", custom: avgLabel },
    { label: "Completion rate", value: completionRate, color: "#3B9E7E", sub: "this week", suffix: "%" },
  ];

  const card = { background: "#FEFDFB", border: "1px solid #EBE6D9", borderRadius: 16 };
  const eyebrow = { fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#B08A4F" };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
      {/* greeting */}
      <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} style={{ marginBottom: 26 }}>
        <div style={{ ...eyebrow, letterSpacing: ".16em", marginBottom: 8 }}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 600, color: "#1B2621", letterSpacing: "-.01em", lineHeight: 1.1 }}>{greeting()}, {myName.split(" ")[0]}.</h1>
        <p style={{ fontSize: 15, color: "#6E756F", marginTop: 8 }}>
          {totalActive === 0 ? "All clear across your departments." : totalActive + " request" + (totalActive === 1 ? "" : "s") + " waiting."}
          {weekTotal > 0 ? " " + weekTotal + " handled this week." : ""}
        </p>
      </motion.div>

      {/* metric tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        {metrics.map((m) => (
          <motion.div key={m.label} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -3 }}
            style={{ ...card, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395" }}>{m.label}</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 6 }}>
              {m.custom ? <span style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.custom}</span> : <Counter value={m.value} color={m.color} suffix={m.suffix} />}
            </div>
            <div style={{ fontSize: 12, color: "#A8A395", marginTop: 8 }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* charts row 1: activity area + resolution gauge */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, marginBottom: 14 }}>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} style={{ ...card, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={eyebrow}>Activity &middot; past 7 days</div>
            <div style={{ fontSize: 13, color: "#9A968B" }}><b style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1B2621" }}>{weekTotal}</b> total</div>
          </div>
          <div style={{ height: 190, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="area1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F5F4C" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#0F5F4C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#B0AB9D" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#B0AB9D" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<Tip />} cursor={{ stroke: "#D9C9A8", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#0F5F4C" strokeWidth={2.4} fill="url(#area1)" dot={{ r: 3, fill: "#FEFDFB", stroke: "#0F5F4C", strokeWidth: 1.6 }} activeDot={{ r: 5 }} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} style={{ ...card, padding: "22px 24px", display: "flex", flexDirection: "column" }}>
          <div style={eyebrow}>Completion rate</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 170 }}>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "rate", value: completionRate, fill: "#0F5F4C" }]} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: "#F1EDE2" }} dataKey="value" cornerRadius={20} animationDuration={1100} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#0F5F4C", lineHeight: 1 }}>{completionRate}%</div>
              <div style={{ fontSize: 11, color: "#A8A395", marginTop: 2 }}>{weekResolved}/{weekTotal} done</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* charts row 2: department radial + peak hours */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 14, marginBottom: 34 }}>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} style={{ ...card, padding: "22px 24px" }}>
          <div style={{ ...eyebrow, marginBottom: 4 }}>By department</div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={byDept} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: "#F5F1E8" }} dataKey="value" cornerRadius={8} animationDuration={900} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 6 }}>
            {byDept.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "#4A514A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1B2621" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} style={{ ...card, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={eyebrow}>When guests reach out</div>
            {weekTotal > 0 ? <div style={{ fontSize: 12.5, color: "#9A968B" }}>Busiest around <b style={{ color: "#1B2621" }}>{peakHour.label.replace("a", " AM").replace("p", " PM")}</b></div> : null}
          </div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hours} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#C0BBAD" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: "#B0AB9D" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<Tip />} cursor={{ fill: "rgba(176,138,79,.08)" }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} animationDuration={900}>
                  {hours.map((h) => <Cell key={h.h} fill={h.h === peakHour.h && peakHour.count > 0 ? "#B08A4F" : "#D8E3DD"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}