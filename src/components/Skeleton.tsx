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

/** Dashboard Overview Skeleton matching Grandoria Luxury Resort layout */
export function DashboardSkeleton() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24, padding: "8px 0" }}>
      {/* Luxury Hero Banner Skeleton */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A3E34 0%, #2F5D50 55%, #3B7262 100%)",
          borderRadius: 20,
          padding: "28px 32px",
          color: "#FFFFFF",
          boxShadow: "0 12px 34px -4px rgba(47,93,80,0.22)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Skeleton width={160} height={14} variant="dark" borderRadius={999} style={{ marginBottom: 12 }} />
            <Skeleton width={280} height={36} variant="dark" borderRadius={8} style={{ marginBottom: 12 }} />
            <Skeleton width="70%" height={16} variant="dark" borderRadius={6} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <Skeleton width={140} height={32} variant="dark" borderRadius={999} />
            <Skeleton width={180} height={14} variant="dark" borderRadius={6} />
          </div>
        </div>

        {/* Quick action bar placeholders */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.15)", flexWrap: "wrap" }}>
          {[120, 110, 130, 115, 125].map((w, i) => (
            <Skeleton key={i} width={w} height={32} variant="dark" borderRadius={999} />
          ))}
        </div>
      </div>

      {/* KPI Cards Row Skeleton */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <Skeleton width={180} height={16} />
          <Skeleton width={120} height={14} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} height={120} />
          ))}
        </div>
      </div>

      {/* Trajectory & Channel Mix Skeletons */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <Skeleton width={240} height={18} />
          <Skeleton width={140} height={14} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {/* Area chart skeleton */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Skeleton width={180} height={16} />
              <Skeleton width={90} height={16} borderRadius={999} />
            </div>
            <Skeleton width="100%" height={180} borderRadius={12} />
          </div>

          {/* Donut chart skeleton */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
            <Skeleton width={140} height={16} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 140 }}>
              <Skeleton width={130} height={130} borderRadius={999} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <Skeleton width={70} height={14} />
              <Skeleton width={70} height={14} />
              <Skeleton width={70} height={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Feed / Table row skeletons */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <Skeleton width={200} height={18} />
          <Skeleton width={80} height={14} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #F1F6F4" }}>
              <Skeleton width={42} height={42} borderRadius={10} />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="70%" height={12} />
              </div>
              <Skeleton width={60} height={20} borderRadius={999} />
            </div>
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
