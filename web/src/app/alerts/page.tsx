import Link from "next/link";
import { apiGet } from "@/lib/api";
import GMSidebar from "@/components/GMSidebar";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F7F4" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "32px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 600, color: "#1B2621" }}>Alerts</h1>
        <p style={{ fontSize: 14, color: "#6E756F", marginTop: 2 }}>Things worth a human eye</p>

        {error || !data ? (
          <div style={{ marginTop: 20, borderRadius: 12, border: "1px solid #F0D5CD", background: "#FBEDE9", padding: 20, fontSize: 14, color: "#B23A2A" }}>{error ?? "No data."}</div>
        ) : (
          <>
            {data.emergencyMode ? (
              <div style={{ marginTop: 20, borderRadius: 12, border: "1px solid #E7B9A8", background: "#FBEDE9", padding: 20 }}>
                <div style={{ fontWeight: 700, color: "#B23A2A" }}>Emergency mode is ON</div>
                <p style={{ fontSize: 14, color: "#B23A2A", marginTop: 4 }}>Every guest message is receiving the emergency notice. Aria is not answering normally.</p>
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Unverified guests</h2>
                <p style={{ fontSize: 12, color: "#9AA09A", marginTop: 2 }}>Claimed a room but no front-desk record</p>
                <div style={{ marginTop: 16 }}>
                  {data.unverifiedActiveGuests.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#9AA09A" }}>All in-house guests are verified.</div>
                  ) : data.unverifiedActiveGuests.map((g, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F4F4F1", fontSize: 14 }}>
                      <span style={{ color: "#3A413B" }}><b style={{ color: "#1B2621" }}>Room {g.room ?? "?"}</b> &middot; {g.name ?? "Unknown"}</span>
                      <Link href={"/conversations/" + encodeURIComponent(g.phone)} style={{ color: "#0F5F4C", textDecoration: "none", fontWeight: 500 }}>View</Link>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Flagged sessions</h2>
                <p style={{ fontSize: 12, color: "#9AA09A", marginTop: 2 }}>Quiet a long time &ndash; may have checked out</p>
                <div style={{ marginTop: 16, maxHeight: 360, overflowY: "auto" }}>
                  {data.flaggedSessions.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#9AA09A" }}>Nothing flagged.</div>
                  ) : data.flaggedSessions.map((s, i) => (
                    <Link key={i} href={"/conversations/" + encodeURIComponent(s.phone)} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F4F4F1", fontSize: 14, textDecoration: "none" }}>
                      <span style={{ fontWeight: 500, color: "#1B2621" }}>Room {s.room ?? "?"}</span>
                      <span style={{ color: "#9AA09A", fontSize: 13 }}>{s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleDateString() : "\u2014"}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", background: "#fff", border: "1px solid #EAEAE4", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: "#6E756F", fontWeight: 600 }}>Urgent requests</h2>
                <p style={{ fontSize: 12, color: "#9AA09A", marginTop: 2 }}>Marked urgent and still open</p>
                <div style={{ marginTop: 16 }}>
                  {data.urgentRequests.length === 0 ? (
                    <div style={{ fontSize: 14, color: "#9AA09A" }}>Nothing urgent right now.</div>
                  ) : data.urgentRequests.map((r) => (
                    <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #F4F4F1", fontSize: 14 }}>
                      <span style={{ fontWeight: 600, color: "#1B2621" }}>Room {r.room ?? "?"}</span>
                      <span style={{ marginLeft: 8, color: "#6E756F", textTransform: "capitalize" }}>{r.department ?? r.intent ?? "unassigned"}</span>
                      {r.detail ? <div style={{ marginTop: 2, color: "#9AA09A" }}>{r.detail}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}