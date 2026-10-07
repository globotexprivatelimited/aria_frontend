import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

const API = process.env.ARIA_API_URL ?? process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";

/**
 * The browser's door to the API. Page scripts never hold the session token: it lives in an httpOnly cookie and this
 * route adds it on the server. It reaches only the API's own /api paths, never forwards the platform admin key or any
 * header a page sets, refuses a change sent from another site, and does not serve sign-in - that is /api/session.
 */
async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const parts = ((await ctx.params).path ?? []).map((p) => String(p));
  if (parts[0] !== "api" || parts.some((p) => p === "" || p === "." || p === ".." || p.includes("\\"))) return Response.json({ ok: false, error: "not found" }, { status: 404 });
  if (parts[1] === "auth" && parts[2] === "login") return Response.json({ ok: false, error: "sign in through /api/session" }, { status: 404 });
  const reading = req.method === "GET" || req.method === "HEAD";
  if (!reading) {
    const origin = req.headers.get("origin");
    let same = true;
    if (origin) { try { same = new URL(origin).host === req.headers.get("host"); } catch { same = false; } }
    if (!same) return Response.json({ ok: false, error: "cross-site request refused" }, { status: 403 });
  }
  const headers: Record<string, string> = {};
  const type = req.headers.get("content-type"); if (type) headers["content-type"] = type;
  const ip = req.headers.get("x-forwarded-for"); if (ip) headers["x-forwarded-for"] = ip;
  const token = (await cookies()).get("aria_token")?.value;
  if (token) headers.authorization = "Bearer " + token;
  let r: Response;
  try { r = await fetch(API + "/" + parts.map(encodeURIComponent).join("/") + req.nextUrl.search, { method: req.method, headers, body: reading ? undefined : await req.arrayBuffer(), cache: "no-store" }); }
  catch { return Response.json({ ok: false, error: "The server could not be reached." }, { status: 502 }); }
  const out = new Headers();
  for (const h of ["content-type", "content-disposition", "retry-after"]) { const v = r.headers.get(h); if (v) out.set(h, v); }
  const empty = r.status === 204 || r.status === 304 || req.method === "HEAD";
  return new Response(empty ? null : await r.arrayBuffer(), { status: r.status, headers: out });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
