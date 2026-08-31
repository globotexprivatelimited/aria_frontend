"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getOnboarding, setStep, setBlocker, type OnboardingRow } from "./onboarding-actions";

const INK = "#1B2621", GREEN = "#0F5F4C", GOLD = "#B08A4F", RED = "#B23A2A";
const STEP_LABEL: Record<string, string> = {
  number_provisioned: "Number provisioned",
  menu_loaded: "Menu and rooms loaded",
  stations_paired: "Stations paired",
  staff_trained: "Staff trained",
  gm_assigned: "GM assigned",
};
const ORDER = ["number_provisioned", "menu_loaded", "stations_paired", "staff_trained", "gm_assigned"];

export default function OnboardingPage() {
  const router = useRouter();
  const [d, setD] = useState<{ rows: OnboardingRow[]; totals: Record<string, number> } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    const tk = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!tk) return;
    setD(await getOnboarding(tk));
  }, []);
  useEffect(() => { load(); const iv = setInterval(load, 12000); return () => clearInterval(iv); }, [load]);

  async function toggle(hotelId: string, step: string, value: boolean) {
    const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
    setBusy(hotelId + step); await setStep(tk, hotelId, step, value); setBusy(null); load();
  }
  async function saveBlocker(hotelId: string) {
    const tk = window.localStorage.getItem("aria_token"); if (!tk) return;
    await setBlocker(tk, hotelId, draft.trim() || null);
    setEditing(null); setDraft(""); load();
  }

  const rows = d?.rows ?? [];
  const inSetup = rows.filter((r) => !r.live);
  const t = d?.totals ?? {};
  const card = { background: "#fff", border: "1px solid #EAE7DE", borderRadius: 15, padding: 19 };
  const lbl = { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "#A8A395" };

  return (
    <div style={{ padding: "34px 30px 60px", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: GOLD }}>Getting properties live</div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600, color: INK, marginTop: 4, letterSpacing: "-.5px" }}>Onboarding</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 11, marginTop: 20 }}>
        {[
          { l: "In setup", v: t.inSetup ?? 0, c: GOLD },
          { l: "Live", v: t.liveTotal ?? 0, c: GREEN },
          { l: "Steps per launch", v: t.stepsPerLaunch ?? 5, c: "#6B6FA0" },
          { l: "Rooms coming online", v: t.roomsComing ?? 0, c: "#B4703A" },
        ].map((x) => (
          <div key={x.l} style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: x.c }} /><span style={lbl}>{x.l}</span></div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 25, fontWeight: 700, color: INK, marginTop: 6, lineHeight: 1 }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <div style={{ ...lbl, marginBottom: 4 }}>Go-live checklist</div>
        <div style={{ fontSize: 12.5, color: "#9AA09A", marginBottom: 16 }}>A property counts as live once every step is done. Tick them as they happen.</div>

        {inSetup.length === 0 ? (
          <div style={{ padding: "26px 0", textAlign: "center", color: "#B4B9B3", fontSize: 13.5 }}>Every property is live. Nothing in setup.</div>
        ) : inSetup.map((r, i) => (
          <div key={r.hotelId} style={{ paddingTop: i ? 18 : 0, marginTop: i ? 18 : 0, borderTop: i ? "1px solid #F2F0EA" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div>
                <button onClick={() => router.push("/founder/hotels/" + r.hotelId)}
                  style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: INK }}>{r.name} &rarr;</button>
                <div style={{ fontSize: 11.5, color: "#9AA09A", marginTop: 2 }}>
                  {[r.city, r.roomCount ? r.roomCount + " rooms" : null, r.owner ? "owner " + r.owner : null,
                    r.daysInSetup + " day" + (r.daysInSetup === 1 ? "" : "s") + " in setup",
                    "GM " + (r.gmName ?? "unassigned")].filter(Boolean).join(" \u00b7 ")}
                </div>
              </div>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: r.done === r.total ? GREEN : GOLD }}>{r.done}/{r.total}</span>
            </div>

            <div style={{ height: 5, borderRadius: 999, background: "#F1EEE6", margin: "10px 0 12px", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: (r.done / r.total) * 100 + "%", background: GREEN, transition: "width .4s" }} />
            </div>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {ORDER.map((s) => {
                const on = !!r.steps[s];
                return (
                  <button key={s} disabled={busy === r.hotelId + s} onClick={() => toggle(r.hotelId, s, !on)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: "1px solid " + (on ? "#CFE5DC" : "#EAE7DE"), background: on ? "#EAF2ED" : "#fff", color: on ? GREEN : "#A8A395" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      {on ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="9" strokeWidth="2" />}
                    </svg>
                    {STEP_LABEL[s]}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 11 }}>
              {editing === r.hotelId ? (
                <div style={{ display: "flex", gap: 7 }}>
                  <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveBlocker(r.hotelId); if (e.key === "Escape") setEditing(null); }}
                    placeholder="What is holding this up?"
                    style={{ flex: 1, borderRadius: 8, border: "1px solid #E3DECF", padding: "8px 11px", fontSize: 13, outline: "none" }} />
                  <button onClick={() => saveBlocker(r.hotelId)} style={{ borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: 0, background: GREEN, color: "#fff" }}>Save</button>
                </div>
              ) : (
                <button onClick={() => { setEditing(r.hotelId); setDraft(r.blocker ?? ""); }}
                  style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", fontSize: 12.5, color: r.blocker ? RED : "#B4B9B3", textAlign: "left" }}>
                  {r.blocker ? "Blocker: " + r.blocker : "No blocker \u00b7 add one"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
