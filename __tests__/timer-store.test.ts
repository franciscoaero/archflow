import { describe, it, expect, beforeEach, vi } from "vitest";
import { getElapsedSeconds, formatElapsed } from "@/lib/timer-store";

describe("getElapsedSeconds", () => {
  it("calculates elapsed seconds from timestamp", () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const elapsed = getElapsedSeconds(fiveMinutesAgo);
    expect(elapsed).toBeGreaterThanOrEqual(299);
    expect(elapsed).toBeLessThanOrEqual(301);
  });

  it("returns 0 for current time", () => {
    const now = Date.now();
    const elapsed = getElapsedSeconds(now);
    expect(elapsed).toBeLessThanOrEqual(1);
  });
});

describe("formatElapsed", () => {
  it("formats zero seconds", () => {
    expect(formatElapsed(0)).toBe("00:00:00");
  });

  it("formats seconds only", () => {
    expect(formatElapsed(45)).toBe("00:00:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatElapsed(125)).toBe("00:02:05");
  });

  it("formats hours, minutes and seconds", () => {
    expect(formatElapsed(3661)).toBe("01:01:01");
  });

  it("formats large durations", () => {
    expect(formatElapsed(36000)).toBe("10:00:00");
  });
});
