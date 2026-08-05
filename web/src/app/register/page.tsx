"use client";

import { useState } from "react";
import { registerHotel } from "./actions";
import CountryPicker from "./CountryPicker";

const DEPARTMENTS = [
  { dept: "front_desk", label: "Front Desk", hint: "Transport, reservations, general requests", icon: "M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6" },
  { dept: "housekeeping", label: "Housekeeping", hint: "Cleaning, amenities, room upkeep", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { dept: "fb", label: "In-Room Dining", hint: "Food and beverage to the room", icon: "M3 2v7c0 1.1.9 2 2 2h1v11h2V2M13 2v20h2V11h1a2 2 0 0 0 2-2V2" },
  { dept: "spa", label: "Spa", hint: "Treatments and wellness bookings", icon: "M12 2c1 4 4 6 4 10a4 4 0 0 1-8 0c0-4 3-6 4-10z" },
];

const DIAL_CODES = [
  { c: "IN", d: "+91", name: "India" }, { c: "US", d: "+1", name: "United States" }, { c: "GB", d: "+44", name: "United Kingdom" }, { c: "AE", d: "+971", name: "UAE" },
  { c: "SG", d: "+65", name: "Singapore" }, { c: "AU", d: "+61", name: "Australia" }, { c: "CA", d: "+1", name: "Canada" }, { c: "DE", d: "+49", name: "Germany" },
  { c: "FR", d: "+33", name: "France" }, { c: "IT", d: "+39", name: "Italy" }, { c: "ES", d: "+34", name: "Spain" }, { c: "NL", d: "+31", name: "Netherlands" },
  { c: "CH", d: "+41", name: "Switzerland" }, { c: "SE", d: "+46", name: "Sweden" }, { c: "JP", d: "+81", name: "Japan" }, { c: "CN", d: "+86", name: "China" },
  { c: "HK", d: "+852", name: "Hong Kong" }, { c: "MY", d: "+60", name: "Malaysia" }, { c: "TH", d: "+66", name: "Thailand" }, { c: "ID", d: "+62", name: "Indonesia" },
  { c: "PH", d: "+63", name: "Philippines" }, { c: "VN", d: "+84", name: "Vietnam" }, { c: "BD", d: "+880", name: "Bangladesh" }, { c: "LK", d: "+94", name: "Sri Lanka" },
  { c: "NP", d: "+977", name: "Nepal" }, { c: "PK", d: "+92", name: "Pakistan" }, { c: "SA", d: "+966", name: "Saudi Arabia" }, { c: "QA", d: "+974", name: "Qatar" },
  { c: "KW", d: "+965", name: "Kuwait" }, { c: "OM", d: "+968", name: "Oman" }, { c: "BH", d: "+973", name: "Bahrain" }, { c: "ZA", d: "+27", name: "South Africa" },
  { c: "NG", d: "+234", name: "Nigeria" }, { c: "KE", d: "+254", name: "Kenya" }, { c: "EG", d: "+20", name: "Egypt" }, { c: "BR", d: "+55", name: "Brazil" },
  { c: "MX", d: "+52", name: "Mexico" }, { c: "AR", d: "+54", name: "Argentina" }, { c: "NZ", d: "+64", name: "New Zealand" }, { c: "IE", d: "+353", name: "Ireland" },
  { c: "PT", d: "+351", name: "Portugal" }, { c: "BE", d: "+32", name: "Belgium" }, { c: "AT", d: "+43", name: "Austria" }, { c: "DK", d: "+45", name: "Denmark" },
  { c: "NO", d: "+47", name: "Norway" }, { c: "FI", d: "+358", name: "Finland" }, { c: "PL", d: "+48", name: "Poland" }, { c: "TR", d: "+90", name: "Turkey" },
  { c: "RU", d: "+7", name: "Russia" }, { c: "KR", d: "+82", name: "South Korea" },
];

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001/login";
const STEPS = ["Your details", "Hotel details", "Departments", "Review"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+91");
  const [phoneNum, setPhoneNum] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [contactCode, setContactCode] = useState("+91");
  const [contactNum, setContactNum] = useState("");
  const [depts, setDepts] = useState<string[]>(["front_desk", "housekeeping"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [focus, setFocus] = useState("");

  const phone = phoneNum.trim() ? phoneCode + " " + phoneNum.trim() : "";
  const contactPhone = contactNum.trim() ? contactCode + " " + contactNum.trim() : "";
  function toggleDept(d: string) { setDepts((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]); }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!fullName.trim()) return "Please enter your full name.";
      if (!email.trim() || !email.includes("@")) return "Please enter a valid email address.";
      if (password.length < 8) return "Your password needs at least 8 characters.";
    }
    if (s === 1 && !hotelName.trim()) return "Please enter your hotel name.";
    if (s === 2 && depts.length === 0) return "Choose at least one department.";
    return null;
  }
  function next() { const e = validateStep(step); if (e) { setError(e); return; } setError(null); setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setError(null); setStep((s) => Math.max(s - 1, 0)); }

  async function submit() {
    setError(null); setBusy(true);
    const res = await registerHotel({ fullName, email, password, phone, hotelName, address, city, roomCount, checkInTime, checkOutTime, contactPhone, departments: depts });
    setBusy(false);
    if (!res.ok) { setError(res.message); return; }
    setDone(true);
  }

  const fieldBase = { width: "100%", marginTop: 7, borderRadius: 12, borderWidth: 1, borderStyle: "solid" as const, borderColor: "#E4E2DA", background: "#FCFBF8", padding: "12px 15px", fontSize: 14.5, color: "#1B2621", outline: "none", boxSizing: "border-box" as const, transition: "border-color .15s, box-shadow .15s, background .15s" };
  const fld = (key: string) => ({ ...fieldBase, ...(focus === key ? { borderColor: "#0F5F4C", background: "#fff", boxShadow: "0 0 0 3px rgba(15,95,76,.09)" } : {}) });
  const label = { fontSize: 11.5, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".09em", color: "#8A9089" };
  const deptLabel = (d: string) => DEPARTMENTS.find((x) => x.dept === d)?.label ?? d;

  function PhoneRow({ code, setCode, num, setNum, ph, fkey }: { code: string; setCode: (v: string) => void; num: string; setNum: (v: string) => void; ph: string; fkey: string }) {
    return (
      <div style={{ display: "flex", gap: 9 }}>
        <CountryPicker options={DIAL_CODES} value={code} onChange={setCode} />
        <input value={num} onChange={(e) => setNum(e.target.value.replace(/[^0-9]/g, ""))} onFocus={() => setFocus(fkey)} onBlur={() => setFocus("")} placeholder={ph} inputMode="numeric" style={{ ...fld(fkey), flex: 1 }} />
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(1200px 600px at 50% -10%, #EAF1EC 0%, #F4F2EC 45%, #F0EDE5 100%)", padding: 24 }}>
        <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", borderRadius: 22, padding: "48px 44px", boxShadow: "0 30px 80px rgba(20,40,33,.12), 0 2px 8px rgba(20,40,33,.05)", borderTop: "3px solid #B08A4F" }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "#EAF1EC", color: "#0F5F4C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 32 }}>&#10003;</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 600, color: "#1B2621", marginTop: 24, letterSpacing: "-.01em" }}>Welcome to Aria</h1>
          <p style={{ fontSize: 14.5, color: "#63696330".slice(0,7), marginTop: 10, lineHeight: 1.6 }}><b style={{ color: "#1B2621" }}>{hotelName}</b> is registered and your manager account is ready.</p>
          <a href={LOGIN_URL} style={{ display: "inline-block", marginTop: 28, borderRadius: 12, padding: "14px 34px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#0F5F4C", textDecoration: "none", boxShadow: "0 8px 20px rgba(15,95,76,.25)" }}>Go to sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: "#F0EDE5", overflow: "hidden" }}>
      <style>{"@media (max-width: 860px){ .reg-side{ display:none !important; } .reg-form-col{ padding:32px 20px !important; } }"}</style>

      <div className="reg-side" style={{ width: "44%", height: "100vh", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <img src="/register-side.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,40,33,.28) 0%, rgba(12,40,33,0) 30%, rgba(12,40,33,.15) 60%, rgba(11,34,28,.82) 100%)" }} />
        <div style={{ position: "absolute", top: 40, left: 44, display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.16)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700 }}>A</div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>Aria</span>
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 52, color: "#fff" }}>
          <div style={{ width: 40, height: 2, background: "#C9A66B", marginBottom: 22 }} />
          <div style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, lineHeight: 1.16, letterSpacing: "-.01em", textShadow: "0 2px 18px rgba(0,0,0,.35)" }}>Every guest,<br />warmly answered.</div>
          <p style={{ fontSize: 15, opacity: .9, marginTop: 16, lineHeight: 1.6, maxWidth: 340, textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>Set up your hotel and let Aria handle requests on WhatsApp, day and night.</p>
        </div>
      </div>

      <div className="reg-form-col" style={{ flex: 1, minWidth: 0, overflowY: "auto", maxHeight: "100vh", padding: "52px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F" }}>Hotel registration</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621", marginTop: 8, letterSpacing: "-.015em" }}>Set up your concierge</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, transition: "all .2s", background: i < step ? "#0F5F4C" : i === step ? "#0F5F4C" : "#fff", color: i <= step ? "#fff" : "#B4B9B3", border: i === step ? "none" : i < step ? "none" : "1px solid #E0DED6", boxShadow: i === step ? "0 0 0 4px rgba(15,95,76,.13)" : "none" }}>{i < step ? "\u2713" : i + 1}</div>
                  <span style={{ fontSize: 10.5, marginTop: 7, color: i === step ? "#0F5F4C" : "#A7ACA5", fontWeight: i === step ? 600 : 500, whiteSpace: "nowrap", letterSpacing: ".01em" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 ? <div style={{ flex: 1, height: 1.5, background: i < step ? "#0F5F4C" : "#E4E2DA", margin: "0 6px", marginBottom: 17, transition: "background .2s" }} /> : null}
              </div>
            ))}
          </div>

          {error ? (
            <div style={{ marginBottom: 20, borderRadius: 11, padding: "12px 16px", fontSize: 13.5, background: "#FBEEEA", color: "#A5382A", border: "1px solid #EFD3CB", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 999, background: "#A5382A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>!</span>
              {error}
            </div>
          ) : null}

          <div style={{ background: "#fff", borderRadius: 20, padding: "34px 34px 30px", boxShadow: "0 24px 60px rgba(20,40,33,.10), 0 2px 6px rgba(20,40,33,.04)", borderTop: "3px solid #B08A4F", minHeight: 300 }}>
            {step === 0 ? (
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 600, color: "#1B2621" }}>Your details</h2>
                <p style={{ fontSize: 13.5, color: "#8A9089", marginTop: 5, marginBottom: 22 }}>This becomes your manager sign-in.</p>
                <div style={{ display: "grid", gap: 18 }}>
                  <div><label style={label}>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocus("fn")} onBlur={() => setFocus("")} placeholder="Your name" autoFocus style={fld("fn")} /></div>
                  <div><label style={label}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus("em")} onBlur={() => setFocus("")} placeholder="you@hotel.com" style={fld("em")} /></div>
                  <div>
                    <label style={label}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocus("pw")} onBlur={() => setFocus("")} placeholder="At least 8 characters" style={{ ...fld("pw"), paddingRight: 46 }} />
                      <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} style={{ position: "absolute", right: 7, top: 7, width: 36, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: 0, cursor: "pointer", color: "#9AA09A" }}>
                        {showPw ? (
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div><label style={label}>Phone</label><PhoneRow code={phoneCode} setCode={setPhoneCode} num={phoneNum} setNum={setPhoneNum} ph="Your number" fkey="ph1" /></div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 600, color: "#1B2621" }}>Hotel details</h2>
                <p style={{ fontSize: 13.5, color: "#8A9089", marginTop: 5, marginBottom: 22 }}>Tell us about your property.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div style={{ gridColumn: "1 / -1" }}><label style={label}>Hotel name</label><input value={hotelName} onChange={(e) => setHotelName(e.target.value)} onFocus={() => setFocus("hn")} onBlur={() => setFocus("")} placeholder="The Grand Palace" autoFocus style={fld("hn")} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={label}>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} onFocus={() => setFocus("ad")} onBlur={() => setFocus("")} placeholder="Street address" style={fld("ad")} /></div>
                  <div><label style={label}>City</label><input value={city} onChange={(e) => setCity(e.target.value)} onFocus={() => setFocus("ci")} onBlur={() => setFocus("")} placeholder="City" style={fld("ci")} /></div>
                  <div><label style={label}>Rooms</label><input value={roomCount} onChange={(e) => setRoomCount(e.target.value.replace(/[^0-9]/g, ""))} onFocus={() => setFocus("rc")} onBlur={() => setFocus("")} placeholder="120" inputMode="numeric" style={fld("rc")} /></div>
                  <div><label style={label}>Check-in</label><input value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} onFocus={() => setFocus("ci2")} onBlur={() => setFocus("")} style={fld("ci2")} /></div>
                  <div><label style={label}>Check-out</label><input value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} onFocus={() => setFocus("co")} onBlur={() => setFocus("")} style={fld("co")} /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={label}>Hotel WhatsApp number</label><PhoneRow code={contactCode} setCode={setContactCode} num={contactNum} setNum={setContactNum} ph="Number guests will message" fkey="ph2" /></div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 600, color: "#1B2621" }}>Departments</h2>
                <p style={{ fontSize: 13.5, color: "#8A9089", marginTop: 5, marginBottom: 22 }}>Aria routes each guest request to the teams you run.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
                  {DEPARTMENTS.map((d) => {
                    const on = depts.includes(d.dept);
                    return (
                      <button key={d.dept} onClick={() => toggleDept(d.dept)} type="button" style={{ textAlign: "left", borderRadius: 14, padding: 17, cursor: "pointer", transition: "all .15s", border: "1.5px solid " + (on ? "#0F5F4C" : "#E7E5DD"), background: on ? "#F1F6F2" : "#fff", boxShadow: on ? "0 2px 8px rgba(15,95,76,.10)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: on ? "#0F5F4C" : "#F4F3EE", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? "#fff" : "#9AA09A"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d.icon} /></svg>
                          </div>
                          <span style={{ width: 22, height: 22, borderRadius: 999, border: "1.5px solid " + (on ? "#0F5F4C" : "#D6D4CC"), background: on ? "#0F5F4C" : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all .15s" }}>{on ? "\u2713" : ""}</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1B2621", marginTop: 13 }}>{d.label}</div>
                        <div style={{ fontSize: 12, color: "#9AA09A", marginTop: 3, lineHeight: 1.4 }}>{d.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 600, color: "#1B2621" }}>Review and confirm</h2>
                <p style={{ fontSize: 13.5, color: "#8A9089", marginTop: 5, marginBottom: 22 }}>A last look before we set things up.</p>
                <div style={{ borderRadius: 14, border: "1px solid #EDEBE3", overflow: "hidden" }}>
                  {[["Manager", fullName], ["Email", email], ["Phone", phone || "\u2014"], ["Hotel", hotelName], ["City", city || "\u2014"], ["Rooms", roomCount || "\u2014"], ["Check-in / out", checkInTime + " / " + checkOutTime], ["WhatsApp", contactPhone || "\u2014"], ["Departments", depts.map(deptLabel).join(", ")]].map(([k, v], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 16px", fontSize: 14, background: i % 2 ? "#FCFBF8" : "#fff", borderBottom: i === 8 ? "none" : "1px solid #F2F0E9" }}>
                      <span style={{ color: "#9AA09A", flexShrink: 0 }}>{k}</span><span style={{ color: "#1B2621", fontWeight: 500, textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 11, marginTop: 30 }}>
              {step > 0 ? <button onClick={back} disabled={busy} style={{ borderRadius: 12, padding: "13px 24px", fontSize: 14.5, fontWeight: 600, color: "#3A413B", background: "#fff", border: "1px solid #DAD8D0", cursor: "pointer" }}>Back</button> : null}
              {step < STEPS.length - 1 ? (
                <button onClick={next} style={{ flex: 1, borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: "pointer", boxShadow: "0 8px 18px rgba(15,95,76,.22)" }}>Continue</button>
              ) : (
                <button onClick={submit} disabled={busy} style={{ flex: 1, borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#0F5F4C", border: 0, cursor: busy ? "default" : "pointer", opacity: busy ? 0.65 : 1, boxShadow: "0 8px 18px rgba(15,95,76,.22)" }}>{busy ? "Setting up your hotel..." : "Complete registration"}</button>
              )}
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 13.5, color: "#9AA09A", marginTop: 22 }}>Already registered? <a href={LOGIN_URL} style={{ color: "#0F5F4C", fontWeight: 600, textDecoration: "none" }}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}