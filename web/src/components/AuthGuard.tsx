"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyRole } from "../lib/auth";

// Wrap a portal page. `allow` is the roles permitted here; anyone else -> login (or their own home).
export default function AuthGuard({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await getMyRole();
      if (!alive) return;
      if (!me) { router.replace("/login"); return; }
      if (allow.includes(me.role)) { setState("ok"); return; }
      // logged in but wrong portal -> send to their own home
      const { homeForRole } = await import("../lib/auth");
      router.replace(homeForRole(me.role));
      setState("denied");
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F7F4" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, border: "3px solid #E7E9E4", borderTopColor: "#0F5F4C", margin: "0 auto", animation: "ariaspin 0.7s linear infinite" }} />
          <p style={{ fontSize: 13, color: "#9AA09A", marginTop: 14 }}>Checking your access...</p>
        </div>
        <style>{"@keyframes ariaspin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }
  if (state === "denied") return null;
  return <>{children}</>;
}