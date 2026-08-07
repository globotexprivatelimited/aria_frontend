"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";
const GOLD = "#B08A4F", INK = "#1B2621";

/** Sits at the top of the GM portal until the hotel confirms its email. */
export default function VerifyEmailBanner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = () => (typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null);

  useEffect(() => {
    (async () => {
      const t = token();
      if (!t) return;
      try {
        const res = await fetch(API + "/api/auth/verify/status", { headers: { authorization: "Bearer " + t }, cache: "no-store" });
        const j = await res.json();
        if (j?.ok && j.data && !j.data.verified) { setShow(true); setEmail(j.data.email ?? null); }
      } catch { /* silence - the banner is not load-bearing */ }
    })();
  }, []);

  if (!show) return null;

  async function resend() {
    const t = token();
    if (!t) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(API + "/api/auth/verify/resend", { method: "POST", headers: { authorization: "Bearer " + t } });
      const j = await res.json();
      if (j?.ok) setSent(true); else setError(j?.error ?? "Could not send it.");
    } catch { setError("Could not reach the server."); }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderRadius: 12, padding: "11px 16px", marginBottom: 16, background: "#FBF3E6", border: "1px solid #EDD9B4", color: "#8A6420", fontSize: 13.5 }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
      <span style={{ flex: 1, minWidth: 220 }}>
        {sent ? (
          <>Sent. Check <b>{email}</b> and click the link to confirm.</>
        ) : (
          <>Confirm your email{email ? <> at <b>{email}</b></> : null} so we can send password resets and notices.</>
        )}
        {error ? <span style={{ color: "#B23A2A", marginLeft: 8 }}>{error}</span> : null}
      </span>
      {!sent ? (
        <button onClick={resend} disabled={busy}
          style={{ borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: busy ? "default" : "pointer", border: "1px solid " + GOLD + "66", background: "#fff", color: GOLD, whiteSpace: "nowrap", opacity: busy ? .6 : 1 }}>
          {busy ? "Sending..." : "Send the link again"}
        </button>
      ) : null}
      <button onClick={() => setShow(false)} aria-label="Dismiss"
        style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 16, lineHeight: 1, color: "#C0A87A" }}>&times;</button>
    </div>
  );
}
