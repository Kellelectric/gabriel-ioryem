import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  estimateLoadCurrent,
  estimateVoltageDrop,
  estimatePvArrayKwp,
  estimateBatteryCapacityKwh
} from "../engineering-tools/calculations.mjs";

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
};

test("single-phase load current uses useful output power, PF and efficiency", () => {
  closeTo(estimateLoadCurrent({phase:"1",outputPowerKw:5,voltage:230,powerFactor:0.9,efficiencyPercent:100}), 5000/(230*0.9));
});

test("three-phase load current includes the square-root-of-three factor", () => {
  closeTo(estimateLoadCurrent({phase:"3",outputPowerKw:15,voltage:400,powerFactor:0.85,efficiencyPercent:95}), 26.811932005710176);
});

test("load current responds correctly to efficiency", () => {
  const fullEfficiency=estimateLoadCurrent({phase:"1",outputPowerKw:5,voltage:230,powerFactor:0.9,efficiencyPercent:100});
  const reducedEfficiency=estimateLoadCurrent({phase:"1",outputPowerKw:5,voltage:230,powerFactor:0.9,efficiencyPercent:80});
  closeTo(reducedEfficiency,fullEfficiency/0.8);
});

test("single-phase copper voltage drop uses the round-trip factor", () => {
  closeTo(estimateVoltageDrop({phase:"1",currentA:32,routeLengthM:30,conductorAreaMm2:6,material:"cu"}),5.5168);
});

test("aluminium voltage drop uses aluminium resistivity", () => {
  closeTo(estimateVoltageDrop({phase:"1",currentA:32,routeLengthM:30,conductorAreaMm2:6,material:"al"}),9.024);
});

test("three-phase voltage drop uses square-root-of-three", () => {
  closeTo(estimateVoltageDrop({phase:"3",currentA:32,routeLengthM:30,conductorAreaMm2:6,material:"cu"}),Math.sqrt(3)*32*30*0.01724/6);
});

test("PV array estimate converts percentage performance ratio", () => {
  closeTo(estimatePvArrayKwp({dailyEnergyKwh:15,peakSunHours:5,performanceRatioPercent:75}),4);
});

test("battery estimate includes depth of discharge and discharge efficiency", () => {
  closeTo(estimateBatteryCapacityKwh({dailyCriticalLoadKwh:8,autonomyDays:1,depthOfDischargePercent:80,dischargeEfficiencyPercent:90}),11.11111111111111);
});

test("100 percent battery usable depth and efficiency are accepted", () => {
  closeTo(estimateBatteryCapacityKwh({dailyCriticalLoadKwh:8,autonomyDays:1,depthOfDischargePercent:100,dischargeEfficiencyPercent:100}),8);
});

test("invalid phase, material and non-positive inputs are rejected", () => {
  assert.throws(() => estimateLoadCurrent({phase:"2",outputPowerKw:5,voltage:230,powerFactor:0.9,efficiencyPercent:100}), RangeError);
  assert.throws(() => estimateVoltageDrop({phase:"1",currentA:32,routeLengthM:30,conductorAreaMm2:6,material:"steel"}), RangeError);
  assert.throws(() => estimatePvArrayKwp({dailyEnergyKwh:15,peakSunHours:0,performanceRatioPercent:75}), RangeError);
  assert.throws(() => estimateBatteryCapacityKwh({dailyCriticalLoadKwh:8,autonomyDays:1,depthOfDischargePercent:110,dischargeEfficiencyPercent:90}), RangeError);
});

test("engineering tools page registers live listeners for every calculator control", async () => {
  const page = await readFile(new URL("../engineering-tools/index.html", import.meta.url), "utf8");
  assert.match(page, /const inputs = Array\.from\(document\.querySelectorAll\("\.fields input, \.fields select"\)\)/);
  assert.match(page, /inputs\.forEach\(el\s*=>\s*el\.addEventListener\("input",\s*update\)\)/);
  assert.match(page, /inputs\.forEach\(el\s*=>\s*el\.addEventListener\("change",\s*update\)\)/);
});

test("calculator validation rejects values that violate declared input increments", async () => {
  const page = await readFile(new URL("../engineering-tools/index.html", import.meta.url), "utf8");

  assert.match(page, /el\.validity\.stepMismatch/);
  assert.match(page, /Use the permitted increment for this value\./);
  assert.match(page, /aria-invalid/);
  assert.match(page, /aria-describedby/);
});
