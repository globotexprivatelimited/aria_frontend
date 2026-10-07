"use client";
const API = "/api/aria"; // the console route that adds the session token on the server - src/app/api/aria

async function post(token: string, path: string, body: unknown) {
  try {
    const r = await fetch(API + "/api/founder/" + path, { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}

export type PlanRow = { code: string; name: string; monthlyPrice: number; maxStations: number | null; features: string[] };

export async function getPlans(token: string): Promise<PlanRow[]> {
  try {
    const r = await fetch(API + "/api/founder/plans", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await r.json();
    return j?.ok && j.data ? j.data : [];
  } catch { return []; }
}
export async function setPlan(token: string, hotelId: string, planCode: string) { return post(token, "hotel/plan", { hotelId, planCode }); }
export async function setShare(token: string, hotelId: string, percent: number) { return post(token, "hotel/share", { hotelId, percent }); }
export async function setActive(token: string, hotelId: string, active: boolean) { return post(token, "hotel/active", { hotelId, active }); }
