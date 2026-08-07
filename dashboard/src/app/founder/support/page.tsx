"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTickets, replyTicket, patchTicket, type Ticket } from "./support-actions";
import { getMyRole } from "../../../lib/auth";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const PRIO: Record<string, { bg: string; fg: string }> = {
  urgent: { bg: "#FBEDE9", fg: RED }, high: { bg: "#FBF3E6", fg: "#B4703A" },
  normal: { bg: "#F1F1F7", fg: "#6B6FA0" }, low: { bg: "#F4F3EF", fg: "#8A8577" },
};
const STATE_LABEL: Record<string, string> = { open: "Open", with_aria: "With Aria", waiting_hotel: "Waiting on hotel", resolved: "Resolved" };

export default function SupportPage() {
  const router = useRouter();
  const [d, setD] = useState<{ tickets: Ticket[]; totals: Record<string, number> } | null>(null);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [me, setMe] = useState("Aria");

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setD(await getTickets(tk));
  }, []);
  useEffect(() => { load(); getMyRole().then((m) => m && setMe(m.fullName ?? "Aria")).catch(() => {}); const iv = setInterval(load, 12000); return () => clearInterval(iv); }, [load]);

  async function send(id: string) {
    const tk = window.localStorage.getItem("aria_token"); const body = (draft[id] ?? "").trim();
    if (!tk || !body) return;
    setBusy(id); await replyTicket(tk, id, me, body);
    setDraft((p) => ({ ...p, [id]: "" })); setBusy(null); load();
  }
  async function patch(id: string, p: { state?: string; assignedTo?: string | null; priority?: string }) {
    const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
    setBusy(id); await patchTicket(tk, id, p); setBusy(null); load();
  }

  const tickets = (d?.tickets ?? []).filter((t) => filter === "all" ? true : filter === "open" ? t.state !== "resolved" : t.state === filter);
  const t = d?.totals ?? {};
  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 19 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };
  const chip = (on: boolean) => ({ borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (on ? GREEN : "#E3DECF"), background: on ? "#EAF2ED" : "#fff", color: on ? GREEN : "#6E756F" });
  const act = { borderRadius: 7, padding: "5px 11px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", border: "1px solid #E3DECF", background: "#fff", color: "#6E756F" };

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1100 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Raised by hotels</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Support</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 11, marginTop: 20 }}>
        {[
          { l: "Open", v: t.open ?? 0, c: (t.open ?? 0) > 0 ? GOLD : "#C8CCC6" },
          { l: "Urgent", v: t.urgent ?? 0, c: (t.urgent ?? 0) > 0 ? RED : "#C8CCC6" },
          { l: "Unassigned", v: t.unassigned ?? 0, c: (t.unassigned ?? 0) > 0 ? "#B4703A" : "#C8CCC6" },
          { l: "Resolved", v: t.resolved ?? 0, c: GREEN },
        ].map((x) => (
          <div key={x.l} style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 7, marginTop: 20, flexWrap: "wrap" }}>
        {[["all", "All"], ["open", "Open"], ["with_aria", "With Aria"], ["waiting_hotel", "Waiting on hotel"], ["resolved", "Resolved"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={chip(filter === k)}>{l}</button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div style={{ ...card, marginTop: 16, textAlign: "center", color: "#B4B9B3", padding: 40, fontSize: 13.5 }}>
          No tickets here. GMs can raise them from their own dashboard.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {tickets.map((x) => {
            const pr = PRIO[x.priority] ?? PRIO.normal;
            return (
              <div key={x.id} style={{ ...card, borderLeft: "4px solid " + (x.state === "resolved" ? "#CDC8BC" : pr.fg) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 240, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>{x.subject}</div>
                    <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 3 }}>
                      {x.ref} &middot; {x.hotelName} &middot; raised by {x.raisedBy ?? "unknown"} &middot; {when(x.createdAt)}
                      <span style={{ color: x.assignedTo ? GREEN : "#B4703A", fontWeight: 600 }}>
                        {x.assignedTo ? " \u00b7 handled by " + x.assignedTo : " \u00b7 nobody assigned"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: pr.bg, color: pr.fg }}>{x.priority}</span>
                    <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: x.state === "resolved" ? "#EAF2ED" : "#F5F3EE", color: x.state === "resolved" ? GREEN : "#6E756F" }}>{STATE_LABEL[x.state] ?? x.state}</span>
                  </div>
                </div>

                <button onClick={() => router.push("/founder/hotels/" + x.hotelId)}
                  style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", fontSize: 12, color: GREEN, marginTop: 8 }}>Open {x.hotelName} &rarr;</button>

                {x.body ? <div style={{ fontSize: 13.5, color: "#3A413B", marginTop: 10, lineHeight: 1.6 }}>{x.body}</div> : null}

                {x.replies.length > 0 ? (
                  <div style={{ marginTop: 12, paddingTop: 11, borderTop: "1px solid #F2F0EA", display: "flex", flexDirection: "column", gap: 9 }}>
                    {x.replies.map((r, i) => (
                      <div key={i} style={{ background: r.side === "aria" ? "#F5F8F6" : "#FBFAF5", borderRadius: 10, padding: "9px 12px" }}>
                        <div style={{ fontSize: 11, color: "#9AA09A" }}>{r.side === "aria" ? "Aria" : x.hotelName} &middot; {r.author} &middot; {when(r.at)}</div>
                        <div style={{ fontSize: 13, color: "#3A413B", marginTop: 3 }}>{r.body}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
                  <input value={draft[x.id] ?? ""} onChange={(e) => setDraft((p) => ({ ...p, [x.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") send(x.id); }}
                    placeholder="Reply to the hotel..."
                    style={{ flex: 1, minWidth: 200, borderRadius: 8, border: "1px solid #E3DECF", padding: "8px 11px", fontSize: 13, outline: "none" }} />
                  <button disabled={busy === x.id || !(draft[x.id] ?? "").trim()} onClick={() => send(x.id)}
                    style={{ borderRadius: 8, padding: "8px 15px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: 0, background: GREEN, color: "#fff", opacity: (draft[x.id] ?? "").trim() ? 1 : .5 }}>Send reply</button>
                  <button onClick={() => patch(x.id, { assignedTo: me })} style={act}>Assign me</button>
                  <button onClick={() => patch(x.id, { state: "waiting_hotel" })} style={act}>Waiting on hotel</button>
                  {x.state === "resolved" ? (
                    <button onClick={() => patch(x.id, { state: "open" })} style={act}>Reopen</button>
                  ) : (
                    <button onClick={() => patch(x.id, { state: "resolved" })} style={{ ...act, borderColor: "#CFE5DC", background: "#EAF2ED", color: GREEN }}>Mark resolved</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
