"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, homeForRole } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setError(null);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (!res.ok || !res.role) { setError(res.error ?? "Wrong email or password."); return; }
    router.push(homeForRole(res.role));
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#F6F7F4 0%,#EEF1EC 100%)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#0F5F4C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>A</div>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "#1B2621" }}>Aria</span>
          </div>
          <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 8, textTransform: "uppercase", letterSpacing: ".16em" }}>Staff Sign-in</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 18, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,.05)" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#6E756F", marginTop: 4 }}>Sign in to your portal</p>

          {error ? (
            <div style={{ marginTop: 16, borderRadius: 10, padding: "10px 14px", fontSize: 13, background: "#FBEDE9", color: "#B23A2A", border: "1px solid #F0D5CD" }}>{error}</div>
          ) : null}

          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", color: "#6E756F" }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="you@hotel.com" autoFocus
              style={{ width: "100%", marginTop: 6, borderRadius: 10, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "11px 14px", fontSize: 14, outline: "none" }} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", color: "#6E756F" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Your password"
              style={{ width: "100%", marginTop: 6, borderRadius: 10, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "11px 14px", fontSize: 14, outline: "none" }} />
          </div>

          <button onClick={submit} disabled={busy || !email || !password}
            style={{ marginTop: 24, width: "100%", borderRadius: 11, padding: "12px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: busy ? "default" : "pointer", opacity: (busy || !email || !password) ? 0.6 : 1 }}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#B4B9B3", marginTop: 20 }}>Aria &middot; Hotel Operations</p>
      </div>
    </div>
  );
}