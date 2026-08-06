"use client";

import { useState, useEffect } from "react";
import { DEPARTMENTS } from "../../../lib/departments";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { createStaff, getStaff, resetPassword } from "./actions";
import { useMyHotel } from "../../../lib/useMyHotel";
import { setStaffDeptAccess as saveDeptAccessCall } from "./staff-access-actions";

type Row = { id: string; name: string; depts: string[]; email: string };

export default function GMStaff() {
  const { isMobile, isTablet } = useBreakpoint();
  const { hotelId: HOTEL_ID } = useMyHotel();
  const [open, setOpen] = useState(false);
  const [depts, setDepts] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [resetFor, setResetFor] = useState<Row | null>(null);
  const [newPw, setNewPw] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;
  function flash(ok: boolean, msg: string) { setToast({ ok, msg }); setTimeout(() => setToast(null), 3200); }
  function toggleDept(d: string) { setDepts((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]); }
  async function saveDeptAccess(staffId: string, dept: string, currentlyOn: boolean) {
    // optimistic: update the row locally
    setRows((prev) => prev.map((r) => r.id === staffId ? { ...r, depts: currentlyOn ? r.depts.filter((x) => x !== dept) : [...r.depts, dept] } : r));
    const res = await saveDeptAccessCall({ staffId, dept, active: !currentlyOn, hotelId: HOTEL_ID as string });
    if (!res.ok) { setRows((prev) => prev.map((r) => r.id === staffId ? { ...r, depts: currentlyOn ? [...r.depts, dept] : r.depts.filter((x) => x !== dept) } : r)); flash(false, res.message ?? "Could not update access"); }
  }

  useEffect(() => {
    if (!HOTEL_ID) return;
    (async () => {
      const res = await getStaff(HOTEL_ID);
      if (res.ok) setRows(res.staff.map((s) => ({ id: s.id, name: s.fullName, depts: s.departments, email: s.email ?? "" })));
    })();
  }, [HOTEL_ID]);

  async function submit() {
    if (!HOTEL_ID) { flash(false, "Loading your hotel, one moment..."); return; }
    if (depts.length === 0) { flash(false, "Pick at least one department."); return; }
    setBusy(true);
    const res = await createStaff({ hotelId: HOTEL_ID, departments: depts, fullName, email, password, phone });
    setBusy(false);
    flash(res.ok, res.message);
    if (res.ok) {
      // reload from DB so the new row carries its real id
      const list = await getStaff(HOTEL_ID);
      if (list.ok) setRows(list.staff.map((s) => ({ id: s.id, name: s.fullName, depts: s.departments, email: s.email ?? "" })));
      setOpen(false); setFullName(""); setEmail(""); setPassword(""); setPhone(""); setDepts([]);
    }
  }

  async function doReset() {
    if (!HOTEL_ID || !resetFor) return;
    if (newPw.length < 8) { flash(false, "Password must be at least 8 characters."); return; }
    setResetBusy(true);
    const res = await resetPassword(HOTEL_ID, resetFor.id, newPw);
    setResetBusy(false);
    flash(res.ok, res.ok ? resetFor.name + "'s password updated." : res.message);
    if (res.ok) { setResetFor(null); setNewPw(""); }
  }

  const field = { width: "100%", marginTop: 6, borderRadius: 9, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const };
  const label = { fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".04em", color: "#6E756F" };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Staff</h1>
            <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>Create a login and assign each team member to one or more departments</p>
          </div>
          <button onClick={() => setOpen(true)} style={{ borderRadius: 9, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer" }}>
            + Add Staff
          </button>
        </div>

        {toast ? (
          <div style={{ marginBottom: 16, borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 500, background: toast.ok ? "#E8F1ED" : "#FBEDE9", color: toast.ok ? "#0F5F4C" : "#B23A2A", border: "1px solid " + (toast.ok ? "#CFE5DC" : "#F0D5CD") }}>{toast.msg}</div>
        ) : null}

        <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, overflow: isMobile ? "auto" : "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 2fr 2fr 1.4fr", minWidth: isMobile ? 640 : "auto", padding: "14px 24px", borderBottom: "1px solid #EAEAE4", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#9AA09A" }}>
            <span>Name</span><span>Departments</span><span>Login email</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9AA09A", fontSize: 14 }}>No staff added yet. Click &ldquo;Add Staff&rdquo; to create a login.</div>
          ) : rows.map((s) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 2fr 2fr 1.4fr", minWidth: isMobile ? 640 : "auto", padding: "16px 24px", borderBottom: "1px solid #F4F4F1", fontSize: 14, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: "#E8F1ED", color: "#0F5F4C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                <span style={{ fontWeight: 500, color: "#1B2621" }}>{s.name}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEPARTMENTS.map((dp) => { const on = s.depts.includes(dp.dept); return <button key={dp.dept} onClick={() => saveDeptAccess(s.id, dp.dept, on)} style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "4px 10px 4px 8px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: on ? "#EAF2ED" : "#F5F5F0", color: on ? "#0F5F4C" : "#9AA09A", border: "1px solid " + (on ? "#CFE5DC" : "#E7E3D8") }}><span style={{ width: 22, height: 13, borderRadius: 999, background: on ? "#0F5F4C" : "#CDC8BC", position: "relative", flexShrink: 0 }}><span style={{ position: "absolute", top: 2, left: on ? 11 : 2, width: 9, height: 9, borderRadius: 999, background: "#fff" }} /></span>{dp.label}</button>; })}
              </div>
              <span style={{ color: "#6E756F", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{s.email || "\u2014"}</span>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => { setResetFor(s); setNewPw(""); }} style={{ borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 500, color: "#B08A4F", background: "#FBF3E6", border: "1px solid #EAD9BC", cursor: "pointer" }}>Reset password</button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 16, fontSize: 13, color: "#9AA09A" }}>
          Each staff member signs in and sees a live board for every department you assign them.
        </p>
      </div>

      {open ? (
        <div onClick={() => !busy && setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#1B2621" }}>Add staff</h2>
            <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 4 }}>Assign one or more departments. They see a live board for each.</p>
            <div style={{ marginTop: 20 }}>
              <label style={label}>Departments</label>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "1fr 1fr", gap: 10, marginTop: 8 }}>
                {DEPARTMENTS.map((d) => {
                  const on = depts.includes(d.dept);
                  return (
                    <button key={d.dept} type="button" onClick={() => toggleDept(d.dept)}
                      style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", borderRadius: 10, padding: "11px 12px", cursor: "pointer", border: "1.5px solid " + (on ? "#0F5F4C" : "#E3E3DC"), background: on ? "#F1F6F2" : "#fff" }}>
                      <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 6, border: "1.5px solid " + (on ? "#0F5F4C" : "#CFCFC7"), background: on ? "#0F5F4C" : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{on ? "\u2713" : ""}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#1B2621" }}>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 16 }}><label style={label}>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Staff name" style={field} /></div>
            <div style={{ marginTop: 14 }}><label style={label}>Login email</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@hotel.com" style={field} /></div>
            <div style={{ marginTop: 14 }}><label style={label}>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={field} /></div>
            <div style={{ marginTop: 14 }}><label style={label}>Phone <span style={{ textTransform: "none", color: "#B4B9B3" }}>(optional)</span></label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." style={field} /></div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setOpen(false)} disabled={busy} style={{ borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, color: "#3A413B", background: "#fff", border: "1px solid #D9D9D2", cursor: "pointer" }}>Cancel</button>
              <button onClick={submit} disabled={busy} style={{ flex: 1, borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Creating..." : "Create staff login"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {resetFor ? (
        <div onClick={() => !resetBusy && setResetFor(null)} style={{ position: "fixed", inset: 0, background: "rgba(20,25,22,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 600, color: "#1B2621" }}>Reset password</h2>
            <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 4 }}>Set a new password for <b style={{ color: "#1B2621" }}>{resetFor.name}</b>. Share it with them to sign in.</p>
            <div style={{ marginTop: 18 }}>
              <label style={label}>New password</label>
              <input type="text" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" autoFocus style={field} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setResetFor(null)} disabled={resetBusy} style={{ borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 600, color: "#3A413B", background: "#fff", border: "1px solid #D9D9D2", cursor: "pointer" }}>Cancel</button>
              <button onClick={doReset} disabled={resetBusy} style={{ flex: 1, borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: resetBusy ? "default" : "pointer", opacity: resetBusy ? 0.6 : 1 }}>{resetBusy ? "Updating..." : "Update password"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}