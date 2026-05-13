#!/usr/bin/env node
/**
 * Pulls the latest services + contact info from the admin sync endpoint and
 * writes them to lib/contact.json and lib/services.json. Run during the
 * GitHub Pages build *before* `next build`.
 *
 * If ADMIN_SYNC_URL isn't set (e.g. local dev before backend exists), this
 * script logs a warning and exits 0 — the existing JSON files (if any) keep
 * the build working.
 *
 * Usage:
 *   ADMIN_SYNC_URL=https://access-barbados-admin.vercel.app/api/public/sync \
 *     node scripts/sync-from-admin.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const libDir = join(root, "lib");

const url = process.env.ADMIN_SYNC_URL;

if (!url) {
  console.warn(
    "[sync] ADMIN_SYNC_URL not set; skipping. Existing lib/*.json (if any) will be used.",
  );
  process.exit(0);
}

console.log(`[sync] Fetching ${url}`);

try {
  const res = await fetch(url, {
    headers: {
      Origin: "https://kkhinds.github.io",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`sync endpoint returned ${res.status}`);
  }
  const data = await res.json();

  if (!data?.contact || !Array.isArray(data?.services)) {
    throw new Error("malformed sync response (missing contact or services)");
  }

  await mkdir(libDir, { recursive: true });
  await writeFile(
    join(libDir, "contact.json"),
    JSON.stringify(data.contact, null, 2) + "\n",
    "utf8",
  );
  await writeFile(
    join(libDir, "services.json"),
    JSON.stringify(data.services, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `[sync] Wrote lib/contact.json + lib/services.json (${data.services.length} services).`,
  );
} catch (err) {
  console.error("[sync] Failed:", err instanceof Error ? err.message : err);
  // Fail the build only if we explicitly opted in to strict mode. Otherwise
  // continue with whatever JSON files already exist in the repo.
  if (process.env.ADMIN_SYNC_STRICT === "true") {
    process.exit(1);
  }
  console.warn("[sync] Continuing with existing JSON files.");
  process.exit(0);
}
