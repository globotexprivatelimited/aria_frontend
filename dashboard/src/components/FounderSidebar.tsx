"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/founder", label: "Operations", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm8 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/founder/hotels", label: "All Hotels", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" },
  { href: "/founder/revenue", label: "Revenue", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { href: "/founder/managers", label: "Managers", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
];

export default function FounderSidebar() {
  const path = usePathname();
  return (
    <aside style={{ width: 256, flexShrink: 0, background: "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)", borderRight: "1px solid #EAEAE4", minHeight: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #F1F1EC" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".22em", color: "#B08A4F", marginTop: 3 }}>Founder</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 12px 8px" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#B4B9B3", padding: "0 12px 10px" }}>Overview</div>
        <nav>
          {ITEMS.map((it) => {
            const active = path === it.href;
            return (
              <Link key={it.href} href={it.href}
                style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 10, padding: "10px 12px", marginBottom: 4, fontSize: 14, fontWeight: 500, textDecoration: "none", background: active ? "#0F5F4C" : "transparent", color: active ? "#fff" : "#5A615B", boxShadow: active ? "0 1px 3px rgba(15,95,76,.25)" : "none", transition: "all .15s" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#9AA09A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={it.icon} />
                </svg>
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ margin: "0 16px 12px", padding: 14, borderRadius: 12, background: "#F5F7F5", border: "1px solid #EAEEEA" }}>
        <div style={{ fontSize: 11, color: "#6E756F", lineHeight: 1.5 }}>All hotels reporting live</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#34D399" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0F5F4C" }}>System nominal</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #F1F1EC", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg,#0F5F4C,#0C4E3F)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>AR</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2621" }}>Aria HQ</div>
          <div style={{ fontSize: 12, color: "#9AA09A", cursor: "pointer" }}>Sign out</div>
        </div>
      </div>
    </aside>
  );
}