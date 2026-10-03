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
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 14 }}>
      {items.map((k) => {
        const t = KPI_TONES[k.key] ?? KPI_TONES.open;
        const live = k.value > 0;
        const share = Math.max(0, Math.min(1, k.share ?? 0));
        return (
          <div key={k.label} className="kpi-card" style={{
            position: "relative", overflow: "hidden", borderRadius: 18, padding: "18px 18px 16px",
            background: "linear-gradient(165deg, #FFFFFF 0%, #FAFCFB 50%, " + t.tint + " 100%)",
            border: "1px solid " + (live ? t.accent + "33" : "#E2EBE7"),
            boxShadow: "0 4px 18px rgba(47,93,80,0.05), 0 1px 3px rgba(0,0,0,0.02)",
            transition: "transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s ease",
          }}>
            {/* colour bloom */}
            <span aria-hidden style={{ position: "absolute", top: -34, right: -24, width: 110, height: 110, borderRadius: 999, background: "radial-gradient(circle," + t.bloom + " 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, color: live ? t.accent : "#8A9490", lineHeight: 1.35, maxWidth: 110 }}>{k.label}</span>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: live ? t.tint : "#F2F5F4", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid " + (live ? t.accent + "2A" : "#E2EBE7"), boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={live ? t.accent : "#A0ABA6"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={GLYPH[k.key] ?? GLYPH.open} /></svg>
              </span>
            </div>

            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 700, color: live ? INK : "#C8CCC6", lineHeight: 1.05, marginTop: 12, letterSpacing: "-.5px" }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: "#7B8782", marginTop: 6, fontWeight: 400 }}>{k.caption}</div>

            {/* share of the board along the bottom edge */}
            <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3.5, background: "#E8EFEA" }}>
              <span style={{ display: "block", height: "100%", width: (share * 100) + "%", background: "linear-gradient(90deg, " + t.accent + ", #B08A4F)", opacity: .9, transition: "width .6s cubic-bezier(.16,1,.3,1)" }} />
            </span>
          </div>
        );
      })}
      <style>{`
        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(47,93,80,.12); border-color: rgba(47,93,80,0.3) !important; }
        @media (prefers-reduced-motion: reduce) { .kpi-card { transition: none !important; } }
      `}</style>
    </div>
  );
}
