"use server";

const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

export async function actOnRequest(args: { token: string; requestId: string; command: "ACCEPT" | "CLAIM" | "DONE" | "REJECT" | "ISSUE" }): Promise<{ ok: boolean; status?: string; message?: string }> {
  try {
    const res = await fetch(API + "/api/staff/request-action", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: "Bearer " + args.token },
      body: JSON.stringify({ requestId: args.requestId, command: args.command }),
      cache: "no-store",
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, message: j.error ?? "That did not go through." };
    return { ok: true, status: j.data?.status };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Could not reach the server." }; }
}
