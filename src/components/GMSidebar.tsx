"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyHotel } from "../lib/useMyHotel";
import { signOut } from "../lib/auth";
import { useBreakpoint } from "../lib/useBreakpoint";
import { LuxuryStars } from "./LuxuryStars";
import { getHotelActive } from "../app/_actions/requests";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badgeKey?: "requests" | "alerts";
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { href: "/gm", label: "Overview", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm8 0h6V11h-6v9zm0-16v5h6V4h-6z" },
      { href: "/gm/reception", label: "Reception", icon: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
      { href: "/gm/requests", label: "Requests", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", badgeKey: "requests" },
      { href: "/gm/departments", label: "Departments", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    ],
  },
  {
    title: "Guests & Team",
    items: [
      { href: "/gm/guests", label: "Guests", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
      { href: "/gm/staff", label: "Staff", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { href: "/gm/knowledge", label: "Knowledge", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5z" },
    ],
  },
  {
    title: "Insight",
    items: [
      { href: "/gm/revenue", label: "Revenue", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
      { href: "/alerts", label: "Alerts", icon: "M12 2 2 20h20L12 2zM12 9v4M12 17v.5", badgeKey: "alerts" },
    ],
  },
];

export const SUPPORT_ITEM: NavItem = {
  href: "/gm/support",
  label: "Support",
  icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

interface NavItemRowProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  isMobile: boolean;
  onNavigate: () => void;
  badgeCount?: number;
  staggerIndex?: number;
}

function NavItemRow({
  item,
  isActive,
  collapsed,
  isMobile,
  onNavigate,
  badgeCount = 0,
  staggerIndex = 0,
}: NavItemRowProps) {
  const isCompact = collapsed && !isMobile;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-active={isActive ? "true" : "false"}
      className={`nav-item group/item relative h-10 flex items-center gap-3 px-3 rounded-[6px] no-underline cursor-pointer ${
        isActive ? "active" : ""
      } ${isCompact ? "justify-center px-0" : ""}`}
      style={{
        color: isActive ? "#C9A227" : "rgba(255, 255, 255, 0.72)",
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.06)" : "transparent",
        fontWeight: isActive ? 500 : 400,
        animation: "navItemIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        animationDelay: `${staggerIndex * 30}ms`,
      }}
    >
      {/* Icon with 180ms hover scale */}
      <svg
        className="w-[18px] h-[18px] shrink-0 transition-transform duration-[180ms] ease-out group-hover/item:scale-[1.08]"
        style={{
          color: isActive ? "#C9A227" : "rgba(255, 255, 255, 0.45)",
          stroke: isActive ? "#C9A227" : "rgba(255, 255, 255, 0.45)",
          strokeWidth: isActive ? 1.8 : 1.5,
        }}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={item.icon} />
      </svg>

      {/* Label with 120ms fade out on collapse */}
      {!isCompact ? (
        <span
          className="text-[14px] truncate tracking-[-0.01em] font-sans transition-opacity duration-[120ms]"
          style={{
            color: isActive ? "#C9A227" : "rgba(255, 255, 255, 0.72)",
          }}
        >
          {item.label}
        </span>
      ) : null}

      {/* Live Badge: 18px champagne pill, ink text, tabular-nums */}
      {badgeCount > 0 && !isCompact ? (
        <span
          className="ml-auto shrink-0 inline-flex items-center justify-center font-bold tabular-nums shadow-sm"
          style={{
            height: "18px",
            minWidth: "18px",
            padding: "0 6px",
            borderRadius: "999px",
            backgroundColor: "#C9A227",
            color: "#0D1F1A",
            fontSize: "10px",
            lineHeight: 1,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {badgeCount}
        </span>
      ) : null}

      {/* Floating Tooltip when collapsed */}
      {isCompact ? (
        <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md bg-[#0D1F1A] border border-[rgba(201,162,39,0.3)] text-white text-xs font-medium shadow-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2">
          <span>{item.label}</span>
          {badgeCount > 0 ? (
            <span
              className="inline-flex items-center justify-center font-bold tabular-nums"
              style={{
                height: "16px",
                minWidth: "16px",
                padding: "0 4px",
                borderRadius: "999px",
                backgroundColor: "#C9A227",
                color: "#0D1F1A",
                fontSize: "9px",
              }}
            >
              {badgeCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}

export interface GMSidebarProps {
  requestsCount?: number;
  alertsCount?: number;
}

export default function GMSidebar({ requestsCount, alertsCount }: GMSidebarProps = {}) {
  const { hotelId, hotelName } = useMyHotel();
  const path = usePathname();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [counts, setCounts] = useState<{ requests: number; alerts: number }>({ requests: 0, alerts: 0 });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const [activeIndicator, setActiveIndicator] = useState<{ top: number; height: number; visible: boolean }>({
    top: 0,
    height: 40,
    visible: false,
  });

  // Responsive default collapse
  useEffect(() => {
    if (isTablet) setCollapsed(true);
    else if (isDesktop) setCollapsed(false);
  }, [isTablet, isDesktop]);

  // Live Counts for Requests and Alerts
  useEffect(() => {
    if (!hotelId) return;
    const currentHotelId = hotelId;
    let isCurrent = true;

    async function fetchCounts() {
      try {
        const active = await getHotelActive(currentHotelId);
        if (!isCurrent) return;
        const reqCount = active.filter((r) => r.status !== "resolved").length;
        const urgentCount = active.filter((r) => r.priority === "urgent" && r.status !== "resolved").length;
        setCounts({ requests: reqCount, alerts: urgentCount });
      } catch {
        // quiet fallback
      }
    }

    fetchCounts();
    const iv = setInterval(fetchCounts, 20000);
    return () => {
      isCurrent = false;
      clearInterval(iv);
    };
  }, [hotelId]);

  // Priority to prop counts if provided, fallback to fetched counts
  const liveRequestsCount = requestsCount !== undefined ? requestsCount : counts.requests;
  const liveAlertsCount = alertsCount !== undefined ? alertsCount : counts.alerts;

  // Sliding active champagne indicator calculation
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setActiveIndicator({
          top: activeRect.top - navRect.top,
          height: activeRect.height || 40,
          visible: true,
        });
      } else {
        setActiveIndicator((prev) => ({ ...prev, visible: false }));
      }
    };

    updateIndicator();
    // Allow DOM to settle on resize/route change
    const timer = setTimeout(updateIndicator, 60);
    return () => clearTimeout(timer);
  }, [path, collapsed, drawerOpen]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  const isCurrentActive = (href: string) => {
    if (href === "/gm") return path === "/gm";
    return path === href || path.startsWith(href + "/");
  };

  const isCompact = collapsed && !isMobile;

  // Flatten items for sequential mount animation indices
  let globalItemIndex = 0;

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* 1. Logo Block */}
      <div className={`px-4 pt-5 pb-3 flex items-center ${isCompact ? "justify-center" : "gap-3"}`}>
        <div
          className="w-9 h-9 rounded-[9px] shrink-0 flex items-center justify-center font-serif text-[20px] font-bold text-[#0D1F1A] shadow-md border border-[rgba(201,162,39,0.4)]"
          style={{ background: "linear-gradient(135deg, #C9A227, #9A7A15)" }}
        >
          A
        </div>

        {!isCompact ? (
          <div
            className="min-w-0 flex-1 transition-opacity duration-[120ms]"
            style={{ opacity: isCompact ? 0 : 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-[20px] font-semibold text-white tracking-tight leading-none">
                Aria
              </span>
              <span className="opacity-80 inline-flex items-center">
                <LuxuryStars count={5} size={8} color="#C9A227" gap={2} />
              </span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-white/40 font-semibold mt-1 font-sans">
              RESORT COMMAND
            </div>
          </div>
        ) : null}
      </div>

      {/* 2. Active Property Strip */}
      {!isCompact ? (
        <div
          className="py-2.5 px-4 mt-2 mb-0 group/prop cursor-pointer transition-colors duration-150 hover:bg-white/[0.04] flex items-center justify-between"
          style={{
            borderTop: "1px solid rgba(201, 162, 39, 0.18)",
            borderBottom: "1px solid rgba(201, 162, 39, 0.18)",
          }}
        >
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-[9px] uppercase tracking-[0.16em] text-[#C9A227] font-semibold font-sans mb-0.5">
              ACTIVE PROPERTY
            </div>
            <div className="text-[14px] text-white font-medium truncate font-sans">
              {hotelName || "Sunanda Hotel"}
            </div>
          </div>
          <svg
            className="w-3.5 h-3.5 text-white/40 group-hover/prop:text-[#C9A227] transition-all group-hover/prop:translate-x-0.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      ) : (
        <div
          className="py-2 mt-2 mb-0 flex justify-center"
          style={{
            borderTop: "1px solid rgba(201, 162, 39, 0.18)",
            borderBottom: "1px solid rgba(201, 162, 39, 0.18)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]/40" />
        </div>
      )}

      {/* 3. Main Grouped Nav (Drop section top margin to 24px) */}
      <nav
        ref={navRef}
        className="flex-1 px-2.5 overflow-y-auto overflow-x-hidden relative flex flex-col scrollbar-thin"
        style={{
          marginTop: "24px",
          paddingBottom: "16px",
        }}
      >
        {/* Sliding active 2px champagne indicator flush to left edge */}
        {activeIndicator.visible && (
          <div
            className="absolute left-0 w-[2px] bg-[#C9A227] rounded-r-sm pointer-events-none z-30"
            style={{
              height: `${activeIndicator.height}px`,
              transform: `translateY(${activeIndicator.top}px)`,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        )}

        <div className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col">
              {/* 10px uppercase champagne eyebrow label */}
              {!isCompact ? (
                <div
                  className="px-3 mb-1.5 font-sans"
                  style={{
                    color: "#C9A227",
                    opacity: 0.6,
                    fontSize: "10px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {group.title}
                </div>
              ) : (
                <div className="h-2" />
              )}

              {/* Group Items with 2px gap */}
              <div className="flex flex-col gap-[2px]">
                {group.items.map((item) => {
                  const active = isCurrentActive(item.href);
                  let badge = 0;
                  if (item.badgeKey === "requests") badge = liveRequestsCount;
                  if (item.badgeKey === "alerts") badge = liveAlertsCount;
                  const idx = globalItemIndex++;

                  return (
                    <NavItemRow
                      key={item.href}
                      item={item}
                      isActive={active}
                      collapsed={collapsed}
                      isMobile={isMobile}
                      onNavigate={() => setDrawerOpen(false)}
                      badgeCount={badge}
                      staggerIndex={idx}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Support Pinned to Bottom Above Footer with hairline */}
        <div
          className="flex flex-col"
          style={{
            marginTop: "auto",
            paddingTop: "14px",
            borderTop: "1px solid rgba(201, 162, 39, 0.18)",
          }}
        >
          <NavItemRow
            item={SUPPORT_ITEM}
            isActive={isCurrentActive(SUPPORT_ITEM.href)}
            collapsed={collapsed}
            isMobile={isMobile}
            onNavigate={() => setDrawerOpen(false)}
            badgeCount={0}
            staggerIndex={globalItemIndex++}
          />
        </div>
      </nav>

      {/* 5. Footer */}
      <div
        className={`p-3.5 flex items-center ${isCompact ? "justify-center" : "gap-3"}`}
        style={{
          borderTop: "1px solid rgba(201, 162, 39, 0.18)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
          style={{
            backgroundColor: "#0D3029",
            boxShadow: "0 0 0 1.5px #C9A227",
          }}
        >
          GM
        </div>
        {!isCompact ? (
          <div
            className="min-w-0 flex-1 transition-opacity duration-[120ms]"
            style={{ opacity: isCompact ? 0 : 1 }}
          >
            <div className="text-[13px] text-white font-medium leading-tight truncate font-sans">
              General Manager
            </div>
            <button
              onClick={() => setShowSignOutModal(true)}
              className="text-[11px] text-white/40 hover:text-[#C9A227] transition-colors cursor-pointer bg-transparent border-0 p-0 text-left mt-0.5 font-sans"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  // MOBILE: Top Bar + Slide-in Drawer
  if (isMobile) {
    return (
      <>
        {/* Top Sticky Bar */}
        <div
          className="flex items-center justify-between px-4 py-3.5 sticky top-0 z-40 shadow-sm"
          style={{
            background: "linear-gradient(180deg, #14473D 0%, #0F3A31 100%)",
            borderBottom: "1px solid rgba(201, 162, 39, 0.18)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center font-serif text-[18px] font-bold text-[#0D1F1A] shadow-sm border border-[rgba(201,162,39,0.3)]"
              style={{ background: "linear-gradient(135deg, #C9A227, #9A7A15)" }}
            >
              A
            </div>
            <div>
              <span className="font-serif text-[17px] font-semibold text-white truncate block max-w-[55vw] leading-tight">
                {hotelName || "Aria"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="opacity-80 inline-flex items-center">
                  <LuxuryStars count={5} size={7.5} color="#C9A227" gap={1.5} />
                </span>
                <span className="text-[8.5px] uppercase tracking-[0.16em] text-[#C9A227] font-semibold font-sans">
                  Resort Command
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="w-10 h-10 rounded-lg bg-white/10 border border-[rgba(201,162,39,0.2)] text-[#C9A227] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* Backdrop */}
        {drawerOpen ? (
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-[#0D1F1A]/70 backdrop-blur-sm z-50 transition-opacity"
          />
        ) : null}

        {/* Slide-out Drawer */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 shadow-2xl transition-transform duration-300 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: "linear-gradient(180deg, #14473D 0%, #0F3A31 100%)",
            borderRight: "1px solid rgba(201, 162, 39, 0.18)",
          }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // DESKTOP & TABLET: Fixed Rail with external unclipped chevron button
  return (
    <>
      <div
        className="hidden md:block shrink-0 relative select-none"
        style={{
          width: collapsed ? 72 : 248,
          transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Fixed container holding both the rail and the external toggle button */}
        <div
          className="group/sidebar fixed top-0 left-0 h-screen z-40"
          style={{
            width: collapsed ? 72 : 248,
            transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Main Emerald Rail - lifted background & gold hairline edge */}
          <aside
            className="w-full h-full flex flex-col overflow-hidden shadow-none"
            style={{
              background: "linear-gradient(180deg, #14473D 0%, #0F3A31 100%)",
              borderRight: "1px solid rgba(201, 162, 39, 0.18)",
            }}
          >
            {sidebarContent}
          </aside>

          {/* 28px Circle Toggle Button on Right Edge (Visible on Sidebar Hover) */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute top-[72px] -right-[14px] z-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 opacity-70 group-hover/sidebar:opacity-100 hover:opacity-100 focus:opacity-100"
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#12433A",
              border: "1px solid rgba(201, 162, 39, 0.35)",
              color: "#C9A227",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: collapsed ? "rotate(180deg)" : "none",
                transition: "transform 220ms ease",
              }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Luxury Sign Out Confirmation Popup Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 bg-[#0D1F1A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            className="rounded-luxury p-7 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative text-center text-white"
            style={{
              background: "linear-gradient(180deg, #14473D 0%, #0D1F1A 100%)",
              border: "1px solid rgba(201, 162, 39, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C9A227] shadow-inner"
              style={{
                backgroundColor: "#0D3029",
                border: "1px solid rgba(201, 162, 39, 0.35)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </div>

            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9A227] font-semibold mb-1 font-sans">
              EXECUTIVE SESSION
            </div>

            <h3 className="font-serif text-2xl font-semibold text-white mb-2 tracking-tight">
              Sign Out of Aria Console?
            </h3>

            <p className="text-xs text-white/70 mb-6 font-sans leading-relaxed">
              Are you sure you want to end your General Manager session for {hotelName || "Aria Resort"}?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B4453A] to-[#922D22] hover:brightness-110 text-white text-xs font-semibold shadow-md transition-all cursor-pointer font-sans"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}