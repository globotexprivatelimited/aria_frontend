"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import GMSidebar from "@/components/GMSidebar";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { useMyHotel } from "@/lib/useMyHotel";
import { getConversation, replyToGuest, type Thread, type ThreadMessage } from "@/app/_actions/conversation";
import { getHotelActive, type Req } from "@/app/_actions/requests";
import { checkOutRoom } from "@/app/gm/reception/rooms-actions";

/* ---------- palette: the GM console's existing cream / ink / emerald ---------- */
const C = {
  bg: "#F6F7F4",
  panel: "#FFFFFF",
  ink: "#1B2621",
  body: "#3A413B",
  muted: "#6E756F",
  faint: "#9AA09A",
  line: "#EAEAE4",
  lineSoft: "#F4F4F1",
  emerald: "#0F5F4C",
  emeraldSoft: "#E8F1ED",
  amber: "#9A6B12",
  amberSoft: "#FFF4DB",
  red: "#9B2C2C",
  redSoft: "#FDECEC",
  neutralSoft: "#EEF0EC",
};
const serif = "Georgia, 'Times New Roman', serif";
const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

/* ---------- small formatting helpers ---------- */
function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(iso) === dayKey(now.toISOString())) return "Today";
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  return Math.floor(s / 86400) + " d ago";
}
function countdown(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? h + " h " + m + " min" : m + " min";
}
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0].toUpperCase()).join("") || "G";
}
function humanise(s: string): string {
  return s.replace(/_/g, " ");
}
function stateLook(state: string): { bg: string; fg: string; label: string } {
  switch (state) {
    case "active": return { bg: C.emeraldSoft, fg: C.emerald, label: "In house" };
    case "flagged": return { bg: C.amberSoft, fg: C.amber, label: "Stay may have ended" };
    case "closed": return { bg: C.neutralSoft, fg: C.muted, label: "Checked out" };
    case "blocked": return { bg: C.redSoft, fg: C.red, label: "Blocked" };
    case "prospect": return { bg: C.neutralSoft, fg: C.muted, label: "Not registered" };
    default: return { bg: C.neutralSoft, fg: C.muted, label: state ? humanise(state) : "Unknown" };
  }
}

