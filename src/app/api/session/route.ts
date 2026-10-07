import { NextResponse, type NextRequest } from "next/server";

const API = process.env.ARIA_API_URL ?? process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";
const COOKIE = "aria_token";

/** Seconds until the token's own expiry, so the cookie never outlives it (12 hours when the token does not say). */
function ttl(token: string): number {
  try {
    const exp = Number(JSON.parse(Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")).exp);
    if (exp > 0) return Math.max(60, Math.floor(exp - Date.now() / 1000));
  } catch { /* not a token we can read */ }
  return 60 * 60 * 12;
}
const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge });
/** A sign-in or sign-out must come from the console's own pages, never from another site. */
function sameSite(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}
type User = { role?: unknown; fullName?: unknown; email?: unknown; hotelId?: unknown };
const publicUser = (u: User) => ({ role: u.role, fullName: u.fullName, email: u.email, hotelId: u.hotelId });

/** POST /api/session - sign in. The API's token goes into an httpOnly cookie page scripts cannot read; the browser only learns who signed in. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!sameSite(req)) return NextResponse.json({ ok: false, error: "cross-site request refused" }, { status: 403 });
  let body: { email?: unknown; password?: unknown } = {};
  try { body = (await req.json()) as typeof body; } catch { /* empty body */ }
  let r: Response;
  try { r = await fetch(API + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: String(body.email ?? ""), password: String(body.password ?? "") }), cache: "no-store" }); }
  catch { return NextResponse.json({ ok: false, error: "The server could not be reached." }, { status: 502 }); }
  const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; data?: { token?: string; user?: User } } | null;
  const token = j?.data?.token;
  if (!r.ok || !j?.ok || !token) return NextResponse.json({ ok: false, error: j?.error ?? "Login failed" }, { status: r.ok ? 401 : r.status });
  const res = NextResponse.json({ ok: true, data: { user: publicUser(j.data?.user ?? {}) } });
  res.cookies.set(COOKIE, token, cookieOptions(ttl(token)));
  return res;
}

/** PUT /api/session - a token obtained another way (an invite, a new password) is checked with the API and kept in the cookie. */
export async function PUT(req: NextRequest): Promise<Response> {
  if (!sameSite(req)) return NextResponse.json({ ok: false, error: "cross-site request refused" }, { status: 403 });
  let token = "";
  try { token = String(((await req.json()) as { token?: unknown }).token ?? ""); } catch { /* empty body */ }
  if (!token) return NextResponse.json({ ok: false, error: "no token" }, { status: 400 });
  let me: Response;
  try { me = await fetch(API + "/api/auth/me", { headers: { authorization: "Bearer " + token }, cache: "no-store" }); }
  catch { return NextResponse.json({ ok: false, error: "The server could not be reached." }, { status: 502 }); }
  const j = (await me.json().catch(() => null)) as { ok?: boolean; data?: User } | null;
  if (!me.ok || !j?.ok) return NextResponse.json({ ok: false, error: "That session is not valid." }, { status: 401 });
  const res = NextResponse.json({ ok: true, data: { user: publicUser(j.data ?? {}) } });
  res.cookies.set(COOKIE, token, cookieOptions(ttl(token)));
  return res;
}

/** DELETE /api/session - sign out. */
export async function DELETE(req: NextRequest): Promise<Response> {
  if (!sameSite(req)) return NextResponse.json({ ok: false, error: "cross-site request refused" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", cookieOptions(0));
  return res;
}
