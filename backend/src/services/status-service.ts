import { publishCampusChange } from "./live-updates.js";
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

  // If status is AVAILABLE, notify all subscribed students
  if (status === "AVAILABLE") {
    try {
      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
        include: { office: true },
      });
      if (professor) {
        const subscribers = await prisma.favorite.findMany({
          where: {
            professorId,
            notifyWhenAvailable: true,
          },
        });
        const locationText = professor.office ? `Room ${professor.office.room}` : "their office";
        const note = publicMessage ? ` "${publicMessage}"` : "";

        for (const sub of subscribers) {
          await prisma.notification.create({
            data: {
              userId: sub.studentUserId,
              type: "FACULTY_AVAILABLE",
              title: `${professor.displayName} is now Available`,
              body: `${professor.displayName} has updated their status to Available in ${locationText}.${note}`,
              payload: {
                professorId: professor.id,
                slug: professor.slug,
                status: "AVAILABLE",
              },
            },
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to notify subscribed students:", notifErr);
    }
  }

  publishCampusChange();
  return formatStatusDetail(result);
}
