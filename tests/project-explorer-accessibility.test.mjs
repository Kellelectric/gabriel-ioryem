import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const explorers = [
  { slug: "cctv-access-control", key: "security", group: "security-controls", panel: "security-detail", outputs: ["security-step", "security-name", "security-copy", "security-check"] },
  { slug: "commercial-electrical-upgrade", key: "upgrade", group: "upgrade-stages", panel: "upgrade-detail", outputs: ["upgrade-step", "upgrade-heading", "upgrade-copy", "upgrade-check"] },
  { slug: "electrical-fault-power-quality", key: "fault", group: "fault-list", panel: "fault-detail", outputs: ["fault-step", "fault-title", "fault-copy", "fault-check"] },
  { slug: "generator-automatic-transfer", key: "ats", group: "ats-modes", panel: "ats-status", outputs: ["ats-stage", "ats-title", "ats-copy", "ats-utility", "ats-transfer", "ats-generator"] },
  { slug: "hybrid-solar-battery-storage", key: "mode", group: "mode-controls", panel: "lab-explain", outputs: ["solar-source", "solar-battery", "solar-load", "solar-explanation"] },
  { slug: "industrial-machinery-power", key: "motor", group: "motor-controls", panel: "motor-detail", outputs: ["motor-step", "motor-name", "motor-copy", "motor-consider"] },
  { slug: "residential-electrical-installation", key: "node", group: "node-controls", panel: "dist-info", outputs: ["dist-step", "dist-title", "dist-description"] },
  { slug: "smart-building-automation", key: "auto", group: "auto-map", panel: "auto-detail", outputs: ["auto-step", "auto-heading", "auto-copy", "auto-check"] }
];

for (const explorer of explorers) {
  test("accessible interactive explorer: " + explorer.slug, async () => {
    const html = await readFile(new URL("../projects/" + explorer.slug + "/index.html", import.meta.url), "utf8");
    const group = html.match(new RegExp('<div\\b(?=[^>]*class="' + explorer.group + '")(?=[^>]*role="group")(?=[^>]*aria-label="[^"]+")[^>]*>([\\s\\S]*?)<\\/div>', "i"));
    assert.ok(group, "control set has a labelled group: " + explorer.group);

    const buttons = [...group[1].matchAll(new RegExp('<button\\b([^>]*)>([\\s\\S]*?)<\\/button>', "gi"))];
    assert.ok(buttons.length > 1, "explorer exposes multiple native buttons");
    const keys = [];

    for (const button of buttons) {
      const attributes = button[1];
      const key = attributes.match(new RegExp('data-' + explorer.key + '="([^"]+)"'))?.[1];
      assert.ok(key, "each button exposes a state key");
      assert.match(attributes, /type="button"/, "button does not submit an enclosing form");
      assert.match(attributes, /aria-pressed="(?:true|false)"/, "selected state is exposed");
      assert.ok(button[2].replace(/<[^>]*>/g, " ").trim(), "button has a visible accessible name");
      keys.push(key);
    }

    assert.equal(new Set(keys).size, keys.length, "each state key is unique");
    assert.equal(keys.filter((_, index) => buttons[index][1].includes('aria-pressed="true"')).length, 1, "exactly one state is initially selected");

    const livePanel = html.match(new RegExp('<(?:aside|div|p)\\b(?=[^>]*class="[^"]*' + explorer.panel + '[^"]*")(?=[^>]*aria-live="polite")[^>]*>', "i"));
    assert.ok(livePanel, "updated explanation has a polite live region: " + explorer.panel);

    for (const id of explorer.outputs) {
      assert.ok(html.includes('id="' + id + '"'), "dynamic output exists: " + id);
    }

    const scripts = [...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)].map(match => match[1]).join("\\n");
    assert.match(scripts, /addEventListener\\(["']click["']/, "buttons have click handlers");

    for (const key of keys) {
      const mapped = new RegExp("(?:^|[,{])\\s*" + key + "\\s*:");
      assert.match(scripts, mapped, "button state has matching explanatory data: " + key);
    }
  });
}
