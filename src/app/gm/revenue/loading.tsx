import GMSidebar from "@/components/GMSidebar";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function RevenueLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 36px 64px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <Skeleton width={180} height={12} style={{ marginBottom: 6 }} />
            <Skeleton width={280} height={34} />
          </div>
          <Skeleton width={130} height={34} borderRadius={999} />
        </div>

        {/* Revenue Flow KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} height={110} />
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Skeleton width={180} height={16} />
              <Skeleton width={80} height={20} />
            </div>
            <Skeleton width="100%" height={220} borderRadius={12} />
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
            <Skeleton width={120} height={16} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160 }}>
              <Skeleton width={150} height={150} borderRadius={999} />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={80} height={14} />
            </div>
          </div>
        </div>

        {/* Items leaderboard */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2EBE7", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px -2px rgba(47,93,80,0.04)" }}>
          <Skeleton width={200} height={16} style={{ marginBottom: 18 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Skeleton width={24} height={24} borderRadius={6} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <Skeleton width="30%" height={14} />
                    <Skeleton width={60} height={12} />
                  </div>
                  <Skeleton width="100%" height={6} borderRadius={999} />
                </div>
                <Skeleton width={70} height={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
