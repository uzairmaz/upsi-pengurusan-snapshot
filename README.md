# UPSI Pengurusan Tertinggi – Static Snapshot (GitHub Pages + Playwright)

This repo snapshots a dynamic page (e.g., UPSI **Pengurusan Tertinggi**) into a static, crawlable HTML every night.
Perfect for feeding AskBot or any crawler that struggles with JavaScript/tabbed content (Elementor, etc.).

## How it works
- A Playwright script (`scripts/fetch.js`) opens the target page, clicks/expands tabs/accordions, removes `hidden`/`aria-hidden` bits, and saves the rendered HTML to `docs/index.html`.
- GitHub Actions runs this **nightly** (and on manual trigger) and commits any changes.
- GitHub Pages serves `docs/` at `https://<your-username>.github.io/upsi-pengurusan-snapshot/`

## Quick start
1. Create a **public** GitHub repo named `upsi-pengurusan-snapshot`.
2. Upload everything in this ZIP to that repo (or `git push`).
3. In the repo: **Settings → Pages** → Source: “**Deploy from a branch**”, Branch: `main`, Folder: `/docs`. Save.
4. Go to **Actions** → enable workflows if prompted → select **Nightly snapshot** → **Run workflow** once.
5. Your page will appear at `https://<your-username>.github.io/upsi-pengurusan-snapshot/`

## Configure the target URL
Edit `scripts/fetch.js` and set **TARGET_URL** to the exact page you want (e.g. the UPSI Pengurusan Tertinggi page).
By default it's set to a placeholder.

```js
const TARGET_URL = process.env.TARGET_URL || "https://example.com/pengurusan-tertinggi";
```

Optionally, set the URL in Actions as an environment variable `TARGET_URL` (repository → Settings → Secrets and variables → Actions → Variables).

## Notes
- The workflow uses the built-in `GITHUB_TOKEN` to commit changes; no PAT required.
- If your page uses Elementor or similar, the script already tries to:
  - click all `[role=tab]` and `.elementor-tab-title`
  - expand `.elementor-accordion`
  - remove `hidden` / `aria-hidden` from content containers
- The initial `docs/index.html` here is a **holding page** so Pages deploys cleanly even before the first fetch runs.

## AskBot
Point AskBot to crawl `https://<your-username>.github.io/upsi-pengurusan-snapshot/` after the first successful run.
