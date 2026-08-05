"use server";

const API = process.env.ARIA_API_URL ?? "http://localhost:4000";

export type RegisterInput = {
  fullName: string; email: string; password: string; phone?: string;
  hotelName: string; address?: string; city?: string; roomCount?: string;
  checkInTime?: string; checkOutTime?: string; contactPhone?: string;
  departments: string[];
};

export async function registerHotel(input: RegisterInput): Promise<{ ok: boolean; message: string; hotelId?: string }> {
  try {
    const res = await fetch(API + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: input.fullName, email: input.email, password: input.password, phone: input.phone,
        hotelName: input.hotelName, address: input.address, city: input.city, roomCount: input.roomCount,
        checkInTime: input.checkInTime, checkOutTime: input.checkOutTime, contactPhone: input.contactPhone,
        departments: input.departments.map((d) => ({ dept: d })),
      }),
      cache: "no-store",
    });
    const body = await res.json();
    if (!res.ok || !body.ok) return { ok: false, message: body.error ?? "Registration failed. Please try again." };
    return { ok: true, message: "Registration complete.", hotelId: body.data?.hotelId };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." };
  }
}