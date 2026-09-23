"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPortfolio, type Portfolio } from "../portfolio-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");

export default function FounderRevenuePage() {
  const router = useRouter();
  const [d, setD] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setD(await getPortfolio(tk)); setLoading(false);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  const hotels = (d?.hotels ?? []).slice().sort((a, b) => b.revenue.total - a.revenue.total);
  const t = d?.totals ?? {};
  const shareTotal = hotels.reduce((s, h) => s + h.revenue.total * (h.revenueSharePercent / 100), 0);
  const maxRev = Math.max(1, ...hotels.map((h) => h.revenue.total));
  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Across the portfolio</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Revenue</h1>

      {loading ? <div style={{ color: "#B4B9B3", marginTop: 24 }}>Loading&hellip;</div> : null}

      {!loading && d ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 11, marginTop: 20 }}>
            {[
              { l: "Today", v: money(t.revenueToday ?? 0), c: GREEN },
              { l: "This week", v: money(t.revenueWeek ?? 0), c: "#5B8C6E" },
              { l: "All time", v: money(t.revenueTotal ?? 0), c: INK },
              { l: "Your share", v: money(shareTotal), c: GOLD, s: "from agreed percentages" },
              { l: "Missed", v: money(t.missedLoss ?? 0), c: RED, s: "demand not served" },
            ].map((x) => (
              <div key={x.l} style={{ ...card, padding: "15px 17px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
                {x.s ? <div style={{ fontSize: 10.5, color: "#9AA09A", marginTop: 4 }}>{x.s}</div> : null}
              </div>
            ))}
          </div>

          {shareTotal === 0 && (t.revenueTotal ?? 0) > 0 ? (
            <div style={{ marginTop: 14, borderRadius: 12, padding: "11px 16px", background: "#FBF3E6", border: "1px solid #EDD9B4", color: "#8A6420", fontSize: 13.5 }}>
              No revenue share is set on any hotel, so your share reads zero. Set a percentage per hotel to track it.
            </div>
          ) : null}

          <div style={{ ...card, marginTop: 18, padding: 20 }}>
            <div style={{ ...lbl, marginBottom: 14 }}>By hotel</div>
            {hotels.map((h) => {
              const pct = Math.round((h.revenue.total / maxRev) * 100);
              return (
                <div key={h.hotelId} onClick={() => router.push("/founder/hotels/" + h.hotelId)} style={{ cursor: "pointer", marginBottom: 15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>{h.name}
                      <span style={{ fontSize: 11, color: "#B4B9B3", marginLeft: 8 }}>{h.revenueSharePercent}% share</span>
                    </span>
                    <span style={{ fontSize: 12.5, color: "#6E756F" }}>
                      <b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 15 }}>{money(h.revenue.total)}</b>
                      <span style={{ color: GOLD, marginLeft: 9 }}>you: {money(h.revenue.total * (h.revenueSharePercent / 100))}</span>
                      {h.missed.estimatedLoss > 0 ? <span style={{ color: RED, marginLeft: 9 }}>missed {money(h.missed.estimatedLoss)}</span> : null}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#F3F1EA", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: Math.max(2, pct) + "%", background: GREEN, transition: "width .5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
