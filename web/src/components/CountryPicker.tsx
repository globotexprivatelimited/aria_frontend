"use client";

import { useState, useRef, useEffect } from "react";

import type { DialOption } from "../lib/dialCodes";
export type { DialOption };

export default function CountryPicker({ options, value, onChange, width = 132, gap = 6 }: { options: DialOption[]; value: string; onChange: (dial: string) => void; width?: number; gap?: number }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const sel = options.find((o) => o.d === value) ?? options[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const flagUrl = (cc: string) => "https://flagcdn.com/24x18/" + cc.toLowerCase() + ".png";
  const filtered = query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()) || o.d.includes(query) || o.c.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} style={{ position: "relative", marginTop: gap, flexShrink: 0, width }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, borderRadius: 10, border: "1px solid #E3E3DC", background: "#FBFBF9", padding: "11px 12px", fontSize: 14, cursor: "pointer", outline: "none" }}>
        <img src={flagUrl(sel.c)} alt="" width={22} height={16} style={{ borderRadius: 2, flexShrink: 0 }} />
        <span style={{ color: "#1B2621" }}>{sel.d}</span>
        <span style={{ marginLeft: "auto", color: "#9AA09A", fontSize: 11 }}>&#9662;</span>
      </button>
      {open ? (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, width: 260, maxHeight: 280, overflowY: "auto", background: "#fff", border: "1px solid #E3E3DC", borderRadius: 10, boxShadow: "0 12px 30px rgba(0,0,0,.12)", zIndex: 60 }}>
          <div style={{ padding: 8, position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #F0F0EA" }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search country..." autoFocus
              style={{ width: "100%", borderRadius: 8, border: "1px solid #E3E3DC", padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          {filtered.map((o, i) => (
            <button key={o.c + i} type="button" onClick={() => { onChange(o.d); setOpen(false); setQuery(""); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: 0, background: o.d === value ? "#E8F1ED" : "#fff", cursor: "pointer", fontSize: 14, textAlign: "left" }}>
              <img src={flagUrl(o.c)} alt="" width={22} height={16} style={{ borderRadius: 2, flexShrink: 0 }} />
              <span style={{ color: "#1B2621", flex: 1 }}>{o.name}</span>
              <span style={{ color: "#9AA09A", fontSize: 13 }}>{o.d}</span>
            </button>
          ))}
          {filtered.length === 0 ? <div style={{ padding: 16, textAlign: "center", color: "#9AA09A", fontSize: 13 }}>No match</div> : null}
        </div>
      ) : null}
    </div>
  );
}