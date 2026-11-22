import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../cv/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/cv.css", import.meta.url), "utf8");

test("CV loads its dedicated stylesheet without changing the document structure", () => {
  assert.match(html, /<link\s+rel="stylesheet"\s+href="\/assets\/cv\.css"\s*>/i);
  assert.equal((html.match(/<style\b/gi) ?? []).length, 0, "CV presentation rules live in the external stylesheet");
  assert.equal((html.match(/<main\b/gi) ?? []).length, 1, "one main landmark remains");
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, "one primary heading remains");
  assert.match(html, /class="skip-link"/, "skip link remains available");
  assert.match(html, /window\.print\(\)/, "print action remains available");
});

test("CV stylesheet retains responsive, print and reduced-motion rules", () => {
  assert.match(css, /@media\s*\(max-width:\s*650px\)/i);
  assert.match(css, /@media\s+print/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.match(css, /\.sheet/);
  assert.match(css, /\.actions/);
  assert.match(css, /\.download-bio/);
});
