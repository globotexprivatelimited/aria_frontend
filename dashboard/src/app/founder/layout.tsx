"use client";
import AuthGuard from "../../components/AuthGuard";
import FounderSidebar from "../../components/FounderSidebar";
import { useBreakpoint } from "../../lib/useBreakpoint";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useBreakpoint();
  return (
    <AuthGuard allow={["founder"]}>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", width: "100%", background: "#F6F7F4" }}>
        <FounderSidebar />
        <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>{children}</div>
      </div>
    </AuthGuard>
  );
}
