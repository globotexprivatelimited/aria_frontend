"use client";

import { useMemo, useState, useEffect } from "react";
import type { Req as RequestRow } from "../app/_actions/requests";
import { DEPARTMENTS, DEPT_BG_CLASSES, type DeptConfig } from "../lib/departments";
export { DEPT_BG_CLASSES };

export interface DeptRowData {
  dept: string;
  label: string;
  bgClass: string;
  openCount: number;
  weekCount: number;
  rate: number;
}

interface DeptRowProps {
  data: DeptRowData;
  fillWidth: string;
  delayMs: number;
  isLast: boolean;
}

/** Reusable row component for each department */
export function DeptRow({ data, fillWidth, delayMs, isLast }: DeptRowProps) {
  return (
    <div
      className={`grid grid-cols-[180px_1fr_80px_90px_60px] items-center gap-4 py-4 ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      {/* 1. [dot] Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${data.bgClass}`} />
        <span className="text-sm font-semibold text-ink font-sans truncate">
          {data.label}
        </span>
      </div>

      {/* 2. Horizontal Load Bar */}
      <div className="h-1.5 rounded-sm bg-line relative overflow-hidden">
        <div
          className={`h-full rounded-sm transition-[width] duration-700 ease-out ${data.bgClass}`}
          style={{
            width: fillWidth,
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>

      {/* 3. 0 this week */}
      <div className="text-xs text-ink font-sans text-right whitespace-nowrap">
        <span className="font-semibold text-sm">{data.weekCount}</span>{" "}
        <span className="text-muted text-[11px]">this wk</span>
      </div>

      {/* 4. 0% resolved */}
      <div
        className={`text-xs font-semibold font-sans text-right whitespace-nowrap ${
          data.rate >= 70 ? "text-emerald" : "text-champagne"
        }`}
      >
        {data.rate}%{" "}
        <span className="text-muted text-[11px] font-normal">resolved</span>
      </div>

      {/* 5. clear / X open */}
      <div className="text-right whitespace-nowrap">
        {data.openCount > 0 ? (
          <span className="text-[11px] font-bold text-urgent bg-urgent/10 px-2 py-0.5 rounded-md font-sans">
            {data.openCount} open
          </span>
        ) : (
          <span className="text-xs text-muted font-sans">clear</span>
        )}
      </div>
    </div>
  );
}

interface DeptBoardProps {
  active: RequestRow[];
  week: RequestRow[];
}

export default function GMDeptBoard({ active, week }: DeptBoardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const { rows, maxWeek } = useMemo(() => {
    const list: DeptRowData[] = DEPARTMENTS.map((dp: DeptConfig) => {
      const openCount = active.filter((r) => r.department === dp.dept && r.status !== "resolved").length;
      const weekCount = week.filter((r) => r.department === dp.dept).length;
      const resolvedCount = week.filter((r) => r.department === dp.dept && r.status === "resolved").length;
      const rate = weekCount > 0 ? Math.round((resolvedCount / weekCount) * 100) : 0;
      return {
        dept: dp.dept,
        label: dp.label,
        bgClass: DEPT_BG_CLASSES[dp.dept] ?? "bg-champagne",
        openCount,
        weekCount,
        rate,
      };
    });
    const maxWeek = Math.max(1, ...list.map((l) => l.weekCount));
    return { rows: list, maxWeek };
  }, [active, week]);

  return (
    <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-luxury-hover">
      {/* Header */}
      <div className="flex justify-between items-baseline mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
            DEPARTMENT STANDINGS &amp; EFFICIENCY
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink m-0 tracking-tight">
            Department Operations Board
          </h3>
        </div>
        <div className="text-xs text-muted font-sans">
          6 Service Centers
        </div>
      </div>

      {/* Unified 6-row table container */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px] flex flex-col">
          {rows.map((row, idx) => {
            const isLast = idx === rows.length - 1;
            const targetWidthPct = row.weekCount > 0 ? Math.max(8, Math.round((row.weekCount / maxWeek) * 100)) : 0;
            const fillWidth = mounted ? `${targetWidthPct}%` : "0%";

            return (
              <DeptRow
                key={row.dept}
                data={row}
                fillWidth={fillWidth}
                delayMs={idx * 60}
                isLast={isLast}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
