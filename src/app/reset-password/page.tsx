"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { validateToken, submitNewPassword } from "./reset-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621";

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) { setValid(false); setChecking(false); return; }
      const res = await validateToken(token);
      setValid(res.ok && !!res.valid);
      setChecking(false);
    })();
  }, [token]);

  async function submit() {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true); setError(null);
    const res = await submitNewPassword(token, password);
    setBusy(false);
    if (res.ok) { setDone(true); setTimeout(() => router.push("/login"), 2500); }
    else setError(res.message ?? "Could not reset password.");
  }

  const field = { width: "100%", boxSizing: "border-box" as const, borderRadius: 13, border: "1.5px solid #E3DECF", background: "#FBFAF5", padding: "15px 16px", fontSize: 15, outline: "none", color: INK };
  const card = { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 22, padding: "44px 40px", boxShadow: "0 20px 60px rgba(27,38,33,0.1)", border: "1px solid #EEE" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F7F4", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD, marginTop: 2 }}>Manager</div>
          </div>
        </div>

        {checking ? (
          <p style={{ color: "#6E756F", fontSize: 14 }}>Checking your reset link&hellip;</p>
        ) : done ? (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "#EAF2ED", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK, margin: 0 }}>Password updated</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 10 }}>Redirecting you to sign in&hellip;</p>
          </div>
        ) : !valid ? (
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK, margin: 0 }}>Link expired</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>This reset link is invalid or has expired. Request a new one.</p>
            <Link href="/forgot-password" style={{ display: "inline-block", marginTop: 22, color: GREEN, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Request a new link &rarr;</Link>
          </div>
        ) : (
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.4px" }}>Set new password</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 10 }}>Choose a strong password for your manager account.</p>

            {error ? (
              <div style={{ marginTop: 18, borderRadius: 12, padding: "12px 15px", fontSize: 14, background: "#FBEDE9", color: "#B23A2A", border: "1px solid #EED7D0" }}>{error}</div>
            ) : null}

            <div style={{ marginTop: 20, marginBottom: 16 }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>New password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={{ ...field, paddingRight: 46 }} autoFocus />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer", color: "#B4A98C", padding: 4, display: "flex" }}>
                  {showPw ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>Confirm password</label>
              <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Re-enter password" style={field} />
            </div>

            <button onClick={submit} disabled={busy || !password || !confirm} style={{ width: "100%", borderRadius: 13, padding: "15px", fontSize: 15, fontWeight: 600, color: "#fff", border: 0, cursor: busy ? "not-allowed" : "pointer", background: GREEN, opacity: busy || !password || !confirm ? 0.55 : 1 }}>
              {busy ? "Updating\u2026" : "Update password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div style={{ padding: 40 }}>Loading&hellip;</div>}><ResetInner /></Suspense>;
}
