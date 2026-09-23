"use client";

const INK = "#1B2621";

export type KpiTone = { accent: string; tint: string; bloom: string };
export const KPI_TONES: Record<string, KpiTone> = {
  guests:   { accent: "#0F5F4C", tint: "#EDF4F0", bloom: "rgba(15,95,76,.14)" },
  open:     { accent: "#B4703A", tint: "#FBF2E9", bloom: "rgba(180,112,58,.16)" },
  progress: { accent: "#6B6FA0", tint: "#F0F0F8", bloom: "rgba(107,111,160,.16)" },
  resolved: { accent: "#5B8C6E", tint: "#EEF5F0", bloom: "rgba(91,140,110,.15)" },
  urgent:   { accent: "#B23A2A", tint: "#FBEDE9", bloom: "rgba(178,58,42,.16)" },
};

const GLYPH: Record<string, string> = {
  guests: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  open: "M12 8v5l3 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z",
  progress: "M12 2a10 10 0 1 0 10 10M12 2v10l7 7",
  resolved: "M20 6L9 17l-5-5",
  urgent: "M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17v.5",
};

export type Kpi = { key: keyof typeof KPI_TONES | string; label: string; value: number; caption: string; share?: number };

export default function GMKpiCards({ items, columns }: { items: Kpi[]; columns: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 13 }}>
      {items.map((k) => {
        const t = KPI_TONES[k.key] ?? KPI_TONES.open;
        const live = k.value > 0;
        const share = Math.max(0, Math.min(1, k.share ?? 0));
        return (
          <div key={k.label} className="kpi-card" style={{
            position: "relative", overflow: "hidden", borderRadius: 16, padding: "17px 17px 15px",
            background: "linear-gradient(155deg,#FFFFFF 0%,#FEFDFC 42%," + t.tint + " 100%)",
            border: "1px solid " + (live ? t.accent + "2E" : "#EDEAE2"),
            transition: "transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s",
          }}>
            {/* colour bloom */}
            <span aria-hidden style={{ position: "absolute", top: -34, right: -24, width: 108, height: 108, borderRadius: 999, background: "radial-gradient(circle," + t.bloom + " 0%, transparent 68%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".11em", fontWeight: 700, color: live ? t.accent : "#A8A395", lineHeight: 1.4, maxWidth: 92 }}>{k.label}</span>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: live ? t.tint : "#F5F4EF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid " + (live ? t.accent + "26" : "#EDEAE2") }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={live ? t.accent : "#C4C0B6"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={GLYPH[k.key] ?? GLYPH.open} /></svg>
              </span>
            </div>

            <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: live ? INK : "#C8CCC6", lineHeight: 1, marginTop: 12, letterSpacing: "-.5px" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 5 }}>{k.caption}</div>

            {/* share of the board along the bottom edge */}
            <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "#F2F0EA" }}>
              <span style={{ display: "block", height: "100%", width: (share * 100) + "%", background: t.accent, opacity: .85, transition: "width .6s cubic-bezier(.16,1,.3,1)" }} />
            </span>
          </div>
        );
      })}
      <style>{`
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(27,38,33,.08); }
        @media (prefers-reduced-motion: reduce) { .kpi-card { transition: none !important; } }
      `}</style>
    </div>
  );
}
