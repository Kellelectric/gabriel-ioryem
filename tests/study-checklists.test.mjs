import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const detailed = [
  "residential-electrical-installation",
  "hybrid-solar-battery-storage",
  "commercial-electrical-upgrade",
  "industrial-machinery-power",
  "cctv-access-control",
  "electrical-fault-power-quality",
  "smart-building-automation",
  "generator-automatic-transfer"
];
const existingVerification = ["earthing-surge-protection", "ev-charging-infrastructure"];

for (const slug of detailed) {
  test("engineering design and verification note: " + slug, async () => {
    const html = await readFile(new URL("../projects/" + slug + "/index.html", import.meta.url), "utf8");
    assert.match(html, /class="engineering-checks"/);
    assert.match(html, /Design inputs to confirm/);
    assert.match(html, /Verification before handover/);
    assert.match(html, /verified site conditions/);
    assert.match(html, /illustrative technical guide/i);
  });
}

for (const slug of existingVerification) {
  test("engineering verification checklist: " + slug, async () => {
    const html = await readFile(new URL("../projects/" + slug + "/index.html", import.meta.url), "utf8");
    assert.match(html, /Verification checklist/);
    assert.match(html, /Evidence required for a completed project record/);
  });
}
