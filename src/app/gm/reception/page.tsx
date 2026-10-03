"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getRooms, getRoomStats, getRoomTarget, checkInRoom, checkOutRoom, markRoomClean, setupRooms, editRoom, deleteRoom, clearFloor, type Room, type RoomStats } from "./rooms-actions";
import RoomSetup from "../../../components/RoomSetup";
import RoomModal from "../../../components/RoomModal";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import CheckInPanel from "../../../components/CheckInPanel";
import { ReceptionSkeleton } from "../../../components/Skeleton";

const GREEN = "#2F5D50", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#0D1F1A";
const STATUS = {
  available: { c: GREEN, bg: "#EBF3F0", border: "#A8D0C3", label: "Available" },
  occupied: { c: RED, bg: "#FBEDE9", border: "#F0C1B8", label: "Occupied" },
  cleaning: { c: AMBER, bg: "#FDF7E7", border: "#EAD69E", label: "Housekeeping" },
} as const;

function hoursLeft(iso: string | null): { text: string; urgent: boolean } {
  if (!iso) return { text: "", urgent: false };
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { text: "overdue", urgent: true };
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return { text: h >= 24 ? Math.floor(h / 24) + "d " + (h % 24) + "h left" : h + "h " + m + "m left", urgent: h < 2 };
}
function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ReceptionBoard() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats>({ total: 0, available: 0, occupied: 0, cleaning: 0, occupancyPct: 0 });
  const [hover, setHover] = useState<Room | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, bottom: 0 });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  const [target, setTarget] = useState(0);
  const [loading, setLoading] = useState(true);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    try {
      const [r, s, t] = await Promise.all([getRooms(HOTEL_ID), getRoomStats(HOTEL_ID), getRoomTarget(HOTEL_ID)]);
      setRooms(r); setStats(s); setTarget(t.target);
    } finally {
      setLoading(false);
    }
  }, [HOTEL_ID]);
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, [load, HOTEL_ID]);

  const types = useMemo(() => Array.from(new Set(rooms.map((r) => r.room_type))), [rooms]);
  const shown = typeFilter === "all" ? rooms : rooms.filter((r) => r.room_type === typeFilter);
  const floors = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const r of shown) { if (!map.has(r.floor)) map.set(r.floor, []); map.get(r.floor)!.push(r); }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]); // top floor first
  }, [shown]);

  async function handleSetup(floors: { floor: number; count: number; type: string; prefix: string }[]) {
    const r = await setupRooms(HOTEL_ID!, floors);
    if (r.ok) { flash("Created " + r.created + " rooms"); setShowSetup(false); load(); } else flash(r.message ?? "failed");
  }
  async function doCheckIn(rm: string, guestName: string, guestPhone: string, partySize: number, checkOut: string) { const r = await checkInRoom(HOTEL_ID!, rm, guestName, guestPhone, partySize, checkOut); if (r.ok) { flash("Checked in to Room " + rm); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doCheckout(rm: string) { const r = await checkOutRoom(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " checked out"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doClean(rm: string) { const r = await markRoomClean(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " ready"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doEdit(rm: string, changes: { room_type?: string; floor?: number; newNumber?: string }) { const r = await editRoom(HOTEL_ID!, rm, changes); if (r.ok) { flash("Room updated"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doDelete(rm: string) { const r = await deleteRoom(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " deleted"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doClearFloor(fl: number, count: number) { if (!confirm("Delete all " + count + " rooms on floor " + fl + "? They will be removed from your hotel and this cannot be undone.")) return; const r = await clearFloor(HOTEL_ID!, fl); if (r.ok) { flash("Deleted " + r.deleted + " rooms from floor " + fl); load(); } else flash(r.message ?? "failed"); }
  async function doCheckoutFloor(fl: number, rooms: string[]) { if (!confirm("Check out all " + rooms.length + " guest" + (rooms.length === 1 ? "" : "s") + " on floor " + fl + " and mark the rooms ready? Their stays end now.")) return; const results = await Promise.all(rooms.map(async (rm) => { const out = await checkOutRoom(HOTEL_ID!, rm); return out.ok ? markRoomClean(HOTEL_ID!, rm) : out; })); const failed = results.filter((r) => !r.ok); flash(failed.length ? (rooms.length - failed.length) + " of " + rooms.length + " checked out - " + (failed[0].message ?? "some could not be updated") : "Floor " + fl + " cleared - " + rooms.length + " guest" + (rooms.length === 1 ? "" : "s") + " checked out, rooms ready"); load(); }
  async function doCleanFloor(fl: number, rooms: string[]) { const results = await Promise.all(rooms.map((rm) => markRoomClean(HOTEL_ID!, rm))); const failed = results.filter((r) => !r.ok); flash(failed.length ? (rooms.length - failed.length) + " of " + rooms.length + " rooms marked ready - " + (failed[0].message ?? "some could not be updated") : rooms.length + " room" + (rooms.length === 1 ? "" : "s") + " on floor " + fl + " ready"); load(); }

  const card = {
    background: "#FFFFFF",
    border: "1px solid #E2EBE7",
    borderRadius: 18,
    padding: isMobile ? "16px 14px" : "22px 24px",
    boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05), 0 1px 3px rgba(0,0,0,0.02)",
  };

  const kpis = [
    { label: "Total suites", value: stats.total, color: INK, sub: "all keys configured" },
    { label: "Occupied", value: stats.occupied, color: RED, sub: "active guest stays" },
    { label: "Available", value: stats.available, color: GREEN, sub: "ready for check-in" },
    { label: "Housekeeping", value: stats.cleaning, color: AMBER, sub: "cleaning in progress" },
    { label: "Occupancy", value: stats.occupancyPct + "%", color: INK, sub: "property utilization" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "18px 14px 48px" : "28px 36px 64px" }}>

        {loading ? (
          <ReceptionSkeleton />
        ) : (
          <>
            {/* Grandoria Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "#B08A4F", fontSize: 11, letterSpacing: 2 }}>★★★★★</span>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Reception &middot; Room Inventory</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em" }}>
                  {hotelName} &middot; Room Board
                </h1>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4A5D56", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 999, padding: "7px 14px", boxShadow: "0 2px 8px rgba(47,93,80,.05)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71", boxShadow: "0 0 0 3px rgba(46,204,113,.2)" }} />Live &middot; Synced 15s
                </div>
                <button onClick={() => setShowSetup((v) => !v)} style={{ borderRadius: 999, padding: "8px 18px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "1px solid " + (showSetup ? "#2F5D50" : "#D0DCD6"), background: showSetup ? "#2F5D50" : "#FFFFFF", color: showSetup ? "#FFFFFF" : "#2F5D50", boxShadow: "0 2px 8px rgba(47,93,80,.08)", transition: "all .18s" }}>
                  {showSetup ? "Close setup" : "+ Manage rooms"}
                </button>
              </div>
            </div>

            {toast ? <div style={{ marginBottom: 14, borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500, background: "#EBF3F0", color: GREEN, border: "1px solid #C0DDD3", boxShadow: "0 4px 12px rgba(47,93,80,.08)" }}>{toast}</div> : null}

            {(showSetup || rooms.length === 0) ? (
              <div style={{ marginBottom: 20 }}>
                <RoomSetup onSave={handleSetup} existingCount={rooms.length} target={target} />
              </div>
            ) : null}

            {/* Check-in panel */}
            <div style={{ marginBottom: 22 }}>
              <CheckInPanel hotelId={HOTEL_ID as string} rooms={rooms} onDone={load} />
            </div>

            {/* Grandoria KPI Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : isTablet ? "repeat(3, minmax(0, 1fr))" : "repeat(5, 1fr)", gap: 14, marginBottom: 22 }}>
              {kpis.map((k) => (
                <div key={k.label} style={{ ...card, padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "#8A9792", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>{k.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: k.color, marginTop: 4, letterSpacing: "-0.01em" }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: "#8A9792", marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Filter bar & legend */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18, background: "#FFFFFF", padding: "12px 18px", borderRadius: 14, border: "1px solid #E2EBE7" }}>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#4A5D56", flexWrap: "wrap" }}>
                {(["available", "occupied", "cleaning"] as const).map((s) => (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS[s].c }} />
                    <span>{STATUS[s].label}</span>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setTypeFilter("all")} style={{ borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (typeFilter === "all" ? GREEN : "#D0DCD6"), background: typeFilter === "all" ? GREEN : "#FFFFFF", color: typeFilter === "all" ? "#FFFFFF" : "#4A5D56", transition: "all .15s" }}>All suites</button>
                {types.map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} style={{ borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (typeFilter === t ? GREEN : "#D0DCD6"), background: typeFilter === t ? GREEN : "#FFFFFF", color: typeFilter === t ? GREEN : "#4A5D56", transition: "all .15s" }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Floors */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {floors.map(([floor, fRooms]) => {
                const occupiedCount = fRooms.filter((r) => r.status === "occupied").length;
                const pct = Math.round((occupiedCount / fRooms.length) * 100);
                return (
                  <div key={floor} style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: INK }}>Floor {floor}</span>
                        <span style={{ fontSize: 11, color: "#8A9792", fontWeight: 500 }}>{occupiedCount}/{fRooms.length} occupied ({pct}%)</span>
                      </div>

                      {/* Floor Progress Bar */}
                      <div style={{ flex: 1, minWidth: 100, height: 6, background: "#F1F6F4", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg, #2F5D50, #B08A4F)", borderRadius: 999, transition: "width .4s ease" }} />
                      </div>

                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {(() => { const busy = fRooms.filter((r) => r.status === "occupied"); return busy.length ? <button onClick={() => doCheckoutFloor(floor, busy.map((r) => r.room_number))} title="Check out every guest on this floor and mark the rooms ready" style={{ fontSize: 11, fontWeight: 600, color: RED, background: "#FBEDE9", border: "1px solid #F0C1B8", borderRadius: 999, padding: "4px 12px", cursor: "pointer", transition: "opacity .15s" }}>Clear floor ({busy.length})</button> : null; })()}
                        {(() => { const dirty = fRooms.filter((r) => r.status === "cleaning"); return dirty.length ? <button onClick={() => doCleanFloor(floor, dirty.map((r) => r.room_number))} title="Mark every room on this floor that is being cleaned as ready" style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: "#EBF3F0", border: "1px solid #C0DDD3", borderRadius: 999, padding: "4px 12px", cursor: "pointer", transition: "opacity .15s" }}>Mark {dirty.length} ready</button> : null; })()}
                        {fRooms.every((r) => r.status !== "occupied") ? <button onClick={() => doClearFloor(floor, fRooms.length)} title="Remove every room on this floor from your hotel" style={{ fontSize: 11, color: "#8A9792", background: "#F8FAF9", border: "1px solid #E2EBE7", borderRadius: 999, padding: "4px 12px", cursor: "pointer" }}>Delete floor</button> : null}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 10 }}>
                      {fRooms.map((r) => {
                        const st = STATUS[r.status as keyof typeof STATUS] ?? STATUS.available;
                        return (
                          <div key={r.id}
                            onMouseEnter={(e) => { const b = e.currentTarget.getBoundingClientRect(); setPos({ x: b.left + b.width / 2, y: b.top, bottom: b.bottom }); setHover(r); }}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => { setHover(null); setSelected(r); }}
                            style={{
                              aspectRatio: "1",
                              borderRadius: 12,
                              background: st.bg,
                              border: "1.5px solid " + st.border,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all .15s ease",
                              position: "relative",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 8px 18px rgba(47,93,80,.16)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.02)"; }}>
                            <span style={{ width: 5, height: 5, borderRadius: 999, background: st.c, position: "absolute", top: 6, right: 6 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: st.c, fontFamily: "'Josefin Sans', 'Poppins', sans-serif" }}>{r.room_number}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* room action modal */}
      {selected ? <RoomModal room={selected} handlers={{ onCheckIn: doCheckIn, onCheckOut: doCheckout, onClean: doClean, onEdit: doEdit, onDelete: doDelete, onClose: () => setSelected(null) }} /> : null}

      {/* hover tooltip */}
      {hover ? (
        <div style={{ position: "fixed", ...(() => { const vw = typeof window !== "undefined" ? window.innerWidth : 1200; const vh = typeof window !== "undefined" ? window.innerHeight : 800; const up = pos.y > 250; return { left: Math.max(118, Math.min(pos.x, vw - 118)), top: up ? pos.y - 12 : pos.bottom + 12, transform: up ? "translate(-50%,-100%)" : "translate(-50%,0)" }; })(), zIndex: 100, width: 230, background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 14, boxShadow: "0 14px 34px rgba(47,93,80,.18)", padding: 16, pointerEvents: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, color: INK }}>Suite {hover.room_number}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: (STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).c, background: (STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).bg, border: "1px solid " + (STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).border, borderRadius: 999, padding: "2px 8px" }}>{(STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).label}</span>
          </div>
          <div style={{ fontSize: 12, color: "#8A9792", marginBottom: hover.status === "occupied" ? 8 : 0 }}>{hover.room_type} &middot; Floor {hover.floor}</div>
          {hover.status === "occupied" ? (
            <div style={{ borderTop: "1px solid #F1F6F4", paddingTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{hover.guest_name || "Guest"}</div>
              {hover.party_size ? <div style={{ fontSize: 11, color: "#8A9792", marginTop: 1 }}>{hover.party_size} guest{hover.party_size === 1 ? "" : "s"}</div> : null}
              <div style={{ fontSize: 12, color: "#4A5D56", marginTop: 6 }}>Checkout: {fmtTime(hover.check_out)}</div>
              {(() => { const h = hoursLeft(hover.check_out); return h.text ? <div style={{ fontSize: 11.5, fontWeight: 700, color: h.urgent ? RED : GREEN, marginTop: 3 }}>{h.text}</div> : null; })()}
            </div>
          ) : hover.status === "cleaning" ? (
            <div style={{ fontSize: 12, color: AMBER, marginTop: 4 }}>Housekeeping in progress</div>
          ) : (
            <div style={{ fontSize: 12, color: GREEN, marginTop: 4 }}>Available for immediate check-in</div>
          )}
        </div>
      ) : null}
    </div>
  );
}