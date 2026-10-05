"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Req as RequestRow } from "../app/_actions/requests";
import { getDeptLabel, DEPT_BG_CLASSES } from "../lib/departments";
import { timeAgo } from "../lib/format";

/** Reusable Empty State component for luxury cards */
/** Reusable Empty State component for luxury cards */
export function DashboardEmptyState({
  title = "All quiet \u2014 no active requests",
  subtitle = "Requests will appear here in real time",
  icon = "bell",
  href,
}: {
  title?: string;
  subtitle?: string;
  icon?: "bell" | "room";
  href?: string;
}) {
  const content = (
    <div className="flex-1 flex flex-col items-center justify-center py-14 px-6 text-center group cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-bone flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:bg-champagne/15">
        {icon === "room" ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7A75"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M14 9h.01M14 15h.01" />
          </svg>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7A75"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v3M2 18h20M4 18a8 8 0 0 1 16 0" />
            <circle cx="12" cy="3" r="1" />
          </svg>
        )}
      </div>
      <div className="text-sm font-medium text-ink mb-1 font-sans transition-colors group-hover:text-emerald">{title}</div>
      <div className="text-xs text-muted font-sans flex items-center gap-1 justify-center">
        <span>{subtitle}</span>
        {href ? <span className="text-champagne font-semibold">&rarr;</span> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline flex-1 flex flex-col justify-center">
        {content}
      </Link>
    );
  }
  return content;
}

/** Reusable live request row with luxury micro-hover */
export function LiveFeedRow({
  request,
  isRecent = false,
}: {
  request: RequestRow;
  isRecent?: boolean;
}) {
  const deptLabel = getDeptLabel(request.department);
  const isUrgent = request.priority === "urgent" && request.status !== "resolved";

  let statusBadgeClass = "text-muted bg-muted/10 border-muted/20 group-hover:border-muted/40";
  let statusText = "Done";

  if (isUrgent) {
    statusBadgeClass = "text-urgent bg-urgent/10 border-urgent/30 group-hover:border-urgent/60 group-hover:shadow-[0_0_8px_rgba(180,69,58,0.2)]";
    statusText = "Urgent";
  } else if (request.status === "received") {
    statusBadgeClass = "text-emerald bg-emerald/10 border-emerald/30 group-hover:border-emerald/60 group-hover:shadow-[0_0_8px_rgba(18,67,58,0.2)]";
    statusText = "New";
  } else if (request.status === "in_progress") {
    statusBadgeClass = "text-champagne bg-champagne/15 border-champagne/30 group-hover:border-champagne/60 group-hover:shadow-[0_0_8px_rgba(201,162,39,0.2)]";
    statusText = "Working";
  }

  const dotBgClass = DEPT_BG_CLASSES[request.department] ?? "bg-champagne";
  const animationClass = isRecent ? "animate-slideInLeft animate-goldFlash" : "";

  return (
    <Link
      href={request.guestPhone ? `/gm/conversations/${encodeURIComponent(request.guestPhone)}` : "/gm/requests"}
      className={`group flex items-center gap-3 p-3 rounded-[10px] no-underline bg-bone border border-line transition-all duration-200 hover:bg-white hover:border-champagne/40 hover:shadow-sm hover:translate-x-1 cursor-pointer ${animationClass}`}
    >
      {/* Department dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125 ${dotBgClass}`} />

      {/* Room number bold */}
      <span className="text-sm font-bold text-ink font-sans whitespace-nowrap group-hover:text-emerald transition-colors">
        {request.roomNumber ? `Room ${request.roomNumber}` : "Room \u2014"}
      </span>

      {/* Request text truncate */}
      <span className="flex-1 min-w-0 text-sm text-ink truncate font-sans group-hover:text-ink transition-colors">
        {request.requestDetail}
      </span>

      {/* Department & relative time */}
      <span className="text-xs text-muted whitespace-nowrap font-sans">
        {deptLabel} &middot; {timeAgo(request.createdAt)}
      </span>

      {/* Status chip */}
      <span className={`text-[11px] font-semibold rounded-md px-2 py-0.5 whitespace-nowrap font-sans border transition-all duration-200 ${statusBadgeClass}`}>
        {statusText}
      </span>
    </Link>
  );
}

export type RoomItemData = {
  roomNumber: string;
  urgent: boolean;
  working: boolean;
  open: boolean;
  count: number;
  floor: string;
};

