import { describe, expect, it } from "vitest";
import { defaultExpiryFromTtl, isStatusExpired, resolveEffectiveStatus } from "./status.js";

describe("status expiry", () => {
  const now = new Date("2026-10-15T10:00:00.000Z");

  it("treats a missing expiry as not expired", () => {
    expect(isStatusExpired(null, now)).toBe(false);
  });

  it("treats a past expiry as expired", () => {
    expect(isStatusExpired(new Date("2026-10-15T09:00:00.000Z"), now)).toBe(true);
  });

  it("does not present UNKNOWN as confidently current", () => {
    const result = resolveEffectiveStatus(
      {
        status: "UNKNOWN",
        updatedAt: now,
        expiresAt: defaultExpiryFromTtl(now, 240),
      },
      now,
    );
    expect(result.isConfidentlyCurrent).toBe(false);
    expect(result.status).toBe("UNKNOWN");
  });

  it("keeps the recorded status when expired but marks it stale", () => {
    const result = resolveEffectiveStatus(
      {
        status: "IN_CLASS",
        updatedAt: new Date("2026-10-15T06:00:00.000Z"),
        expiresAt: new Date("2026-10-15T08:00:00.000Z"),
      },
      now,
    );
    expect(result.status).toBe("IN_CLASS");
    expect(result.isExpired).toBe(true);
    expect(result.isConfidentlyCurrent).toBe(false);
  });

  it("treats a non-unknown unexpired status as current", () => {
    const result = resolveEffectiveStatus(
      {
        status: "AVAILABLE",
        updatedAt: now,
        expiresAt: defaultExpiryFromTtl(now, 60),
      },
      now,
    );
    expect(result.isConfidentlyCurrent).toBe(true);
    expect(result.isExpired).toBe(false);
  });
});
