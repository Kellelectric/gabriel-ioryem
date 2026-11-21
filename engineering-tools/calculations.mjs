const positive = (value, name) => {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + " must be a positive finite number.");
};

const phaseFactor = phase => {
  if (phase === "1") return 1;
  if (phase === "3") return Math.sqrt(3);
  throw new RangeError("Phase must be 1 or 3.");
};

export function estimateLoadCurrent({ phase, powerKw, voltage, powerFactor, efficiencyPercent }) {
  positive(powerKw, "Power");
  positive(voltage, "Voltage");
  positive(powerFactor, "Power factor");
  positive(efficiencyPercent, "Efficiency");
  if (powerFactor > 1) throw new RangeError("Power factor cannot exceed 1.");
  if (efficiencyPercent > 100) throw new RangeError("Efficiency cannot exceed 100%.");
  return powerKw * 1000 / (phaseFactor(phase) * voltage * powerFactor * (efficiencyPercent / 100));
}

export function estimateVoltageDrop({ phase, currentA, routeLengthM, conductorAreaMm2, material }) {
  positive(currentA, "Current");
  positive(routeLengthM, "Route length");
  positive(conductorAreaMm2, "Conductor area");
  const resistivity = material === "cu" ? 0.01724 : material === "al" ? 0.0282 : null;
  if (resistivity === null) throw new RangeError("Material must be cu or al.");
  const loopFactor = phase === "3" ? Math.sqrt(3) : phase === "1" ? 2 : null;
  if (loopFactor === null) throw new RangeError("Phase must be 1 or 3.");
  return loopFactor * currentA * routeLengthM * resistivity / conductorAreaMm2;
}

export function estimatePvArrayKwp({ dailyEnergyKwh, peakSunHours, performanceRatioPercent }) {
  positive(dailyEnergyKwh, "Daily energy");
  positive(peakSunHours, "Peak sun hours");
  positive(performanceRatioPercent, "Performance ratio");
  if (performanceRatioPercent > 100) throw new RangeError("Performance ratio cannot exceed 100%.");
  return dailyEnergyKwh / (peakSunHours * performanceRatioPercent / 100);
}

export function estimateBatteryCapacityKwh({ dailyCriticalLoadKwh, autonomyDays, depthOfDischargePercent, dischargeEfficiencyPercent }) {
  positive(dailyCriticalLoadKwh, "Daily critical load");
  positive(autonomyDays, "Autonomy");
  positive(depthOfDischargePercent, "Depth of discharge");
  positive(dischargeEfficiencyPercent, "Discharge efficiency");
  if (depthOfDischargePercent > 100) throw new RangeError("Depth of discharge cannot exceed 100%.");
  if (dischargeEfficiencyPercent > 100) throw new RangeError("Discharge efficiency cannot exceed 100%.");
  return dailyCriticalLoadKwh * autonomyDays / ((depthOfDischargePercent / 100) * (dischargeEfficiencyPercent / 100));
}
