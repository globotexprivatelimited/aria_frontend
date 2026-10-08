import { cookies } from "next/headers";
import { apiBase } from "@/lib/api";

/** GET /api/consent-export - the hotel's consent records as CSV, for a Meta request. Signed-in users only; the API checks the hotel. */
export async function GET(): Promise<Response> {
  const token = (await cookies()).get("aria_token")?.value;
  if (!token) return new Response("Not signed in", { status: 401 });
  let hotelId = "";
  try { hotelId = String(JSON.parse(Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")).hotelId ?? ""); } catch { /* the API will refuse */ }
  const r = await fetch(apiBase + "/api/dashboard/consent/export?hotelId=" + encodeURIComponent(hotelId), { headers: { authorization: "Bearer " + token }, cache: "no-store" });
  if (!r.ok) return new Response("Could not export (" + r.status + ")", { status: r.status });
  return new Response(await r.text(), { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=\"consent-" + hotelId + ".csv\"" } });
}
