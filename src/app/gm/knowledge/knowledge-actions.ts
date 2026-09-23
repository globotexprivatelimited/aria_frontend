"use server";
import { apiGet, apiPost } from "@/lib/api";

export type Fact = { id: string; topic: string; content: string; category: string; keywords: string; active: boolean; updatedAt: string };
export type Proposal = { topic: string; content: string; category: string; keywords: string };
type Reply<T> = { ok: boolean; data?: T; error?: string; count?: number };
type Result = { ok: boolean; message?: string };
const fail = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : "failed" });

export async function getFacts(hotelId: string): Promise<Fact[]> {
  if (!hotelId) return [];
  try { const r = await apiGet<Reply<Fact[]>>("/api/knowledge?hotelId=" + encodeURIComponent(hotelId)); return r.ok && r.data ? r.data : []; } catch { return []; }
}
export async function addFact(hotelId: string, f: Proposal): Promise<Result> {
  try { const r = await apiPost<Reply<Fact>>("/api/knowledge", { hotelId, ...f }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function updateFact(hotelId: string, id: string, patch: Partial<Proposal> & { active?: boolean }): Promise<Result> {
  try { const r = await apiPost<Reply<Fact>>("/api/knowledge/update", { hotelId, id, ...patch }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function deleteFact(hotelId: string, id: string): Promise<Result> {
  try { const r = await apiPost<Reply<never>>("/api/knowledge/delete", { hotelId, id }); return r.ok ? { ok: true } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
/** Claude reads pasted text and proposes facts; nothing is saved until the GM ticks them. */
export async function extractFacts(hotelId: string, text: string): Promise<{ ok: boolean; data?: Proposal[]; message?: string }> {
  try { const r = await apiPost<Reply<Proposal[]>>("/api/knowledge/extract", { hotelId, text }); return r.ok ? { ok: true, data: r.data ?? [] } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
export async function importFacts(hotelId: string, facts: Proposal[]): Promise<{ ok: boolean; count?: number; message?: string }> {
  try { const r = await apiPost<Reply<never>>("/api/knowledge/import", { hotelId, facts }); return r.ok ? { ok: true, count: r.count ?? 0 } : { ok: false, message: r.error }; } catch (e) { return fail(e); }
}
