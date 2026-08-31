"use server";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type HotelDetail = {
  hotel: { hotelId: string; name: string; city: string | null; address: string | null;
    whatsappNumber: string | null; contactEmail: string | null; contactPhone: string | null;
    checkInTime: string | null; checkOutTime: string | null; roomTarget: number | null;
    onboarded: boolean; isActive: boolean; emailVerified: boolean; revenueSharePercent: number; planCode: string; pilotEndsAt: string | null; accountOwner: string | null; createdAt: string };
  rooms: { roomNumber: string; type: string | null; floor: number | null; status: string;
    guestName: string | null; guestPhone: string | null; partySize: number | null;
    checkIn: string | null; checkOut: string | null; notes: string | null }[];
  staff: { name: string; email: string | null; role: string; phone: string | null;
    onDuty: boolean; lastSeen: string | null; departments: string[] }[];
  departments: { dept: string; mode: string; open: number; inProgress: number; resolvedToday: number; offerings: number }[];
  requests: { id: string; room: string | null; detail: string | null; department: string | null;
    status: string; priority: string; claimedBy: string | null; declined: boolean;
    createdAt: string; claimedAt: string | null; resolvedAt: string | null; revenue: number }[];
  missed: { item: string; department: string | null; times: number; loss: number }[];
  revenue: { today: number; week: number; month: number; total: number; byDept: { dept: string; amount: number }[] };
};

export async function getHotelDetail(token: string, hotelId: string): Promise<HotelDetail | null> {
  if (!token || !hotelId) return null;
  try {
    const res = await fetch(API + "/api/founder/hotel?hotelId=" + encodeURIComponent(hotelId),
      { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await res.json();
    return j?.ok && j.data ? j.data : null;
  } catch { return null; }
}
