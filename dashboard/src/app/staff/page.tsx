"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getActiveRequests, getHistory, getAnalytics, type Req as RequestRow } from "../_actions/requests";
import { getMyDepartments, getMyRole, signOut } from "../../lib/auth";
import StaffDashboardTab from "../../components/StaffDashboardTab";
import MenuEditor from "../../components/MenuEditor";
import DeptItemManager from "../../components/DeptItemManager";
import { useBreakpoint } from "../../lib/useBreakpoint";

const API = "http://localhost:4000";
type Tab = "dashboard" | "requests" | "history" | "manage";

const DEPT_CFG: Record<string, { label: string; type: "auto" | "accept"; staffNumber: string; icon: string }> = {
  fb: { label: "In-Room Dining", type: "auto", staffNumber: "+919000000003", icon: "M3 2v7c0 1.1.9 2 2 2h1v11h2V2M13 2v20h2V11h1a2 2 0 0 0 2-2V2" },
  housekeeping: { label: "Housekeeping", type: "auto", staffNumber: "+919000000002", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  spa: { label: "Spa", type: "accept", staffNumber: "+919000000005", icon: "M12 2c1 4 4 6 4 10a4 4 0 0 1-8 0c0-4 3-6 4-10z" },
  front_desk: { label: "Front Desk", type: "accept", staffNumber: "+919000000001", icon: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
};
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z" },
  { id: "requests", label: "Requests", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { id: "history", label: "History", icon: "M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2" },
  { id: "manage", label: "Manage", icon: "M12 2l2 4 4 .5-3 3 .5 4-3.5-2-3.5 2 .5-4-3-3 4-.5z" },
];

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}
function when(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function StaffDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // tablet starts icon-only, desktop starts expanded - but the arrow can override either way
  useEffect(() => { if (isTablet) setCollapsed(true); else if (isDesktop) setCollapsed(false); }, [isTablet, isDesktop]);
  const sidebarCollapsed = collapsed; // user-controlled via the arrow
  const iconsOnly = sidebarCollapsed && !isMobile; // hide labels only when truly collapsed on larger screens
  const [checking, setChecking] = useState(true);
  const [myDepts, setMyDepts] = useState<string[]>([]);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string>("");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [history, setHistory] = useState<RequestRow[]>([]);
  const [analytics, setAnalytics] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [proposeFor, setProposeFor] = useState<string | null>(null);
  const [proposeText, setProposeText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await getMyRole();
      if (!alive) return;
      if (!me) { router.replace("/login"); return; }
      if (me.role === "founder") { router.replace("/founder"); return; }
      if (me.role === "gm") { router.replace("/gm"); return; }
      const depts = await getMyDepartments();
      if (!alive) return;
      setMyDepts(depts.filter((d) => DEPT_CFG[d]));
      setHotelId(me.hotelId);
      setMyName(me.fullName ?? "Team member");
      setChecking(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    if (!hotelId || myDepts.length === 0) return;
    setRows(await getActiveRequests(hotelId, myDepts));
  }, [hotelId, myDepts]);

  const loadHistory = useCallback(async () => {
    if (!hotelId || myDepts.length === 0) return;
    setHistory(await getHistory(hotelId, myDepts));
  }, [hotelId, myDepts]);

  const loadAnalytics = useCallback(async () => {
    if (!hotelId || myDepts.length === 0) return;
    setAnalytics(await getAnalytics(hotelId, myDepts, 7));
  }, [hotelId, myDepts]);

  useEffect(() => {
    if (checking || !hotelId || myDepts.length === 0) return;
    load();
    let prevActive = 0;
    const tick = async () => {
      const before = prevActive;
      await load();
      loadAnalytics();
      // alarm when the active count grows
      setRows((cur) => { if (cur.length > before) ring(); prevActive = cur.length; return cur; });
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => { clearInterval(iv); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, hotelId, myDepts, load, loadHistory]);

  // load history when its tab is opened
  useEffect(() => { if (tab === "history") loadHistory(); }, [tab, loadHistory]);
  // load analytics on mount and when dashboard is viewed
  useEffect(() => { if (!checking) loadAnalytics(); }, [checking, tab, loadAnalytics]);

  function ring() { setAlarm(true); if (timer.current) return; const b = () => audioRef.current?.play().catch(() => {}); b(); timer.current = setInterval(b, 3000); }
  function stop() { setAlarm(false); if (timer.current) { clearInterval(timer.current); timer.current = null; } }
  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 2600); }

  async function send(dept: string, id: string, command: string, option?: string) {
    stop();
    const cfg = DEPT_CFG[dept];
    const ref = id.slice(0, 8);
    const text = option ? command + " " + ref + " " + option : command + " " + ref;
    try {
      await fetch(API + "/webhooks/admin/demo-token-123", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waId: cfg.staffNumber, text, type: "text", id: "ui-" + Date.now() }),
      });
    } catch { /* offline tolerant */ }
    if (command === "DONE" || command === "REJECT") { setRows((prev) => prev.filter((r) => r.id !== id)); loadHistory(); } else load();
    if (command === "ACCEPT") flash("Accepted \u2014 guest notified");
    else if (command === "CLAIM") flash("Claimed \u2014 on the way");
    else if (command === "DONE") flash("Completed \u2014 guest notified");
    else if (command === "REJECT") flash("Declined \u2014 guest notified");
    else if (command === "ALTERNATIVE") flash("Alternative sent");
    else if (command === "PROBLEM") flash("Flagged to the manager");
    setProposeFor(null); setProposeText("");
  }

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F1EA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, border: "2.5px solid #E6E1D5", borderTopColor: "#B08A4F", margin: "0 auto", animation: "sp 0.8s linear infinite" }} />
          <p style={{ fontSize: 13, color: "#9A968B", marginTop: 16 }}>Preparing your board</p>
        </div>
        <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }
  if (myDepts.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F1EA", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 25, color: "#1B2621" }}>No departments assigned</h1>
          <p style={{ fontSize: 14, color: "#6E756F", marginTop: 8 }}>Ask your manager to assign you to a department.</p>
          <button onClick={async () => { await signOut(); window.location.href = "/login"; }} style={{ marginTop: 20, borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>
    );
  }

  const initials = myName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const totalActive = rows.length;
  const urgentCount = rows.filter((r) => r.priority === "urgent").length;

  function Card({ r, dept }: { r: RequestRow; dept: string }) {
    const cfg = DEPT_CFG[dept];
    const claimed = r.status === "in_progress";
    const proposing = proposeFor === r.id;
    const urgent = r.priority === "urgent";
    const railColor = urgent ? "#C0563E" : claimed ? "#B08A4F" : "#0F5F4C";
    return (
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#FEFDFB", border: "1px solid #EBE6D9", boxShadow: "0 2px 10px rgba(30,40,33,.05)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: railColor }} />
        <div style={{ padding: "18px 20px 18px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "#B08A4F", marginBottom: 2 }}>Room</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>{r.roomNumber ?? "\u2014"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#A8A395" }}>{timeAgo(r.createdAt)}</div>
              {claimed ? <div style={{ marginTop: 6, display: "inline-block", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, background: "#F6EEDD", color: "#96733C" }}>In progress</div> : null}
              {urgent ? <div style={{ marginTop: 6, display: "inline-block", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, background: "#FBEAE4", color: "#C0563E" }}>Urgent</div> : null}
            </div>
          </div>
          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.55, color: "#2C332D" }}>{r.requestDetail}</p>
          {proposing ? (
            <div style={{ marginTop: 16 }}>
              <input value={proposeText} onChange={(e) => setProposeText(e.target.value)} placeholder="Suggest a time, e.g. 6:30pm" autoFocus style={{ width: "100%", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: "#E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => proposeText.trim() && send(dept, r.id, "ALTERNATIVE", proposeText.trim())} disabled={!proposeText.trim()} style={{ flex: 1, borderRadius: 9, padding: "9px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer", opacity: proposeText.trim() ? 1 : 0.5 }}>Send suggestion</button>
                <button onClick={() => { setProposeFor(null); setProposeText(""); }} style={{ borderRadius: 9, padding: "9px 14px", fontSize: 14, borderWidth: 1, borderStyle: "solid", borderColor: "#DED8C8", background: "#fff", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : cfg.type === "auto" ? (
            <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
              {!claimed ? <button onClick={() => send(dept, r.id, "CLAIM")} style={{ flex: 1, borderRadius: 9, padding: "9px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer" }}>Claim</button> : null}
              <button onClick={() => send(dept, r.id, "DONE")} style={claimed ? { flex: 1, borderRadius: 9, padding: "9px", fontSize: 14, fontWeight: 600, background: "#0F5F4C", color: "#fff", border: 0, cursor: "pointer" } : { borderRadius: 9, padding: "9px 16px", fontSize: 14, fontWeight: 600, borderWidth: 1, borderStyle: "solid", borderColor: "#DED8C8", background: "#fff", cursor: "pointer", color: "#3A413B" }}>Done</button>
              <button onClick={() => send(dept, r.id, "PROBLEM")} style={{ borderRadius: 9, padding: "9px 14px", fontSize: 14, borderWidth: 1, borderStyle: "solid", borderColor: "#DED8C8", background: "#fff", cursor: "pointer", color: "#3A413B" }}>Issue</button>
            </div>
          ) : (
            <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
              <button onClick={() => send(dept, r.id, "ACCEPT")} style={{ flex: 1, borderRadius: 9, padding: "9px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer" }}>Accept</button>
              <button onClick={() => setProposeFor(r.id)} style={{ borderRadius: 9, padding: "9px 14px", fontSize: 14, fontWeight: 600, color: "#96733C", background: "#F9F2E2", borderWidth: 1, borderStyle: "solid", borderColor: "#EAD9BC", cursor: "pointer" }}>Propose</button>
              <button onClick={() => send(dept, r.id, "REJECT")} style={{ borderRadius: 9, padding: "9px 14px", fontSize: 14, borderWidth: 1, borderStyle: "solid", borderColor: "#DED8C8", background: "#fff", cursor: "pointer", color: "#3A413B" }}>Decline</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const navBtn = (active: boolean) => ({ width: "100%", position: "relative" as const, display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 11, padding: "11px 12px", marginBottom: 3, borderRadius: 10, border: 0, cursor: "pointer", textAlign: "left" as const, background: active ? "#0F5F4C" : "transparent" });

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "#F4F1EA" }}>
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
      {isMobile ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#FEFDFB", borderBottom: "1px solid #E9E4D8", position: "sticky", top: 0, zIndex: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>A</div>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: "#1B2621" }}>Aria</span>
            {totalActive > 0 ? <span style={{ borderRadius: 999, padding: "2px 9px", fontSize: 12, fontWeight: 700, background: "#FBEAE4", color: "#C0563E" }}>{totalActive}</span> : null}
          </div>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ width: 40, height: 40, borderRadius: 10, background: "#F5F1E8", border: "1px solid #E9E4D8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#3A413B" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      ) : null}
      {isMobile && drawerOpen ? <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.45)", zIndex: 85 }} /> : null}

      {/* SIDEBAR */}
      <aside style={ isMobile ? { position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "82vw", zIndex: 90, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .26s cubic-bezier(.4,0,.2,1)", boxShadow: drawerOpen ? "0 0 40px rgba(0,0,0,.25)" : "none" } : { width: sidebarCollapsed ? 78 : 268, flexShrink: 0, background: "#FEFDFB", borderRight: "1px solid #E9E4D8", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", transition: "width .22s cubic-bezier(.4,0,.2,1)" } }>
        {!isMobile ? <button onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand menu" : "Collapse menu"} style={{ position: "absolute", top: 26, right: -13, zIndex: 20, width: 26, height: 26, borderRadius: 999, background: "#FEFDFB", border: "1px solid #E4DECF", boxShadow: "0 2px 6px rgba(30,40,33,.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8577", transition: "color .12s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#0F5F4C")} onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8577")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform .22s" }}><path d="M15 18l-6-6 6-6" /></svg>
        </button> : null}
        <div style={{ padding: iconsOnly ? "24px 0 18px" : "24px 22px 18px", display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, boxShadow: "0 4px 12px rgba(15,95,76,.2)" }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, color: "#1B2621", lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", color: "#B08A4F", marginTop: 4 }}>Concierge</div>
          </div>
        </div>

        <div style={{ margin: "2px 16px 10px", padding: iconsOnly ? "10px 0" : "10px 14px", borderRadius: 11, background: iconsOnly ? "transparent" : "#F7F4EC", border: iconsOnly ? "0" : "1px solid #EDE7DA", display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 8 }}>
          <span style={{ display: "inline-block", height: 7, width: 7, borderRadius: 999, background: connected ? "#3B9E7E" : "#D9A441" }} />
          <span style={{ fontSize: 12, color: "#4A514A", fontWeight: 500 }}>{connected ? "Live board" : "Connecting"}</span>
          {totalActive > 0 ? <span style={{ marginLeft: "auto", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: "#B08A4F" }}>{totalActive}</span> : null}
        </div>

        <nav style={{ padding: "6px 12px 0", flex: 1, overflowY: "auto" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            const badge = t.id === "requests" ? totalActive : 0;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setDrawerOpen(false); }} style={navBtn(active)}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F5F1E8"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#8A8577"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 600 : 500, color: active ? "#fff" : "#3A413B" }}>{t.label}</span>
                {badge > 0 ? <span style={{ borderRadius: 999, minWidth: 20, textAlign: "center", padding: "1px 7px", fontSize: 12, fontWeight: 700, background: active ? "rgba(255,255,255,.22)" : "#E8F1ED", color: active ? "#fff" : "#0F5F4C" }}>{badge}</span> : null}
              </button>
            );
          })}

          {!iconsOnly ? <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".14em", color: "#B7B2A4", padding: "20px 12px 8px" }}>Assigned to you</div> : <div style={{ height: 16 }} />}
          {myDepts.map((d) => {
            const cfg = DEPT_CFG[d];
            const count = rows.filter((r) => r.department === d).length;
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12, padding: "9px 12px" }}>
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: count > 0 ? "#0F5F4C" : "#F1EDE2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#fff" : "#A8A395"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={cfg.icon} /></svg>
                </span>
                <span style={{ flex: 1, fontSize: 13, color: "#4A514A" }}>{cfg.label}</span>
                {count > 0 ? <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#0F5F4C" }}>{count}</span> : null}
              </div>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #EDE8DC", padding: 16, display: "flex", alignItems: "center", justifyContent: iconsOnly ? "center" : "flex-start", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: "linear-gradient(135deg,#B08A4F,#96733C)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initials || "ME"}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1B2621", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{myName}</div>
            <button onClick={async () => { await signOut(); window.location.href = "/login"; }} style={{ fontSize: 12, color: "#A8A395", background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={{ flex: 1, minWidth: 0, padding: isMobile ? "20px 16px 48px" : isTablet ? "28px 28px 56px" : "36px 44px 60px", maxWidth: 1280, width: "100%" }}>
        {toast ? <div style={{ marginBottom: 18, borderRadius: 12, padding: "13px 18px", fontSize: 14, fontWeight: 500, background: "#EAF2ED", color: "#0F5F4C", border: "1px solid #CFE5DC" }}>{toast}</div> : null}
        {alarm && tab !== "history" ? (
          <button onClick={stop} style={{ marginBottom: 18, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, padding: "14px 22px", border: "1px solid #E3B4A5", background: "linear-gradient(180deg,#FBEEE9,#F9E6DF)", cursor: "pointer" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#A0432E" }}>A new request just arrived</span>
            <span style={{ borderRadius: 9, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#fff", background: "#C0563E" }}>Acknowledge</span>
          </button>
        ) : null}

        {/* DASHBOARD */}
        {tab === "dashboard" ? (
          <div>
            <StaffDashboardTab analytics={analytics} rows={rows} myDepts={myDepts} myName={myName} />
            {myDepts.map((dept) => {
              const cfg = DEPT_CFG[dept];
              const deptRows = rows.filter((r) => r.department === dept);
              return (
                <section key={dept} style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: "#0F5F4C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={cfg.icon} /></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 23, fontWeight: 600, color: "#1B2621", lineHeight: 1 }}>{cfg.label}</h2>
                      <div style={{ fontSize: 12, color: "#A8A395", marginTop: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>{cfg.type === "auto" ? "Claim \u00b7 Deliver \u00b7 Done" : "Accept \u00b7 Propose \u00b7 Decline"}</div>
                    </div>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: deptRows.length > 0 ? "#0F5F4C" : "#C7C2B4" }}>{deptRows.length} active</span>
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg,#D9C9A8,transparent)", marginBottom: 18 }} />
                  {deptRows.length === 0 ? (
                    <div style={{ borderRadius: 16, padding: 36, textAlign: "center", border: "1px dashed #D9D3C3", background: "#FBF9F3", color: "#A8A395", fontSize: 14 }}>All caught up here. New requests arrive the instant a guest asks.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))" }}>
                      {deptRows.map((r) => <Card key={r.id} r={r} dept={dept} />)}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
        {tab === "requests" ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", marginBottom: 8 }}>Live queue</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621", lineHeight: 1.1 }}>Requests</h1>
              <p style={{ fontSize: 14, color: "#6E756F", marginTop: 6 }}>{totalActive === 0 ? "Nothing in the queue right now." : "Work through everything waiting, across your departments."}</p>
            </div>
            {totalActive === 0 ? (
              <div style={{ borderRadius: 16, padding: 48, textAlign: "center", border: "1px dashed #D9D3C3", background: "#FBF9F3", color: "#A8A395", fontSize: 14 }}>Your queue is empty. New requests appear here the moment they arrive.</div>
            ) : (
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {rows.map((r) => <Card key={r.id} r={r} dept={r.department} />)}
              </div>
            )}
          </div>
        ) : null}

        {/* HISTORY - resolved from DB */}
        {tab === "manage" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {myDepts.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#9AA09A" }}>No departments assigned to you yet.</div>
                ) : myDepts.map((dept) => (
                  <div key={dept} style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1px solid #F0F0EA", background: "#FEFDFB" }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#B08A4F" }}>{DEPT_CFG[dept]?.type === "auto" ? "Menu & inventory" : "Services & offerings"}</div>
                      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621", marginTop: 3 }}>{DEPT_CFG[dept]?.label ?? dept}</h2>
                    </div>
                    <div style={{ padding: 22 }}>
                      {dept === "fb"
                        ? <MenuEditor hotelId={hotelId as string} dept={dept} deptLabel={DEPT_CFG[dept]?.label ?? dept} />
                        : <DeptItemManager hotelId={hotelId as string} dept={dept} deptLabel={DEPT_CFG[dept]?.label ?? dept} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {tab === "history" ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", marginBottom: 8 }}>Completed</div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621", lineHeight: 1.1 }}>History</h1>
              <p style={{ fontSize: 14, color: "#6E756F", marginTop: 6 }}>Requests you and your team have resolved.</p>
            </div>
            {history.length === 0 ? (
              <div style={{ borderRadius: 16, padding: 48, textAlign: "center", border: "1px dashed #D9D3C3", background: "#FBF9F3", color: "#A8A395", fontSize: 14 }}>No completed requests yet. Resolved requests will be recorded here.</div>
            ) : (
              <div style={{ background: "#FEFDFB", border: "1px solid #EBE6D9", borderRadius: 16, overflow: isMobile ? "auto" : "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1.4fr 2fr 140px", minWidth: isMobile ? 560 : "auto", padding: "14px 24px", borderBottom: "1px solid #EDE8DC", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#A8A395" }}>
                  <span>Room</span><span>Department</span><span>Request</span><span style={{ textAlign: "right" }}>Completed</span>
                </div>
                {history.map((r) => (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "80px 1.4fr 2fr 140px", minWidth: isMobile ? 560 : "auto", padding: "16px 24px", borderBottom: "1px solid #F4F0E7", fontSize: 14, alignItems: "center" }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#1B2621" }}>{r.roomNumber ?? "\u2014"}</span>
                    <span><span style={{ borderRadius: 999, padding: "3px 11px", fontSize: 12, fontWeight: 500, background: "#F1F6F2", color: "#0F5F4C", border: "1px solid #DCEBE1" }}>{DEPT_CFG[r.department]?.label ?? r.department}</span></span>
                    <span style={{ color: "#3A413B", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.requestDetail}</span>
                    <span style={{ textAlign: "right", color: "#A8A395", fontSize: 12 }}>{when(r.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
