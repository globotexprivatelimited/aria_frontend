"use server";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type Insights = {
  series: { date: string; label: string; revenue: number; requests: number; resolved: number }[];
  growth: { month: string; hotels: number; cumulative: number }[];
  speed: { avgResponseMins: number | null; avgResolveMins: number | null;
    byHotel: { hotelId: string; name: string; response: number | null; resolve: number | null; handled: number }[] };
  demand: { item: string; times: number; revenue: number }[];
  gaps: { item: string; times: number; loss: number; hotels: number }[];
  byDepartment: { dept: string; requests: number; revenue: number; declined: number }[];
  activity: { hotelId: string; hotelName: string; room: string | null; detail: string | null; dept: string | null; status: string; at: string }[];
  attention: { hotelId: string; name: string; issue: string; severity: "high" | "medium" }[];
};

export async function getInsights(token: string, days = 30): Promise<Insights | null> {
  if (!token) return null;
  try {
    const res = await fetch(API + "/api/founder/insights?days=" + days, { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await res.json();
    return j?.ok && j.data ? j.data : null;
  } catch { return null; }
}
