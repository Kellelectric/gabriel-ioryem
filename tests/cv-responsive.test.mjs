import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../cv/index.html", import.meta.url), "utf8");

test("CV action toolbar stacks and keeps both actions usable on narrow screens", () => {
  assert.match(page, /<div class="actions">[\\s\\S]*?download-bio[\\s\\S]*?window\\.print\\(\\)/);
  assert.match(page, /@media\\s*\\(max-width:\\s*650px\\)[\\s\\S]*?\\.actions\\s*\\{[^}]*flex-direction:\\s*column/);
  assert.match(page, /\\.actions>div\\s*\\{[^}]*grid-template-columns:\\s*repeat\\(2,minmax\\(0,1fr\\)\\)/);
  assert.match(page, /\\.actions>div>a,\\.actions>div>button\\s*\\{[^}]*min-height:\\s*44px/);
});

test("CV retains its print-specific action hiding", () => {
  assert.match(page, /@media print\\s*\\{[^}]*\\.actions\\s*\\{\\s*display:\\s*none/);
});
