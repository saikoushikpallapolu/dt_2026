import {
  type FacultyStatus,
  type StatusDetail,
  defaultExpiryFromTtl,
  resolveEffectiveStatus,
} from "@wimp/shared";
import { prisma } from "../db.js";
import type { AppEnv } from "../config/env.js";

export function formatStatusDetail(statusRecord: {
  status: string;
  expectedReturnAt: Date | null;
  alternateLocation: string | null;
  publicMessage: string | null;
  expiresAt: Date | null;
  updatedAt: Date;
}): StatusDetail {
  const effective = resolveEffectiveStatus({
    status: statusRecord.status as FacultyStatus,
    updatedAt: statusRecord.updatedAt,
    expiresAt: statusRecord.expiresAt,
  });

  return {
    status: statusRecord.status as FacultyStatus,
    expectedReturnAt: statusRecord.expectedReturnAt?.toISOString() ?? null,
    alternateLocation: statusRecord.alternateLocation,
    publicMessage: statusRecord.publicMessage,
    expiresAt: statusRecord.expiresAt?.toISOString() ?? null,
    updatedAt: statusRecord.updatedAt.toISOString(),
    isExpired: effective.isExpired,
    isConfidentlyCurrent: effective.isConfidentlyCurrent,
  };
}

export async function getDefaultTtlMinutes(fallback: number): Promise<number> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: "status_default_ttl_minutes" },
    });
    if (setting && typeof setting.value === "number") {
      return setting.value;
    }
  } catch (err) {
    // Ignore setting read error and fallback
  }
  return fallback;
}

export interface UpdateStatusInput {
  professorId: string;
  actorUserId: string;
  status: FacultyStatus;
  expectedReturnAt?: string | null;
  alternateLocation?: string | null;
  publicMessage?: string | null;
  ttlMinutes?: number | null;
  appEnv: AppEnv;
}

export async function updateProfessorStatus(input: UpdateStatusInput): Promise<StatusDetail> {
  const {
    professorId,
    actorUserId,
    status,
    expectedReturnAt,
    alternateLocation,
    publicMessage,
    ttlMinutes,
    appEnv,
  } = input;

  const now = new Date();
  const effectiveTtl =
    typeof ttlMinutes === "number" && ttlMinutes > 0
      ? ttlMinutes
      : await getDefaultTtlMinutes(appEnv.STATUS_DEFAULT_TTL_MINUTES);

  const expiresAt = defaultExpiryFromTtl(now, effectiveTtl);
  const parsedReturnAt = expectedReturnAt ? new Date(expectedReturnAt) : null;

  // Execute atomically in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Upsert current status
    const currentStatus = await tx.professorStatus.upsert({
      where: { professorId },
      update: {
        status,
        expectedReturnAt: parsedReturnAt,
        alternateLocation: alternateLocation || null,
        publicMessage: publicMessage || null,
        expiresAt,
        updatedAt: now,
      },
      create: {
        professorId,
        status,
        expectedReturnAt: parsedReturnAt,
        alternateLocation: alternateLocation || null,
        publicMessage: publicMessage || null,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      },
    });

    // 2. Append history record
    await tx.statusHistory.create({
      data: {
        professorId,
        recordedByUserId: actorUserId,
        status,
        expectedReturnAt: parsedReturnAt,
        alternateLocation: alternateLocation || null,
        publicMessage: publicMessage || null,
        expiresAt,
        recordedAt: now,
      },
    });

    // 3. Record audit log
    await tx.auditLog.create({
      data: {
        actorUserId,
        action: "STATUS_UPDATE",
        entityType: "professor",
        entityId: professorId,
        metadata: {
          newStatus: status,
          expectedReturnAt: parsedReturnAt?.toISOString(),
          alternateLocation: alternateLocation || null,
        },
      },
    });

    return currentStatus;
  });

  return formatStatusDetail(result);
}
