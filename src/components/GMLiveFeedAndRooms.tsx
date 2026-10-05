"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Req as RequestRow } from "../app/_actions/requests";
import { getDeptLabel, DEPT_BG_CLASSES } from "../lib/departments";
import { timeAgo } from "../lib/format";

/** Reusable Empty State component for luxury cards */
export function DashboardEmptyState({
  title = "All quiet \u2014 no active requests",
  subtitle = "Requests will appear here in real time",
  icon = "bell",
}: {
  title?: string;
  subtitle?: string;
  icon?: "bell" | "room";
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-bone flex items-center justify-center mb-3">
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
      <div className="text-sm font-medium text-ink mb-1 font-sans">{title}</div>
      <div className="text-xs text-muted font-sans">{subtitle}</div>
    </div>
  );
}

/** Reusable live request row */
export function LiveFeedRow({
  request,
  isRecent = false,
}: {
  request: RequestRow;
  isRecent?: boolean;
}) {
  const deptLabel = getDeptLabel(request.department);
  const isUrgent = request.priority === "urgent" && request.status !== "resolved";

  let statusBadgeClass = "text-muted bg-muted/10 border-muted/20";
  let statusText = "Done";

  if (isUrgent) {
    statusBadgeClass = "text-urgent bg-urgent/10 border-urgent/30";
    statusText = "Urgent";
  } else if (request.status === "received") {
    statusBadgeClass = "text-emerald bg-emerald/10 border-emerald/30";
    statusText = "New";
  } else if (request.status === "in_progress") {
    statusBadgeClass = "text-champagne bg-champagne/15 border-champagne/30";
    statusText = "Working";
  }

  const dotBgClass = DEPT_BG_CLASSES[request.department] ?? "bg-champagne";
  const animationClass = isRecent ? "animate-slideInLeft animate-goldFlash" : "";

  return (
    <Link
      href={request.guestPhone ? `/gm/conversations/${encodeURIComponent(request.guestPhone)}` : "/gm/requests"}
      className={`flex items-center gap-3 p-3 rounded-[10px] no-underline bg-bone border border-line transition-colors hover:border-ink/25 ${animationClass}`}
    >
      {/* Department dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotBgClass}`} />

      {/* Room number bold */}
      <span className="text-sm font-bold text-ink font-sans whitespace-nowrap">
        {request.roomNumber ? `Room ${request.roomNumber}` : "Room \u2014"}
      </span>

      {/* Request text truncate */}
      <span className="flex-1 min-w-0 text-sm text-ink truncate font-sans">
        {request.requestDetail}
      </span>

      {/* Department & relative time */}
      <span className="text-xs text-muted whitespace-nowrap font-sans">
        {deptLabel} &middot; {timeAgo(request.createdAt)}
      </span>

      {/* Status chip */}
      <span className={`text-[11px] font-semibold rounded-md px-2 py-0.5 whitespace-nowrap font-sans border ${statusBadgeClass}`}>
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

/** Reusable 48x48 room pill component */
export function RoomPill({ room }: { room: RoomItemData }) {
  let styleClasses = "border-line bg-bone text-muted";
  let countBadgeClass = "text-muted";

  if (room.urgent) {
    styleClasses = "border-urgent bg-urgent/10 text-urgent";
    countBadgeClass = "text-urgent";
  } else if (room.open) {
    styleClasses = "border-emerald bg-emerald/10 text-emerald";
    countBadgeClass = "text-emerald";
  } else if (room.working) {
    styleClasses = "border-champagne bg-champagne/15 text-champagne";
    countBadgeClass = "text-champagne";
  }

  return (
    <div
      title={`Room ${room.roomNumber} \u2014 ${room.count} active request(s)`}
      className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center relative cursor-default ${styleClasses}`}
    >
      <span className="text-xs font-bold text-ink font-sans leading-none">
        {room.roomNumber}
      </span>
      {room.count > 1 ? (
        <span className={`text-[9px] font-bold mt-0.5 ${countBadgeClass}`}>
          {room.count}
        </span>
      ) : null}
    </div>
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
      <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line flex flex-col min-h-[440px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-luxury-hover">
        <div className="flex justify-between items-center mb-4.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
              REAL-TIME PULSE
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink m-0 tracking-tight">
              Live Guest Activity
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-3 py-1 rounded-full font-sans">
            {requests.length} active
          </span>
        </div>

        {/* Feed List with max-height 420px */}
        <div className="flex-1 max-h-[420px] overflow-y-auto flex flex-col gap-2 pr-1">
          {requests.length === 0 ? (
            <DashboardEmptyState />
          ) : (
            requests.map((r, idx) => (
              <LiveFeedRow key={r.id} request={r} isRecent={idx === 0} />
            ))
          )}
        </div>
      </div>

      {/* 40% Column: Rooms with Activity */}
      <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line flex flex-col min-h-[440px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-luxury-hover">
        <div className="flex justify-between items-start mb-4.5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
              PROPERTY ACTIVITY
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink m-0 tracking-tight">
              Rooms with Activity
            </h3>
          </div>

          {/* Legend */}
          <div className="flex gap-2.5 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-urgent" />
              Urgent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-emerald" />
              New
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-champagne" />
              Working
            </span>
          </div>
        </div>

        {/* Floor-wise grid of room pills: 48x48 */}
        <div className="flex-1 max-h-[420px] overflow-y-auto flex flex-col gap-4">
          {totalActiveRooms === 0 ? (
            <DashboardEmptyState icon="room" />
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
