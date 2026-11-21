import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

test("homepage uses independently cacheable local assets", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const cssPath = new URL("../assets/executive.css", import.meta.url);
  const jsPath = new URL("../assets/portfolio.js", import.meta.url);
  const css = await readFile(cssPath, "utf8");
  const js = await readFile(jsPath, "utf8");
  const [cssStats, jsStats] = await Promise.all([stat(cssPath), stat(jsPath)]);

  assert.match(html, /<link rel="stylesheet" href="\/assets\/executive\.css">/);
  assert.match(html, /<script src="\/assets\/portfolio\.js" defer><\/script>/);
  assert.doesNotMatch(html, /<style\b/i, "homepage styles should be stored in a cacheable asset");
  assert.ok(html.length < 40000, "homepage HTML should remain below the source-size guardrail");
  assert.ok(cssStats.size < 20000, "homepage stylesheet should remain below 20 KB");
  assert.ok(jsStats.size < 10000, "homepage interaction script should remain below 10 KB");
  assert.match(css, /\.explore-track/, "sliding section navigation styles are retained");
  assert.match(css, /\.mobile-navigation/, "mobile navigation styles are retained");
  assert.match(css, /prefers-reduced-motion/, "reduced-motion support is retained");
  assert.match(js, /aria-expanded/, "mobile menu exposes its expanded state");
  assert.match(js, /mailto:info@kellelectricals\.com/, "contact flow prepares a direct email draft");
});

test("homepage portrait is accessible and reserves its display dimensions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const image = html.match(/<img\b([^>]*)>/i);
  assert.ok(image, "homepage portrait exists");
  assert.match(image[1], /\balt="[^"]+"/i, "portrait has alternative text");
  assert.match(image[1], /\bwidth="\d+"/i, "portrait has intrinsic width");
  assert.match(image[1], /\bheight="\d+"/i, "portrait has intrinsic height");
  assert.match(image[1], /\bfetchpriority="high"/i, "hero portrait retains high loading priority");
});
