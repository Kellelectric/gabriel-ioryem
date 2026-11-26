import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

test("hero headline states who, where and since when, and keeps one h1", () => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  assert.equal(h1, "Electrical engineer. Abuja. Since 2010.");
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("main breaker is an accessible switch described by the panel hint", () => {
  const breaker = html.match(/<button[^>]*id="breaker"[^>]*>/)[0];
  assert.match(breaker, /role="switch"/);
  assert.match(breaker, /aria-checked="false"/);
  assert.match(breaker, /aria-describedby="panel-hint"/);
  assert.match(html, /id="panel-hint"/);
  assert.match(html, /id="panel-count"[^>]*aria-live="polite"/);
});

test("every panel switch is a labelled toggle that maps to a brief option", () => {
  const switches = [...html.matchAll(/<button type="button" class="sw" data-part="([^"]+)" aria-pressed="false">([\s\S]*?)<\/button>/g)];
  assert.equal(switches.length, 6, "six systems are offered");
  for (const [, part, body] of switches) {
    assert.ok(body.replace(/<[^>]*>/g, "").trim().length > 3, part + " has visible text");
    assert.match(html, new RegExp('class="lead-option" data-value="[^"]+" data-part="' + part + '"'), part + " exists in the brief");
    assert.match(html, new RegExp('<g class="iso-part" data-part="' + part + '"'), part + " is drawn on the building");
  }
});

test("panel and brief share one state and the drawing is not duplicated in markup", () => {
  assert.equal((html.match(/<svg class="iso"/g) ?? []).length, 1, "one building drawing in the markup");
  assert.match(js, /cloneNode\(true\)/);
  assert.match(js, /\.lead-option\[data-part="' \+ button\.dataset\.part/);
  assert.match(js, /disabled = !on/, "switches are inert while the breaker is open");
});

test("panel never traps focus or hides content from keyboard users", () => {
  assert.doesNotMatch(html, /<button[^>]*class="sw"[^>]*tabindex="-1"/);
  assert.match(html, /<a href="#contact" class="btn-primary panel-go"/);
});
