"use client";

import { useState } from "react";
import type { DeptConfig } from "../lib/departments";
import DeptSidebar from "./DeptSidebar";

export default function DeptSettings({ config, staffName, initials }: { config: DeptConfig; staffName: string; initials: string }) {
  const [alarmSound, setAlarmSound] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const Toggle = ({ on, set, label, hint }: { on: boolean; set: (v: boolean) => void; label: string; hint: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F4F4F1" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#1B2621" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#9AA09A", marginTop: 2 }}>{hint}</div>
      </div>
      <button onClick={() => set(!on)} style={{ width: 44, height: 26, borderRadius: 999, border: 0, cursor: "pointer", background: on ? "#0F5F4C" : "#D5D9D3", position: "relative", transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <DeptSidebar config={config} staffName={staffName} initials={initials} activeKey="settings" />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>{config.label} &middot; Settings</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>How this board behaves for your team</p>

        <div style={{ marginTop: 24, maxWidth: 640, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: "8px 24px 24px" }}>
          <div style={{ paddingTop: 16, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>Notifications</div>
          <Toggle on={alarmSound} set={setAlarmSound} label="Alarm sound on new request" hint="Play a repeating tone until a new request is acknowledged" />
          <Toggle on={urgentOnly} set={setUrgentOnly} label="Urgent-only alarm" hint="Only sound the alarm for requests marked urgent" />
          <div style={{ paddingTop: 24, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>Display</div>
          <Toggle on={autoRefresh} set={setAutoRefresh} label="Live auto-refresh" hint="Cards appear the moment a guest sends a request" />
        </div>

        <div style={{ marginTop: 20, maxWidth: 640, background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A", marginBottom: 12 }}>Department</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
            <span style={{ color: "#6E756F" }}>Board</span><span style={{ fontWeight: 500, color: "#1B2621" }}>{config.label}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
            <span style={{ color: "#6E756F" }}>Handling</span><span style={{ fontWeight: 500, color: "#1B2621" }}>{config.type === "auto" ? "Auto \u00b7 Claim / Done / Problem" : "Accept / Decline / Propose"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
            <span style={{ color: "#6E756F" }}>Notified as</span><span style={{ fontWeight: 500, color: "#1B2621" }}>{config.staffNumber}</span>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#9AA09A" }}>Preferences apply to this browser. Team-wide settings arrive with staff accounts.</p>
      </div>
    </div>
  );
}