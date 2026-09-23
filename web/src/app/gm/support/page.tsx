"use client";
import { useEffect, useState, useCallback } from "react";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { getMyTickets, raiseTicket, replyOnTicket, type MyTicket } from "./support-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const STATE_LABEL: Record<string, string> = { open: "Open", with_aria: "Aria is looking", waiting_hotel: "Waiting on you", resolved: "Resolved" };
const PRIO: Record<string, { bg: string; fg: string }> = {
  urgent: { bg: "#FBEDE9", fg: RED }, high: { bg: "#FBF3E6", fg: "#B4703A" },
  normal: { bg: "#F1F1F7", fg: "#6B6FA0" }, low: { bg: "#F4F3EF", fg: "#8A8577" },
};

export default function GMSupportPage() {
  const { isMobile } = useBreakpoint();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const token = () => (typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null);
  const load = useCallback(async () => { const t = token(); if (t) setTickets(await getMyTickets(t)); }, []);
  useEffect(() => { load(); const iv = setInterval(load, 12000); return () => clearInterval(iv); }, [load]);

  async function submit() {
    const t = token(); if (!t) return;
    if (!subject.trim()) { setErr("Give it a short title."); return; }
    setBusy(true); setErr(null);
    const r = await raiseTicket(t, { subject: subject.trim(), body: body.trim() || undefined, priority });
    setBusy(false);
    if (r.ok) {
      setMsg("Sent to Aria as " + r.ref + ". We will reply here.");
      setSubject(""); setBody(""); setPriority("normal"); setOpen(false); load();
      setTimeout(() => setMsg(null), 6000);
    } else setErr(r.error ?? "That did not send.");
  }

  async function reply(id: string) {
    const t = token(); const text = (draft[id] ?? "").trim();
    if (!t || !text) return;
    await replyOnTicket(t, id, text);
    setDraft((p) => ({ ...p, [id]: "" })); load();
  }

  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 19 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395", fontWeight: 700 as const, display: "block", marginBottom: 5 };
  const fld = { width: "100%", boxSizing: "border-box" as const, borderRadius: 9, border: "1px solid #E3DECF", background: "#FBFAF5", padding: "10px 12px", fontSize: 14, outline: "none", color: INK };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", width: "100%", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "22px 16px 48px" : "36px 40px 60px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>We are here to help</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: INK, marginTop: 4 }}>Support</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 4, maxWidth: 560 }}>
          Anything not working, or something you would like changed? Tell us and we will reply here.
        </p>

        {msg ? <div style={{ marginTop: 16, borderRadius: 12, padding: "11px 16px", background: "#EAF2ED", border: "1px solid #CFE5DC", color: GREEN, fontSize: 13.5 }}>{msg}</div> : null}

        <div style={{ ...card, marginTop: 18 }}>
          {!open ? (
            <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: 0, cursor: "pointer", padding: 0, textAlign: "left" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "#EAF2ED", border: "1px solid #CFE5DC", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 600, color: INK }}>Raise something with Aria</span>
                <span style={{ fontSize: 12, color: "#9AA09A" }}>A problem, a question, or a change you need</span>
              </span>
            </button>
          ) : (
            <div>
              {err ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, background: "#FBEDE9", color: RED, border: "1px solid #EED7D0" }}>{err}</div> : null}
              <label style={lbl}>What is happening?</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. The kitchen tablet keeps losing wifi" style={fld} />
              <label style={{ ...lbl, marginTop: 13 }}>Tell us more</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                placeholder="When does it happen, what have you tried, anything else worth knowing"
                style={{ ...fld, resize: "vertical", fontFamily: "inherit" }} />
              <label style={{ ...lbl, marginTop: 13 }}>How urgent?</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["normal", "Normal"], ["high", "Soon"], ["urgent", "Guests affected now"]].map(([k, l]) => (
                  <button key={k} onClick={() => setPriority(k)}
                    style={{ borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                      border: "1px solid " + (priority === k ? GREEN : "#E3DECF"), background: priority === k ? "#EAF2ED" : "#fff", color: priority === k ? GREEN : "#6E756F" }}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button disabled={busy || !subject.trim()} onClick={submit}
                  style={{ borderRadius: 9, padding: "11px 22px", fontSize: 14, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: busy || !subject.trim() ? .55 : 1 }}>
                  {busy ? "Sending\u2026" : "Send to Aria"}
                </button>
                <button onClick={() => { setOpen(false); setErr(null); }} style={{ borderRadius: 9, padding: "11px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid #E3DECF", background: "#fff", color: "#6E756F" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ ...lbl, marginTop: 26, marginBottom: 10 }}>Your tickets</div>
        {tickets.length === 0 ? (
          <div style={{ ...card, textAlign: "center", color: "#B4B9B3", padding: 34, fontSize: 13.5 }}>Nothing raised yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {tickets.map((t) => {
              const pr = PRIO[t.priority] ?? PRIO.normal;
              const waiting = t.state === "waiting_hotel";
              return (
                <div key={t.id} style={{ ...card, borderLeft: "4px solid " + (t.state === "resolved" ? "#CDC8BC" : waiting ? "#B4703A" : pr.fg) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 200, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>{t.subject}</div>
                      <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 3 }}>
                        {t.ref} &middot; {when(t.createdAt)}{t.assignedTo ? " \u00b7 " + t.assignedTo + " is on it" : ""}
                      </div>
                    </div>
                    <span style={{ borderRadius: 999, padding: "3px 11px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", alignSelf: "flex-start",
                      background: t.state === "resolved" ? "#EAF2ED" : waiting ? "#FBF3E6" : "#F5F3EE",
                      color: t.state === "resolved" ? GREEN : waiting ? "#B4703A" : "#6E756F" }}>{STATE_LABEL[t.state] ?? t.state}</span>
                  </div>
                  {t.body ? <div style={{ fontSize: 13.5, color: "#3A413B", marginTop: 9, lineHeight: 1.6 }}>{t.body}</div> : null}

                  {t.replies.length > 0 ? (
                    <div style={{ marginTop: 12, paddingTop: 11, borderTop: "1px solid #F2F0EA", display: "flex", flexDirection: "column", gap: 8 }}>
                      {t.replies.map((r, i) => (
                        <div key={i} style={{ background: r.side === "aria" ? "#F5F8F6" : "#FBFAF5", borderRadius: 10, padding: "9px 12px",
                          borderLeft: "3px solid " + (r.side === "aria" ? GREEN : "#E3DECF") }}>
                          <div style={{ fontSize: 11, color: "#9AA09A" }}>{r.side === "aria" ? "Aria" : "You"} &middot; {r.author} &middot; {when(r.at)}</div>
                          <div style={{ fontSize: 13, color: "#3A413B", marginTop: 3 }}>{r.body}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {t.state !== "resolved" ? (
                    <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                      <input value={draft[t.id] ?? ""} onChange={(e) => setDraft((p) => ({ ...p, [t.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") reply(t.id); }}
                        placeholder={waiting ? "Aria is waiting on you\u2026" : "Add something\u2026"}
                        style={{ ...fld, flex: 1 }} />
                      <button disabled={!(draft[t.id] ?? "").trim()} onClick={() => reply(t.id)}
                        style={{ borderRadius: 9, padding: "10px 17px", fontSize: 13, fontWeight: 600, color: "#fff", background: GREEN, border: 0, cursor: "pointer", opacity: (draft[t.id] ?? "").trim() ? 1 : .5 }}>Send</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
