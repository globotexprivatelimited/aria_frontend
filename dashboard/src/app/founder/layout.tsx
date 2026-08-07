"use client";
import AuthGuard from "../../components/AuthGuard";
import FounderSidebar from "../../components/FounderSidebar";
import { useBreakpoint } from "../../lib/useBreakpoint";
import { T } from "./theme";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useBreakpoint();
  return (
    <AuthGuard allow={["founder"]}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&display=swap');
        .fdr ::selection { background: ${T.cobalt}; color: #fff; }
        .fdr *::-webkit-scrollbar { width: 9px; height: 9px; }
        .fdr *::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 9px; }
        .fdr *::-webkit-scrollbar-thumb:hover { background: ${T.dim}; }
        .fdr input::placeholder, .fdr textarea::placeholder { color: ${T.dim}; }
        .fdr button:focus-visible, .fdr a:focus-visible, .fdr input:focus-visible {
          outline: 2px solid ${T.cobalt}; outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) { .fdr * { animation: none !important; transition: none !important; } }
      `}</style>
      <div className="fdr" style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        minHeight: "100vh", width: "100%", background: T.base, color: T.ink,
      }}>
        <FounderSidebar />
        <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>{children}</div>
      </div>
    </AuthGuard>
  );
}
