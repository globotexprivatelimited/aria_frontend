"use server";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; sent?: boolean; message?: string }> {
  try {
    const res = await fetch(API + "/api/auth/forgot", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
      cache: "no-store",
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, message: j.error ?? "Could not send reset email." };
    return { ok: true, sent: j.data?.sent };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Network error." }; }
}

export async function validateToken(token: string): Promise<{ ok: boolean; valid?: boolean }> {
  try {
    const res = await fetch(API + "/api/auth/reset/validate?token=" + encodeURIComponent(token), { cache: "no-store" });
    const j = await res.json();
    return { ok: j.ok, valid: j.data?.valid };
  } catch { return { ok: false, valid: false }; }
}

export async function submitNewPassword(token: string, password: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(API + "/api/auth/reset", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
      cache: "no-store",
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, message: j.error ?? "Could not reset password." };
    return { ok: true };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Network error." }; }
}
