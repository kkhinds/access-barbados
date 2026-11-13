import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Run a copy of the script in a temp folder, so it writes to <tmp>/lib and
// never touches the repo's committed JSON. A data: URL stands in for the admin.
function runStrict(body) {
  const dir = mkdtempSync(join(tmpdir(), "sync-test-"));
  mkdirSync(join(dir, "scripts"));
  const script = join(dir, "scripts", "sync-from-admin.mjs");
  copyFileSync(fileURLToPath(new URL("./sync-from-admin.mjs", import.meta.url)), script);
  const r = spawnSync(process.execPath, [script], {
    env: {
      ...process.env,
      ADMIN_SYNC_URL: "data:application/json," + encodeURIComponent(JSON.stringify(body)),
      ADMIN_SYNC_STRICT: "true",
    },
    encoding: "utf8",
  });
  return { ...r, lib: join(dir, "lib") };
}

const base = { services: [], contact: { email: "a@b.c" } };

for (const [label, fare] of [
  ["without fare", undefined],
  ["with perMileBbd 0", { perMileBbd: 0 }],
  ["with perMileBbd null", { perMileBbd: null }],
  ["with only the old perKmBbd", { perKmBbd: 5.98 }],
]) {
  test(`strict sync fails on a response ${label}`, () => {
    const r = runStrict({ ...base, fare });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /fare/);
  });
}

test("sync writes lib/fare.json from the fare field", () => {
  const r = runStrict({ ...base, fare: { perMileBbd: 9.5 } });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(readFileSync(join(r.lib, "fare.json"), "utf8")), { perMileBbd: 9.5 });
});
