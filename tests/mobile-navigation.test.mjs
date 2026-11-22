import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("mobile navigation exposes a correctly associated disclosure control", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

  assert.match(html, /id="menu-toggle"[^>]*aria-controls="mobile-navigation"[^>]*aria-expanded="false"/);
  assert.match(html, /id="mobile-navigation"[^>]*aria-label="Mobile navigation"/);
  assert.match(js, /mobileNav\.querySelector\("a"\)\?\.focus\(\)/);
  assert.match(js, /menuToggle\.setAttribute\("aria-expanded", String\(!isOpen\)\)/);
});

test("mobile navigation closes on Escape, outside interaction, route navigation and desktop resize", async () => {
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

  assert.match(js, /event\.key === "Escape"[^\n]*closeMenu\(true\)/);
  assert.match(js, /document\.addEventListener\("pointerdown"/);
  assert.match(js, /!mobileNav\.contains\(event\.target\)[\s\S]*!menuToggle\.contains\(event\.target\)[\s\S]*closeMenu\(\)/);
  assert.match(js, /window\.addEventListener\("hashchange", \(\) => closeMenu\(\)\)/);
  assert.match(js, /window\.innerWidth >= 1024\) closeMenu\(\)/);
});

test("mobile navigation section links point to existing sections", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const nav = html.match(/<nav id="mobile-navigation"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav, "mobile navigation exists");
  const targets = [...nav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  for (const target of targets) assert.match(html, new RegExp('id="' + target + '"'), "section #" + target + " exists");
});

test("in-page navigation moves keyboard focus to the destination after closing the menu", async () => {
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

  assert.match(js, /const target = link\.hash \? document\.querySelector\(link\.hash\) : null/);
  assert.match(js, /if \(!target\.hasAttribute\("tabindex"\)\) target\.setAttribute\("tabindex", "-1"\)/);
  assert.match(js, /window\.requestAnimationFrame\(\(\) => target\.focus\(\{ preventScroll: true \}\)\)/);
  assert.match(js, /mobileNav\.querySelectorAll\("a"\)\.forEach\(link => link\.addEventListener\("click"/);
});
