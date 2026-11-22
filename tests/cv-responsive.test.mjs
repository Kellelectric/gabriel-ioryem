import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../cv/index.html", import.meta.url), "utf8");

test("CV action toolbar stacks and keeps both actions usable on narrow screens", () => {
  assert.ok(page.includes('<div class="actions">'));
  assert.ok(page.includes('download-bio'));
  assert.ok(page.includes('onclick="window.print()"'));
  assert.ok(page.includes("@media(max-width:650px){\n  .actions{flex-direction:column"));
  assert.ok(page.includes(".actions>div{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))"));
  assert.ok(page.includes("min-height:44px"));
});

test("CV retains its print-specific action hiding", () => {
  assert.ok(page.includes(".actions{display:none}"));
});
