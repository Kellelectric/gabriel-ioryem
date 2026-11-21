import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

test("homepage uses a cacheable external stylesheet", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const cssPath = new URL("../assets/portfolio.css", import.meta.url);
  const css = await readFile(cssPath, "utf8");
  const cssStats = await stat(cssPath);

  assert.match(html, /<link rel="stylesheet" href="\/assets\/portfolio\.css">/);
  assert.doesNotMatch(html, /<style\b/i, "homepage styles should not be duplicated inline");
  assert.ok(html.length < 70000, "homepage HTML should remain below the transfer-size guardrail");
  assert.ok(cssStats.size < 150000, "homepage stylesheet should remain below its size guardrail");
  assert.match(css, /#home\.hero/, "hero design rules are retained");
  assert.match(css, /\.primary-nav/, "primary navigation rules are retained");
  assert.match(css, /\.page-index \.index-track/, "sliding Explore navigation rules are retained");
  assert.match(css, /prefers-reduced-motion/, "reduced-motion support is retained");
});

test("homepage portrait is accessible and has intrinsic dimensions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const image = html.match(/<img\b([^>]*)>/i);
  assert.ok(image, "homepage portrait exists");
  assert.match(image[1], /\balt="[^"]+"/i, "portrait has alternative text");
  assert.match(image[1], /\bwidth="\d+"/i, "portrait has intrinsic width");
  assert.match(image[1], /\bheight="\d+"/i, "portrait has intrinsic height");
  assert.match(image[1], /\bfetchpriority="high"/i, "hero portrait retains high loading priority");
});
