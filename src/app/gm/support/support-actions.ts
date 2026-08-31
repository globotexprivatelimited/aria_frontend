"use client";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type Reply = { author: string; side: string; body: string; at: string };
export type MyTicket = {
  id: string; ref: string; subject: string; body: string | null; priority: string;
  state: string; assignedTo: string | null; createdAt: string; resolvedAt: string | null; replies: Reply[];
};

export async function getMyTickets(token: string): Promise<MyTicket[]> {
  try {
    const r = await fetch(API + "/api/support/my-tickets", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await r.json();
    return j?.ok && j.data ? j.data.tickets : [];
  } catch { return []; }
}

export async function raiseTicket(token: string, b: { subject: string; body?: string; priority?: string }) {
  try {
    const r = await fetch(API + "/api/support/ticket", { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(b) });
    const j = await r.json();
    return { ok: !!j?.ok, ref: j?.data?.ref as string | undefined, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}

export async function replyOnTicket(token: string, ticketId: string, body: string) {
  try {
    const r = await fetch(API + "/api/support/reply", { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify({ ticketId, body }) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}