/* ---------- tiny presentational pieces ---------- */
function Chip({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) {
  return (
    <span style={{ display: "inline-block", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, background: bg, color: fg, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
function Panel({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <div style={{ background: C.panel, border: "1px solid " + C.line, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink }}>{title}</span>
        {typeof count === "number" && <span style={{ fontSize: 13, color: C.faint }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}
function Fact({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: "1px solid " + C.lineSoft, fontSize: 13 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: accent ?? C.ink, fontWeight: accent ? 600 : 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div style={{ padding: "56px 20px", textAlign: "center", fontSize: 14, color: C.faint }}>{text}</div>;
}
function DayMarker({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 8px" }}>
      <span style={{ flex: 1, height: 1, background: C.line }} />
      <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}
function Bubble({ m, compact }: { m: ThreadMessage; compact: boolean }) {
  const inbound = m.direction === "inbound";
  const isText = !m.type || m.type === "text";
  return (
    <div style={{ display: "flex", justifyContent: inbound ? "flex-start" : "flex-end", marginTop: compact ? 4 : 14 }}>
      <div
        style={{
          maxWidth: "72%",
          padding: "9px 13px 7px",
          borderRadius: 16,
          borderTopLeftRadius: inbound && compact ? 6 : 16,
          borderTopRightRadius: !inbound && compact ? 6 : 16,
          background: inbound ? C.panel : C.emerald,
          color: inbound ? C.ink : "#FFFFFF",
          border: inbound ? "1px solid " + C.line : "1px solid " + C.emerald,
        }}
      >
        {!isText && (
          <span style={{ display: "inline-block", marginBottom: 5, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: inbound ? C.neutralSoft : "rgba(255,255,255,0.18)", color: inbound ? C.muted : "#FFFFFF" }}>
            {humanise(m.type ?? "attachment")}
          </span>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {m.body ?? (isText ? "" : "[" + humanise(m.type ?? "attachment") + " message]")}
        </div>
        <div style={{ marginTop: 3, fontSize: 11, textAlign: "right", color: inbound ? C.faint : "rgba(255,255,255,0.72)" }}>{fmtTime(m.at)}</div>
      </div>
    </div>
  );
}
function button(primary: boolean, disabled: boolean): CSSProperties {
  return {
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    border: primary ? "1px solid " + C.emerald : "1px solid " + C.line,
    background: primary ? C.emerald : C.panel,
    color: primary ? "#FFFFFF" : C.ink,
    opacity: disabled ? 0.55 : 1,
  };
}

/* ---------- the thread, grouped by day, consecutive same-side messages tightened ---------- */
function renderThread(list: ThreadMessage[]): ReactNode[] {
  const out: ReactNode[] = [];
  let prevDay = "";
  let prev: ThreadMessage | null = null;
  list.forEach((m, i) => {
    const day = dayKey(m.at);
    if (day !== prevDay) {
      out.push(<DayMarker key={"day-" + i} label={dayLabel(m.at)} />);
      prevDay = day;
      prev = null;
    }
    const compact = !!prev && prev.direction === m.direction && new Date(m.at).getTime() - new Date(prev.at).getTime() < 5 * 60 * 1000;
    out.push(<Bubble key={"m-" + i} m={m} compact={compact} />);
    prev = m;
  });
  return out;
}

export default function GMConversation() {
  const params = useParams<{ phone: string }>();
  const phone = decodeURIComponent(String(params?.phone ?? ""));
  const router = useRouter();
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId, hotelName } = useMyHotel();

  const [thread, setThread] = useState<Thread | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickToBottom = useRef(true);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    if (!hotelId || !phone) return;
    const [t, reqs] = await Promise.all([getConversation(hotelId, phone), getHotelActive(hotelId)]);
    setThread(t);
    setRequests(reqs);
    setLoaded(true);
  }, [hotelId, phone]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 4000);
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [load]);

  useEffect(() => {
    const n = thread?.messages.length ?? 0;
    if (n === lastCount.current) return;
    lastCount.current = n;
    if (stickToBottom.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const session = thread?.session ?? null;
  const room = session?.room ?? null;
  const name = (session?.name ?? "").trim() || "Unknown guest";
  const look = stateLook(session?.state ?? "");

  const messages = useMemo(() => {
    const all = thread?.messages ?? [];
    const q = query.trim().toLowerCase();
    return q ? all.filter((m) => (m.body ?? "").toLowerCase().includes(q)) : all;
  }, [thread, query]);

  const roomRequests = useMemo(
    () => (room ? requests.filter((r) => r.roomNumber === room && r.status !== "resolved") : []),
    [requests, room]
  );

  const stats = useMemo(() => {
    const all = thread?.messages ?? [];
    const inbound = all.filter((m) => m.direction === "inbound");
    return {
      total: all.length,
      inbound: inbound.length,
      outbound: all.length - inbound.length,
      first: all.length ? all[0].at : null,
      lastGuest: inbound.length ? inbound[inbound.length - 1].at : null,
    };
  }, [thread]);

  const windowLeft = stats.lastGuest ? REPLY_WINDOW_MS - (now - new Date(stats.lastGuest).getTime()) : 0;
  const windowOpen = windowLeft > 0;

  async function send() {
    const text = draft.trim();
    if (!text || !hotelId || sending) return;
    setSending(true);
    setNotice(null);
    const r = await replyToGuest(hotelId, phone, text);
    setSending(false);
    if (!r.ok) { setNotice(r.error ?? "Could not send."); return; }
    setDraft("");
    stickToBottom.current = true;
    await load();
  }

  async function doCheckOut() {
    if (!hotelId || !room || checkingOut) return;
    if (!window.confirm("Check " + name + " out of room " + room + "? This closes their WhatsApp session.")) return;
    setCheckingOut(true);
    const r = await checkOutRoom(hotelId, room);
    setCheckingOut(false);
    if (r.ok) router.push("/gm/guests");
    else setNotice(r.message ?? "Could not check out.");
  }

  const pagePad = isMobile ? "16px" : "20px 32px";

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: C.bg }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: isMobile ? "auto" : "100vh" }}>
        {/* ---------- guest header ---------- */}
        <div style={{ padding: pagePad, paddingBottom: 0 }}>
          <Link href="/gm/guests" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>&larr; All guests</Link>
          <div style={{ marginTop: 12, background: C.panel, border: "1px solid " + C.line, borderRadius: 16, padding: isMobile ? 16 : "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: C.emerald, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
              {initials(name)}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontFamily: serif, fontSize: isMobile ? 22 : 26, fontWeight: 600, color: C.ink }}>{name}</h1>
                {session && <Chip bg={look.bg} fg={look.fg}>{look.label}</Chip>}
                {session && (
                  <Chip bg={session.verified ? C.emeraldSoft : C.amberSoft} fg={session.verified ? C.emerald : C.amber}>
                    {session.verified ? "Registered by reception" : "Self reported"}
                  </Chip>
                )}
              </div>
              <div style={{ marginTop: 5, fontSize: 13, color: C.muted, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, color: C.body }}>{room ? "Room " + room : "No room"}</span>
                <span>{phone}</span>
                {session?.checkInDate && <span>Checked in {fmtDate(session.checkInDate)}</span>}
                {session?.checkOutDate && <span>Checks out {fmtDate(session.checkOutDate)}</span>}
                {stats.lastGuest && <span>Last wrote {timeAgo(stats.lastGuest)}</span>}
              </div>
            </div>
            {room && session && session.state !== "closed" && (
              <button onClick={doCheckOut} disabled={checkingOut} style={button(false, checkingOut)}>
                {checkingOut ? "Checking out..." : "Check out guest"}
              </button>
            )}
          </div>
        </div>

        {/* ---------- thread + side panel ---------- */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, padding: pagePad, paddingTop: 16 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: C.panel, border: "1px solid " + C.line, borderRadius: 16, overflow: "hidden", minHeight: isMobile ? 520 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid " + C.line, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: C.muted }}>
                {stats.total} messages, kept verbatim for dispute resolution
              </span>
              <span style={{ flex: 1 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this conversation"
                aria-label="Search this conversation"
                style={{ width: isMobile ? "100%" : 240, padding: "8px 12px", borderRadius: 10, border: "1px solid " + C.line, fontSize: 13, color: C.ink, background: C.bg, outline: "none" }}
              />
              {query && <span style={{ fontSize: 12, color: C.muted }}>{messages.length} {messages.length === 1 ? "match" : "matches"}</span>}
            </div>

            <div
              ref={scrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
              style={{ flex: 1, overflowY: "auto", padding: "6px 18px 10px", background: C.bg }}
            >
              {!loaded ? (
                <Empty text="Loading the conversation" />
              ) : messages.length === 0 ? (
                <Empty text={query ? "No messages match that search." : "No messages yet. The welcome goes out when reception checks the guest in."} />
              ) : (
                renderThread(messages)
              )}
            </div>

            <div style={{ borderTop: "1px solid " + C.line, padding: 14, background: C.panel }}>
              {notice && (
                <div style={{ marginBottom: 10, fontSize: 13, color: C.red, background: C.redSoft, borderRadius: 10, padding: "8px 12px" }}>{notice}</div>
              )}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={windowOpen ? "Reply to " + name + " on WhatsApp" : "WhatsApp only allows a free-form reply within 24 hours of the guest writing to you"}
                  rows={2}
                  disabled={sending || !windowOpen}
                  aria-label="Reply to guest"
                  style={{ flex: 1, resize: "vertical", padding: "10px 12px", borderRadius: 12, border: "1px solid " + C.line, fontSize: 14, lineHeight: 1.5, color: C.ink, background: windowOpen ? C.panel : C.bg, outline: "none", fontFamily: "inherit" }}
                />
                <button onClick={send} disabled={sending || !windowOpen || !draft.trim()} style={button(true, sending || !windowOpen || !draft.trim())}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: windowOpen ? C.faint : C.amber }}>
                {windowOpen
                  ? "Reply window closes in " + countdown(windowLeft) + ". Enter sends, Shift+Enter starts a new line. Sent as " + (hotelName || "your hotel") + "."
                  : "The guest has not written in the last 24 hours, so the reply window is closed. It reopens the moment they message."}
              </div>
            </div>
          </div>

          {!isMobile && (
            <div style={{ width: isTablet ? 250 : 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
              <Panel title="Open requests" count={roomRequests.length}>
                {roomRequests.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.faint, paddingTop: 4 }}>Nothing open for {room ? "room " + room : "this guest"}.</div>
                ) : (
                  roomRequests.map((r) => (
                    <div key={r.id} style={{ padding: "10px 0", borderTop: "1px solid " + C.lineSoft }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.emerald }}>{humanise(r.department)}</span>
                        <Chip bg={r.priority === "urgent" ? C.redSoft : C.neutralSoft} fg={r.priority === "urgent" ? C.red : C.muted}>{humanise(r.priority)}</Chip>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, color: C.body, lineHeight: 1.45 }}>{r.requestDetail}</div>
                      <div style={{ marginTop: 4, fontSize: 12, color: C.faint }}>{humanise(r.status)}, {timeAgo(r.createdAt)}</div>
                    </div>
                  ))
                )}
              </Panel>

              <Panel title="At a glance">
                <Fact label="Messages from guest" value={String(stats.inbound)} />
                <Fact label="Replies from Aria and staff" value={String(stats.outbound)} />
                <Fact label="First contact" value={stats.first ? fmtDate(stats.first) : "None yet"} />
                <Fact label="Reply window" value={windowOpen ? "Open, " + countdown(windowLeft) + " left" : "Closed"} accent={windowOpen ? C.emerald : C.amber} />
                {session?.verificationMethod && <Fact label="Verified via" value={humanise(session.verificationMethod)} />}
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
