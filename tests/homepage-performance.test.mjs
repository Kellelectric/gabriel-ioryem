import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

// Budgets for CSS and JS are measured on gzip output, which is what visitors download.
// This keeps the stylesheet and script readable instead of hand-minified.
const gzipBytes = text => gzipSync(text, { level: 9 }).length;

test("homepage uses cacheable local assets without a runtime CSS compiler", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const cssPath = new URL("../assets/executive.css", import.meta.url);
  const utilityPath = new URL("../assets/utilities.css", import.meta.url);
  const jsPath = new URL("../assets/portfolio.js", import.meta.url);
  const css = await readFile(cssPath, "utf8");
  const utility = await readFile(utilityPath, "utf8");
  const js = await readFile(jsPath, "utf8");
  const utilityStats = await stat(utilityPath);

  assert.match(html, /<link rel="stylesheet" href="\/assets\/utilities\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\/assets\/executive\.css">/);
  assert.match(html, /<script src="\/assets\/portfolio\.js" defer><\/script>/);
  assert.doesNotMatch(html, /<style\b/i);
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com|tailwind\.config/);
  // Measured on gzip output, like the CSS and JS budgets: the interactive hero panel and project brief add markup.
  assert.ok(gzipBytes(html) < 14000, "index.html stays under 14 KB gzipped");
  assert.ok(html.length < 60000, "index.html stays under 60 KB uncompressed");
  // Raised from 7.5 KB for the project-brief builder, to 10 KB for the drawing-set design, then to 12 KB
  // for the electric theme (dark pill navigation, service chips, floating badges, toggle switches, chart card)
  // (cover-sheet frame, title blocks, reference schedule, busbar). Dead selectors were removed first.
  assert.ok(gzipBytes(css) < 12000, "executive.css stays under 12 KB gzipped");
  assert.ok(css.length < 48000, "executive.css stays under 48 KB uncompressed");
  assert.ok(utilityStats.size < 4000);
  // Raised from 4.5 KB for the same feature (multi-step brief with WhatsApp and email handoff).
  assert.ok(gzipBytes(js) < 7000, "portfolio.js stays under 7 KB gzipped");
  assert.ok(js.length < 32000, "portfolio.js stays under 32 KB uncompressed");
  assert.match(css, /\.explore-track/);
  assert.match(css, /\.mobile-navigation/);
  assert.match(utility, /\.lg\\:grid-cols-12/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /mailto:gabrielioryem@kellelectricals\.com/);
});

test("homepage portrait is accessible and reserves its display dimensions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const image = html.match(/<img\b([^>]*)>/i);
  assert.ok(image);
  assert.match(image[1], /\balt="[^"]+"/i);
  assert.match(image[1], /\bwidth="\d+"/i);
  assert.match(image[1], /\bheight="\d+"/i);
  assert.match(image[1], /\bfetchpriority="high"/i);
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

test("homepage keeps the arch portrait and uses the jet, silver and electric yellow palette with a dark header", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  assert.match(css, /--jet:#0f1115/);
  assert.match(css, /--yellow:#f5d90a/);
  assert.match(css, /\.site-header\{background:rgba\(15,17,21/);
  assert.match(css, /\.hero-section\{[^}]*background:radial-gradient/s);
  assert.match(css, /\.portrait-wrap\{position:relative;aspect-ratio:4\/5/);
  assert.match(css, /border-radius:46% 46% 3px 3px/);
  assert.doesNotMatch(css, /\.portrait-wrap\{[^}]*border-radius:50%/);
});

test("desktop hero headline stays within its text column and clear of the portrait", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  assert.ok(css.includes("@media(min-width:1024px){.hero-section .display{max-width:100%;font-size:clamp(2.65rem,3.9vw,4.2rem);"));
  assert.ok(css.includes('[class~="lg:col-span-7"]{min-width:0}'));
  assert.ok(css.includes(".hero-section .portrait-column{width:100%;max-width:440px}"));
});

test("desktop anchor targets clear both fixed header and sticky section navigation", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  assert.match(css, /@media\(min-width:768px\)\{html\{scroll-padding-top:148px\}\}/);
  assert.match(css, /@media\(max-width:767px\)\{\.explore-nav\{position:relative;top:auto/);
});
