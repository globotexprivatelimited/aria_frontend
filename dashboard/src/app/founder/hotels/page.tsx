"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPortfolio, type Portfolio, type HotelSummary } from "../portfolio-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const rupee = "\u20B9";
const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");
type SortKey = "name" | "rooms" | "occupancy" | "revenue" | "open" | "staff";

export default function FounderHotelsPage() {
  const router = useRouter();
  const [d, setD] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("revenue");
  const [desc, setDesc] = useState(true);

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setD(await getPortfolio(tk)); setLoading(false);
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);

  const val = (h: HotelSummary, k: SortKey): number | string => {
    switch (k) {
      case "name": return h.name.toLowerCase();
      case "rooms": return h.rooms.total;
      case "occupancy": return h.rooms.occupancyPct;
      case "revenue": return h.revenue.total;
      case "open": return h.requests.open;
      case "staff": return h.staff.total;
    }
  };
  const hotels = (d?.hotels ?? []).slice().sort((a, b) => {
    const x = val(a, sort), y = val(b, sort);
    const c = typeof x === "string" ? String(x).localeCompare(String(y)) : Number(x) - Number(y);
    return desc ? -c : c;
  });

  const head = (k: SortKey, label: string, align: "left" | "right" = "right") => (
    <button onClick={() => { if (sort === k) setDesc((v) => !v); else { setSort(k); setDesc(true); } }}
      style={{ background: "transparent", border: 0, cursor: "pointer", padding: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, color: sort === k ? GREEN : "#A8A395", textAlign: align, width: "100%" }}>
      {label}{sort === k ? (desc ? " \u2193" : " \u2191") : ""}
    </button>
  );
  const cell = { padding: "13px 12px", fontSize: 13.5, color: INK } as const;

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Every property</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Hotels</h1>

      {loading ? <div style={{ color: "#B4B9B3", marginTop: 24 }}>Loading&hellip;</div> : null}

      {!loading && d ? (
        <div style={{ background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, marginTop: 20, overflowX: "auto" }}>
          <div style={{ minWidth: 860 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr .8fr 1fr .8fr .8fr 1fr 1fr .8fr", padding: "12px 12px", borderBottom: "1px solid #F1EEE6", background: "#FBFAF6" }}>
              <div style={{ textAlign: "left" }}>{head("name", "Hotel", "left")}</div>
              <div>{head("rooms", "Rooms")}</div>
              <div>{head("occupancy", "Occupied")}</div>
              <div>{head("staff", "Staff")}</div>
              <div>{head("open", "Open")}</div>
              <div>{head("revenue", "Revenue")}</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, color: "#A8A395", textAlign: "right" }}>Missed</div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, color: "#A8A395", textAlign: "right" }}>State</div>
            </div>
            {hotels.map((h, i) => (
              <div key={h.hotelId} onClick={() => router.push("/founder/hotels/" + h.hotelId)}
                style={{ display: "grid", gridTemplateColumns: "2fr .8fr 1fr .8fr .8fr 1fr 1fr .8fr", borderTop: i ? "1px solid #F4F2EC" : "none", cursor: "pointer" }}>
                <div style={{ ...cell, textAlign: "left" }}>
                  <div style={{ fontWeight: 600 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: "#9AA09A" }}>{h.city ?? "\u2014"} &middot; hotel {h.hotelId}</div>
                </div>
                <div style={{ ...cell, textAlign: "right" }}>{h.rooms.total || "\u2014"}</div>
                <div style={{ ...cell, textAlign: "right" }}>{h.rooms.total ? h.rooms.occupied + " (" + h.rooms.occupancyPct + "%)" : "\u2014"}</div>
                <div style={{ ...cell, textAlign: "right" }}>{h.staff.total}{h.staff.onDuty > 0 ? <span style={{ color: "#2ECC71" }}> &bull;{h.staff.onDuty}</span> : null}</div>
                <div style={{ ...cell, textAlign: "right", color: h.requests.open > 0 ? RED : "#C8CCC6", fontWeight: h.requests.open > 0 ? 700 : 400 }}>{h.requests.open}</div>
                <div style={{ ...cell, textAlign: "right", fontFamily: "Georgia, serif", fontWeight: 600 }}>{money(h.revenue.total)}</div>
                <div style={{ ...cell, textAlign: "right", color: h.missed.estimatedLoss > 0 ? RED : "#C8CCC6" }}>{h.missed.count ? money(h.missed.estimatedLoss) : "\u2014"}</div>
                <div style={{ ...cell, textAlign: "right" }}>
                  <span style={{ borderRadius: 999, padding: "3px 9px", fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", background: !h.isActive ? "#F4F3EF" : h.rooms.total === 0 ? "#FBF2E9" : "#EDF4F0", color: !h.isActive ? "#8A8577" : h.rooms.total === 0 ? "#B4703A" : GREEN }}>
                    {!h.isActive ? "off" : h.rooms.total === 0 ? "setup" : "live"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
