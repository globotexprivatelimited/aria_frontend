"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyRole, homeForRole } from "../lib/auth";

// Bare "/" should never show a portal. Send logged-in users to their home, everyone else to login.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const me = await getMyRole();
      router.replace(me ? homeForRole(me.role) : "/login");
    })();
  }, [router]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F1EA" }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, border: "2.5px solid #E6E1D5", borderTopColor: "#0F5F4C", animation: "sp .8s linear infinite" }} />
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}