"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmEmail } from "./verify-actions";

const GREEN = "#0F5F4C", GOLD = "#B08A4F", INK = "#1B2621", RED = "#B23A2A";

function VerifyInner() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"working" | "done" | "already" | "failed">("working");
  const [hotel, setHotel] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!token) { setState("failed"); setMessage("This link is missing its code."); return; }
      const r = await confirmEmail(token);
      if (r.ok) { setHotel(r.hotelName ?? ""); setState(r.alreadyDone ? "already" : "done"); }
      else { setState("failed"); setMessage(r.message ?? "This link did not work."); }
    })();
  }, [token]);

  const card = { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 22, padding: "44px 40px", boxShadow: "0 20px 60px rgba(27,38,33,.1)", border: "1px solid #EEE" };
  const ring = (bg: string) => ({ width: 54, height: 54, borderRadius: 999, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F7F4", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 26 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: GREEN, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>A</div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: INK, lineHeight: 1 }}>Aria</div>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD, marginTop: 2 }}>Hotel Intelligence</div>
          </div>
        </div>

        {state === "working" ? (
          <p style={{ color: "#6E756F", fontSize: 14 }}>Confirming your email&hellip;</p>
        ) : state === "failed" ? (
          <div>
            <div style={ring("#FBEDE9")}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12.01" y2="16.5" /></svg>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 27, fontWeight: 700, color: INK, margin: 0 }}>That link did not work</h1>
            <p style={{ fontSize: 14.5, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>{message} Sign in and use the banner at the top to send a fresh one.</p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 22, borderRadius: 12, padding: "12px 22px", background: GREEN, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Go to sign in</Link>
          </div>
        ) : (
          <div>
            <div style={ring("#EAF2ED")}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-.3px" }}>
              {state === "already" ? "Already confirmed" : "Email confirmed"}
            </h1>
            <p style={{ fontSize: 14.5, color: "#6E756F", marginTop: 10, lineHeight: 1.6 }}>
              {state === "already"
                ? "This address was confirmed earlier. Nothing else to do."
                : (hotel ? hotel + " is all set. " : "") + "We can now send password resets and important notices to this address."}
            </p>
            <Link href="/login" style={{ display: "inline-block", marginTop: 22, borderRadius: 12, padding: "12px 22px", background: GREEN, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Go to sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div style={{ padding: 40 }}>Loading&hellip;</div>}><VerifyInner /></Suspense>;
}
