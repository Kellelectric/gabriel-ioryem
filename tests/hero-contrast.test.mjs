import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("executive homepage hero has a defined responsive visual treatment", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");

  assert.match(html, /id="home"[^>]*class="[^"]*hero-section/, "homepage hero uses the executive hero component");
  assert.match(css, /\.hero-section\s*\{[^}]*background:/s, "hero background is defined in the external stylesheet");
  assert.match(css, /\.hero-intro\s*\{[^}]*color:/s, "hero supporting copy has a defined text colour");
  assert.match(css, /\.portrait-wrap\s+figcaption/, "portrait caption styling is retained");
  assert.match(css, /prefers-reduced-motion:reduce/, "reduced-motion support is retained");
});
