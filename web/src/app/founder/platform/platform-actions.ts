"use client";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

const get = async (token: string, path: string) => {
  try {
    const r = await fetch(API + "/api/founder/" + path, { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await r.json();
    return j?.ok ? j.data : null;
  } catch { return null; }
};
const post = async (token: string, path: string, body: unknown) => {
  try {
    const r = await fetch(API + "/api/founder/" + path, { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
};

export type Billing = { mrr: number; costToServe: number; grossMarginPct: number; pilotsRunning: number;
  byPlan: { code: string; name: string; hotels: number; mrr: number }[]; costs: { category: string; amount: number }[] };
export type PlanRow = { code: string; name: string; monthlyPrice: number; maxStations: number | null; features: string[] };
export type Station = { id: string; hotelId: string; hotelName: string | null; name: string; dept: string | null; lastSeen: string | null; online: boolean; minutesOffline: number | null };
export type Incident = { id: string; hotelId: string | null; hotelName: string | null; kind: string; title: string; detail: string | null; severity: string; state: string; createdAt: string; resolvedAt: string | null };

export async function getBilling(t: string) { return get(t, "billing") as Promise<Billing | null>; }
export async function getPlans(t: string) { return get(t, "plans") as Promise<PlanRow[] | null>; }
export async function getStations(t: string) { return get(t, "stations") as Promise<{ stations: Station[]; totals: Record<string, number> } | null>; }
export async function getIncidents(t: string) { return get(t, "incidents") as Promise<{ incidents: Incident[]; open: number } | null>; }
export async function resolveIncident(t: string, id: string) { return post(t, "incidents/resolve", { id }); }
export async function addIncident(t: string, b: { hotelId?: string; title: string; detail?: string; severity?: string; kind?: string }) { return post(t, "incidents", b); }
