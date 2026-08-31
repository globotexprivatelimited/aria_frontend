"use server";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type HotelSummary = {
  hotelId: string; name: string; city: string | null; onboarded: boolean; isActive: boolean;
  emailVerified: boolean; revenueSharePercent: number; contactEmail: string | null; whatsappNumber: string | null;
  rooms: { total: number; occupied: number; available: number; cleaning: number; occupancyPct: number };
  guestsInHouse: number;
  staff: { total: number; onDuty: number; names: string[] };
  requests: { open: number; inProgress: number; resolvedToday: number; urgent: number };
  revenue: { today: number; week: number; total: number };
  missed: { count: number; estimatedLoss: number };
  lastActivity: string | null;
};
export type Portfolio = { hotels: HotelSummary[]; totals: Record<string, number> };

export async function getPortfolio(token: string): Promise<Portfolio | null> {
  if (!token) return null;
  try {
    const res = await fetch(API + "/api/founder/portfolio", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await res.json();
    return j?.ok && j.data ? j.data : null;
  } catch { return null; }
}
