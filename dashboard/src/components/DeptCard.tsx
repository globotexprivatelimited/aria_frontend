"use client";
import type { DeptConfig } from "../lib/departments";
import type { DeptPresence } from "../app/gm/departments/presence-actions";
import type { DeptMode, DeptModeRow } from "../app/gm/departments/mode-actions";

const INK = "#1B2621";

/** Each department carries its own colour so the board is scannable without reading. */
export const DEPT_SKIN: Record<string, { accent: string; tint: string; glyph: string }> = {
  fb:          { accent: "#B4703A", tint: "#FBF2E9", glyph: "M3 2v7c0 1.1.9 2 2 2h1v11h2V2M13 2v20h2V11h1a2 2 0 0 0 2-2V2" },
  housekeeping:{ accent: "#5B8C6E", tint: "#EEF5F0", glyph: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  spa:         { accent: "#7C7FA8", tint: "#F1F1F7", glyph: "M12 2c1 4 4 6 4 10a4 4 0 0 1-8 0c0-4 3-6 4-10z" },
  front_desk:  { accent: "#0F5F4C", tint: "#EAF2ED", glyph: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
  dining:      { accent: "#9B4A52", tint: "#FAEFF0", glyph: "M5 3v18M5 8h6a3 3 0 0 0 0-6H5M15 3c2 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2-5 4-8z" },
  maintenance: { accent: "#4E6B84", tint: "#EDF2F6", glyph: "M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4z" },
};
const skinOf = (d: string) => DEPT_SKIN[d] ?? DEPT_SKIN.front_desk;

const MODES: { k: DeptMode; label: string; hint: string }[] = [
  { k: "auto", label: "Auto", hint: "Guest is promised instantly; staff claim and deliver" },
  { k: "accept_decline", label: "Approve", hint: "A person approves before the guest is told yes" },
  { k: "maintenance", label: "Always on", hint: "Acknowledged, never declined, tracked to completion" },
];

type Stats = { open: number; inProgress: number; resolved: number; urgent: number };

export default function DeptCard({
  d, stats, presence, modes, onOpenDetail, onManage, onSetMode,
}: {
  d: DeptConfig;
  stats: Stats;
  presence?: DeptPresence;
  modes: DeptModeRow[];
  onOpenDetail: () => void;
  onManage: () => void;
  onSetMode: (mode: DeptMode) => void;
}) {
  const skin = skinOf(d.dept);
  const online = !!presence?.online;
  const names = (presence?.staff ?? []).map((s) => s.name).join(", ");
  const currentMode = (modes.find((m) => m.dept === d.dept)?.mode ?? d.type) as string;

  // the load arc: fills as work piles up, capped at six
  const load = Math.min(1, (stats.open + stats.inProgress) / 6);
  const R = 21, C = 2 * Math.PI * R;

  return (
    <div
      onClick={onOpenDetail}
      className="dept-card"
      style={{
        position: "relative", cursor: "pointer", overflow: "hidden",
        background: "linear-gradient(168deg,#FFFFFF 0%,#FDFCFA 58%," + skin.tint + " 100%)",
        border: "1px solid #EAE7DE", borderRadius: 18, padding: "22px 22px 18px 26px",
        transition: "transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s",
      }}
    >
      {/* colour spine */}
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: skin.accent, opacity: .9 }} />
      {/* urgent corner flag */}
      {stats.urgent > 0 ? (
        <span style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "34px solid #B23A2A", borderLeft: "34px solid transparent" }} />
      ) : null}

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* glyph inside the load arc */}
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx="26" cy="26" r={R} fill="none" stroke="#EFEBE2" strokeWidth="3" />
            <circle cx="26" cy="26" r={R} fill="none" stroke={skin.accent} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - load)} style={{ transition: "stroke-dashoffset .5s ease" }} />
          </svg>
          <span style={{ position: "absolute", inset: 9, borderRadius: 13, background: skin.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={skin.accent} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d={skin.glyph} />
            </svg>
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 600, color: INK, margin: 0, letterSpacing: "-.2px" }}>{d.label}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: online ? "#2ECC71" : "#CDC8BC", boxShadow: online ? "0 0 0 3px rgba(46,204,113,.18)" : "none", flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: online ? "#0F5F4C" : "#A8A395", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {online ? names : "No one on duty"}
            </span>
          </div>
        </div>
      </div>

      {/* stats, divided by hairlines */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 18, borderTop: "1px solid #F1EEE6", paddingTop: 14 }}>
        {[
          { n: stats.open, l: "waiting", c: stats.open > 0 ? skin.accent : "#C8CCC6" },
          { n: stats.inProgress, l: "working", c: stats.inProgress > 0 ? INK : "#C8CCC6" },
          { n: stats.resolved, l: "done", c: stats.resolved > 0 ? "#5B8C6E" : "#C8CCC6" },
        ].map((x, i) => (
          <div key={x.l} style={{ paddingLeft: i ? 14 : 0, borderLeft: i ? "1px solid #F1EEE6" : "none" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: x.c, lineHeight: 1 }}>{x.n}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395", marginTop: 3 }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* mode pills */}
      <div style={{ display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap" }}>
        {MODES.map((m) => {
          const on = currentMode === m.k;
          return (
            <button key={m.k} title={m.hint}
              onClick={(e) => { e.stopPropagation(); onSetMode(m.k); }}
              style={{
                borderRadius: 7, padding: "4px 10px", fontSize: 10.5, fontWeight: 600, cursor: "pointer",
                border: "1px solid " + (on ? skin.accent : "#EAE7DE"),
                background: on ? skin.tint : "#fff",
                color: on ? skin.accent : "#B4B9B3",
                transition: "all .16s",
              }}>{m.label}</button>
          );
        })}
        <button onClick={(e) => { e.stopPropagation(); onManage(); }}
          className="dept-manage"
          style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5,
            borderRadius: 8, padding: "5px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            border: "1px solid " + skin.accent + "33", background: "#fff", color: skin.accent, transition: "all .16s",
          }}>
          Manage
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <style>{`
        .dept-card:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(27,38,33,.09); }
        .dept-card:active { transform: translateY(-1px); }
        .dept-manage:hover { background: ${skin.tint} !important; }
        @media (prefers-reduced-motion: reduce) { .dept-card { transition: none !important; } }
      `}</style>
    </div>
  );
}
