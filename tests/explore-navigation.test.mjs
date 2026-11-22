import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Explore navigation has working controls and never forces vertical page scrolling", async () => {
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.match(js, /data-auto-copy/);
  assert.match(js, /aria-hidden", "true"/);
  assert.match(js, /copy\.tabIndex = -1/);
  assert.match(js, /requestAnimationFrame\(animateExplore\)/);
  assert.match(js, /exploreTrack\.scrollLeft \+= elapsed \* 0\.022/);
  assert.match(js, /pointerenter/);
  assert.match(js, /pointerleave/);
  assert.match(js, /focusin/);
  assert.match(js, /touchstart/);
  assert.match(js, /prefers-reduced-motion/);
  assert.doesNotMatch(js, /activeLink\.scrollIntoView/);
});

test("project references preserve the restored editorial section and verified wording", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  const start = html.indexOf('<section id="references"');
  const end = html.indexOf("</section>", start);
  assert.ok(start >= 0 && end > start);
  const section = html.slice(start, end);
  assert.match(section, /04 \/ Selected references/);
  assert.match(section, /A selection of project references\./);
  assert.match(section, /A small number of named project references are presented here/);
  assert.match(section, /No unverified scope, completion date, measured result or client endorsement is implied/);
  assert.match(section, /class="content-section section-light"/);
  assert.doesNotMatch(css, /\.reference-section \.section-label\{color:#fff\}/);
});

test("mobile layout keeps normal document scrolling independent of Explore navigation", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.ok(css.includes("html,body{min-height:100%;}"));
  assert.match(css, /@media\(max-width:767px\)\{\.explore-nav\{position:relative;top:auto/);
  assert.doesNotMatch(css, /(?:html|body)\s*\{[^}]*overflow\s*:\s*hidden/i);
  assert.doesNotMatch(js, /document\.body\.style\.overflow\s*=\s*["']hidden["']/);
  assert.match(js, /exploreTrack\.addEventListener\("touchstart"/);
});
