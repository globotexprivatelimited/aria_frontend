import GMSidebar from "@/components/GMSidebar";
import { ReceptionSkeleton } from "@/components/Skeleton";

export default function ReceptionLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg,#F8FAF9 0%,#F1F6F4 100%)" }}>
      <GMSidebar />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 36px 64px", overflowX: "hidden" }}>
        <ReceptionSkeleton />
      </div>
    </div>
  );
}
