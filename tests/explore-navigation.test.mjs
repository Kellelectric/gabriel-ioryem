import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Explore navigation auto-slides without taking control of vertical page scrolling", async () => {
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

test("project references use the approved copy and white-on-dark presentation", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  const start = html.indexOf('<section id="references"');
  const end = html.indexOf("</section>", start);
  assert.ok(start >= 0 && end > start, "project reference section exists");
  const section = html.slice(start, end);
  assert.match(section, /09 \/ SELECTED PROJECT REFERENCES/);
  assert.match(section, /Engineering work connected to real places\./);
  assert.match(section, /A selection of residential and institutional project references in Abuja\./);
  assert.match(section, /These entries identify the project and location only\./);
  assert.match(section, /Detailed work scopes, engineering decisions, equipment schedules, testing records and outcomes/);
  assert.match(section, /Project references are presented separately from the illustrative engineering scenarios and technical notes below\./);
  assert.match(css, /\.reference-section \.section-label\{color:#fff\}/);
  assert.match(css, /\.reference-section \.heading-1\{color:#fff\}/);
  assert.match(css, /\.reference-section \.section-body\{color:#fff\}/);
  assert.match(css, /\.reference-section \.reference-note\{color:#fff\}/);
});

test("mobile layout keeps normal document scrolling independent of Explore navigation", async () => {
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.ok(css.includes('html,body{min-height:100%;}'));
  assert.match(css, /@media\(max-width:767px\)\{\.explore-nav\{position:relative;top:auto/);
  assert.doesNotMatch(css, /(?:html|body)\s*\{[^}]*overflow\s*:\s*hidden/i);
  assert.doesNotMatch(js, /document\.body\.style\.overflow\s*=\s*["']hidden["']/);
  assert.match(js, /exploreTrack\.addEventListener\("touchstart"/);
});
