import { test, expect, type Page, type Request as PwRequest, type Response as PwResponse } from "@playwright/test";

/**
 * The console as a person meets it (pending item 32): signing in, the session cookie, what each role may reach, and
 * signing out. Read-only - nothing is created, changed or sent - so it is safe against the live console. Each role
 * signs in once. The accounts come from the environment (E2E_GM_EMAIL and E2E_GM_PASSWORD, E2E_STAFF_EMAIL and
 * E2E_STAFF_PASSWORD), never from this file.
 */
const GM = { email: process.env.E2E_GM_EMAIL ?? "", password: process.env.E2E_GM_PASSWORD ?? "" };
const STAFF = { email: process.env.E2E_STAFF_EMAIL ?? "", password: process.env.E2E_STAFF_PASSWORD ?? "" };
const GM_PAGES = ["/gm", "/gm/reception", "/gm/requests", "/gm/departments", "/gm/staff", "/gm/guests", "/gm/revenue", "/alerts"];
const MANAGER_ONLY = ["/api/menu", "/api/dashboard/overview", "/api/revenue/summary", "/api/presence/departments"];
const BROKEN = /Not signed in|Not your hotel|unauthorized|Application error|Internal Server Error|This page could not be found/i;
const HTTPS = (process.env.CONSOLE_URL ?? "").startsWith("https:");

/** A call from inside the page through the console's own door to the API, exactly as the console's scripts make it - the status it gets. */
const api = (page: Page, path: string): Promise<number> => page.evaluate((url) => fetch(url, { cache: "no-store" }).then((r) => r.status), "/api/aria" + path);

/** Every script this page loads from now on, to check none of them names the platform key header. */
function watchScripts(page: Page): () => Promise<string[]> {
  const bodies: Promise<string>[] = [];
  page.on("response", (r) => { if (r.request().resourceType() === "script") bodies.push(r.text().catch(() => "")); });
  return () => Promise.all(bodies);
}
const KEY_HEADER = "x-admin-key";

/** True for the console's own sign-in call (POST /api/session). */
const isSignIn = (r: PwRequest): boolean => r.method() === "POST" && new URL(r.url()).pathname === "/api/session";

/**
 * Signs in through the login page the way a person does: Enter, or the Sign in button when Enter does not submit. When
 * the page does not move on, the error says what the console's sign-in answered (its reply holds no token - that is in
 * the httpOnly cookie), so a wrong password, an inactive account and a slow API are told apart.
 */
async function signIn(page: Page, who: { email: string; password: string }): Promise<void> {
  let asked = 0;
  const answers: Promise<string>[] = [];
  const onRequest = (r: PwRequest): void => { if (isSignIn(r)) asked++; };
  const onResponse = (r: PwResponse): void => { if (isSignIn(r.request())) answers.push(r.text().then((t) => r.status() + " " + t.slice(0, 200), () => String(r.status()))); };
  page.on("request", onRequest);
  page.on("response", onResponse);
  try {
    await page.goto("/login");
    const password = page.locator('input[type="password"]').first();
    await page.locator('input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])').first().fill(who.email);
    await password.fill(who.password);
    await password.press("Enter");
    await page.waitForTimeout(3_000);
    if (!asked) await page.getByRole("button", { name: /sign in|log in|continue/i }).first().click();
    const left = await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60_000 }).then(() => true, () => false);
    if (!left) {
      const said = await Promise.all(answers);
      throw new Error("signing in as " + who.email + " did not leave the login page. The console's sign-in " +
        (said.length ? "answered: " + said.join(" | ") : asked ? "was asked but had not answered after 60 seconds - the API is slow or stuck" : "was never asked - the form did not submit"));
    }
  } finally {
    page.off("request", onRequest);
    page.off("response", onResponse);
  }
}

test.describe("signed out", () => {
  test("the console's pages carry the security headers", async ({ page }) => {
    const r = await page.goto("/login");
    expect(r?.status() ?? 0).toBeLessThan(400);
    const h = r?.headers() ?? {};
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"] ?? "").toContain("frame-ancestors 'none'");
  });

  test("no script the login page loads carries the platform key", async ({ page }) => {
    const scripts = watchScripts(page);
    await page.goto("/login");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1_500);
    const all = await scripts();
    expect(all.length).toBeGreaterThan(0);
    expect(all.filter((s) => s.includes(KEY_HEADER)).length, "a page script names the " + KEY_HEADER + " header").toBe(0);
  });

  test("the API refuses everything through the console without a sign-in", async ({ page }) => {
    await page.goto("/login");
    for (const p of MANAGER_ONLY) expect(await api(page, p), p).toBe(401);
  });
});

test("a GM: session cookie, every page, own hotel only, sign-out", async ({ page, context }) => {
  test.skip(!GM.email || !GM.password, "set E2E_GM_EMAIL and E2E_GM_PASSWORD to run this");
  const scripts = watchScripts(page);
  await test.step("signs in and lands on the GM console", async () => {
    await signIn(page, GM);
    await expect(page, "this account did not land on /gm - is it a GM account?").toHaveURL(/\/gm/);
  });
  await test.step("the session is an httpOnly cookie page scripts cannot read", async () => {
    const cookie = (await context.cookies()).find((c) => c.name === "aria_token");
    expect(cookie, "no aria_token cookie after signing in").toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    if (HTTPS) expect(cookie?.secure).toBe(true);
    expect(await page.evaluate(() => window.localStorage.getItem("aria_token"))).toBe("session");
    expect(await page.evaluate(() => document.cookie)).not.toContain("aria_token");
  });
  await test.step("every GM page loads", async () => {
    for (const p of GM_PAGES) {
      const r = await page.goto(p);
      expect(r?.status() ?? 0, p).toBeLessThan(400);
      await page.waitForTimeout(1_500);
      expect(new URL(page.url()).pathname, p + " sent the GM back to the login page").not.toMatch(/^\/login/);
      expect(await page.locator("body").innerText(), p).not.toMatch(BROKEN);
    }
    expect((await scripts()).filter((s) => s.includes(KEY_HEADER)).length, "a script on the GM pages names the " + KEY_HEADER + " header").toBe(0);
  });
  await test.step("reads their own hotel and is refused another", async () => {
    expect(await api(page, "/api/menu")).toBe(200);
    expect(await api(page, "/api/menu?hotelId=e2e-not-this-hotel")).toBe(403);
  });
  await test.step("signing out ends the session", async () => {
    await page.evaluate(() => fetch("/api/session", { method: "DELETE" }).then((r) => r.status));
    expect((await context.cookies()).some((c) => c.name === "aria_token" && c.value !== "")).toBe(false);
    expect(await api(page, "/api/menu")).toBe(401);
  });
});

test("a staff member: the staff board, and none of the manager's routes", async ({ page }) => {
  test.skip(!STAFF.email || !STAFF.password, "set E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD to run this");
  await signIn(page, STAFF);
  await expect(page, "this account did not land on /staff - is it a staff account?").toHaveURL(/\/staff/);
  expect(await page.locator("body").innerText()).not.toMatch(/Application error|Internal Server Error/i);
  for (const p of MANAGER_ONLY) expect(await api(page, p), p).toBe(401);
  await page.evaluate(() => fetch("/api/session", { method: "DELETE" }).then((r) => r.status));
});
