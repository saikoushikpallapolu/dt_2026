import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { FacultyStatus, ProfileVisibility, UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { formatStatusDetail } from "../services/status-service.js";
import type { AdminAnalytics, AuditLogItem } from "@wimp/shared";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createProfessorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  designation: z.string().min(2),
  departmentId: z.string().uuid(),
  officeId: z.string().uuid().optional().nullable(),
  publicContact: z.string().optional().nullable(),
  consultationDetails: z.string().optional().nullable(),
});

const updateProfessorSchema = z.object({
  displayName: z.string().min(2).optional(),
  designation: z.string().min(2).optional(),
  departmentId: z.string().uuid().optional(),
  officeId: z.string().uuid().nullable().optional(),
  visibility: z.nativeEnum(ProfileVisibility).optional(),
  publicContact: z.string().nullable().optional(),
  consultationDetails: z.string().nullable().optional(),
});

const createBuildingSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1).max(10),
});

const createOfficeSchema = z.object({
  buildingId: z.string().uuid(),
  floor: z.string().min(1),
  room: z.string().min(1),
  label: z.string().optional().nullable(),
});

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1).max(10),
});

export function createAdminRouter(): Router {
  const router = Router();

  // All admin routes require ADMINISTRATOR role
  router.use(requireAuth, requireRole("ADMINISTRATOR"));

  // ----------------------------------------------------
  // PROFESSORS MANAGEMENT
  // ----------------------------------------------------

  router.get("/professors", async (_req, res, next) => {
    try {
      const professors = await prisma.professor.findMany({
        include: {
          user: true,
          department: true,
          office: { include: { building: true } },
          currentStatus: true,
          qrCodes: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { displayName: "asc" },
      });

      const response = professors.map((p) => {
        const rawStatus = p.currentStatus || {
          status: "UNKNOWN",
          expectedReturnAt: null,
          alternateLocation: null,
          publicMessage: null,
          expiresAt: null,
          updatedAt: p.updatedAt,
        };

        return {
          id: p.id,
          userId: p.userId,
          email: p.user.email,
          slug: p.slug,
          displayName: p.displayName,
          designation: p.designation,
          visibility: p.visibility,
          publicContact: p.publicContact,
          consultationDetails: p.consultationDetails,
          department: {
            id: p.department.id,
            name: p.department.name,
            code: p.department.code,
          },
          office: p.office
            ? {
                id: p.office.id,
                buildingName: p.office.building.name,
                buildingCode: p.office.building.code,
                floor: p.office.floor,
                room: p.office.room,
                label: p.office.label,
              }
            : null,
          currentStatus: formatStatusDetail(rawStatus),
          qrCodes: p.qrCodes.map((q) => ({
            id: q.id,
            token: q.token,
            isActive: q.isActive,
            revokedAt: q.revokedAt?.toISOString() || null,
            createdAt: q.createdAt.toISOString(),
          })),
        };
      });

      res.json({ professors: response });
    } catch (err) {
      next(err);
    }
  });

  router.post("/professors", async (req, res, next) => {
    try {
      const parsed = createProfessorSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid professor data",
            details: parsed.error.flatten(),
          },
        });
        return;
      }

      const { email, password, displayName, designation, departmentId, officeId, publicContact, consultationDetails } = parsed.data;
      const lowerEmail = email.toLowerCase();

      const existingUser = await prisma.user.findUnique({ where: { email: lowerEmail } });
      if (existingUser) {
        res.status(409).json({ error: { code: "EMAIL_TAKEN", message: "User with this email already exists" } });
        return;
      }

      // Generate unique slug
      let baseSlug = slugify(displayName);
      let candidateSlug = baseSlug;
      let counter = 1;
      while (await prisma.professor.findUnique({ where: { slug: candidateSlug } })) {
        candidateSlug = `${baseSlug}-${counter++}`;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const initialQrToken = `qr-${candidateSlug}-${crypto.randomBytes(3).toString("hex")}`;

      const created = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: lowerEmail,
            passwordHash,
            role: UserRole.PROFESSOR,
          },
        });

        const professor = await tx.professor.create({
          data: {
            userId: user.id,
            slug: candidateSlug,
            displayName,
            designation,
            departmentId,
            officeId: officeId || null,
            publicContact: publicContact || null,
            consultationDetails: consultationDetails || null,
            visibility: ProfileVisibility.PUBLIC,
          },
        });

        // Initialize default status to UNKNOWN
        await tx.professorStatus.create({
          data: {
            professorId: professor.id,
            status: FacultyStatus.UNKNOWN,
          },
        });

        // Generate permanent initial QR code
        await tx.qrCode.create({
          data: {
            professorId: professor.id,
            token: initialQrToken,
            isActive: true,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorUserId: req.user!.id,
            action: "PROFESSOR_ONBOARD",
            entityType: "professor",
            entityId: professor.id,
            metadata: { email: lowerEmail, slug: candidateSlug },
          },
        });

        return professor;
      });

      res.status(201).json({
        ok: true,
        professor: created,
        initialQrToken,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/professors/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const parsed = updateProfessorSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid update payload" } });
        return;
      }

      const updated = await prisma.professor.update({
        where: { id },
        data: parsed.data,
        include: {
          department: true,
          office: { include: { building: true } },
        },
      });

      await prisma.auditLog.create({
        data: {
          actorUserId: req.user!.id,
          action: "PROFESSOR_UPDATE",
          entityType: "professor",
          entityId: id,
          metadata: parsed.data,
        },
      });

      res.json({ ok: true, professor: updated });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------------------
  // QR CODE MANAGEMENT
  // ----------------------------------------------------

  router.post("/professors/:id/qr", async (req, res, next) => {
    try {
      const { id } = req.params;

      const professor = await prisma.professor.findUnique({ where: { id } });
      if (!professor) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Professor not found" } });
        return;
      }

      const token = `qr-${professor.slug}-${crypto.randomBytes(4).toString("hex")}`;

      const qr = await prisma.$transaction(async (tx) => {
        // Optionally deactivate existing ones or keep them active
        const newQr = await tx.qrCode.create({
          data: {
            professorId: id,
            token,
            isActive: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: req.user!.id,
            action: "QR_GENERATE",
            entityType: "qr_code",
            entityId: newQr.id,
            metadata: { token, professorSlug: professor.slug },
          },
        });

        return newQr;
      });

      res.status(201).json({ ok: true, qr });
    } catch (err) {
      next(err);
    }
  });

  router.post("/qr/:id/revoke", async (req, res, next) => {
    try {
      const { id } = req.params;

      const qr = await prisma.qrCode.findUnique({ where: { id } });
      if (!qr) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "QR record not found" } });
        return;
      }

      const revoked = await prisma.$transaction(async (tx) => {
        const updated = await tx.qrCode.update({
          where: { id },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: req.user!.id,
            action: "QR_REVOKE",
            entityType: "qr_code",
            entityId: id,
            metadata: { token: qr.token },
          },
        });

        return updated;
      });

      res.json({ ok: true, qr: revoked });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------------------
  // CAMPUS / BUILDINGS / OFFICES
  // ----------------------------------------------------

  router.get("/buildings", async (_req, res, next) => {
    try {
      const buildings = await prisma.building.findMany({
        include: {
          offices: {
            include: {
              professors: {
                select: { id: true, displayName: true, slug: true },
              },
            },
            orderBy: [{ floor: "asc" }, { room: "asc" }],
          },
        },
        orderBy: { name: "asc" },
      });

      res.json({ buildings });
    } catch (err) {
      next(err);
    }
  });

  router.post("/buildings", async (req, res, next) => {
    try {
      const parsed = createBuildingSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid building data" } });
        return;
      }

      const building = await prisma.building.create({
        data: parsed.data,
      });

      res.status(201).json({ ok: true, building });
    } catch (err) {
      next(err);
    }
  });

  router.post("/offices", async (req, res, next) => {
    try {
      const parsed = createOfficeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid office data" } });
        return;
      }

      const office = await prisma.office.create({
        data: parsed.data,
        include: { building: true },
      });

      res.status(201).json({ ok: true, office });
    } catch (err) {
      next(err);
    }
  });

  router.post("/departments", async (req, res, next) => {
    try {
      const parsed = createDepartmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid department data" } });
        return;
      }

      const department = await prisma.department.create({
        data: parsed.data,
      });

      res.status(201).json({ ok: true, department });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------------------
  // ANALYTICS & AUDIT LOGS
  // ----------------------------------------------------

  router.get("/analytics", async (_req, res, next) => {
    try {
      const [
        facultyCount,
        departmentsCount,
        officesCount,
        activeQrCount,
        statuses,
        meetings,
        recentUpdatesCount,
      ] = await Promise.all([
        prisma.professor.count(),
        prisma.department.count(),
        prisma.office.count(),
        prisma.qrCode.count({ where: { isActive: true } }),
        prisma.professorStatus.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.meetingRequest.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.statusHistory.count({
          where: {
            recordedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const statusDistribution: Record<FacultyStatus, number> = {
        AVAILABLE: 0,
        IN_CLASS: 0,
        IN_MEETING: 0,
        AWAY: 0,
        ON_LEAVE: 0,
        UNKNOWN: 0,
      };

      for (const s of statuses) {
        statusDistribution[s.status as FacultyStatus] = s._count.status;
      }

      const meetingsStats = {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        cancelled: 0,
      };

      for (const m of meetings) {
        meetingsStats.total += m._count.status;
        if (m.status === "PENDING") meetingsStats.pending = m._count.status;
        if (m.status === "ACCEPTED") meetingsStats.accepted = m._count.status;
        if (m.status === "DECLINED") meetingsStats.declined = m._count.status;
        if (m.status === "CANCELLED") meetingsStats.cancelled = m._count.status;
      }

      const analytics: AdminAnalytics = {
        facultyCount,
        departmentsCount,
        officesCount,
        activeQrCount,
        statusDistribution,
        meetingsStats,
        recentUpdatesCountLast24h: recentUpdatesCount,
      };

      res.json({ analytics });
    } catch (err) {
      next(err);
    }
  });

  router.get("/audit-logs", async (_req, res, next) => {
    try {
      const logs = await prisma.auditLog.findMany({
        include: {
          actor: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      const response: AuditLogItem[] = logs.map((l) => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata,
        createdAt: l.createdAt.toISOString(),
        actorEmail: l.actor?.email || null,
      }));

      res.json({ auditLogs: response });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
