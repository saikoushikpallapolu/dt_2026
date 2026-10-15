import type { FacultyStatus } from "./enums.js";

export type StatusSnapshot = {
  status: FacultyStatus;
  updatedAt: Date;
  expiresAt: Date | null;
};

export type EffectiveStatus = {
  status: FacultyStatus;
  isExpired: boolean;
  isConfidentlyCurrent: boolean;
};

export function isStatusExpired(expiresAt: Date | null, now: Date = new Date()): boolean {
  if (!expiresAt) {
    return false;
  }
  return expiresAt.getTime() <= now.getTime();
}

/**
 * Published status is self-reported. When the configured expiry has passed,
 * the recorded value is still returned but must not be treated as current.
 */
export function resolveEffectiveStatus(snapshot: StatusSnapshot, now: Date = new Date()): EffectiveStatus {
  const expired = isStatusExpired(snapshot.expiresAt, now);
  if (snapshot.status === "UNKNOWN") {
    return {
      status: "UNKNOWN",
      isExpired: expired,
      isConfidentlyCurrent: false,
    };
  }
  return {
    status: snapshot.status,
    isExpired: expired,
    isConfidentlyCurrent: !expired,
  };
}

export function defaultExpiryFromTtl(updatedAt: Date, ttlMinutes: number): Date {
  return new Date(updatedAt.getTime() + ttlMinutes * 60_000);
}
