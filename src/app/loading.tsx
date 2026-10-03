import { DashboardSkeleton } from "@/components/Skeleton";

export default function RootLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)", padding: "28px 36px" }}>
      <DashboardSkeleton />
    </div>
  );
}
