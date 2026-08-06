"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, homeForRole } from "../../lib/auth";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  async function submit() {
    if (!email || !password) return;
    setBusy(true);
    setError(null);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (res.ok && res.role) {
      router.push(homeForRole(res.role));
    } else {
      setError(res.error ?? "Login failed");
    }
  }

  const fieldWrap = (name: string): React.CSSProperties => ({
    position: "relative",
    borderRadius: 13,
    border: "1.5px solid " + (focused === name ? GREEN : "#E3DECF"),
    background: "#FBFAF5",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused === name ? "0 0 0 4px rgba(15,95,76,0.12)" : "none",
  });
  const input: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: 0, background: "transparent",
    padding: "15px 16px 15px 46px", fontSize: 15, outline: "none", color: INK,
  };
  const iconStyle: React.CSSProperties = {
    position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
    width: 19, height: 19, color: "#B4A98C", pointerEvents: "none",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#0B1A16" }}>
      {/* LEFT: full image, uncropped, on a dark panel */}
      <div className="login-visual" style={{ flex: "0 0 46%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0F2620 0%, #0B1A16 100%)", overflow: "hidden" }}>
        {/* soft ambient glow */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "60%", height: "50%", background: "radial-gradient(circle, rgba(176,138,79,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "60%", height: "50%", background: "radial-gradient(circle, rgba(15,95,76,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* the full image - contained so nothing is cropped */}
        <img src="/login-hero.jpg" alt="" style={{ position: "relative", zIndex: 1, maxWidth: "88%", maxHeight: "86%", width: "auto", height: "auto", objectFit: "contain", borderRadius: 20, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }} />

        {/* brand overlay top-left */}
        <div style={{ position: "absolute", top: 40, left: 44, zIndex: 2, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 23, fontWeight: 700, color: "#fff" }}>A</div>
          <div style={{ color: "#fff" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".18em", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>Hotel Intelligence</div>
          </div>
        </div>

        {/* tagline bottom */}
        <div style={{ position: "absolute", bottom: 40, left: 44, right: 44, zIndex: 2, color: "rgba(255,255,255,0.85)" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 600, lineHeight: 1.25 }}>Your hotel, running itself.</div>
        </div>
      </div>

      {/* RIGHT: login form on clean surface */}
      <div className="login-form-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#F6F7F4" }}>
        <div className="form-inner" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "inline-block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".2em", color: GOLD, marginBottom: 16, padding: "5px 13px", borderRadius: 999, background: "rgba(176,138,79,0.12)", border: "1px solid rgba(176,138,79,0.28)" }}>Welcome back</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.02, letterSpacing: "-0.6px" }}>Sign in</h1>
            <p style={{ fontSize: 15, color: "#6E756F", marginTop: 12 }}>Access your hotel command center</p>
          </div>

          {error ? (
            <div style={{ marginBottom: 20, borderRadius: 12, padding: "12px 15px", fontSize: 13.5, background: "#FBEDE9", color: "#B23A2A", border: "1px solid #EED7D0", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          ) : null}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>Email</label>
            <div style={fieldWrap("email")}>
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
              <input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="you@hotel.com" style={input} autoFocus />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", fontWeight: 600, marginBottom: 8, display: "block" }}>Password</label>
            <div style={fieldWrap("password")}>
              <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Your password" style={{ ...input, paddingRight: 46 }} />
              <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer", color: "#B4A98C", padding: 4, display: "flex" }}>
                {showPw ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 18, marginTop: -8 }}>
            <Link href="/forgot-password" style={{ fontSize: 13, color: GREEN, textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <button onClick={submit} disabled={busy || !email || !password} className="signin-btn" style={{ width: "100%", borderRadius: 13, padding: "16px", fontSize: 15.5, fontWeight: 600, color: "#fff", border: 0, cursor: busy || !email || !password ? "not-allowed" : "pointer", background: "linear-gradient(100deg, " + GREEN + " 0%, #157A5F 60%, " + GOLD + " 200%)", opacity: busy || !email || !password ? 0.55 : 1, boxShadow: "0 8px 22px rgba(15,95,76,0.32)", transition: "transform .15s, box-shadow .15s", letterSpacing: ".01em" }}>
            {busy ? "Signing in\u2026" : "Sign in"}
          </button>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 12.5, color: "#A8A395" }}>
            Protected by Aria security
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder { color: #B4B9B3; }
        .signin-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(15,95,76,0.42); }
        .signin-btn:active:not(:disabled) { transform: translateY(0); }
        .form-inner { animation: formIn .55s cubic-bezier(0.16,1,0.3,1); }
        @keyframes formIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .login-visual { display: none !important; }
        }
      `}</style>
    </div>
  );
}