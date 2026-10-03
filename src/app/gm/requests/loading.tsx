import GMSidebar from "@/components/GMSidebar";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function RequestsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 36px 64px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <Skeleton width={180} height={12} style={{ marginBottom: 6 }} />
            <Skeleton width={260} height={32} />
          </div>
          <Skeleton width={120} height={34} borderRadius={999} />
        </div>

        {/* Counter Tiles */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <SkeletonCard height={90} style={{ width: 170 }} />
          <SkeletonCard height={90} style={{ width: 170 }} />
        </div>

        {/* Request Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#FFFFFF",
                border: "1px solid #E2EBE7",
                borderRadius: 16,
                padding: "18px 20px",
                boxShadow: "0 4px 16px rgba(47,93,80,0.04)",
              }}
            >
              <Skeleton width={64} height={24} borderRadius={6} />
              <div style={{ flex: 1 }}>
                <Skeleton width="45%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="25%" height={12} />
              </div>
              <Skeleton width={80} height={18} />
              <Skeleton width={100} height={32} borderRadius={999} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
