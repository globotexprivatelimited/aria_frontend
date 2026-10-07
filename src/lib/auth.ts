const API = "/api/aria"; // the console route that adds the session token on the server - src/app/api/aria
const TOKEN_KEY = "aria_token";
/** The session token lives only in an httpOnly cookie set by the console's own /api/session route - page scripts never see it. The browser keeps a marker that says someone is signed in and calls the API through /api/aria, which adds the token on the server. */
function clearCookie() { if (typeof document !== "undefined") document.cookie = TOKEN_KEY + "=; path=/; max-age=0"; }

export type Role = "founder" | "gm" | "fb" | "housekeeping" | "spa" | "front_desk" | "staff";

export function homeForRole(role: string): string {
  switch (role) {
    case "founder": return "/founder";
    case "gm": return "/gm";
    case "staff": return "/staff";
    case "fb": case "housekeeping": case "spa": case "front_desk": return "/staff";
    default: return "/gm";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // a token from before the httpOnly cookie is dropped here, and the person signs in once more
  const t = window.localStorage.getItem(TOKEN_KEY); if (t && t.split(".").length === 3) { window.localStorage.removeItem(TOKEN_KEY); window.localStorage.removeItem("aria_me"); clearCookie();
    void fetch("/api/session", { method: "DELETE" }).catch(() => undefined); return null; } return t;
}
const SESSION_MARKER = "session";
/** Remember who signed in - name and role for display only; the token itself never reaches page scripts. */
function rememberSignIn(user: { fullName?: unknown; email?: unknown; role?: unknown; hotelId?: unknown } | undefined) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, SESSION_MARKER);
  try { window.localStorage.setItem("aria_me", JSON.stringify({ name: String(user?.fullName ?? user?.email ?? ""), role: String(user?.role ?? ""), hotelId: String(user?.hotelId ?? "") })); } catch { /* storage blocked */ }
}
/** A token obtained another way (an invite, a new password) goes to the console's server, which keeps it in the httpOnly cookie. */
export async function setToken(token: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const r = await fetch("/api/session", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const j = await r.json();
    if (j?.ok) rememberSignIn(j.data?.user);
  } catch { /* the person signs in again */ }
}

type MeResponse = { ok: boolean; data?: { role: string; hotelId: string; fullName: string; hotelName: string; departments: string[]; webhookToken?: string } };

async function fetchMe(): Promise<MeResponse["data"] | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(API + "/api/auth/me", { headers: { authorization: "Bearer " + token } });
    if (!res.ok) return null;
    const j: MeResponse = await res.json();
    return j.ok && j.data ? j.data : null;
  } catch { return null; }
}

// same signature as before: { role, hotelId, fullName } | null
export async function getMyRole(): Promise<{ role: string; hotelId: string; fullName: string } | null> {
  const me = await fetchMe();
  if (!me) return null;
  return { role: me.role, hotelId: me.hotelId, fullName: me.fullName };
}

export async function getWebhookToken(): Promise<string> {
  const me = await fetchMe();
  return me?.webhookToken ?? "";
}

export async function getMyDepartments(): Promise<string[]> {
  const me = await fetchMe();
  return me?.departments ?? [];
}

// login helper used by the login page
export async function signIn(email: string, password: string): Promise<{ ok: boolean; role?: string; error?: string }> {
  try {
    const res = await fetch("/api/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, error: j.error ?? "Login failed" };
    rememberSignIn(j.data.user);
    return { ok: true, role: j.data.user.role };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Login failed" }; }
}

export async function signOut() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY); clearCookie();
    // clear any legacy supabase keys too
    Object.keys(window.localStorage).forEach((k) => { if (k.startsWith("sb-") || k.toLowerCase().includes("supabase")) window.localStorage.removeItem(k); });
  }
}