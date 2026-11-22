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
  test("responsive layout guardrails: " + pagePath, async () => {
    const html = await readFile(new URL("../" + pagePath, import.meta.url), "utf8");
    const inlineCss = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join("\n");
    let linkedCss = "";
    if (pagePath === "index.html") {
      linkedCss = await readFile(new URL("../assets/executive.css", import.meta.url), "utf8");
    } else if (pagePath === "cv/index.html") {
      linkedCss = await readFile(new URL("../assets/cv.css", import.meta.url), "utf8");
    } else if (pagePath.startsWith("projects/") && pagePath !== "projects/index.html" &&
      !pagePath.includes("earthing-surge-protection") && !pagePath.includes("ev-charging-infrastructure")) {
      linkedCss = await readFile(new URL("../assets/study-checks.css", import.meta.url), "utf8");
    }
    const css = inlineCss + "\n" + linkedCss;

    assert.match(html, /<meta\s+name=["']viewport["']/i, "viewport is configured");
    assert.match(css, /@media\s*\([^)]*max-width/i, "mobile breakpoint is present");
    assert.doesNotMatch(css, /(?:^|[;{])\s*min-width\s*:\s*(?:[5-9]\d{2}|[1-9]\d{3,})px/i, "no large fixed minimum width blocks narrow screens");
    assert.doesNotMatch(css, /overflow-x\s*:\s*hidden/i, "horizontal overflow is not concealed instead of fixed");
    if (pagePath === "index.html") {
      assert.match(css, /\.hero-section:after\{[^}]*right:0(?:;|})/i, "decorative hero artwork stays inside the viewport");
    }

    for (const svg of html.matchAll(/<svg\b([^>]*)>/gi)) {
      assert.match(svg[1], /viewBox=/i, "inline diagrams use a scalable viewBox");
    }
  });
}
