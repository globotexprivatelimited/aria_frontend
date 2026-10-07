"use client";
/** The signed-in person's name as remembered at sign-in - for audit trails only, never for authorisation. */
export function whoAmI(): string {
  try {
    const me = typeof window !== "undefined" ? window.localStorage.getItem("aria_me") : null;
    const name = me ? String((JSON.parse(me) as { name?: unknown }).name ?? "").trim() : "";
    return name || "staff";
  } catch { return "staff"; }
}
