"use client";

import React, { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: "default" | "dark" | "gold";
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = 18,
  borderRadius = 8,
  variant = "default",
  className = "",
  style = {},
}: SkeletonProps) {
  const variantClass =
    variant === "dark"
      ? "skeleton-dark"
      : variant === "gold"
      ? "skeleton-gold"
      : "skeleton";

  return (
    <div
      className={`${variantClass} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        display: "inline-block",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({
  height = 140,
  style = {},
  children,
}: {
  height?: number | string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2EBE7",
        borderRadius: 18,
        padding: "20px 22px",
        boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)",
        minHeight: height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {children || (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton width="45%" height={12} />
            <Skeleton width={24} height={24} borderRadius={999} />
          </div>
          <Skeleton width="60%" height={32} borderRadius={6} style={{ margin: "14px 0 8px" }} />
          <Skeleton width="75%" height={10} />
        </>
      )}
    </div>
  );
}

/** Dashboard Overview Skeleton matching Aria Luxury Resort 5-section layout */
export function DashboardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-14 py-2">
      {/* 1. Luxury Hero Banner Skeleton (~180px) */}
      <div className="bg-gradient-to-br from-emerald to-emerald-lo rounded-luxury p-6 md:px-8 text-white shadow-luxury min-h-[180px] flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-[260px]">
            <Skeleton width={180} height={12} variant="dark" borderRadius={999} style={{ marginBottom: 10 }} />
            <Skeleton width={320} height={36} variant="dark" borderRadius={8} style={{ marginBottom: 8 }} />
            <Skeleton width={220} height={14} variant="dark" borderRadius={6} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton width={140} height={30} variant="dark" borderRadius={999} />
            <Skeleton width={160} height={12} variant="dark" borderRadius={6} />
          </div>
        </div>

        {/* Quick action bar placeholders */}
        <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-white/15 flex-wrap">
          {[130, 110, 130, 115, 125].map((w, i) => (
            <Skeleton key={i} width={w} height={30} variant="dark" borderRadius={999} />
          ))}
        </div>
      </div>

      {/* 2. KPI Cards Row Skeleton (5 cards) */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card border border-line rounded-luxury p-5 md:p-6 shadow-luxury flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex justify-between items-center">
                <Skeleton width="50%" height={11} />
                <Skeleton width={32} height={32} borderRadius={999} />
              </div>
              <Skeleton width="60%" height={40} borderRadius={6} style={{ margin: "14px 0 6px" }} />
              <Skeleton width="40%" height={12} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live Feed + Rooms 60/40 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-card border border-line rounded-luxury p-6 md:p-7 shadow-luxury min-h-[380px]">
          <div className="flex justify-between mb-5">
            <Skeleton width={180} height={18} />
            <Skeleton width={70} height={22} borderRadius={999} />
          </div>
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={52} borderRadius={10} />
            ))}
          </div>
        </div>
        <div className="bg-card border border-line rounded-luxury p-6 md:p-7 shadow-luxury min-h-[380px]">
          <div className="flex justify-between mb-5">
            <Skeleton width={160} height={18} />
            <Skeleton width={100} height={14} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,48px))] gap-2">
            {Array.from({ length: 12 }).map((_, j) => (
              <Skeleton key={j} width={48} height={48} borderRadius={8} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Department Board Skeleton (6 rows) */}
      <div className="bg-card border border-line rounded-luxury p-6 md:p-7 shadow-luxury">
        <div className="flex justify-between mb-5">
          <Skeleton width={220} height={18} />
          <Skeleton width={110} height={14} />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-[180px_1fr_80px_90px_60px] gap-4 items-center">
              <Skeleton width={140} height={14} />
              <Skeleton width="100%" height={6} borderRadius={3} />
              <Skeleton width={50} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={45} height={14} />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Heatmap Skeleton */}
      <div className="bg-card border border-line rounded-luxury p-6 md:p-7 shadow-luxury">
        <div className="flex justify-between mb-5">
          <Skeleton width={260} height={18} />
          <Skeleton width={120} height={12} />
        </div>
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} width="100%" height={26} borderRadius={3} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Room Board / Reception Skeleton */
export function ReceptionSkeleton() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <Skeleton width={180} height={12} style={{ marginBottom: 8 }} />
          <Skeleton width={260} height={32} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Skeleton width={120} height={34} borderRadius={999} />
          <Skeleton width={140} height={34} borderRadius={999} />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} height={110} />
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 14, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Skeleton width={90} height={14} />
          <Skeleton width={90} height={14} />
          <Skeleton width={90} height={14} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton width={60} height={28} borderRadius={999} />
          <Skeleton width={60} height={28} borderRadius={999} />
        </div>
      </div>

      {/* Floor Room Grids */}
      {[3, 2, 1].map((fl) => (
        <div key={fl} style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 22, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Skeleton width={90} height={18} />
            <Skeleton width={140} height={12} />
            <div style={{ flex: 1 }}>
              <Skeleton width="100%" height={6} borderRadius={999} />
            </div>
            <Skeleton width={100} height={26} borderRadius={999} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 10 }}>
            {Array.from({ length: 12 }).map((_, j) => (
              <Skeleton key={j} width="100%" height={56} borderRadius={12} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Data Table Skeleton (Guests, Alerts, Requests) */
export function TableSkeleton({
  rows = 5,
  titleWidth = 180,
  showSearch = false,
}: {
  rows?: number;
  titleWidth?: number;
  showSearch?: boolean;
}) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Skeleton width={140} height={12} style={{ marginBottom: 6 }} />
          <Skeleton width={titleWidth} height={32} />
        </div>
        <Skeleton width={130} height={34} borderRadius={999} />
      </div>

      {showSearch && (
        <div style={{ display: "flex", gap: 12 }}>
          <Skeleton width="100%" height={40} borderRadius={12} />
        </div>
      )}

      {/* Table container */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
        {/* Table Head */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px", background: "#FAFBFB", borderBottom: "1px solid #E2EBE7" }}>
          <Skeleton width={80} height={12} />
          <Skeleton width={120} height={12} />
          <Skeleton width={180} height={12} />
          <Skeleton width={70} height={12} />
          <Skeleton width={80} height={12} />
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #F1F6F4" }}>
            <Skeleton width={70} height={16} borderRadius={6} />
            <Skeleton width={130} height={14} />
            <Skeleton width={220} height={14} />
            <Skeleton width={60} height={20} borderRadius={999} />
            <Skeleton width={70} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Department Cards Grid Skeleton */
export function DepartmentsSkeleton() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Skeleton width={160} height={12} style={{ marginBottom: 6 }} />
          <Skeleton width={260} height={32} />
        </div>
        <Skeleton width={140} height={34} borderRadius={999} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 22, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Skeleton width={38} height={38} borderRadius={10} />
                <div>
                  <Skeleton width={120} height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width={70} height={11} />
                </div>
              </div>
              <Skeleton width={70} height={24} borderRadius={999} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "18px 0" }}>
              <Skeleton height={50} borderRadius={10} />
              <Skeleton height={50} borderRadius={10} />
              <Skeleton height={50} borderRadius={10} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #F1F6F4" }}>
              <Skeleton width={90} height={28} borderRadius={999} />
              <Skeleton width={90} height={28} borderRadius={999} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
