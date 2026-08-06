"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMyHotel } from "../lib/useMyHotel";
import { signOut } from "../lib/auth";
import { useBreakpoint } from "../lib/useBreakpoint";

const ITEMS = [
  { href: "/gm", label: "Overview", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm8 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/gm/departments", label: "Departments", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { href: "/gm/staff", label: "Staff", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/gm/guests", label: "Guests", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { href: "/alerts", label: "Alerts", icon: "M12 2 2 20h20L12 2zM12 9v4M12 17v.5" },
  { href: "/gm/reception", label: "Reception", icon: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
  { href: "/gm/revenue", label: "Revenue", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
];

export default function GMSidebar() {
  const { hotelName } = useMyHotel();
  const router = useRouter();
  const path = usePathname();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => { if (isTablet) setCollapsed(true); else if (isDesktop) setCollapsed(false); }, [isTablet, isDesktop]);

  const iconsOnly = collapsed && !isMobile;
  async function handleSignOut() { await signOut(); window.location.href = "/login"; }
  const hotelLabel = (hotelName || "Your hotel").toUpperCase();

  const inner = (
    <>
      {!isMobile ? (
        <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand" : "Collapse"} style={{ position: "absolute", top: 26, right: -13, zIndex: 20, width: 26, height: 26, borderRadius: 999, background: "#FEFDFB", border: "1px solid #E4DECF", boxShadow: "0 2px 6px rgba(30,40,33,.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8577" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .22s" }}><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      ) : null}

      <div style={{ padding: iconsOnly ? "24px 0 16px" : "24px 22px 16px", display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, boxShadow: "0 4px 12px rgba(15,95,76,.2)", flexShrink: 0 }}>A</div>
        {!iconsOnly ? (
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", color: "#B08A4F", marginTop: 4 }}>Manager</div>
          </div>
        ) : null}
      </div>

      {!iconsOnly ? (
        <div style={{ margin: "2px 16px 12px", padding: "10px 14px", borderRadius: 11, background: "#F7F4EC", border: "1px solid #EDE7DA" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginBottom: 3 }}>Your hotel</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2621", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hotelName || "Your hotel"}</div>
        </div>
      ) : null}

      <nav style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        {ITEMS.map((it) => {
          const active = it.href === "/gm" ? path === "/gm" : path.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} onClick={() => setDrawerOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12, borderRadius: 10, padding: "11px 12px", marginBottom: 3, fontSize: 14, fontWeight: active ? 600 : 500, textDecoration: "none", background: active ? "#0F5F4C" : "transparent", color: active ? "#fff" : "#5A615B" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#8A8577"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={it.icon} /></svg>
              {!iconsOnly ? <span>{it.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #EDE8DC", padding: 16, display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "linear-gradient(135deg,#B08A4F,#96733C)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>GM</div>
        {!iconsOnly ? (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2621" }}>General Manager</div>
            <button onClick={handleSignOut} style={{ fontSize: 12, color: "#A8A395", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>Sign out</button>
          </div>
        ) : null}
      </div>
    </>
  );

  // MOBILE: top bar + slide-in drawer
  if (isMobile) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#FEFDFB", borderBottom: "1px solid #E9E4D8", position: "sticky", top: 0, zIndex: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</div>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1B2621", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50vw" }}>{hotelName || "Aria"}</span>
          </div>
          <button onClick={() => setDrawerOpen(true)} aria-label="Menu" style={{ width: 40, height: 40, borderRadius: 10, background: "#F5F1E8", border: "1px solid #E9E4D8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#3A413B" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        {drawerOpen ? <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.45)", zIndex: 85 }} /> : null}
        <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "82vw", zIndex: 90, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .26s cubic-bezier(.4,0,.2,1)", boxShadow: drawerOpen ? "0 0 40px rgba(0,0,0,.25)" : "none" }}>
          {inner}
        </aside>
      </>
    );
  }

  // DESKTOP / TABLET
  return (
    <aside style={{ width: iconsOnly ? 78 : 264, flexShrink: 0, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>
      {inner}
    </aside>
  );
}