/** Reusable 48x48 room pill component with luxury pop on hover and navigation */
export function RoomPill({ room }: { room: RoomItemData }) {
  let styleClasses = "border-line bg-bone text-muted hover:border-muted/50 hover:bg-white";
  let countBadgeClass = "text-muted";

  if (room.urgent) {
    styleClasses = "border-urgent bg-urgent/10 text-urgent hover:bg-urgent/15 hover:shadow-[0_0_12px_rgba(180,69,58,0.3)]";
    countBadgeClass = "text-urgent";
  } else if (room.open) {
    styleClasses = "border-emerald bg-emerald/10 text-emerald hover:bg-emerald/15 hover:shadow-[0_0_12px_rgba(18,67,58,0.3)]";
    countBadgeClass = "text-emerald";
  } else if (room.working) {
    styleClasses = "border-champagne bg-champagne/15 text-champagne hover:bg-champagne/25 hover:shadow-[0_0_12px_rgba(201,162,39,0.3)]";
    countBadgeClass = "text-champagne";
  }

  return (
    <Link
      href="/gm/reception"
      title={`Room ${room.roomNumber} \u2014 ${room.count} active request(s). Click to view Reception & Rooms.`}
      className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center relative cursor-pointer no-underline transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:shadow-md ${styleClasses}`}
    >
      <span className="text-xs font-bold text-ink font-sans leading-none">
        {room.roomNumber}
      </span>
      {room.count > 1 ? (
        <span className={`text-[9px] font-bold mt-0.5 ${countBadgeClass}`}>
          {room.count}
        </span>
      ) : null}
    </Link>
  );
}

interface LiveFeedAndRoomsProps {
  requests: RequestRow[];
  isMobile?: boolean;
}

export default function GMLiveFeedAndRooms({ requests }: LiveFeedAndRoomsProps) {
  // Group rooms by room number and floor
  const { floors, totalActiveRooms } = useMemo(() => {
    const map: Record<string, RoomItemData> = {};

    for (const r of requests) {
      const rm = (r.roomNumber || "").trim();
      if (!rm) continue;
      if (!map[rm]) {
        let floor = "Other";
        const digits = rm.replace(/\D/g, "");
        if (digits.length >= 3) {
          floor = `Floor ${digits.slice(0, digits.length - 2)}`;
        } else if (digits.length > 0) {
          floor = `Floor ${digits[0]}`;
        }
        map[rm] = { roomNumber: rm, urgent: false, working: false, open: false, count: 0, floor };
      }
      map[rm].count += 1;
      if (r.priority === "urgent" && r.status !== "resolved") map[rm].urgent = true;
      if (r.status === "in_progress") map[rm].working = true;
      if (r.status === "received") map[rm].open = true;
    }

    const roomList = Object.values(map).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
    const floorGroups: Record<string, RoomItemData[]> = {};
    for (const r of roomList) {
      if (!floorGroups[r.floor]) floorGroups[r.floor] = [];
      floorGroups[r.floor].push(r);
    }

    return {
      floors: Object.entries(floorGroups).sort((a, b) => b[0].localeCompare(a[0], undefined, { numeric: true })),
      totalActiveRooms: roomList.length,
    };
  }, [requests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
      {/* 60% Column: Live Feed */}
      <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line flex flex-col min-h-[440px] luxury-card-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-luxury-hover hover:border-champagne/40">
        <div className="flex justify-between items-center mb-4.5 relative z-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
              REAL-TIME PULSE
            </div>
            <Link
              href="/gm/requests"
              className="group/title inline-flex items-center gap-1.5 text-ink no-underline hover:text-emerald transition-colors"
            >
              <h3 className="font-serif text-xl font-semibold text-inherit m-0 tracking-tight">
                Live Guest Activity
              </h3>
              <svg
                className="w-4 h-4 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-champagne"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <Link
            href="/gm/requests"
            className="text-xs font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-3 py-1 rounded-full font-sans transition-all duration-200 hover:bg-emerald/15 hover:scale-105 no-underline flex items-center gap-1.5"
          >
            <span>{requests.length} active</span>
            <span className="text-champagne font-bold">&rarr;</span>
          </Link>
        </div>

        {/* Feed List with max-height 420px */}
        <div className="flex-1 max-h-[420px] overflow-y-auto flex flex-col gap-2 pr-1 relative z-10">
          {requests.length === 0 ? (
            <DashboardEmptyState href="/gm/requests" />
          ) : (
            requests.map((r, idx) => (
              <LiveFeedRow key={r.id} request={r} isRecent={idx === 0} />
            ))
          )}
        </div>
      </div>

      {/* 40% Column: Rooms with Activity */}
      <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line flex flex-col min-h-[440px] luxury-card-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-luxury-hover hover:border-champagne/40">
        <div className="flex justify-between items-start mb-4.5 relative z-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
              PROPERTY ACTIVITY
            </div>
            <Link
              href="/gm/reception"
              className="group/title inline-flex items-center gap-1.5 text-ink no-underline hover:text-emerald transition-colors"
            >
              <h3 className="font-serif text-xl font-semibold text-inherit m-0 tracking-tight">
                Rooms with Activity
              </h3>
              <svg
                className="w-4 h-4 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-champagne"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Link
              href="/gm/reception"
              className="text-xs font-semibold text-champagne hover:text-emerald transition-colors flex items-center gap-1 no-underline"
            >
              <span>Reception &rarr;</span>
            </Link>
            {/* Legend */}
            <div className="flex gap-2.5 text-xs text-muted">
              <span className="flex items-center gap-1 transition-transform hover:scale-105">
                <span className="w-1.5 h-1.5 rounded-sm bg-urgent" />
                Urgent
              </span>
              <span className="flex items-center gap-1 transition-transform hover:scale-105">
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald" />
                New
              </span>
              <span className="flex items-center gap-1 transition-transform hover:scale-105">
                <span className="w-1.5 h-1.5 rounded-sm bg-champagne" />
                Working
              </span>
            </div>
          </div>
        </div>

        {/* Floor-wise grid of room pills: 48x48 */}
        <div className="flex-1 max-h-[420px] overflow-y-auto flex flex-col gap-4 relative z-10">
          {totalActiveRooms === 0 ? (
            <DashboardEmptyState icon="room" href="/gm/reception" />
          ) : (
            floors.map(([floorName, floorRooms]) => (
              <div key={floorName}>
                <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-2 font-sans">
                  {floorName}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,48px))] gap-2">
                  {floorRooms.map((s) => (
                    <RoomPill key={s.roomNumber} room={s} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
