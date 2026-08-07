"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBreakpoint } from "../lib/useBreakpoint";
import { signOut, getMyRole } from "../lib/auth";

const INK = "#1B2621", GOLD = "#B08A4F", GREEN = "#0F5F4C";

const NAV = [
  { href: "/founder", label: "Portfolio", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { href: "/founder/hotels", label: "Hotels", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 11h.01M15 11h.01" },
  { href: "/founder/managers", label: "People", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/founder/revenue", label: "Revenue", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
];

export default function FounderSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [who, setWho] = useState<string>("");

  useEffect(() => { if (isTablet) setCollapsed(true); else if (isDesktop) setCollapsed(false); }, [isTablet, isDesktop]);
  useEffect(() => { getMyRole().then((m) => { if (m) setWho(m.fullName ?? "Founder"); }).catch(() => {}); }, []);

  const iconsOnly = collapsed && !isMobile;
  const isActive = (href: string) => href === "/founder" ? pathname === "/founder" : pathname.startsWith(href);

  const navBtn = (active: boolean) => ({
    display: "flex", alignItems: "center", gap: 11, width: "100%",
    justifyContent: iconsOnly ? "center" : "flex-start",
    borderRadius: 10, padding: iconsOnly ? "11px 0" : "10px 13px", marginBottom: 3,
    fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "none",
    border: 0, background: active ? "#0F5F4C" : "transparent", color: active ? "#fff" : "#5B615C",
    transition: "background .15s",
  });

  const inner = (
    <>
      <div style={{ padding: iconsOnly ? "22px 0 14px" : "22px 20px 14px", display: "flex", alignItems: "center", gap: 11, justifyContent: iconsOnly ? "center" : "flex-start" }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, flexShrink: 0 }}>A</span>
        {!iconsOnly ? (
          <span>
            <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: INK, lineHeight: 1 }}>Aria</span>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".15em", color: GOLD }}>Founder</span>
          </span>
        ) : null}
      </div>

      <nav style={{ padding: "6px 12px", flex: 1, overflowY: "auto" }}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setDrawerOpen(false)} title={n.label} style={navBtn(isActive(n.href))}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={n.icon} /></svg>
            {!iconsOnly ? n.label : null}
          </Link>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid #F0ECE2", padding: iconsOnly ? "14px 8px" : "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(135deg,#B08A4F,#8A6420)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {(who || "F").split(" ").map((x) => x[0]).slice(0, 2).join("")}
        </span>
        {!iconsOnly ? (
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{who || "Founder"}</span>
            <button onClick={async () => { await signOut(); router.replace("/login"); }} style={{ fontSize: 11.5, color: "#9AA09A", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>Sign out</button>
          </span>
        ) : null}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#FEFDFB", borderBottom: "1px solid #E9E4D8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: INK }}>Founder</span>
          </span>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid #E9E4D8", background: "#F5F1E8", cursor: "pointer", color: "#5B615C" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
        {drawerOpen ? <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(27,38,33,.35)", zIndex: 80 }} /> : null}
        <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 268, maxWidth: "82vw", zIndex: 90, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", overflowY: "auto", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", visibility: drawerOpen ? "visible" : "hidden", transition: "transform .26s cubic-bezier(.4,0,.2,1), visibility .26s" }}>
          {inner}
        </aside>
      </>
    );
  }

  return (
    <aside style={{ width: collapsed ? 76 : 246, flexShrink: 0, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", overflowY: "auto", overflowX: "hidden", transition: "width .22s cubic-bezier(.4,0,.2,1)" }}>
      <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand" : "Collapse"}
        style={{ position: "absolute", top: 26, right: -1, width: 22, height: 22, borderRadius: "6px 0 0 6px", border: "1px solid #E9E4D8", borderRight: 0, background: "#F5F1E8", cursor: "pointer", color: "#9AA09A", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" style={{ transform: collapsed ? "none" : "rotate(180deg)" }}><path d="M9 18l6-6-6-6" /></svg>
      </button>
      {inner}
    </aside>
  );
}
