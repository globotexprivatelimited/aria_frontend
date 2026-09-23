"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import GMSidebar from "../../../components/GMSidebar";
import { useBreakpoint } from "../../../lib/useBreakpoint";
import { useMyHotel } from "../../../lib/useMyHotel";
import { getFacts, addFact, updateFact, deleteFact, extractFacts, importFacts, type Fact, type Proposal } from "./knowledge-actions";

const GREEN = "#0F5F4C", RED = "#B23A2A", AMBER = "#B08A4F", INK = "#1B2621", MUTED = "#8A8577";
const CATEGORIES = ["essentials", "rooms", "dining", "facilities", "policies", "directions", "nearby", "general"];
const LABEL: Record<string, string> = { essentials: "Essentials", rooms: "Rooms", dining: "Dining", facilities: "Facilities", policies: "Policies", directions: "Directions", nearby: "Nearby", general: "General" };
const HINT: Record<string, string> = {
  essentials: "Check-in and check-out, Wi-Fi, reception hours, breakfast - always in front of Aria",
  rooms: "What is in the rooms, room types, extra beds",
  dining: "Restaurant hours, room service hours, dietary options",
  facilities: "Pool, gym, spa, parking, laundry, business centre",
  policies: "Smoking, pets, children, cancellation, payment",
  directions: "How to reach the hotel from the station, airport, bus stand",
  nearby: "Sights, markets, hospitals, ATMs, places to eat",
  general: "Anything else a guest may ask",
};

const card = { background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 20 } as const;
const field = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E4DECF", background: "#FEFDFB", fontSize: 13, color: INK, colorScheme: "light" as const, fontFamily: "inherit" } as const;
const btn = (bg: string, fg: string, border = bg) => ({ fontSize: 12, fontWeight: 600, color: fg, background: bg, border: "1px solid " + border, borderRadius: 999, padding: "7px 14px", cursor: "pointer" } as const);
const empty: Proposal = { topic: "", content: "", category: "essentials", keywords: "" };

