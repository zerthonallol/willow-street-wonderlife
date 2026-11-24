import { describe, expect, it } from "vitest";
import { panelAngle, panelProgress, TRIANGLE_DISTANCE } from "./car-panel-rules";

describe("breakdown car panels", () => {
  it("the bonnet lifts its front edge instead of rotating into the engine", () => {
    expect(-Math.sin(panelAngle("hood", 1)) * -0.64).toBeGreaterThan(0);
    expect(panelAngle("hood", 0)).toBe(0);
  });
  it("the boot lifts its rear edge instead of rotating into the luggage", () => {
    expect(-Math.sin(panelAngle("trunk", 1)) * 0.49).toBeGreaterThan(0);
    expect(panelAngle("trunk", 0)).toBe(0);
  });
  it("opening is gradual, reversible and independent of frame rate", () => {
    const part = panelProgress(0, true, 0.1);
    expect(part).toBeGreaterThan(0);
    expect(part).toBeLessThan(1);
    expect(panelProgress(part, false, 0.1)).toBeLessThan(part);
    expect(panelProgress(panelProgress(0, true, 0.1), true, 0.1)).toBeCloseTo(panelProgress(0, true, 0.2), 8);
    expect(panelProgress(0, true, 2)).toBe(1);
  });
  it("the marked placement point stays behind the car", () => {
    expect(TRIANGLE_DISTANCE).toBe(16);
    expect(TRIANGLE_DISTANCE).toBeGreaterThan(2.4);
  });
});