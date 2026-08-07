"use client";
const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export type TicketReply = { author: string; side: string; body: string; at: string };
export type Ticket = {
  id: string; ref: string; hotelId: string; hotelName: string; raisedBy: string | null;
  subject: string; body: string | null; priority: string; state: string;
  assignedTo: string | null; createdAt: string; updatedAt: string; resolvedAt: string | null;
  replies: TicketReply[];
};

export async function getTickets(token: string): Promise<{ tickets: Ticket[]; totals: Record<string, number> } | null> {
  try {
    const r = await fetch(API + "/api/founder/tickets", { headers: { authorization: "Bearer " + token }, cache: "no-store" });
    const j = await r.json();
    return j?.ok ? j.data : null;
  } catch { return null; }
}
async function post(token: string, path: string, body: unknown) {
  try {
    const r = await fetch(API + "/api/founder/" + path, { method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify(body) });
    const j = await r.json();
    return { ok: !!j?.ok, error: j?.error as string | undefined };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "failed" }; }
}
export async function replyTicket(t: string, ticketId: string, author: string, body: string) { return post(t, "tickets/reply", { ticketId, author, body }); }
export async function patchTicket(t: string, ticketId: string, patch: { state?: string; assignedTo?: string | null; priority?: string }) { return post(t, "tickets/update", { ticketId, ...patch }); }
