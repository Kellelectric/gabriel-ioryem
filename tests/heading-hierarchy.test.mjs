import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = [
  "index.html",
  "cv/index.html",
  "projects/index.html",
  "engineering-tools/index.html",
  "projects/residential-electrical-installation/index.html",
  "projects/hybrid-solar-battery-storage/index.html",
  "projects/commercial-electrical-upgrade/index.html",
  "projects/industrial-machinery-power/index.html",
  "projects/cctv-access-control/index.html",
  "projects/electrical-fault-power-quality/index.html",
  "projects/smart-building-automation/index.html",
  "projects/generator-automatic-transfer/index.html",
  "projects/earthing-surge-protection/index.html",
  "projects/ev-charging-infrastructure/index.html"
];

for (const pagePath of pages) {
  test(`heading hierarchy is accessible: ${pagePath}`, async () => {
    const html = await readFile(new URL(`../${pagePath}`, import.meta.url), "utf8");
    const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
      level: Number(match[1]),
      text: match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    }));

    assert.equal(headings.filter(heading => heading.level === 1).length, 1, "page should have exactly one H1");
    assert.ok(headings.every(heading => heading.text.length > 0), "headings should have text");
    for (let index = 1; index < headings.length; index++) {
      assert.ok(
        headings[index].level <= headings[index - 1].level + 1,
        `heading level skips from H${headings[index - 1].level} to H${headings[index].level}`
      );
    }
  });
}
