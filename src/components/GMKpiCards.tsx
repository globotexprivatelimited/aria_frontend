"use client";

import { useEffect, useState } from "react";

export type KpiItem = {
  key: string;
  label: string;
  value: number;
  caption: string;
};

const GLYPHS: Record<string, string> = {
  guests: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  open: "M12 8v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
  progress: "M12 2a10 10 0 1 0 10 10M12 2v10l7 7",
  resolved: "M20 6L9 17l-5-5",
  urgent: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17v.5",
};

import { useCountUp } from "../lib/useCountUp";
export { useCountUp };

export function KpiCard({ item }: { item: KpiItem }) {
  const animatedValue = useCountUp(item.value, 900);
  const isUrgent = item.key === "urgent";
  const isResolved = item.key === "resolved";

  let numClass = "text-ink";
  if (isUrgent && item.value > 0) {
    numClass = "text-urgent";
  } else if (isResolved && item.value > 0) {
    numClass = "text-champagne";
  }

  return (
    <div
      className={`relative flex flex-col justify-between min-h-[140px] bg-card rounded-luxury p-5 md:p-6 shadow-luxury transition-all duration-200 hover:-translate-y-0.5 hover:shadow-luxury-hover border ${
        isUrgent ? "border-line border-l-[3px] border-l-urgent" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold leading-tight font-sans">
          {item.label}
        </span>
        <span
          className="w-8 h-8 rounded-full bg-bone inline-flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isUrgent && item.value > 0 ? "#B4453A" : "#6B7A75"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={GLYPHS[item.key] ?? GLYPHS.open} />
          </svg>
        </span>
      </div>

      <div className="mt-3.5">
        <div className={`font-sans text-[44px] font-semibold leading-none tracking-tight tabular-nums ${numClass}`}>
          {animatedValue}
        </div>
        <div className="text-xs text-muted mt-1.5 font-normal font-sans">
          {item.caption}
        </div>
      </div>
    </div>
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
