"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getWhatsApp, connectWhatsApp, disconnectWhatsApp, type HotelWhatsApp } from "./whatsapp-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621", MUTED = "#8A8577";
const field = { width: "100%", padding: "9px 11px", borderRadius: 10, border: "1px solid #E4DECF", background: "#FEFDFB", fontSize: 13, color: INK, boxSizing: "border-box" } as const;
const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 as const, marginBottom: 4, display: "block" } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }) as const;

/** Connect the hotel's own WhatsApp number: paste the phone-number id (and WABA id) from Meta; the API checks it, saves it and subscribes the app. */
export default function WhatsAppLink() {
  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const raw = params?.hotelId;
  const hotelId = Array.isArray(raw) ? String(raw[0] ?? "") : String(raw ?? "");
  const [token, setToken] = useState("");
  const [d, setD] = useState<HotelWhatsApp | null>(null);
  const [phoneId, setPhoneId] = useState("");
  const [waba, setWaba] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  useEffect(() => { try { setToken(window.localStorage.getItem("aria_token") ?? ""); } catch { /* no storage */ } }, []);
  const load = useCallback(async () => { if (!token || !hotelId) return; const r = await getWhatsApp(token, hotelId); setD(r); if (r) { setPhoneId(r.phoneNumberId ?? ""); setWaba(r.wabaId ?? ""); } }, [token, hotelId]);
  useEffect(() => { void load(); }, [load]);

  async function doConnect() {
    if (!phoneId.trim()) return;
    setBusy(true); setMsg(null);
    const r = await connectWhatsApp(token, hotelId, phoneId.trim(), waba.trim());
    setBusy(false);
    if (r.ok) { setMsg({ text: "Connected" + (r.data?.live?.number ? " - " + r.data.live.number + (r.data.live.verifiedName ? " (" + r.data.live.verifiedName + ")" : "") : "") + ". " + (r.note ?? ""), tone: GREEN }); void load(); }
    else setMsg({ text: r.message ?? "Could not connect", tone: RED });
  }
  async function doDisconnect() {
    if (!confirm("Disconnect this number? The hotel goes back to the platform's default number until another is linked.")) return;
    setBusy(true); const r = await disconnectWhatsApp(token, hotelId); setBusy(false);
    if (r.ok) { setMsg({ text: "Disconnected - back on the platform default number", tone: AMBER }); void load(); } else setMsg({ text: r.message ?? "Could not disconnect", tone: RED });
  }
  const live = d?.live;
  const quality = live ? (live.quality === "GREEN" ? GREEN : live.quality === "RED" ? RED : AMBER) : MUTED;

  return (
    <div style={{ gridColumn: "1 / -1", border: "1px solid #EAEAE4", borderRadius: 14, padding: 16, background: "#fff", marginTop: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: INK }}>WhatsApp number</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{d ? (d.platformDefault ? "Using the platform's default number. Link the hotel's own number below - no script, no SQL." : "Messages to this number route to this hotel, and replies go out from it.") : "Loading..."}</div>
        </div>
        {d && !d.platformDefault ? <span style={{ fontSize: 11, fontWeight: 700, color: d.liveError ? RED : GREEN, background: (d.liveError ? RED : GREEN) + "14", border: "1px solid " + (d.liveError ? RED : GREEN) + "55", borderRadius: 999, padding: "3px 10px" }}>{d.liveError ? "Meta cannot see it" : "Connected"}</span> : null}
      </div>
      {live ? (
        <div style={{ fontSize: 13, color: INK, marginTop: 10, lineHeight: 1.7 }}>
          <div><b>{live.number}</b>{live.verifiedName ? " - " + live.verifiedName : ""}</div>
          <div style={{ fontSize: 12, color: MUTED }}>quality <span style={{ color: quality, fontWeight: 700 }}>{live.quality}</span> - name {live.nameStatus} - code verification {live.codeVerification}{d?.wabaId ? " - WABA " + d.wabaId : ""}</div>
          {live.codeVerification === "EXPIRED" ? <div style={{ fontSize: 12, color: AMBER }}>Code verification has expired - re-verify the number in Meta Business Manager before relying on it.</div> : null}
        </div>
      ) : d?.liveError ? <div style={{ fontSize: 12, color: RED, marginTop: 10 }}>{d.liveError}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end", marginTop: 12 }}>
        <div><label style={lbl}>Phone number id</label><input style={field} placeholder="e.g. 1313874975138126" value={phoneId} onChange={(e) => setPhoneId(e.target.value.replace(/\D/g, ""))} inputMode="numeric" /></div>
        <div><label style={lbl}>WhatsApp Business Account id</label><input style={field} placeholder="e.g. 38265744036350087" value={waba} onChange={(e) => setWaba(e.target.value.replace(/\D/g, ""))} inputMode="numeric" /></div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={doConnect} disabled={busy || !phoneId.trim() || !token} style={{ ...btn(GREEN, "#fff"), opacity: busy || !phoneId.trim() || !token ? 0.6 : 1 }}>{d && !d.platformDefault ? "Re-check and save" : "Connect"}</button>
          {d && !d.platformDefault ? <button onClick={doDisconnect} disabled={busy} style={btn("#fff", RED, "#F1C9C2")}>Disconnect</button> : null}
        </div>
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>Both ids are under WhatsApp, API setup in Meta Business Manager. The number must sit in a WABA our app can reach with the platform token; the API confirms it with Meta before saving, and subscribes the app to the WABA so the hotel's messages arrive.</div>
      {msg ? <div style={{ fontSize: 12, color: msg.tone, marginTop: 8 }}>{msg.text}</div> : null}
    </div>
  );
}
