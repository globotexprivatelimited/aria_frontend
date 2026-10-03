"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMyHotel } from "../lib/useMyHotel";
import { signOut } from "../lib/auth";
import { useBreakpoint } from "../lib/useBreakpoint";

const ITEMS = [
  { href: "/gm", label: "Overview", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm8 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/gm/reception", label: "Reception", icon: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
  { href: "/gm/requests", label: "Requests", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { href: "/gm/departments", label: "Departments", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { href: "/gm/knowledge", label: "Knowledge", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5z" },
  { href: "/gm/staff", label: "Staff", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/gm/guests", label: "Guests", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { href: "/alerts", label: "Alerts", icon: "M12 2 2 20h20L12 2zM12 9v4M12 17v.5" },
  { href: "/gm/revenue", label: "Revenue", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { href: "/gm/support", label: "Support", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
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
        <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand" : "Collapse"} style={{ position: "absolute", top: 26, right: -13, zIndex: 20, width: 26, height: 26, borderRadius: 999, background: "#FFFFFF", border: "1px solid #E2EBE7", boxShadow: "0 2px 8px rgba(47,93,80,.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#5A6E67" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .22s" }}><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      ) : null}

      <div style={{ padding: iconsOnly ? "24px 0 16px" : "24px 20px 16px", display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #2F5D50 0%, #1E4238 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, boxShadow: "0 6px 16px rgba(47,93,80,.28)", flexShrink: 0, border: "1px solid rgba(176,138,79,0.3)" }}>A</div>
        {!iconsOnly ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, color: "#0D1F1A", lineHeight: 1 }}>Aria</span>
              <span style={{ fontSize: 9, color: "#B08A4F", letterSpacing: "1px" }}>★★★★★</span>
            </div>
            <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".18em", color: "#B08A4F", marginTop: 4, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700 }}>Resort Command</div>
          </div>
        ) : null}
      </div>

      {!iconsOnly ? (
        <div style={{ margin: "2px 14px 12px", padding: "10px 14px", borderRadius: 12, background: "linear-gradient(180deg, #F8FAF9 0%, #F1F6F4 100%)", border: "1px solid #E2EBE7" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".12em", color: "#8A9792", marginBottom: 3, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700 }}>Active Property</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0D1F1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Poppins', sans-serif" }}>{hotelName}</div>
        </div>
      ) : null}

      <nav style={{ padding: "6px 10px", flex: 1, overflowY: "auto" }}>
        {ITEMS.map((it) => {
          const active = it.href === "/gm" ? path === "/gm" : path.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} onClick={() => setDrawerOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: iconsOnly ? "center" : "flex-start",
                gap: 12,
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 4,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                textDecoration: "none",
                background: active ? "linear-gradient(135deg, #2F5D50 0%, #1E4238 100%)" : "transparent",
                color: active ? "#FFFFFF" : "#4A5D56",
                boxShadow: active ? "0 4px 14px rgba(47,93,80,.22)" : "none",
                position: "relative",
                transition: "all .18s ease",
              }}>
              {active && !iconsOnly ? (
                <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 2px 2px 0", background: "#B08A4F" }} />
              ) : null}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#FFFFFF" : "#72837C"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={it.icon} /></svg>
              {!iconsOnly ? <span style={{ letterSpacing: "-0.01em" }}>{it.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #E2EBE7", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12, background: "#FAFBFB" }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg,#B08A4F,#8D6B35)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, border: "2px solid #FFFFFF", boxShadow: "0 2px 8px rgba(176,138,79,.3)" }}>GM</div>
        {!iconsOnly ? (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0D1F1A", lineHeight: 1.2 }}>General Manager</div>
            <button onClick={handleSignOut} style={{ fontSize: 11.5, color: "#8A9792", background: "transparent", border: 0, padding: 0, cursor: "pointer", marginTop: 3, fontWeight: 500 }}>Sign out</button>
          </div>
        ) : null}
      </div>
    </>
  );

  // MOBILE: top bar + slide-in drawer
  if (isMobile) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#FFFFFF", borderBottom: "1px solid #E2EBE7", position: "sticky", top: 0, zIndex: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #2F5D50 0%, #1E4238 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</div>
            <div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: "#0D1F1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", maxWidth: "50vw" }}>{hotelName || "Aria"}</span>
              <span style={{ fontSize: 8.5, color: "#B08A4F", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>★★★★★ Luxury Resort</span>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(true)} aria-label="Menu" style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F6F4", border: "1px solid #E2EBE7", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2F5D50" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
        {drawerOpen ? <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,31,26,.5)", backdropFilter: "blur(4px)", zIndex: 85 }} /> : null}
        <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "82vw", zIndex: 90, background: "#FFFFFF", borderRight: "1px solid #E2EBE7", display: "flex", flexDirection: "column", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", visibility: drawerOpen ? "visible" : "hidden", transition: "transform .26s cubic-bezier(.4,0,.2,1), visibility .26s", boxShadow: drawerOpen ? "0 0 40px rgba(13,31,26,.35)" : "none" }}>
          {inner}
        </aside>
      </>
    );
  }

  // DESKTOP / TABLET
  return (
    <aside style={{ width: iconsOnly ? 78 : 260, flexShrink: 0, background: "#FFFFFF", borderRight: "1px solid #E2EBE7", display: "flex", flexDirection: "column", position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", overflowY: "auto", overflowX: "hidden", transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>
      {inner}
    </aside>
  );
}