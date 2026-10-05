"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { getRoomStats } from "./reception/rooms-actions";
import { getHotelActive, getHotelSince, type Req as RequestRow } from "../_actions/requests";
import GMSidebar from "../../components/GMSidebar";
import { LuxuryStars } from "../../components/LuxuryStars";
import { useBreakpoint } from "../../lib/useBreakpoint";
import { useMyHotel } from "../../lib/useMyHotel";
import VerifyEmailBanner from "../../components/VerifyEmailBanner";
import GMKpiCards, { type KpiItem } from "../../components/GMKpiCards";
import GMLiveFeedAndRooms from "../../components/GMLiveFeedAndRooms";
import GMDeptBoard from "../../components/GMDeptBoard";
import GMHeatmap from "../../components/GMHeatmap";
import { DashboardSkeleton } from "../../components/Skeleton";

/** Reusable quick action button */
function QuickActionPill({
  href,
  label,
  icon,
  badge,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white border border-white/25 bg-transparent hover:bg-white/10 transition-colors"
    >
      {icon}
      <span>{label}</span>
      {badge}
    </Link>
  );
}

export default function GMDashboard() {
  const { isMobile } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName, loading: hotelLoading } = useMyHotel();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [history, setHistory] = useState<RequestRow[]>([]);
  const [occupied, setOccupied] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    try {
      const [active, since, stats] = await Promise.all([
        getHotelActive(HOTEL_ID),
        getHotelSince(HOTEL_ID, 7),
        getRoomStats(HOTEL_ID),
      ]);
      setRows(active);
      setHistory(since);
      setOccupied(stats.occupied);
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
    return () => clearInterval(iv);
  }, [load, HOTEL_ID, hotelLoading]);

  // Executive Indicator calculations
  const open = rows.filter((r) => r.status === "received").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const urgent = rows.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
  const guests = occupied ?? 0;

  const now = new Date();
  const todayStr = now.toDateString();
  const resolvedToday = history.filter(
    (r) => r.status === "resolved" && new Date(r.createdAt).toDateString() === todayStr
  ).length;

  const kpis: KpiItem[] = [
    { key: "guests", label: "Guests in house", value: guests, caption: "rooms occupied" },
    { key: "open", label: "Open requests", value: open, caption: "awaiting action" },
    { key: "progress", label: "In progress", value: inProgress, caption: "being handled" },
    { key: "resolved", label: "Resolved today", value: resolvedToday, caption: "completed" },
    { key: "urgent", label: "Urgent", value: urgent, caption: "need attention" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bone text-ink font-sans">
      <GMSidebar />

      <div className="flex-1 min-w-0 max-w-full overflow-x-hidden px-4 py-5 md:px-10 md:py-8 pb-20">
        <VerifyEmailBanner />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-14">
            {/* =========================================================================
                SECTION 1: HERO BAR (property + live status + quick actions)
               ========================================================================= */}
            <section
              className="stagger-section relative overflow-hidden rounded-luxury p-5 md:py-6 md:px-8 text-white shadow-luxury min-h-[180px] flex flex-col justify-between bg-gradient-to-br from-emerald to-emerald-lo"
              style={{ "--i": 0 } as React.CSSProperties}
            >
              {/* Subtle radial gold glow in upper-right corner */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 85% 15%, rgba(201, 162, 39, 0.14), transparent 60%)",
                }}
              />

              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <LuxuryStars count={5} size={11} color="#C9A227" gap={3} />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans">
                      Luxury Hotel Intelligence
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl md:text-[44px] font-semibold m-0 tracking-tight text-white leading-tight">
                    {hotelName || "Aria Grand Resort"}
                  </h1>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#EBF3F0] bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-[pulse_2s_infinite]" />
                    Live &middot; Synced every 15s
                  </div>
                  <div className="text-[11.5px] text-white/75 font-sans tracking-wide">
                    {new Date().toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="relative z-10 mt-4 pt-3.5 border-t border-white/15 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold mr-1 font-sans">
                  Quick Actions:
                </span>

                <QuickActionPill
                  href="/gm/reception"
                  label="Reception & Rooms"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" />
                    </svg>
                  }
                />

                <QuickActionPill
                  href="/gm/requests"
                  label="Requests"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M9 14l2 2 4-4" />
                    </svg>
                  }
                  badge={
                    open > 0 ? (
                      <span className="bg-urgent text-white text-[11px] font-bold rounded-full px-2 py-0.5 ml-1">
                        {open} open
                      </span>
                    ) : null
                  }
                />

                <QuickActionPill
                  href="/gm/guests"
                  label={`Guests (${guests} in house)`}
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />

                <QuickActionPill
                  href="/gm/departments"
                  label="Departments"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  }
                />

                <QuickActionPill
                  href="/gm/revenue"
                  label="Revenue Folio"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  }
                />
              </div>
            </section>

            {/* =========================================================================
                SECTION 2: KPI STRIP — 5 CARDS
               ========================================================================= */}
            <section className="stagger-section" style={{ "--i": 1 } as React.CSSProperties}>
              <GMKpiCards items={kpis} />
            </section>

            {/* =========================================================================
                SECTION 3: LIVE FEED + ROOMS WITH ACTIVITY (2-COL, 60/40)
               ========================================================================= */}
            <section className="stagger-section" style={{ "--i": 2 } as React.CSSProperties}>
              <GMLiveFeedAndRooms requests={rows} isMobile={isMobile} />
            </section>

            {/* =========================================================================
                SECTION 4: DEPARTMENT BOARD (UNIFIED)
               ========================================================================= */}
            <section className="stagger-section" style={{ "--i": 3 } as React.CSSProperties}>
              <GMDeptBoard active={rows} week={history} />
            </section>

            {/* =========================================================================
                SECTION 5: ACTIVITY HEATMAP 7D x 24H
               ========================================================================= */}
            <section className="stagger-section" style={{ "--i": 4 } as React.CSSProperties}>
              <GMHeatmap week={history} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}