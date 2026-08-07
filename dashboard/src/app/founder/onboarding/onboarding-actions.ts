"use client";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type OnboardingRow = {
  hotelId: string; name: string; city: string | null; roomCount: number | null;
  owner: string | null; gmName: string | null; daysInSetup: number;
  steps: Record<string, boolean>; done: number; total: number; blocker: string | null; live: boolean;
};

export async function getOnboarding(token: string): Promise<{ rows: OnboardingRow[]; totals: Record<string, number> } | null> {
  try {
    const r = await fetch(API + "/api/founder/onboarding", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await r.json();
    return j?.ok ? j.data : null;
  } catch { return null; }
}

async function post(token: string, path: string, body: unknown) {
  try {
    const r = await fetch(API + "/api/founder/" + path, { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}
export async function setStep(t: string, hotelId: string, step: string, value: boolean) { return post(t, "onboarding/step", { hotelId, step, value }); }
export async function setBlocker(t: string, hotelId: string, blocker: string | null) { return post(t, "onboarding/blocker", { hotelId, blocker }); }
