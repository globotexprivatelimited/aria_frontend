"use client";

import { useMemo, useState } from "react";
import type { Req as RequestRow } from "../app/_actions/requests";

interface GMHeatmapProps {
  week: RequestRow[];
}

function formatHourShort(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

export const GOLD_RAMP_CLASSES: Record<number, string> = {
  0: "bg-goldramp-0",
  1: "bg-goldramp-1",
  2: "bg-goldramp-2",
  3: "bg-goldramp-3",
  4: "bg-goldramp-4",
  5: "bg-goldramp-5",
};

export function getGoldRampLevel(v: number, max: number): number {
  if (v === 0) return 0;
  if (max <= 1) return 3;
  const ratio = v / max;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  if (ratio <= 0.8) return 4;
  return 5;
}

interface HeatmapCellProps {
  value: number;
  max: number;
  dayLabel: string;
  hour: number;
  delayMs: number;
  onHover: (info: { text: string; x: number; y: number } | null) => void;
}

/** Reusable Heatmap Cell component */
export function HeatmapCell({
  value,
  max,
  dayLabel,
  hour,
  delayMs,
  onHover,
}: HeatmapCellProps) {
  const level = getGoldRampLevel(value, max);
  const colorClass = GOLD_RAMP_CLASSES[level];
  const tooltipText = `${dayLabel} ${formatHourShort(hour)} \u00B7 ${value} ${
    value === 1 ? "request" : "requests"
  }`;

  return (
    <div
      className={`flex-1 h-[26px] rounded-[3px] min-w-4 cursor-pointer transition-transform duration-150 hover:scale-125 hover:z-10 ${colorClass}`}
      title={tooltipText}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onHover({
          text: tooltipText,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
      }}
      onMouseLeave={() => onHover(null)}
      style={{
        opacity: 0,
        animation: "fadeCell 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        animationDelay: `${delayMs}ms`,
      }}
    />
  );
}

export default function GMHeatmap({ week }: GMHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { grid, days, max } = useMemo(() => {
    const days: string[] = [];
    const grid: number[][] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { weekday: "short" }));
      const key = d.toDateString();
      const hours = Array.from({ length: 24 }, () => 0);
      for (const r of week) {
        const rd = new Date(r.createdAt);
        if (rd.toDateString() === key) {
          hours[rd.getHours()] += 1;
        }
      }
      grid.push(hours);
    }
    const max = Math.max(1, ...grid.flat());
    return { grid, days, max };
  }, [week]);

  return (
    <div className="bg-card rounded-luxury p-6 md:p-7 shadow-luxury border border-line relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-luxury-hover">
      {/* Header */}
      <div className="flex justify-between items-baseline mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-champagne font-semibold font-sans mb-1">
            HOURLY CONCIERGE DENSITY
          </div>
          <h3 className="font-serif text-xl font-semibold text-ink m-0 tracking-tight">
            Activity Heatmap &middot; 7 Days &times; 24 Hours
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted font-sans">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={`w-2.5 h-2.5 rounded-[2px] ${GOLD_RAMP_CLASSES[level]}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Grid container with internal horizontal scroll on small mobile */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[640px] flex flex-col gap-1">
          {grid.map((hours, di) => (
            <div key={di} className="flex items-center gap-2">
              {/* Day label */}
              <span className="w-8 text-xs font-medium text-muted text-right font-sans shrink-0">
                {days[di]}
              </span>

              {/* 24 cells */}
              <div className="flex gap-1 flex-1">
                {hours.map((v, hi) => (
                  <HeatmapCell
                    key={hi}
                    value={v}
                    max={max}
                    dayLabel={days[di]}
                    hour={hi}
                    delayMs={(di * 24 + hi) * 4}
                    onHover={setTooltip}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Time axis footer */}
          <div className="flex gap-2 mt-2">
            <span className="w-8 shrink-0" />
            <div className="flex flex-1 justify-between text-[10px] text-muted font-sans px-0.5">
              <span>12a</span>
              <span>3a</span>
              <span>6a</span>
              <span>9a</span>
              <span>12p</span>
              <span>3p</span>
              <span>6p</span>
              <span>9p</span>
              <span>11p</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating luxury tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap shadow-lg bg-ink text-white font-sans -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}