import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("multi-step enquiry exposes progress to assistive technology", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");

  assert.match(html, /id="lead-progress" role="progressbar"/);
  assert.match(html, /aria-label="Enquiry progress"/);
  assert.match(html, /aria-valuemin="0" aria-valuemax="100" aria-valuenow="25"/);
  assert.match(html, /aria-valuetext="Step 1 of 4"/);
  assert.match(js, /progressBar\.setAttribute\("aria-valuenow"/);
  assert.match(js, /progressBar\.setAttribute\("aria-valuetext"/);
  assert.match(js, /nextStep === "done" \? "Enquiry prepared"/);
});

test("enquiry completion is a focusable heading announced within the live region", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const completion = html.match(/<div class="lead-step hidden" data-step="done">([\s\S]*?)<\/div>/);
  assert.ok(completion);
  assert.match(completion[1], /<h3 class="done-title">Your email draft is ready\.<\/h3>/);
  assert.match(html, /id="lead-flow" class="lead-flow" aria-live="polite"/);
  assert.match(html, /id="lead-mailto" href="mailto:info@kellelectricals\.com"/);
});
