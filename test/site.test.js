import { test, describe, expect } from "bun:test";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "_data");
const SRC_DIR = join(ROOT, "src");

// ---------------------------------------------------------------------------
// Build smoke test
// ---------------------------------------------------------------------------

describe("eleventy build", () => {
  test("bun run build emits _site/", () => {
    const result = spawnSync("bun", ["run", "build"], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 120_000,
    });

    expect(result.status).toBe(0);

    const siteDir = join(ROOT, "_site");
    expect(existsSync(siteDir)).toBe(true);

    const entries = readdirSync(siteDir);
    expect(entries.length).toBeGreaterThan(0);
  });
});
