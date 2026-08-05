"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getRooms, getRoomStats, getRoomTarget, checkInRoom, checkOutRoom, markRoomClean, setupRooms, editRoom, deleteRoom, clearFloor, type Room, type RoomStats } from "./rooms-actions";
import RoomSetup from "../../../components/RoomSetup";
import RoomModal from "../../../components/RoomModal";
import GMSidebar from "../../../components/GMSidebar";
import { useMyHotel } from "../../../lib/useMyHotel";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621";
const STATUS = {
  available: { c: GREEN, bg: "#EAF3EE", label: "Available" },
  occupied: { c: RED, bg: "#FBEDE9", label: "Occupied" },
  cleaning: { c: AMBER, bg: "#F7F0E0", label: "Cleaning" },
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
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats>({ total: 0, available: 0, occupied: 0, cleaning: 0, occupancyPct: 0 });
  const [hover, setHover] = useState<Room | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  const [target, setTarget] = useState(0);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const load = useCallback(async () => {
    if (!HOTEL_ID) return;
    const [r, s, t] = await Promise.all([getRooms(HOTEL_ID), getRoomStats(HOTEL_ID), getRoomTarget(HOTEL_ID)]);
    setRooms(r); setStats(s); setTarget(t.target);
  }, [HOTEL_ID]);
  useEffect(() => { if (!HOTEL_ID) return; load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, [load, HOTEL_ID]);

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
  async function doClean(rm: string) { const r = await markRoomClean(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " ready"); load(); } else flash(r.message ?? "failed"); }
  async function doEdit(rm: string, changes: { room_type?: string; floor?: number; newNumber?: string }) { const r = await editRoom(HOTEL_ID!, rm, changes); if (r.ok) { flash("Room updated"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doDelete(rm: string) { const r = await deleteRoom(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " deleted"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doClearFloor(fl: number) { if (!confirm("Clear all rooms on floor " + fl + "?")) return; const r = await clearFloor(HOTEL_ID!, fl); if (r.ok) { flash("Cleared " + r.deleted + " rooms from floor " + fl); load(); } else flash(r.message ?? "failed"); }
  async function doEdit(rm: string, changes: { room_type?: string; floor?: number; newNumber?: string }) { const r = await editRoom(HOTEL_ID!, rm, changes); if (r.ok) { flash("Room updated"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doDelete(rm: string) { const r = await deleteRoom(HOTEL_ID!, rm); if (r.ok) { flash("Room " + rm + " deleted"); setSelected(null); load(); } else flash(r.message ?? "failed"); }
  async function doClearFloor(fl: number) { if (!confirm("Clear all rooms on floor " + fl + "?")) return; const r = await clearFloor(HOTEL_ID!, fl); if (r.ok) { flash("Cleared " + r.deleted + " rooms from floor " + fl); load(); } else flash(r.message ?? "failed"); }

  const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 };
  const kpis = [
    { label: "Total rooms", value: stats.total, color: INK },
    { label: "Occupied", value: stats.occupied, color: RED },
    { label: "Available", value: stats.available, color: GREEN },
    { label: "Cleaning", value: stats.cleaning, color: AMBER },
    { label: "Occupancy", value: stats.occupancyPct + "%", color: INK },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }} onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "30px 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: AMBER, marginBottom: 4 }}>Reception &middot; Room Board</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: INK, margin: 0 }}>{hotelName || "Your Hotel"}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6E756F", background: "#fff", border: "1px solid #EAEAE4", borderRadius: 999, padding: "7px 14px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2ECC71" }} />Live &middot; 5s
          </div>
          <button onClick={() => setShowSetup((v) => !v)} style={{ marginLeft: 10, borderRadius: 999, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #E3DECF", background: showSetup ? "#EAF2ED" : "#fff", color: showSetup ? "#0F5F4C" : "#6E756F" }}>{showSetup ? "Close setup" : "Manage rooms"}</button>
        </div>

        {toast ? <div style={{ marginBottom: 12, borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 500, background: "#EAF2ED", color: GREEN, border: "1px solid #CFE5DC" }}>{toast}</div> : null}

        {(showSetup || rooms.length === 0) ? (
          <div style={{ marginBottom: 18 }}>
            <RoomSetup onSave={handleSetup} existingCount={rooms.length} target={target} />
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".07em", color: "#9AA09A", fontWeight: 600 }}>{k.label}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: k.color, marginTop: 6 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* legend + filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6E756F" }}>
            {(["available", "occupied", "cleaning"] as const).map((s) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: STATUS[s].c }} />{STATUS[s].label}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setTypeFilter("all")} style={{ borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (typeFilter === "all" ? GREEN : "#E3DECF"), background: typeFilter === "all" ? "#EAF2ED" : "#fff", color: typeFilter === "all" ? GREEN : "#6E756F" }}>All</button>
            {types.map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{ borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid " + (typeFilter === t ? GREEN : "#E3DECF"), background: typeFilter === t ? "#EAF2ED" : "#fff", color: typeFilter === t ? GREEN : "#6E756F" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* floors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {floors.map(([floor, fRooms]) => (
            <div key={floor} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK }}>Floor {floor}</span>
                <span style={{ fontSize: 11, color: "#B4B9B3" }}>{fRooms.filter((r) => r.status === "occupied").length}/{fRooms.length} occupied</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#E4DBC7,transparent)" }} />
                <button onClick={() => doClearFloor(floor)} style={{ fontSize: 10.5, color: "#B0776A", background: "#FBEDE9", border: "1px solid #EED7D0", borderRadius: 999, padding: "3px 10px", cursor: "pointer" }}>Clear floor</button>
                <button onClick={() => doClearFloor(floor)} style={{ fontSize: 10.5, color: "#B0776A", background: "#FBEDE9", border: "1px solid #EED7D0", borderRadius: 999, padding: "3px 10px", cursor: "pointer" }}>Clear floor</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))", gap: 8 }}>
                {fRooms.map((r) => {
                  const st = STATUS[r.status as keyof typeof STATUS] ?? STATUS.available;
                  return (
                    <div key={r.id}
                      onMouseEnter={() => setHover(r)} onMouseLeave={() => setHover(null)}
                      onClick={() => { setHover(null); setSelected(r); }}
                      style={{ aspectRatio: "1", borderRadius: 10, background: st.bg, border: "1.5px solid " + st.c, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform .1s", position: "relative" }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")} onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: st.c, fontFamily: "Georgia, serif" }}>{r.room_number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* room action modal */}
      {selected ? <RoomModal room={selected} handlers={{ onCheckIn: doCheckIn, onCheckOut: doCheckout, onClean: doClean, onEdit: doEdit, onDelete: doDelete, onClose: () => setSelected(null) }} /> : null}

      {/* hover tooltip */}
      {hover ? (
        <div style={{ position: "fixed", left: Math.min(pos.x + 16, (typeof window !== "undefined" ? window.innerWidth : 1200) - 240), top: pos.y + 16, zIndex: 100, width: 220, background: "#fff", border: "1px solid #E4DECF", borderRadius: 12, boxShadow: "0 12px 32px rgba(30,40,33,.16)", padding: 14, pointerEvents: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: INK }}>{hover.room_number}</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: (STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).c, background: (STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).bg, borderRadius: 6, padding: "2px 8px" }}>{(STATUS[hover.status as keyof typeof STATUS] ?? STATUS.available).label}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#8A8577", marginBottom: hover.status === "occupied" ? 8 : 0 }}>{hover.room_type} &middot; Floor {hover.floor}</div>
          {hover.status === "occupied" ? (
            <div style={{ borderTop: "1px solid #F0F0EA", paddingTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{hover.guest_name || "Guest"}</div>
              {hover.party_size ? <div style={{ fontSize: 11, color: "#8A8577", marginTop: 1 }}>{hover.party_size} guest{hover.party_size === 1 ? "" : "s"}</div> : null}
              <div style={{ fontSize: 11.5, color: "#6E756F", marginTop: 6 }}>Checkout: {fmtTime(hover.check_out)}</div>
              {(() => { const h = hoursLeft(hover.check_out); return h.text ? <div style={{ fontSize: 12, fontWeight: 700, color: h.urgent ? RED : GREEN, marginTop: 2 }}>{h.text}</div> : null; })()}
            </div>
          ) : hover.status === "cleaning" ? (
            <div style={{ fontSize: 11.5, color: AMBER, marginTop: 4 }}>Being cleaned</div>
          ) : (
            <div style={{ fontSize: 11.5, color: GREEN, marginTop: 4 }}>Ready to book</div>
          )}
        </div>
      ) : null}
    </div>
  );
}