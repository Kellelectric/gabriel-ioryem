import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

// A custom property defined in terms of itself (for example --line:var(--line)) is invalid,
// and every rule that uses it silently loses its value. This happened once; keep it from recurring.
test("no stylesheet defines a CSS custom property in terms of itself", async () => {
  const dir = new URL("../assets/", import.meta.url);
  const sheets = (await readdir(dir)).filter(name => name.endsWith(".css"));
  assert.ok(sheets.length > 0);
  for (const name of sheets) {
    const css = await readFile(new URL(name, dir), "utf8");
    for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]*)/g)) {
      const [, property, value] = match;
      assert.ok(!value.includes("var(" + property + ")") && !value.includes("var(" + property + ","),
        name + " defines " + property + " in terms of itself");
    }
  }
});
