import Link from "next/link";
import { apiGet } from "@/lib/api";
import GMSidebar from "@/components/GMSidebar";
import { LuxuryStars } from "@/components/LuxuryStars";

type Alerts = {
  emergencyMode: boolean;
  flaggedSessions: { phone: string; room: string | null; lastMessageAt: string | null }[];
  unverifiedActiveGuests: { phone: string; room: string | null; name: string | null }[];
  urgentRequests: { id: string; room: string | null; intent: string | null; department: string | null; detail: string | null; createdAt: string }[];
};

export default async function AlertsPage() {
  let data: Alerts | null = null;
  let error: string | null = null;
  try {
    data = await apiGet<Alerts>("/api/dashboard/alerts");
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown error";
  }

  return (
    <div className="alerts-container" style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div className="alerts-content" style={{ flex: 1, minWidth: 0, padding: "28px 36px 64px", overflowX: "hidden" }}>
        
        {/* Grandoria Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <LuxuryStars count={5} size={11} color="#B08A4F" gap={2} />
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Attention Queue &middot; Exceptions</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: "#0D1F1A", margin: 0, letterSpacing: "-0.01em" }}>Alerts &amp; Operational Flags</h1>
          <p style={{ fontSize: 13.5, color: "#72837C", marginTop: 4, fontFamily: "'Poppins', sans-serif" }}>Critical signals, unresolved exceptions, and urgent inquiries requiring GM intervention.</p>
        </div>

        {error || !data ? (
          <div style={{ marginTop: 20, borderRadius: 14, border: "1px solid #F0C1B8", background: "#FBEDE9", padding: 20, fontSize: 14, color: "#B23A2A" }}>{error ?? "No data available."}</div>
        ) : (
          <>
            {data.emergencyMode ? (
              <div style={{ marginTop: 20, borderRadius: 14, border: "1px solid #F0C1B8", background: "#FBEDE9", padding: 20, boxShadow: "0 4px 16px rgba(178,58,42,.12)" }}>
                <div style={{ fontWeight: 700, color: "#B23A2A", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B23A2A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Emergency mode is ACTIVE</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#B23A2A", marginTop: 4 }}>Every guest communication is receiving the automated emergency notice. Aria standard concierge answers are paused.</p>
              </div>
            ) : null}

            <div className="alerts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05)" }}>
                <h2 style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Unverified Guests</h2>
                <p style={{ fontSize: 12, color: "#8A9792", marginTop: 2 }}>Claimed a suite but no verified check-in folio found</p>
                <div style={{ marginTop: 16 }}>
                  {data.unverifiedActiveGuests.length === 0 ? (
                    <div style={{ fontSize: 13.5, color: "#8A9792" }}>All active guest numbers are formally registered.</div>
                  ) : data.unverifiedActiveGuests.map((g, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1F6F4", fontSize: 13.5 }}>
                      <span style={{ color: "#4A5D56" }}><b style={{ color: "#0D1F1A", fontFamily: "'Josefin Sans', sans-serif" }}>Suite {g.room ?? "?"}</b> &middot; {g.name ?? "Unknown"}</span>
                      <Link href={"/gm/conversations/" + encodeURIComponent(g.phone)} style={{ color: "#2F5D50", textDecoration: "none", fontWeight: 600, background: "#EBF3F0", padding: "4px 12px", borderRadius: 999, fontSize: 12 }}>View Chat</Link>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05)" }}>
                <h2 style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", color: "#B08A4F", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Flagged Conversations</h2>
                <p style={{ fontSize: 12, color: "#8A9792", marginTop: 2 }}>Inactive for an extended period &ndash; verify checkout</p>
                <div style={{ marginTop: 16, maxHeight: 360, overflowY: "auto" }}>
                  {data.flaggedSessions.length === 0 ? (
                    <div style={{ fontSize: 13.5, color: "#8A9792" }}>No dormant conversations flagged.</div>
                  ) : data.flaggedSessions.map((s, i) => (
                    <Link key={i} href={"/gm/conversations/" + encodeURIComponent(s.phone)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1F6F4", fontSize: 13.5, textDecoration: "none", transition: "background .15s" }}>
                      <span style={{ fontWeight: 600, color: "#0D1F1A", fontFamily: "'Josefin Sans', sans-serif" }}>Suite {s.room ?? "?"}</span>
                      <span style={{ color: "#8A9792", fontSize: 12.5 }}>{s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleDateString() : "\u2014"}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.05)" }}>
                <h2 style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".12em", color: "#B23A2A", fontWeight: 700, fontFamily: "'Josefin Sans', sans-serif" }}>Urgent Guest Requests</h2>
                <p style={{ fontSize: 12, color: "#8A9792", marginTop: 2 }}>Flagged urgent priority and currently pending fulfillment</p>
                <div style={{ marginTop: 16 }}>
                  {data.urgentRequests.length === 0 ? (
                    <div style={{ fontSize: 13.5, color: "#8A9792" }}>Zero pending urgent requests across all departments.</div>
                  ) : data.urgentRequests.map((r) => (
                    <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #F1F6F4", fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, color: "#0D1F1A", fontFamily: "'Josefin Sans', sans-serif" }}>Suite {r.room ?? "?"}</span>
                      <span style={{ marginLeft: 8, color: "#B08A4F", textTransform: "capitalize", fontWeight: 600 }}>{r.department ?? r.intent ?? "Concierge"}</span>
                      {r.detail ? <div style={{ marginTop: 3, color: "#4A5D56" }}>{r.detail}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 860px) {
          .alerts-container { flex-direction: column !important; }
          .alerts-content { padding: 18px 14px 40px !important; }
          .alerts-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
      `}</style>
    </div>
  );
}