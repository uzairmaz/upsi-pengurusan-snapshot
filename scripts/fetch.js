// Playwright snapshot script for dynamic pages (e.g., Elementor tabbed content)
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const TARGET_URL = process.env.TARGET_URL || "https://example.com/pengurusan-tertinggi";
const OUT_DIR = "docs";
const OUT_FILE = path.join(OUT_DIR, "index.html");
const TIMEOUT = 30000;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function waitIdle(page) {
  // wait for network and a bit of idle time
  await page.waitForLoadState("networkidle", { timeout: TIMEOUT }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function expandElementor(page) {
  // Click all tabs
  const tabSelectors = ["[role=tab]", ".elementor-tab-title"];
  for (const sel of tabSelectors) {
    const tabs = await page.$$(sel);
    for (const t of tabs) {
      try { await t.click({ timeout: 2000 }); } catch {}
    }
  }
  // Expand accordions
  const accSelectors = [".elementor-accordion .elementor-accordion-title", ".elementor-toggle .elementor-tab-title"];
  for (const sel of accSelectors) {
    const toggles = await page.$$(sel);
    for (const tg of toggles) {
      try { await tg.click({ timeout: 2000 }); } catch {}
    }
  }
  // Remove hidden/aria-hidden flags that prevent crawlers
  await page.evaluate(() => {
    const all = document.querySelectorAll("[hidden], [aria-hidden='true']");
    all.forEach(el => {
      el.removeAttribute("hidden");
      el.removeAttribute("aria-hidden");
      // Also force display if Elementor inlines styles
      if (getComputedStyle(el).display === "none") {
        el.style.display = "block";
        el.style.visibility = "visible";
        el.style.opacity = "1";
      }
    });
    // Expand any <details> elements
    document.querySelectorAll("details").forEach(d => d.open = true);
  });
}

async function main() {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1440, height: 1200 });
  console.log("Navigating to", TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
  await waitIdle(page);
  await expandElementor(page);
  await waitIdle(page);

  // Inline basic base href so relative assets resolve when served from /docs
  const html = await page.content();
  const withBase = html.replace(/<head([^>]*)>/i, (m, g1) => {
    const base = `<base href="${TARGET_URL}">`;
    return `<head${
      g1 || ""
    }>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${base}`;
  });

  fs.writeFileSync(OUT_FILE, withBase, "utf8");
  console.log("Saved snapshot to", OUT_FILE);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
