import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill("#email", "teacher01@example.com");
await page.fill("#password", "StrongPass123!");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard/teacher", { timeout: 20000 });
await page.waitForSelector("text=Bonjour", { timeout: 20000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: "shot-dashboard.png", fullPage: true });
console.log("dashboard ok");

await page.goto(`${BASE}/dashboard/teacher/classes`, { waitUntil: "networkidle" });
await page.waitForSelector("text=3ème A", { timeout: 20000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: "shot-classes.png", fullPage: true });
console.log("classes ok");

await page.goto(`${BASE}/dashboard/teacher/resources`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Mathématiques", { timeout: 20000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: "shot-resources.png", fullPage: true });
console.log("resources ok");

console.log("CONSOLE_ERRORS:", errors.slice(0, 5).join(" || ") || "none");
await browser.close();
