"use server";
import { apiGet, apiPost } from "@/lib/api";

export type Profile = {
  checkInTime: string | null; checkOutTime: string | null; frontDeskPhone: string | null; emergencyPhone: string | null;
  wifiName: string | null; wifiPassword: string | null; breakfastHours: string | null; breakfastPlace: string | null;
  address: string | null; parking: string | null; pets: string | null; smoking: string | null; lateCheckout: string | null; earlyCheckin: string | null;
  currency: string | null; languages: string | null; notes: string | null; updatedAt: string | null; updatedBy: string | null;
};
export type ProfileDraft = Omit<Profile, "updatedAt" | "updatedBy">;
export type SpaRules = { advanceNoticeMins: number; firstAppointment: string | null; lastAppointment: string | null; medicalToHuman: boolean; cancellation: string | null; ageRule: string | null; notes: string | null; updatedAt: string | null; updatedBy: string | null; set: boolean };
export type Service = { id: string; name: string; price: string | null; unit: string | null; hours: string | null; dept: string | null; how: string | null; active: boolean; sortOrder: number; updatedAt: string; updatedBy: string | null };
export type ServiceDraft = { name: string; price: string; unit: string; hours: string; dept: string; how: string };
export type GoLive = { ready: boolean; filled: number; total: number; missing: { key: string; label: string }[]; counts: { facilities: number; facts: number; services: number; pairings: number }; spaRulesSet: boolean; live: boolean | null };
type Reply<T> = { ok: boolean; data?: T; error?: string; mandatory?: { key: string; label: string }[] };
type Result = { ok: boolean; message?: string };
const fail = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : "failed" });
const q = (hotelId: string) => "?hotelId=" + encodeURIComponent(hotelId);

export async function getProfile(hotelId: string): Promise<{ profile: Profile | null; mandatory: { key: string; label: string }[] }> {
  if (!hotelId) return { profile: null, mandatory: [] };
  try { const r = await apiGet<Reply<Profile>>("/api/forms/profile" + q(hotelId)); return { profile: r.ok && r.data ? r.data : null, mandatory: r.mandatory ?? [] }; } catch { return { profile: null, mandatory: [] }; }
}
export async function saveProfile(hotelId: string, p: ProfileDraft): Promise<Result> {
  try { const r = await apiPost<Reply<Profile>>("/api/forms/profile", { hotelId, ...p }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function getSpaRules(hotelId: string): Promise<SpaRules | null> {
  if (!hotelId) return null;
  try { const r = await apiGet<Reply<SpaRules>>("/api/forms/spa" + q(hotelId)); return r.ok && r.data ? r.data : null; } catch { return null; }
}
export async function saveSpaRules(hotelId: string, s: Partial<SpaRules>): Promise<Result> {
  try { const r = await apiPost<Reply<SpaRules>>("/api/forms/spa", { hotelId, advanceNoticeMins: s.advanceNoticeMins, firstAppointment: s.firstAppointment || null, lastAppointment: s.lastAppointment || null, medicalToHuman: s.medicalToHuman !== false, cancellation: s.cancellation || null, ageRule: s.ageRule || null, notes: s.notes || null }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function getServices(hotelId: string): Promise<Service[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<Reply<Service[]>>("/api/forms/services" + q(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function addService(hotelId: string, s: ServiceDraft): Promise<Result> {
  try { const r = await apiPost<Reply<Service>>("/api/forms/services", { hotelId, ...s }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function updateService(hotelId: string, id: string, patch: Partial<ServiceDraft> & { active?: boolean }): Promise<Result> {
  try { const r = await apiPost<Reply<Service>>("/api/forms/services/update", { hotelId, id, ...patch }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function deleteService(hotelId: string, id: string): Promise<Result> {
  try { const r = await apiPost<Reply<never>>("/api/forms/services/delete", { hotelId, id }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function getGoLive(hotelId: string): Promise<GoLive | null> {
  if (!hotelId) return null;
  try { const r = await apiGet<Reply<GoLive>>("/api/forms/go-live" + q(hotelId)); return r.ok && r.data ? r.data : null; } catch { return null; }
}
export async function goLive(hotelId: string): Promise<Result & { data?: GoLive }> {
  try { const r = await apiPost<Reply<GoLive>>("/api/forms/go-live", { hotelId }); return r.ok ? { ok: true, data: r.data } : { ok: false, message: r.error, data: r.data }; } catch (e) { return fail(e); }
}
