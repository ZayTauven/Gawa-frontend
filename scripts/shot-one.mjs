import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3000";
const EMAIL = process.env.SHOT_EMAIL ?? "teacher01@example.com";
const PASS = process.env.SHOT_PASS ?? "StrongPass123!";
const PATH = process.env.SHOT_PATH ?? "/dashboard/teacher";
const WAIT = process.env.SHOT_WAIT ?? "Bonjour";
const OUT = process.env.SHOT_OUT ?? "shot.png";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#password", PASS);
await page.click('button[type="submit"]');
await page.waitForURL(`**${PATH}`, { timeout: 20000 }).catch(() => {});
if (page.url().replace(BASE, "") !== PATH) {
  await page.goto(`${BASE}${PATH}`, { waitUntil: "networkidle" });
}
await page.waitForSelector(`text=${WAIT}`, { timeout: 20000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: OUT, fullPage: true });
console.log("OK:", OUT, "| CONSOLE_ERRORS:", errors.slice(0, 5).join(" || ") || "none");
await browser.close();
