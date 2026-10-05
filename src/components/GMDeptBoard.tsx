"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
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

/** Reusable row component for each department with luxury micro-hover and direct navigation */
export function DeptRow({ data, fillWidth, delayMs, isLast }: DeptRowProps) {
  return (
    <Link
      href="/gm/departments"
      title={`Configure and view operations for ${data.label}`}
      className={`group grid grid-cols-[180px_1fr_80px_90px_60px_20px] items-center gap-4 py-3.5 px-3 -mx-3 rounded-lg no-underline transition-all duration-200 hover:bg-bone/80 cursor-pointer ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      {/* 1. [dot] Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125 ${data.bgClass}`} />
        <span className="text-sm font-semibold text-ink font-sans truncate transition-colors group-hover:text-emerald">
          {data.label}
        </span>
      </div>

      {/* 2. Horizontal Load Bar */}
      <div className="h-1.5 rounded-sm bg-line relative overflow-hidden">
        <div
          className={`h-full rounded-sm transition-[width] duration-700 ease-out group-hover:brightness-110 ${data.bgClass}`}
          style={{
            width: fillWidth,
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>

      {/* 3. 0 this week */}
      <div className="text-xs text-ink font-sans text-right whitespace-nowrap">
        <span className="font-semibold text-sm group-hover:font-bold transition-all">{data.weekCount}</span>{" "}
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
          <span className="text-[11px] font-bold text-urgent bg-urgent/10 px-2 py-0.5 rounded-md font-sans transition-transform duration-200 inline-block group-hover:scale-105">
            {data.openCount} open
          </span>
        ) : (
          <span className="text-xs text-muted font-sans group-hover:text-ink/60 transition-colors">clear</span>
        )}
      </div>

      {/* 6. Hover arrow */}
      <div className="text-right">
        <svg
          className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-champagne inline-block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
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
    <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line luxury-card-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-luxury-hover hover:border-champagne/40">
      {/* Header */}
      <div className="flex justify-between items-baseline mb-5 relative z-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
            DEPARTMENT STANDINGS &amp; EFFICIENCY
          </div>
          <Link
            href="/gm/departments"
            className="group/title inline-flex items-center gap-1.5 text-ink no-underline hover:text-emerald transition-colors"
          >
            <h3 className="font-serif text-xl font-semibold text-inherit m-0 tracking-tight">
              Department Operations Board
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
          href="/gm/departments"
          className="text-xs font-semibold text-champagne hover:text-emerald transition-colors flex items-center gap-1 no-underline"
        >
          <span>Manage Departments &rarr;</span>
        </Link>
      </div>

      {/* Unified 6-row table container */}
      <div className="overflow-x-auto relative z-10">
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
