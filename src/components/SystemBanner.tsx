"use client";
import { useEffect, useState } from "react";
import { getSystemStatus, type SystemStatus } from "@/app/_actions/system";

/**
 * A strip across the top of every signed-in page when something a person must know about is wrong:
 * the AI not answering, WhatsApp refusing sends, the token about to expire, the scheduled jobs not running.
 * Shows nothing when all is well, and nothing when nobody is signed in.
 */
type Notice = { level: "red" | "amber"; text: string; key: string };

function notices(s: SystemStatus): Notice[] {
  const out: Notice[] = [];
  if (s.aiDown) out.push({ level: "red", key: "ai:" + (s.aiDetail ?? ""), text: /credit/i.test(s.aiDetail ?? "") ? "Aria's AI account is out of credit - every guest is getting the front-desk fallback line. Top up at console.anthropic.com (Plans & Billing); no restart needed." : "Aria's AI is not answering - guests are getting the front-desk fallback line. " + (s.aiDetail ?? "") });
  if (s.whatsappDown) out.push({ level: "red", key: "wa:" + (s.whatsappDetail ?? ""), text: "WhatsApp is refusing messages - " + (s.whatsappDetail ?? "check the token on Render") });
  if (s.token && s.token.valid === false) out.push({ level: "red", key: "token-invalid", text: "The WhatsApp access token is invalid - Aria cannot send or receive until it is replaced." });
  else if (s.token && s.token.daysLeft !== null && s.token.daysLeft <= 14) out.push({ level: "amber", key: "token-expiring:" + s.token.daysLeft, text: "The WhatsApp access token expires in " + s.token.daysLeft + " day" + (s.token.daysLeft === 1 ? "" : "s") + (s.token.expiresAt ? " (" + s.token.expiresAt.slice(0, 10) + ")" : "") + ". Replace it with the permanent system user token before then." });
  if (!s.jobsRunning) out.push({ level: "amber", key: "jobs", text: "Scheduled messages and escalations are not running on the server right now (no job has run in the last 10 minutes)." });
  return out;
}

export default function SystemBanner() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [hidden, setHidden] = useState<string>("");
  useEffect(() => {
    let alive = true;
    const load = async () => { try { const s = await getSystemStatus(); if (alive) setStatus(s); } catch { /* the banner never breaks a page */ } };
    void load();
    const t = setInterval(load, 60 * 1000);
    try { setHidden(window.sessionStorage.getItem("aria_banner_hidden") ?? ""); } catch { /* storage may be unavailable */ }
    return () => { alive = false; clearInterval(t); };
  }, []);
  if (!status) return null;
  const list = notices(status).filter((n) => n.key !== hidden);
  if (!list.length) return null;
  const red = list.some((n) => n.level === "red");
  const dismiss = () => { try { window.sessionStorage.setItem("aria_banner_hidden", list[0].key); } catch { /* ignore */ } setHidden(list[0].key); };
  return (
    <div role="alert" style={{ position: "sticky", top: 0, zIndex: 1000, background: red ? "#B42318" : "#B54708", color: "#fff", padding: "10px 16px", fontSize: 13, lineHeight: 1.45, display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((n) => <div key={n.key}><strong style={{ marginRight: 8 }}>{n.level === "red" ? "Action needed" : "Heads up"}</strong>{n.text}</div>)}
      </div>
      <button type="button" onClick={dismiss} title="Hide for this session" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.6)", color: "#fff", borderRadius: 6, padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}>Hide</button>
    </div>
  );
}
