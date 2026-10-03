import GMSidebar from "@/components/GMSidebar";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function AlertsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 36px 64px", overflowX: "hidden" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Skeleton width={180} height={12} style={{ marginBottom: 6 }} />
          <Skeleton width={320} height={34} style={{ marginBottom: 8 }} />
          <Skeleton width="50%" height={14} />
        </div>

        {/* 2-column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <SkeletonCard height={240} />
          <SkeletonCard height={240} />
          <div style={{ gridColumn: "1 / -1" }}>
            <SkeletonCard height={200} />
          </div>
        </div>
      </div>
    </div>
  );
}
