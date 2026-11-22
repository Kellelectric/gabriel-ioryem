import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

test("homepage uses independently cacheable local assets without a runtime CSS compiler", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const cssPath = new URL("../assets/executive.css", import.meta.url);
  const utilityPath = new URL("../assets/utilities.css", import.meta.url);
  const jsPath = new URL("../assets/portfolio.js", import.meta.url);
  const css = await readFile(cssPath, "utf8");
  const utility = await readFile(utilityPath, "utf8");
  const js = await readFile(jsPath, "utf8");
  const [cssStats, utilityStats, jsStats] = await Promise.all([stat(cssPath), stat(utilityPath), stat(jsPath)]);

  assert.match(html, /<link rel="stylesheet" href="\/assets\/utilities\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/executive\.css">/);
  assert.match(html, /<script src="\/assets\/portfolio\.js" defer><\/script>/);
  assert.doesNotMatch(html, /<style\b/i, "homepage styles should be stored in cacheable assets");
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com|tailwind\.config/, "homepage should not compile utility CSS in the visitor's browser");
  assert.ok(html.length < 40000, "homepage HTML should remain below the source-size guardrail");
  assert.ok(cssStats.size < 22000, "homepage stylesheet should remain below 22 KB with the Kell forest-green brand system");
  assert.ok(utilityStats.size < 4000, "static utility stylesheet should remain below 4 KB");
  assert.ok(jsStats.size < 13000, "homepage interaction script should remain below 13 KB");
  assert.match(css, /\.explore-track/, "sliding section navigation styles are retained");
  assert.match(css, /\.mobile-navigation/, "mobile navigation styles are retained");
  assert.match(utility, /\.lg\\:grid-cols-12/, "responsive grid utility is included");
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


test("homepage content remains visible without JavaScript and reveals progressively when JavaScript starts", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.match(css, /\.fade-up\{opacity:1;transform:none/);
  assert.match(css, /\.reveal-line span\{display:block;transform:none/);
  assert.match(css, /\.js-enabled \.fade-up:not\(\.is-visible\)\{opacity:0/);
  assert.match(css, /\.js-enabled \.reveal-line:not\(\.is-visible\) span\{transform:translateY\(115%\)\}/);
  assert.match(js, /document\.documentElement\.classList\.add\("js-enabled"\)/);
});


test("homepage portrait retains the original circular presentation", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  assert.match(css, /\.portrait-wrap\{position:relative;aspect-ratio:1/);
  assert.match(css, /\.portrait-wrap\{[^}]*border-radius:50%/);
  assert.doesNotMatch(css, /\.portrait-wrap\{[^}]*border-radius:46% 46% 3px 3px/);
});


test("homepage uses the Kell forest-green brand system without changing the circular portrait", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  assert.match(css, /--forest:#13322c/);
  assert.match(css, /--forest-deep:#081b17/);
  assert.match(css, /--gold:#c6a972/);
  assert.match(css, /\.site-header\{background:rgba\(8,27,23/);
  assert.match(css, /\.explore-nav\{background:var\(--forest-deep\)/);
  assert.match(css, /\.hero-section\{background:radial-gradient/);
  assert.match(css, /\.expertise-card\{background:var\(--forest-deep\)/);
  assert.match(css, /\.site-footer\{background:var\(--forest-deep\)/);
  assert.match(css, /\.portrait-wrap\{position:relative;aspect-ratio:1;[^}]*border-radius:50%/);
  assert.doesNotMatch(css.slice(css.indexOf("/* Kell Electricals forest-green visual system")), /\.portrait-wrap\{/);
  assert.doesNotMatch(css.slice(css.indexOf("/* Kell Electricals forest-green visual system")), /\.portrait-caption\{/);
});
