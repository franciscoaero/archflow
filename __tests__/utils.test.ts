import { describe, it, expect } from "vitest";
import { formatDuration, calculateDuration } from "@/lib/utils";

describe("formatDuration", () => {
  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45min");
  });

  it("formats hours only", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(150)).toBe("2h30");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0min");
  });

  it("pads minutes with leading zero", () => {
    expect(formatDuration(65)).toBe("1h05");
  });
});

describe("calculateDuration", () => {
  it("calculates simple duration", () => {
    expect(calculateDuration("09:00", "11:30")).toBe(150);
  });

  it("calculates duration within same hour", () => {
    expect(calculateDuration("14:00", "14:45")).toBe(45);
  });

  it("calculates full day", () => {
    expect(calculateDuration("09:00", "17:00")).toBe(480);
  });

  it("returns negative for invalid range", () => {
    expect(calculateDuration("17:00", "09:00")).toBeLessThan(0);
  });
});
