"use server";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type PersonRow = {
  name: string; email: string | null; phone: string | null; role: string;
  hotelId: string; hotelName: string;
  departments: string[]; onDuty: boolean; lastSeen: string | null;
  handled30d: number; avgResponseMins: number | null;
};
export type PeopleData = { people: PersonRow[]; totals: Record<string, number> };

export async function getAllPeople(token: string): Promise<PeopleData | null> {
  if (!token) return null;
  try {
    const res = await fetch(API + "/api/founder/people", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await res.json();
    return j?.ok && j.data ? j.data : null;
  } catch { return null; }
}
