const API = process.env.NEXT_PUBLIC_ARIA_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "aria_token";

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
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
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
    const res = await fetch(API + "/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    if (!j.ok) return { ok: false, error: j.error ?? "Login failed" };
    setToken(j.data.token);
    return { ok: true, role: j.data.user.role };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Login failed" }; }
}

export async function signOut() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    // clear any legacy supabase keys too
    Object.keys(window.localStorage).forEach((k) => { if (k.startsWith("sb-") || k.toLowerCase().includes("supabase")) window.localStorage.removeItem(k); });
  }
}