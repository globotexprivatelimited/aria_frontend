"use client";
/** The signed-in person's name from the console session token - for audit trails only, never for authorisation. */
export function whoAmI(): string {
  try {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("aria_token") : null;
    if (!token) return "staff";
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return String(payload.name ?? payload.fullName ?? payload.email ?? payload.staffUserId ?? "staff");
  } catch { return "staff"; }
}
