import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("multi-step enquiry exposes progress to assistive technology", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

  assert.match(html, /id="lead-progress" role="progressbar"/);
  assert.match(html, /aria-label="Enquiry progress"/);
  assert.match(html, /aria-valuemin="0" aria-valuemax="100" aria-valuenow="17"/);
  assert.match(html, /aria-valuetext="Step 1 of 6"/);
  assert.match(js, /progressBar\.setAttribute\("aria-valuenow"/);
  assert.match(js, /progressBar\.setAttribute\("aria-valuetext"/);
  assert.match(js, /nextStep === "done" \? "Enquiry prepared"/);
});

test("enquiry completion is a focusable heading announced within the live region", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const completion = html.match(/<div class="lead-step hidden" data-step="done">([\s\S]*?)<\/div>/);
  assert.ok(completion);
  assert.match(completion[1], /<h3 class="done-title">Your brief is ready\.<\/h3>/);
  assert.match(html, /id="lead-flow" class="lead-flow" aria-live="polite"/);
  assert.match(html, /id="lead-mailto" href="mailto:gabrielioryem@kellelectricals\.com"/);
});

test("project brief can be sent on WhatsApp or by email without the site transmitting it", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  // Official Kell Electricals WhatsApp line, as published on kellelectricals.com.
  assert.match(html, /id="lead-whatsapp" href="https:\/\/wa\.me\/2348140205895"/);
  assert.match(js, /const WHATSAPP = "2348140205895"/);
  assert.match(js, /"https:\/\/wa\.me\/" \+ WHATSAPP \+ "\?text=" \+ encodeURIComponent\(body\)/);
  assert.match(html, /nothing leaves your device until you press send/);
});

test("needs step is a labelled multi-select and the brief preview is described", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const needs = html.match(/<div class="lead-options lead-grid" data-field="needs" data-multi="true">([\s\S]*?)<\/div>/);
  assert.ok(needs, "multi-select group exists");
  const options = [...needs[1].matchAll(/<button type="button" class="lead-option"[^>]*aria-pressed="false">[^<]+<\/button>/g)];
  assert.ok(options.length >= 6, "at least six service options are offered");
  assert.match(html, /<svg class="iso" viewBox="[^"]+" role="img" aria-labelledby="iso-title"><title id="iso-title">/);
  assert.match(html, /id="lead-contact-error"/, "missing contact details are explained, not silently rejected");
});
