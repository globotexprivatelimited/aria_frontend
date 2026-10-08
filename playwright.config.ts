import { defineConfig, devices } from "@playwright/test";

/**
 * Browser checks for the console (pending item 32). They run against a console that is already up - the live one, or
 * `pnpm dev` - named by CONSOLE_URL. They only sign in, read and sign out: nothing is created, changed or sent.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 300_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  outputDir: "./test-results",
  use: { ...devices["Desktop Chrome"], baseURL: process.env.CONSOLE_URL ?? "http://localhost:3001", trace: "retain-on-failure" },
});
