"use client";

import Link from "next/link";
import type { DeptConfig } from "../lib/departments";

export default function DeptSidebar({ config, staffName, initials, activeKey = "requests" }: { config: DeptConfig; staffName: string; initials: string; activeKey?: string }) {
  const base = "/portal/" + config.slug;
  const items = [
    { key: "requests", label: "Requests", href: base },
    { key: "history", label: "History", href: base + "/history" },
    { key: "settings", label: "Settings", href: base + "/settings" },
  ];
  return (
    <aside style={{ width: 256, flexShrink: 0, background: "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)", borderRight: "1px solid #EAEAE4", minHeight: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #F1F1EC" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".2em", color: "#B08A4F", marginTop: 3 }}>{config.label}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 12px 8px" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "#B4B9B3", padding: "0 12px 10px" }}>The Regent, Kolkata</div>
        <nav>
          {items.map((it) => {
            const active = it.key === activeKey;
            return (
              <Link key={it.key} href={it.href}
                style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, padding: "10px 12px", marginBottom: 4, fontSize: 14, fontWeight: 500, textDecoration: "none", background: active ? "#0F5F4C" : "transparent", color: active ? "#fff" : "#5A615B", boxShadow: active ? "0 1px 3px rgba(15,95,76,.25)" : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? "#fff" : "#D5D9D3" }} />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ margin: "0 16px 12px", padding: 14, borderRadius: 12, background: "#F5F7F5", border: "1px solid #EAEEEA" }}>
        <div style={{ fontSize: 11, color: "#6E756F", lineHeight: 1.5 }}>{config.type === "auto" ? "Auto-accepted queue" : "You accept or decline"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#34D399" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0F5F4C" }}>Live</span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #F1F1EC", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg,#0F5F4C,#0C4E3F)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2621" }}>{staffName}</div>
          <div style={{ fontSize: 12, color: "#9AA09A", cursor: "pointer" }}>Sign out</div>
        </div>
      </div>
    </aside>
  );
}