function FactForm({ value, onChange, onSave, onCancel, saving, saveLabel }: { value: Proposal; onChange: (v: Proposal) => void; onSave: () => void; onCancel: () => void; saving: boolean; saveLabel: string }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <input style={field} placeholder="Topic - e.g. Check-in and check-out" value={value.topic} onChange={(e) => onChange({ ...value, topic: e.target.value })} />
        <select style={field} value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{LABEL[c]}</option>)}
        </select>
      </div>
      <textarea style={{ ...field, minHeight: 84, resize: "vertical" }} placeholder="The fact, as you would tell a guest - keep times, prices and names exact" value={value.content} onChange={(e) => onChange({ ...value, content: e.target.value })} />
      <input style={field} placeholder="Words a guest might use - e.g. wifi internet password, nashta, checkout (optional)" value={value.keywords} onChange={(e) => onChange({ ...value, keywords: e.target.value })} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={saving || !value.topic.trim() || !value.content.trim()} style={{ ...btn(GREEN, "#fff"), opacity: saving || !value.topic.trim() || !value.content.trim() ? 0.5 : 1 }}>{saving ? "Saving..." : saveLabel}</button>
        <button onClick={onCancel} style={btn("#F5F1E8", INK, "#E9E4D8")}>Cancel</button>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { isMobile } = useBreakpoint();
  const { hotelId: HOTEL_ID, hotelName } = useMyHotel();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Proposal>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Proposal>(empty);
  const [saving, setSaving] = useState(false);
  const [pasted, setPasted] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [proposals, setProposals] = useState<(Proposal & { keep: boolean })[]>([]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const load = useCallback(async () => { if (!HOTEL_ID) return; setFacts(await getFacts(HOTEL_ID)); setLoaded(true); }, [HOTEL_ID]);
  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => CATEGORIES.map((c) => ({ category: c, items: facts.filter((f) => f.category === c) })).filter((g) => g.items.length), [facts]);
  const live = facts.filter((f) => f.active).length;

  async function doAdd() {
    setSaving(true);
    const r = await addFact(HOTEL_ID!, draft);
    setSaving(false);
    if (r.ok) { flash("Aria now knows about " + draft.topic.trim()); setDraft(empty); setShowAdd(false); load(); } else flash(r.message ?? "Could not save");
  }
  function startEdit(f: Fact) { setEditing(f.id); setEditDraft({ topic: f.topic, content: f.content, category: f.category, keywords: f.keywords }); }
  async function doEdit(id: string) {
    setSaving(true);
    const r = await updateFact(HOTEL_ID!, id, editDraft);
    setSaving(false);
    if (r.ok) { flash("Updated"); setEditing(null); load(); } else flash(r.message ?? "Could not save");
  }
  async function toggle(f: Fact) {
    const r = await updateFact(HOTEL_ID!, f.id, { active: !f.active });
    if (r.ok) { flash(f.active ? "Switched off - Aria will not use it" : "Switched on"); load(); } else flash(r.message ?? "Could not update");
  }
  async function remove(f: Fact) {
    if (!confirm("Delete \"" + f.topic + "\"? Aria will no longer know this.")) return;
    const r = await deleteFact(HOTEL_ID!, f.id);
    if (r.ok) { flash("Deleted"); load(); } else flash(r.message ?? "Could not delete");
  }
  async function doExtract() {
    setExtracting(true);
    const r = await extractFacts(HOTEL_ID!, pasted);
    setExtracting(false);
    if (!r.ok) { flash(r.message ?? "Could not read that text"); return; }
    setProposals((r.data ?? []).map((p) => ({ ...p, keep: true })));
    if (!r.data?.length) flash("No new facts found in that text");
  }
  async function doImport() {
    const keep = proposals.filter((p) => p.keep).map(({ keep: _k, ...p }) => p);
    if (!keep.length) return;
    setSaving(true);
    const r = await importFacts(HOTEL_ID!, keep);
    setSaving(false);
    if (r.ok) { flash("Saved " + r.count + " fact" + (r.count === 1 ? "" : "s")); setProposals([]); setPasted(""); load(); } else flash(r.message ?? "Could not save");
  }

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: "linear-gradient(180deg,#F6F7F4 0%,#F1F3EF 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden", padding: isMobile ? "20px 16px" : "30px 34px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: INK }}>Knowledge</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>What Aria knows about {hotelName || "your hotel"}. Guests' questions about the hotel are answered from these facts - and only these. Anything not here, Aria says it does not know and offers the front desk.</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: MUTED }}>{live} live{facts.length !== live ? ", " + (facts.length - live) + " off" : ""}</span>
            <button onClick={() => { setShowAdd((v) => !v); setDraft(empty); }} style={btn(GREEN, "#fff")}>{showAdd ? "Close" : "+ Add a fact"}</button>
          </div>
        </div>

        {showAdd ? (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK, marginBottom: 12 }}>New fact</div>
            <FactForm value={draft} onChange={setDraft} onSave={doAdd} onCancel={() => setShowAdd(false)} saving={saving} saveLabel="Save fact" />
          </div>
        ) : null}

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK }}>Teach Aria from your own text</div>
          <div style={{ fontSize: 12, color: MUTED, margin: "4px 0 12px" }}>Paste your brochure, the text of your website, or a few paragraphs about the hotel. Aria reads it and proposes facts - nothing is saved until you tick and confirm.</div>
          <textarea style={{ ...field, minHeight: 110, resize: "vertical" }} placeholder="Paste the text here..." value={pasted} onChange={(e) => setPasted(e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <button onClick={doExtract} disabled={extracting || pasted.trim().length < 20} style={{ ...btn(INK, "#fff"), opacity: extracting || pasted.trim().length < 20 ? 0.5 : 1 }}>{extracting ? "Reading..." : "Find the facts"}</button>
            {proposals.length ? <span style={{ fontSize: 12, color: MUTED }}>{proposals.filter((p) => p.keep).length} of {proposals.length} selected</span> : null}
          </div>
          {proposals.length ? (
            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {proposals.map((p, i) => (
                <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: p.keep ? "#F4F7F5" : "#FAFAF8", border: "1px solid " + (p.keep ? "#D6E6DD" : "#EAEAE4"), cursor: "pointer" }}>
                  <input type="checkbox" checked={p.keep} onChange={() => setProposals((list) => list.map((x, j) => (j === i ? { ...x, keep: !x.keep } : x)))} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.topic}</span>
                      <span style={{ fontSize: 10, color: AMBER, background: "#F7F0E0", border: "1px solid #EAD9B0", borderRadius: 999, padding: "1px 8px" }}>{LABEL[p.category] ?? p.category}</span>
                    </div>
                    <div style={{ fontSize: 13, color: INK, marginTop: 3 }}>{p.content}</div>
                    {p.keywords ? <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{p.keywords}</div> : null}
                  </div>
                </label>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={doImport} disabled={saving || !proposals.some((p) => p.keep)} style={{ ...btn(GREEN, "#fff"), opacity: saving || !proposals.some((p) => p.keep) ? 0.5 : 1 }}>{saving ? "Saving..." : "Save selected"}</button>
                <button onClick={() => setProposals([])} style={btn("#F5F1E8", INK, "#E9E4D8")}>Discard</button>
              </div>
            </div>
          ) : null}
        </div>

        {loaded && !facts.length ? (
          <div style={{ ...card, textAlign: "center", padding: 36 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: INK }}>Nothing written yet</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 6, maxWidth: 520, margin: "6px auto 0" }}>Until you add facts, a guest asking about check-in times, Wi-Fi or the pool is told to ask the front desk. Start with the essentials: check-in and check-out, Wi-Fi, breakfast, reception hours.</div>
          </div>
        ) : null}

        {grouped.map((g) => (
          <div key={g.category} style={{ ...card, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: INK }}>{LABEL[g.category]}</span>
              <span style={{ fontSize: 11, color: MUTED }}>{HINT[g.category]}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {g.items.map((f) => (
                <div key={f.id} style={{ padding: "10px 12px", borderRadius: 12, background: f.active ? "#FAFAF8" : "#F3F3F0", border: "1px solid #EAEAE4", opacity: f.active ? 1 : 0.65 }}>
                  {editing === f.id ? (
                    <FactForm value={editDraft} onChange={setEditDraft} onSave={() => doEdit(f.id)} onCancel={() => setEditing(null)} saving={saving} saveLabel="Save changes" />
                  ) : (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{f.topic}{!f.active ? <span style={{ fontSize: 10, fontWeight: 600, color: RED, marginLeft: 8 }}>OFF</span> : null}</div>
                        <div style={{ fontSize: 13, color: INK, marginTop: 3, whiteSpace: "pre-wrap" }}>{f.content}</div>
                        {f.keywords ? <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{f.keywords}</div> : null}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => startEdit(f)} style={btn("#F5F1E8", INK, "#E9E4D8")}>Edit</button>
                        <button onClick={() => toggle(f)} style={btn("#F5F1E8", INK, "#E9E4D8")}>{f.active ? "Switch off" : "Switch on"}</button>
                        <button onClick={() => remove(f)} style={btn("#FBEDE9", "#B0776A", "#EED7D0")}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {toast ? <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", fontSize: 13, padding: "10px 18px", borderRadius: 999, boxShadow: "0 6px 20px rgba(0,0,0,.18)", zIndex: 50 }}>{toast}</div> : null}
      </div>
    </div>
  );
}
