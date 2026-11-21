import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = [
  "../index.html",
  "../cv/index.html",
  "../projects/index.html",
  "../engineering-tools/index.html",
  "../projects/residential-electrical-installation/index.html",
  "../projects/hybrid-solar-battery-storage/index.html",
  "../projects/commercial-electrical-upgrade/index.html",
  "../projects/industrial-machinery-power/index.html",
  "../projects/cctv-access-control/index.html",
  "../projects/electrical-fault-power-quality/index.html",
  "../projects/smart-building-automation/index.html",
  "../projects/generator-automatic-transfer/index.html",
  "../projects/earthing-surge-protection/index.html",
  "../projects/ev-charging-infrastructure/index.html"
];

const attr = (attributes, name) =>
  attributes.match(new RegExp("(?:^|\\s)" + name + '="([^"]*)"', "i"))?.[1] ?? "";

const plainText = value =>
  value.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

for (const pagePath of pages) {
  test("semantic accessibility basics: " + pagePath, async () => {
    const html = await readFile(new URL(pagePath, import.meta.url), "utf8");
    assert.equal((html.match(/<main\b/gi) ?? []).length, 1, "one main landmark is present");
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, "one primary page heading is present");

    const skipLink = html.match(/<a\b(?=[^>]*class="[^"]*skip-link")([^>]*)>/i);
    assert.ok(skipLink, "skip-to-content link is present");
    const skipHref = attr(skipLink[1], "href");
    assert.ok(skipHref?.startsWith("#"), "skip link targets an in-page landmark");
    assert.ok(html.includes(`id="${skipHref.slice(1)}"`), "skip link target exists");

    for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
      assert.ok(attr(match[1], "alt") !== "", "image has meaningful alt text: " + match[0].slice(0, 100));
    }

    for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
      const attributes = match[1];
      const name = attr(attributes, "aria-label") || attr(attributes, "title") || plainText(match[2]);
      assert.ok(name, "button has an accessible name: " + match[0].slice(0, 140));
    }

    const labelFor = [...html.matchAll(/<label\b([^>]*)>/gi)].map(match => attr(match[1], "for"));
    for (const tag of ["input", "select", "textarea"]) {
      for (const match of html.matchAll(new RegExp("<" + tag + "\\b([^>]*)>", "gi"))) {
        const attributes = match[1];
        const type = attr(attributes, "type").toLowerCase();
        if (tag === "input" && ["hidden", "submit", "button", "reset", "image"].includes(type)) continue;
        const id = attr(attributes, "id");
        const labelled = attr(attributes, "aria-label") || (id && labelFor.includes(id));
        assert.ok(labelled, tag + " has an associated label: " + match[0]);
      }
    }
  });
}

// Static checks complement, but do not replace, assistive-technology testing.
