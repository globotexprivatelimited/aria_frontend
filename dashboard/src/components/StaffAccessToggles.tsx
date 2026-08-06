"use client";
import { useState } from "react";
import { setStaffDeptAccess, type StaffDept } from "../app/gm/staff/staff-access-actions";

const GREEN = "#0F5F4C", INK = "#1B2621";

export default function StaffAccessToggles({ hotelId, staffId, departments, onChange }: { hotelId: string; staffId: string; departments: StaffDept[]; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [local, setLocal] = useState<StaffDept[]>(departments);

  async function toggle(dept: string, current: boolean) {
    setBusy(dept);
    // optimistic UI
    setLocal((prev) => prev.map((d) => d.dept === dept ? { ...d, active: !current } : d));
    const r = await setStaffDeptAccess(hotelId, staffId, dept, !current);
    setBusy(null);
    if (!r.ok) {
      // revert on failure
      setLocal((prev) => prev.map((d) => d.dept === dept ? { ...d, active: current } : d));
      alert(r.message ?? "Could not update access");
    } else {
      onChange();
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {local.map((d) => (
        <button key={d.dept} onClick={() => toggle(d.dept, d.active)} disabled={busy === d.dept}
          style={{
            display: "flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "6px 12px 6px 10px",
            fontSize: 12, fontWeight: 600, cursor: busy === d.dept ? "wait" : "pointer",
            border: "1px solid " + (d.active ? "#CFE5DC" : "#E3DECF"),
            background: d.active ? "#EAF2ED" : "#F5F5F0",
            color: d.active ? GREEN : "#8A8577", opacity: busy === d.dept ? 0.6 : 1, transition: "all .15s",
          }}>
          {/* mini switch */}
          <span style={{ width: 26, height: 15, borderRadius: 999, background: d.active ? GREEN : "#CDC8BC", position: "relative", transition: "background .15s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 2, left: d.active ? 13 : 2, width: 11, height: 11, borderRadius: 999, background: "#fff", transition: "left .15s" }} />
          </span>
          {d.label}
        </button>
      ))}
    </div>
  );
}