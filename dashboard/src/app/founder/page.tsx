"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPortfolio, type Portfolio, type HotelSummary } from "./portfolio-actions";


const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");

const TONE = {
  live:    { accent: "#0F5F4C", tint: "#EDF4F0", label: "Live" },
  quiet:   { accent: "#7C7FA8", tint: "#F1F1F7", label: "Quiet" },
  setup:   { accent: "#B4703A", tint: "#FBF2E9", label: "Needs setup" },
  off:     { accent: "#8A8577", tint: "#F4F3EF", label: "Inactive" },
};
function toneFor(h: HotelSummary) {
  if (!h.isActive) return TONE.off;
  if (h.rooms.total === 0) return TONE.setup;
  if (h.rooms.occupied > 0 || h.requests.open > 0) return TONE.live;
  return TONE.quiet;
}
const ago = (iso: string | null) => {
  if (!iso) return "no activity yet";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  return h < 24 ? h + "h ago" : Math.floor(h / 24) + "d ago";
};

export default function FounderPage() {
  const router = useRouter();
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    const p = await getPortfolio(tk);
    setData(p); setLoading(false);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv); }, [load]);

  const t = data?.totals ?? {};
  const hotels = data?.hotels ?? [];
  const needSetup = hotels.filter((h) => h.rooms.total === 0 && h.isActive);
  const unverified = hotels.filter((h) => !h.emailVerified);

  const stat = (label: string, value: string, accent: string, caption?: string) => (
    <div key={label} style={{ padding: "16px 18px", borderRadius: 14, background: "#fff", border: "1px solid #EAE7DE", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: accent }} />
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#A8A395" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 27, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{value}</div>
      {caption ? <div style={{ fontSize: 11, color: "#9AA09A", marginTop: 4 }}>{caption}</div> : null}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F4", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 30px 60px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Every hotel, one view</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Portfolio</h1>
          </div>

        </div>

        {loading ? <div style={{ color: "#B4B9B3", fontSize: 14, marginTop: 30 }}>Loading the portfolio&hellip;</div> : null}

        {!loading && data ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(158px,1fr))", gap: 12, marginTop: 22 }}>
              {stat("Hotels", String(t.hotels ?? 0), GREEN, (t.hotels ?? 0) - needSetup.length + " live")}
              {stat("Guests in house", String(t.guests ?? 0), "#B4703A", (t.occupied ?? 0) + " rooms occupied")}
              {stat("Staff", String(t.staff ?? 0), "#7C7FA8", (t.onDuty ?? 0) + " on duty now")}
              {stat("Open requests", String(t.openRequests ?? 0), (t.urgent ?? 0) > 0 ? RED : "#5B8C6E", (t.urgent ?? 0) + " urgent")}
              {stat("Revenue today", money(t.revenueToday ?? 0), GREEN, money(t.revenueWeek ?? 0) + " this week")}
              {stat("Missed", money(t.missedLoss ?? 0), RED, "estimated, unserved")}
            </div>

            {(needSetup.length > 0 || unverified.length > 0) ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {needSetup.length > 0 ? (
                  <div style={{ borderRadius: 12, padding: "11px 16px", background: "#FBF3E6", border: "1px solid #EDD9B4", color: "#8A6420", fontSize: 13.5 }}>
                    <b>{needSetup.length} hotel{needSetup.length === 1 ? "" : "s"} not set up</b> &mdash; {needSetup.map((h) => h.name).join(", ")} {needSetup.length === 1 ? "has" : "have"} no rooms yet.
                  </div>
                ) : null}
                {unverified.length > 0 ? (
                  <div style={{ borderRadius: 12, padding: "11px 16px", background: "#F5F5F0", border: "1px solid #E7E3D8", color: "#6E756F", fontSize: 13.5 }}>
                    <b>{unverified.map((h) => h.name).join(", ")}</b> {unverified.length === 1 ? "has" : "have"} not confirmed their email.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14, marginTop: 20 }}>
              {hotels.map((h) => {
                const tone = toneFor(h);
                return (
                  <div key={h.hotelId}
                    onClick={() => router.push("/founder/hotels/" + h.hotelId)}
                    className="hotel-card"
                    style={{ position: "relative", overflow: "hidden", cursor: "pointer", borderRadius: 17, padding: "20px 20px 17px 23px",
                      background: "linear-gradient(160deg,#FFFFFF 0%,#FEFDFC 55%," + tone.tint + " 100%)",
                      border: "1px solid #EAE7DE", transition: "transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s" }}>
                    <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: tone.accent }} />
                    {h.requests.urgent > 0 ? <span style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "30px solid " + RED, borderLeft: "30px solid transparent" }} /> : null}

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 600, color: INK, margin: 0 }}>{h.name}</h3>
                        <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 3 }}>
                          {h.city ? h.city + " \u00b7 " : ""}hotel {h.hotelId} &middot; {ago(h.lastActivity)}
                        </div>
                      </div>
                      <span style={{ borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", background: tone.tint, color: tone.accent, whiteSpace: "nowrap" }}>{tone.label}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 15 }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: h.rooms.total ? tone.accent : "#C8CCC6", lineHeight: 1 }}>{h.rooms.occupancyPct}%</span>
                      <span style={{ fontSize: 11.5, color: "#9AA09A" }}>occupied &middot; {h.rooms.occupied}/{h.rooms.total || "\u2014"} rooms</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "#F1EEE6", marginTop: 8, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: h.rooms.occupancyPct + "%", background: tone.accent, transition: "width .5s" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginTop: 15, paddingTop: 13, borderTop: "1px solid #F1EEE6" }}>
                      {[
                        { n: h.guestsInHouse, l: "guests" },
                        { n: h.staff.onDuty, l: "on duty" },
                        { n: h.requests.open, l: "waiting" },
                        { n: h.missed.count, l: "missed" },
                      ].map((x) => (
                        <div key={x.l}>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: x.n > 0 ? INK : "#C8CCC6", lineHeight: 1 }}>{x.n}</div>
                          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".07em", color: "#A8A395", marginTop: 3 }}>{x.l}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 13 }}>
                      <span style={{ fontSize: 12.5, color: "#6E756F" }}>
                        <b style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 15 }}>{money(h.revenue.today)}</b> today
                      </span>
                      <span style={{ fontSize: 11.5, color: tone.accent, fontWeight: 600 }}>Open &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {!loading && !data ? (
          <div style={{ marginTop: 26, padding: "30px 0", textAlign: "center", color: "#B4B9B3", fontSize: 14, border: "1px dashed #E3DECF", borderRadius: 14 }}>
            Could not load the portfolio. Check that the API is running.
          </div>
        ) : null}
      </div>
      <style>{`.hotel-card:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(27,38,33,.09); }`}</style>
    </div>
  );
}
