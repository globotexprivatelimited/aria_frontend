"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./reset-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email) return;
    setBusy(true); setError(null);
    const res = await requestPasswordReset(email);
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.message ?? "Something went wrong.");
  }

  const field = { width: "100%", boxSizing: "border-box" as const, borderRadius: 13, border: "1.5px solid #E3DECF", background: "#FBFAF5", padding: "15px 16px", fontSize: 15, outline: "none", color: INK };

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      {/* 16:9 background image */}
      <img src="/forgot-bg.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(120deg, rgba(11,26,22,0.88) 0%, rgba(11,26,22,0.5) 55%, rgba(11,26,22,0.25) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(circle at 18% 40%, rgba(176,138,79,0.15) 0%, transparent 45%)" }} />

      {/* two-column: message panel + form box */}
      <div className="fp-wrap" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "stretch", gap: 28, width: "100%", maxWidth: 880 }}>

        {/* LEFT: message / info panel */}
        <div className="fp-message" style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", justifyContent: "center", color: "#fff", padding: "8px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>A</div>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700, lineHeight: 1 }}>Aria</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".18em", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>Hotel Intelligence</div>
            </div>
          </div>
          <div style={{ display: "inline-block", width: "fit-content", fontSize: 11, textTransform: "uppercase", letterSpacing: ".2em", color: GOLD, marginBottom: 16, padding: "5px 13px", borderRadius: 999, background: "rgba(176,138,79,0.18)", border: "1px solid rgba(176,138,79,0.3)" }}>Account recovery</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.1, letterSpacing: "-0.6px" }}>You can reset your password here.</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.78)", marginTop: 16, lineHeight: 1.65, maxWidth: 380 }}>Enter the manager email for your hotel and we&apos;ll send a secure reset link to your hotel&apos;s contact inbox. The link stays valid for one hour.</p>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              Secure, time-limited reset link
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              Sent to your hotel&apos;s contact email
            </div>
          </div>
        </div>

        {/* RIGHT: the form box */}
        <div className="fp-box" style={{ flex: "1 1 55%", background: "#fff", borderRadius: 22, padding: "40px 38px", boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
          {done ? (
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: "#EAF2ED", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, margin: 0 }}>Check the hotel inbox</h2>
              <p style={{ fontSize: 14, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>If a manager account exists for that email, a reset link has been sent to the hotel&apos;s contact email. It expires in 1 hour.</p>
              <Link href="/login" style={{ display: "inline-block", marginTop: 22, color: GREEN, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>&larr; Back to sign in</Link>
            </div>
          ) : (
            <div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 27, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.3px" }}>Reset password</h2>
              <p style={{ fontSize: 14, color: "#6E756F", marginTop: 8 }}>We&apos;ll email you a secure link.</p>

              {error ? (
                <div style={{ marginTop: 18, borderRadius: 12, padding: "12px 15px", fontSize: 14, background: "#FBEDE9", color: "#B23A2A", border: "1px solid #EED7D0" }}>{error}</div>
              ) : null}

              <div style={{ marginTop: 22, marginBottom: 22 }}>
                <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>Manager email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="you@hotel.com" style={field} autoFocus />
              </div>

              <button onClick={submit} disabled={busy || !email} style={{ width: "100%", borderRadius: 13, padding: "15px", fontSize: 15, fontWeight: 600, color: "#fff", border: 0, cursor: busy || !email ? "not-allowed" : "pointer", background: "linear-gradient(100deg, " + GREEN + " 0%, #157A5F 60%, " + GOLD + " 200%)", opacity: busy || !email ? 0.55 : 1, boxShadow: "0 8px 22px rgba(15,95,76,0.32)" }}>
                {busy ? "Sending\u2026" : "Send reset link"}
              </button>

              <div style={{ marginTop: 18, textAlign: "center" }}>
                <Link href="/login" style={{ color: "#6E756F", fontSize: 14, textDecoration: "none" }}>&larr; Back to sign in</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .fp-wrap { flex-direction: column; max-width: 440px !important; }
          .fp-message { text-align: center; align-items: center; }
        }
      `}</style>
    </div>
  );
}