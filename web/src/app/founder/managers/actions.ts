"use server";

import { apiPost } from "@/lib/api";

export async function createManager(input: { fullName: string; email: string; password: string; phone?: string }) {
  const fullName = input.fullName.trim(), email = input.email.trim();
  if (!fullName || !email || !input.password) return { ok: false, message: "Name, email and password are required." };
  if (input.password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  try {
    const res = await apiPost<{ ok: boolean; error?: string; data?: { authUserId: string } }>("/api/admin/gms", {
      email, password: input.password, fullName, phone: input.phone,
    });
    if (!res.ok) return { ok: false, message: res.error ?? "Could not create the manager." };
    return { ok: true, message: "Manager created." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." };
  }
}