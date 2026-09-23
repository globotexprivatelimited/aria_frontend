"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { section: "Console", items: [
    { href: "/", label: "Overview" },
    { href: "/requests", label: "Requests" },
    { href: "/guests", label: "Guests" },
    { href: "/alerts", label: "Alerts" },
    { href: "/frontdesk", label: "Front Desk" },
    { href: "/privacy", label: "Privacy" },
  ]},
  { section: "Live Portals", items: [
    { href: "/portal/in-room-dining", label: "In-Room Dining" },
    { href: "/portal/housekeeping", label: "Housekeeping" },
    { href: "/portal/spa", label: "Spa" },
    { href: "/portal/front-desk", label: "Front Desk" },
  ]},
  { section: "Executive", items: [
    { href: "/founder", label: "Founder" },
  ]},
];

export default function SideNav() {
  const path = usePathname();

  return (
    <aside style={{ width: 248, flexShrink: 0, background: "#fff", borderRight: "1px solid #EAEAE4", minHeight: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "26px 24px 18px" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#0F5F4C", letterSpacing: "-0.01em" }}>Aria</div>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".2em", color: "#B08A4F", marginTop: 3 }}>Operations</div>
      </div>

      <nav style={{ padding: "0 12px", flex: 1 }}>
        {LINKS.map((group) => (
          <div key={group.section} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#B4B9B3", padding: "4px 12px 8px" }}>{group.section}</div>
            {group.items.map((it) => {
              const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
              return (
                <Link key={it.href} href={it.href}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, borderRadius: 9, padding: "9px 12px", marginBottom: 3,
                    fontSize: 14, fontWeight: 500, textDecoration: "none",
                    background: active ? "#E8F1ED" : "transparent",
                    color: active ? "#0F5F4C" : "#5A615B",
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? "#0F5F4C" : "#D5D9D3", flexShrink: 0 }} />
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid #EAEAE4", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>GM</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1B2621" }}>The Regent, Kolkata</div>
          <div style={{ fontSize: 12, color: "#9AA09A" }}>Manager</div>
        </div>
      </div>
    </aside>
  );
}