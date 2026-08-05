"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllActive, type Req as RequestRow } from "../../_actions/requests";
import FounderSidebar from "../../../components/FounderSidebar";
import { createManager } from "./actions";

export default function ManagersPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    setRows(await getAllActive());
  }, []);

  useEffect(() => {
    load();
    load();
    const iv = setInterval(load, 4000);
    return () => { clearInterval(iv); };
  }, [load]);

  const hotels = Array.from(new Set(rows.map((r) => r.hotelId))).sort();

  function flash(ok: boolean, msg: string) { setToast({ ok, msg }); setTimeout(() => setToast(null), 3200); }

  async function submit() {
    setBusy(true);
    const res = await createManager({ fullName, email, password, phone });
    setBusy(false);
    flash(res.ok, res.message);
    if (res.ok) { setOpen(false); setFullName(""); setEmail(""); setPassword(""); setPhone(""); }
  }

  const field = { width: "100%", marginTop: 6, borderRadius: 9, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const label = { fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".04em", color: "#6E756F" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <FounderSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Managers</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>
              <span style={{ display: "inline-block", height: 8, width: 8, borderRadius: 999, marginRight: 6, background: connected ? "#34D399" : "#F0B429" }} />
              {connected ? "Live" : "Connecting..."} &middot; {hotels.length} hotels
            </p>
          </div>
          <button onClick={() => setOpen(true)} style={{ borderRadius: 9, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer" }}>
            + Add Manager
          </button>
        </div>

        {toast ? (
          <div style={{ marginTop: 16, borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 500, background: toast.ok ? "#E8F1ED" : "#FBEDE9", color: toast.ok ? "#0F5F4C" : "#B23A2A", border: "1px solid " + (toast.ok ? "#CFE5DC" : "#F0D5CD") }}>{toast.msg}</div>
        ) : null}

        <div style={{ marginTop: 24, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", padding: "14px 24px", borderBottom: "1px solid #EAEAE4", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>
            <span>Hotel</span><span>Manager account</span><span>Status</span>
          </div>
          {hotels.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No hotels yet. Create a manager to get started.</div>
          ) : hotels.map((h) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", padding: "16px 24px", borderBottom: "1px solid #F4F4F1", fontSize: 14, alignItems: "center" }}>
              <span style={{ fontWeight: 500, color: "#1B2621" }}>{h}</span>
              <span style={{ color: "#9AA09A" }}>Assigned</span>
              <span><span style={{ borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 500, background: "#E8F1ED", color: "#0F5F4C" }}>Active</span></span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: "#9AA09A" }}>
          Each manager runs their own hotel and adds their department staff.
        </p>
      </div>

      {open ? (
        <div onClick={() => !busy && setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621" }}>Add a manager</h2>
            <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 4 }}>Creates a GM login. They&rsquo;ll set up their hotel on first sign-in.</p>
            <div style={{ marginTop: 20 }}>
              <label style={label}>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Manager name" autoFocus style={field} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@hotel.com" style={field} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={field} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={label}>Phone <span style={{ textTransform: "none", color: "#B4B9B3" }}>(optional)</span></label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." style={field} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setOpen(false)} disabled={busy} style={{ borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, color: "#3A413B", background: "#fff", border: "1px solid #D9D9D2", cursor: "pointer" }}>Cancel</button>
              <button onClick={submit} disabled={busy} style={{ flex: 1, borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Creating..." : "Create manager"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}