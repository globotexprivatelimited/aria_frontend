"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";
import { getOfferReport, type OfferReport, type OfferRow } from "./suggestions-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621", MUTED = "#8A8577";
const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }) as const;
const title = { fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK } as const;
const money = (n: number) => "Rs " + Math.round(n).toLocaleString("en-IN");
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => { const f = () => setM(window.innerWidth < 760); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return m;
}

function Status({ s }: { s: OfferRow["status"] }) {
  const color = s === "accepted" ? GREEN : s === "declined" ? RED : s === "skipped" ? MUTED : AMBER;
  const text = s === "accepted" ? "Accepted" : s === "declined" ? "Not taken" : s === "skipped" ? "AI left it out" : s === "offered" ? "Offered" : "Proposed";
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "14", border: "1px solid " + color + "55", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>{text}</span>;
}

export default function SuggestionsPage() {
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const isMobile = useIsMobile();
  const [days, setDays] = useState(30);
  const [r, setR] = useState<OfferReport | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!HOTEL_ID) return; setLoading(true); setR(await getOfferReport(HOTEL_ID, days)); setLoading(false); }, [HOTEL_ID, days]);
  useEffect(() => { void load(); }, [load]);
  const tile = (label: string, value: string, sub: string, color = INK) => (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: "#9AA09A", fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK }}>Suggestions</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Revenue from what Aria suggested at {hotelName || "your hotel"}. The item and price are chosen by your pairings and the live menu; Aria only writes the sentence. Test guests are left out.</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} style={btn(days === d ? GREEN : "#fff", days === d ? "#fff" : INK, days === d ? GREEN : "#E9E4D8")}>{d} days</button>)}
          </div>
        </div>
        {loading && !r ? <div style={{ ...card, color: MUTED, fontSize: 13 }}>Loading...</div> : null}
        {r ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {tile("Offered", String(r.offered), r.skipped ? r.skipped + " more proposed but the AI left them out" : "spoken to guests")}
              {tile("Accepted", String(r.accepted), r.declined + " not taken", GREEN)}
              {tile("Acceptance", r.acceptanceRate + "%", "of offers turned into an order")}
              {tile("Revenue", money(r.revenue), "from accepted suggestions", GREEN)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <div style={card}>
                <div style={title}>By item</div>
                {!r.byItem.length ? <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>Nothing offered in this period. Suggestions come from <Link href="/gm/departments" style={{ color: GREEN, fontWeight: 600 }}>menu pairings</Link> and the time of day; the limits are in <Link href="/gm/settings" style={{ color: GREEN, fontWeight: 600 }}>Settings</Link>.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 13 }}>
                    <thead><tr style={{ color: "#9AA09A", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}><th style={{ textAlign: "left", padding: "6px 4px" }}>Item</th><th style={{ textAlign: "right", padding: "6px 4px" }}>Offered</th><th style={{ textAlign: "right", padding: "6px 4px" }}>Accepted</th><th style={{ textAlign: "right", padding: "6px 4px" }}>Revenue</th></tr></thead>
                    <tbody>{r.byItem.map((x) => <tr key={x.itemName} style={{ borderTop: "1px solid #F0EDE4" }}><td style={{ padding: "7px 4px", color: INK }}>{x.itemName}</td><td style={{ padding: "7px 4px", textAlign: "right" }}>{x.offered}</td><td style={{ padding: "7px 4px", textAlign: "right", color: GREEN, fontWeight: 600 }}>{x.accepted}</td><td style={{ padding: "7px 4px", textAlign: "right" }}>{money(x.revenue)}</td></tr>)}</tbody>
                  </table>
                )}
              </div>
              <div style={card}>
                <div style={title}>Latest offers</div>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {r.recent.map((o) => (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderTop: "1px solid #F0EDE4", paddingTop: 8 }}>
                      <div style={{ fontSize: 13, color: INK, minWidth: 0 }}>
                        <b>{o.itemName}</b> at {money(o.price)}{o.reason ? <span style={{ color: MUTED }}> - {o.reason}</span> : null}
                        <div style={{ fontSize: 11, color: MUTED }}>{when(o.offeredAt ?? o.proposedAt)} - <Link href={"/gm/conversations/" + encodeURIComponent(o.guestPhone)} style={{ color: GREEN }}>{o.guestPhone}</Link>{o.status === "accepted" ? " - " + money(o.revenue) : ""}</div>
                      </div>
                      <Status s={o.status} />
                    </div>
                  ))}
                  {!r.recent.length ? <div style={{ fontSize: 13, color: MUTED }}>No offers yet.</div> : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
