import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage hero contrast correction is in the document head", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const headEnd = html.indexOf("</head>");
  const bodyStart = html.indexOf("<body");
  const css = await readFile(new URL("../assets/portfolio.css", import.meta.url), "utf8");

  assert.ok(headEnd > 0 && bodyStart > headEnd, "document head and body are correctly ordered");
  assert.match(html, /<link rel="stylesheet" href="\/assets\/portfolio\.css">/, "homepage loads the shared stylesheet");
  assert.match(css, /#home\.hero/, "hero correction rules are retained in the external stylesheet");
  for (const selector of [
    "#home.hero .eyebrow",
    "#home.hero h1",
    "#home.hero h1 em",
    "#home.hero .hero-copy",
    "#home.hero .hero-proof strong",
    "#home.hero .hero-proof span",
    "#home.hero .button.secondary"
  ]) {
    assert.ok(css.includes(selector), "hero text selector exists: " + selector);
  }

  assert.match(css, /#home\.hero\s*\{[\s\S]*?background-color:\s*#173c33!important/i);
  assert.match(css, /-webkit-text-fill-color:\s*#fff!important/i);
  assert.match(css, /color:\s*#fff!important/i);
});
