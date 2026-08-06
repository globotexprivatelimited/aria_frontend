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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F7F4", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 22, padding: "44px 40px", boxShadow: "0 20px 60px rgba(27,38,33,0.1)", border: "1px solid #EEE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD, marginTop: 2 }}>Manager</div>
          </div>
        </div>

        {done ? (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "#EAF2ED", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK, margin: 0 }}>Check the hotel inbox</h1>
            <p style={{ fontSize: 14.5, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>If a manager account exists for that email, a password reset link has been sent to the hotel&apos;s contact email. The link expires in 1 hour.</p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 24, color: GREEN, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>&larr; Back to sign in</Link>
          </div>
        ) : (
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.4px" }}>Forgot password?</h1>
            <p style={{ fontSize: 14.5, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>Enter your manager email. We&apos;ll send a reset link to your hotel&apos;s contact email.</p>

            {error ? (
              <div style={{ marginTop: 18, borderRadius: 12, padding: "12px 15px", fontSize: 13.5, background: "#FBEDE9", color: "#B23A2A", border: "1px solid #EED7D0" }}>{error}</div>
            ) : null}

            <div style={{ marginTop: 22, marginBottom: 22 }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>Manager email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="you@hotel.com" style={field} autoFocus />
            </div>

            <button onClick={submit} disabled={busy || !email} style={{ width: "100%", borderRadius: 13, padding: "15px", fontSize: 15, fontWeight: 600, color: "#fff", border: 0, cursor: busy || !email ? "not-allowed" : "pointer", background: GREEN, opacity: busy || !email ? 0.55 : 1 }}>
              {busy ? "Sending\u2026" : "Send reset link"}
            </button>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link href="/login" style={{ color: "#6E756F", fontSize: 13.5, textDecoration: "none" }}>&larr; Back to sign in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
