"use client";

import Link from "next/link";
import { useCountUp } from "../lib/useCountUp";

export type KpiItem = {
  key: string;
  label: string;
  value: number;
  caption: string;
  href?: string;
};

const GLYPHS: Record<string, string> = {
  guests: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  open: "M12 8v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
  progress: "M12 2a10 10 0 1 0 10 10M12 2v10l7 7",
  resolved: "M20 6L9 17l-5-5",
  urgent: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17v.5",
};

export { useCountUp };

const DEFAULT_HREFS: Record<string, string> = {
  guests: "/gm/guests",
  open: "/gm/requests",
  progress: "/gm/requests",
  resolved: "/gm/requests",
  urgent: "/gm/requests",
};

export function KpiCard({ item }: { item: KpiItem }) {
  const animatedValue = useCountUp(item.value, 900);
  const isUrgent = item.key === "urgent";
  const isResolved = item.key === "resolved";
  const targetHref = item.href || DEFAULT_HREFS[item.key] || "/gm/requests";

  let numClass = "text-ink group-hover:text-ink";
  if (isUrgent && item.value > 0) {
    numClass = "text-urgent group-hover:text-red-700";
  } else if (isResolved && item.value > 0) {
    numClass = "text-champagne group-hover:text-amber-600";
  }

  return (
    <Link
      href={targetHref}
      title={`Navigate to ${item.label}`}
      className={`group relative flex flex-col justify-between min-h-[142px] bg-card rounded-luxury p-5 md:p-6 shadow-luxury transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-luxury-hover active:scale-[0.98] border luxury-card-sheen cursor-pointer no-underline ${
        isUrgent
          ? "border-line border-l-[3px] border-l-urgent hover:border-l-urgent hover:border-urgent/30 hover:shadow-[0_12px_32px_rgba(180,69,58,0.12)]"
          : "border-line hover:border-champagne/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 relative z-10">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold leading-tight font-sans transition-colors group-hover:text-ink">
          {item.label}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Subtle click indicator arrow that appears on hover */}
          <svg
            className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 text-champagne"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span
            className="w-8 h-8 rounded-full bg-bone inline-flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-champagne/15 group-hover:scale-105"
            aria-hidden="true"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isUrgent && item.value > 0 ? "#B4453A" : "#6B7A75"}
              className="transition-colors group-hover:stroke-champagne"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={GLYPHS[item.key] ?? GLYPHS.open} />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-3.5 relative z-10">
        <div className={`font-sans text-[44px] font-semibold leading-none tracking-tight tabular-nums transition-transform duration-200 group-hover:translate-x-0.5 ${numClass}`}>
          {animatedValue}
        </div>
        <div className="text-xs text-muted mt-1.5 font-normal font-sans group-hover:text-ink/75 transition-colors flex items-center justify-between">
          <span>{item.caption}</span>
          <span className="text-[10px] text-champagne font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function GMKpiCards({ items, columns }: { items: KpiItem[]; columns?: string }) {
  return (
    <div
      className={
        columns
          ? undefined
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      }
      style={columns ? { display: "grid", gridTemplateColumns: columns, gap: 16 } : undefined}
    >
      {items.map((item) => (
        <KpiCard key={item.key} item={item} />
      ))}
    </div>
  );
}
