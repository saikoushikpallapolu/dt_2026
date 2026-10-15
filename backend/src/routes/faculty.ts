import { Router } from "express";
import { z } from "zod";
import { FacultyStatus, MeetingRequestStatus } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { formatStatusDetail, updateProfessorStatus } from "../services/status-service.js";
import type { AppEnv } from "../config/env.js";

const updateStatusSchema = z.object({
  status: z.nativeEnum(FacultyStatus),
  expectedReturnAt: z.string().datetime().nullable().optional(),
  alternateLocation: z.string().max(100).nullable().optional(),
  publicMessage: z.string().max(280).nullable().optional(),
  ttlMinutes: z.number().int().positive().nullable().optional(),
});

const updateProfileSchema = z.object({
  publicContact: z.string().max(200).nullable().optional(),
  consultationDetails: z.string().max(500).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
});

const meetingActionSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE", "PROPOSE_RESCHEDULE", "COMPLETE"]),
  note: z.string().max(500).optional(),
  proposedStart: z.string().datetime().optional(),
  proposedEnd: z.string().datetime().optional(),
});

export function createFacultyRouter(appEnv: AppEnv): Router {
  const router = Router();

  // ----------------------------------------------------
  // PUBLIC ROUTES
  // ----------------------------------------------------

  router.get("/", async (req, res, next) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : "";
      const statusFilter = typeof req.query.status === "string" ? req.query.status : "";
      const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20));

      const where: any = {
        visibility: "PUBLIC",
      };

      if (search) {
        where.OR = [
          { displayName: { contains: search, mode: "insensitive" } },
          { designation: { contains: search, mode: "insensitive" } },
          { department: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (statusFilter && Object.values(FacultyStatus).includes(statusFilter as FacultyStatus)) {
        where.currentStatus = {
          status: statusFilter as FacultyStatus,
        };
      }

      const [total, professors] = await Promise.all([
        prisma.professor.count({ where }),
        prisma.professor.findMany({
          where,
          include: {
            department: true,
            office: {
              include: { building: true },
            },
            currentStatus: true,
            qrCodes: {
              where: { isActive: true },
              take: 1,
            },
          },
          orderBy: { displayName: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      // Check favorites if student is logged in
      let favoritedIds = new Set<string>();
      if (req.user?.id) {
        const userFavs = await prisma.favorite.findMany({
          where: { studentUserId: req.user.id },
          select: { professorId: true },
        });
        favoritedIds = new Set(userFavs.map((f) => f.professorId));
      }

      const items = professors.map((prof) => {
        const rawStatus = prof.currentStatus || {
          status: "UNKNOWN",
          expectedReturnAt: null,
          alternateLocation: null,
          publicMessage: null,
          expiresAt: null,
          updatedAt: prof.updatedAt,
        };
        const statusDetail = formatStatusDetail(rawStatus);

        return {
          id: prof.id,
          slug: prof.slug,
          displayName: prof.displayName,
          designation: prof.designation,
          photoUrl: prof.photoUrl,
          department: {
            id: prof.department.id,
            name: prof.department.name,
            code: prof.department.code,
          },
          office: prof.office
            ? {
                id: prof.office.id,
                buildingName: prof.office.building.name,
                floor: prof.office.floor,
                room: prof.office.room,
                label: prof.office.label,
              }
            : null,
          currentStatus: statusDetail,
          activeQrToken: prof.qrCodes[0]?.token || null,
          isFavorited: favoritedIds.has(prof.id),
        };
      });

      res.json({
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // ----------------------------------------------------
  // AUTHENTICATED FACULTY ROUTES (me)
  // ----------------------------------------------------

  router.get(
    "/me/status",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const professor = await prisma.professor.findUnique({
          where: { userId: req.user!.id },
          include: {
            department: true,
            office: { include: { building: true } },
            currentStatus: true,
            qrCodes: { where: { isActive: true }, take: 1 },
          },
        });

        if (!professor) {
          res.status(404).json({
            error: {
              code: "NOT_FOUND",
              message: "No professor profile linked to this user account",
            },
          });
          return;
        }

        const rawStatus = professor.currentStatus || {
          status: "UNKNOWN",
          expectedReturnAt: null,
          alternateLocation: null,
          publicMessage: null,
          expiresAt: null,
          updatedAt: professor.updatedAt,
        };

        res.json({
          professorId: professor.id,
          displayName: professor.displayName,
          slug: professor.slug,
          status: formatStatusDetail(rawStatus),
          activeQrToken: professor.qrCodes[0]?.token || null,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.put(
    "/me/status",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const parsed = updateStatusSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid status parameters",
              details: parsed.error.flatten(),
            },
          });
          return;
        }

        const professor = await prisma.professor.findUnique({
          where: { userId: req.user!.id },
        });

        if (!professor) {
          res.status(404).json({
            error: {
              code: "NOT_FOUND",
              message: "No professor profile linked to this user",
            },
          });
          return;
        }

        const updated = await updateProfessorStatus({
          professorId: professor.id,
          actorUserId: req.user!.id,
          status: parsed.data.status,
          expectedReturnAt: parsed.data.expectedReturnAt,
          alternateLocation: parsed.data.alternateLocation,
          publicMessage: parsed.data.publicMessage,
          ttlMinutes: parsed.data.ttlMinutes,
          appEnv,
        });

        res.json({
          ok: true,
          status: updated,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/me/history",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const professor = await prisma.professor.findUnique({
          where: { userId: req.user!.id },
        });

        if (!professor) {
          res.status(404).json({ error: { code: "NOT_FOUND", message: "Professor profile not found" } });
          return;
        }

        const history = await prisma.statusHistory.findMany({
          where: { professorId: professor.id },
          include: { recordedBy: true },
          orderBy: { recordedAt: "desc" },
          take: 30,
        });

        res.json({
          history: history.map((h) => ({
            id: h.id,
            status: h.status,
            expectedReturnAt: h.expectedReturnAt?.toISOString() || null,
            alternateLocation: h.alternateLocation,
            publicMessage: h.publicMessage,
            expiresAt: h.expiresAt?.toISOString() || null,
            recordedAt: h.recordedAt.toISOString(),
            recordedByName: h.recordedBy.email.split("@")[0],
          })),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    "/me/profile",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid profile data" } });
          return;
        }

        const updated = await prisma.professor.update({
          where: { userId: req.user!.id },
          data: parsed.data,
        });

        res.json({ ok: true, professor: updated });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/me/requests",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const professor = await prisma.professor.findUnique({
          where: { userId: req.user!.id },
        });

        if (!professor) {
          res.status(404).json({ error: { code: "NOT_FOUND", message: "Professor profile not found" } });
          return;
        }

        const requests = await prisma.meetingRequest.findMany({
          where: { professorId: professor.id },
          include: {
            student: true,
            events: {
              orderBy: { createdAt: "asc" },
              include: { actor: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        res.json({
          requests: requests.map((r) => ({
            id: r.id,
            studentUserId: r.studentUserId,
            studentEmail: r.student.email,
            professorId: r.professorId,
            professorName: professor.displayName,
            professorSlug: professor.slug,
            reason: r.reason,
            proposedStart: r.proposedStart.toISOString(),
            proposedEnd: r.proposedEnd.toISOString(),
            note: r.note,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            events: r.events.map((e) => ({
              id: e.id,
              fromStatus: e.fromStatus,
              toStatus: e.toStatus,
              note: e.note,
              createdAt: e.createdAt.toISOString(),
              actorEmail: e.actor.email,
            })),
          })),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    "/me/requests/:id",
    requireAuth,
    requireRole("PROFESSOR"),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const parsed = meetingActionSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid action payload" } });
          return;
        }

        const professor = await prisma.professor.findUnique({
          where: { userId: req.user!.id },
        });

        if (!professor) {
          res.status(404).json({ error: { code: "NOT_FOUND", message: "Professor profile not found" } });
          return;
        }

        const request = await prisma.meetingRequest.findUnique({
          where: { id },
          include: { student: true },
        });

        if (!request || request.professorId !== professor.id) {
          res.status(404).json({ error: { code: "NOT_FOUND", message: "Meeting request not found" } });
          return;
        }

        let targetStatus: MeetingRequestStatus;
        if (parsed.data.action === "ACCEPT") {
          targetStatus = MeetingRequestStatus.ACCEPTED;

          // Conflict check for accepted meetings
          const conflict = await prisma.meetingRequest.findFirst({
            where: {
              professorId: professor.id,
              status: MeetingRequestStatus.ACCEPTED,
              id: { not: request.id },
              AND: [
                { proposedStart: { lt: request.proposedEnd } },
                { proposedEnd: { gt: request.proposedStart } },
              ],
            },
          });

          if (conflict) {
            res.status(409).json({
              error: {
                code: "BOOKING_CONFLICT",
                message: "You already have an accepted meeting scheduled during this time window",
              },
            });
            return;
          }
        } else if (parsed.data.action === "DECLINE") {
          targetStatus = MeetingRequestStatus.DECLINED;
        } else if (parsed.data.action === "PROPOSE_RESCHEDULE") {
          targetStatus = MeetingRequestStatus.RESCHEDULE_PROPOSED;
        } else {
          targetStatus = MeetingRequestStatus.COMPLETED;
        }

        const updated = await prisma.$transaction(async (tx) => {
          const updateData: any = {
            status: targetStatus,
          };
          if (parsed.data.proposedStart) {
            updateData.proposedStart = new Date(parsed.data.proposedStart);
          }
          if (parsed.data.proposedEnd) {
            updateData.proposedEnd = new Date(parsed.data.proposedEnd);
          }

          const m = await tx.meetingRequest.update({
            where: { id },
            data: updateData,
          });

          await tx.meetingRequestEvent.create({
            data: {
              meetingRequestId: id,
              actorUserId: req.user!.id,
              fromStatus: request.status,
              toStatus: targetStatus,
              note: parsed.data.note || null,
            },
          });

          // Create notification for student
          await tx.notification.create({
            data: {
              userId: request.studentUserId,
              type: "MEETING_UPDATE",
              title: `Meeting ${targetStatus.toLowerCase()}: ${professor.displayName}`,
              body:
                parsed.data.note ||
                `${professor.displayName} updated your meeting request to ${targetStatus}.`,
              payload: {
                meetingId: id,
                status: targetStatus,
              },
            },
          });

          return m;
        });

        res.json({ ok: true, request: updated });
      } catch (err) {
        next(err);
      }
    },
  );

  // ----------------------------------------------------
  // PUBLIC BY SLUG
  // ----------------------------------------------------

  router.get("/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;

      const professor = await prisma.professor.findUnique({
        where: { slug },
        include: {
          department: true,
          office: { include: { building: true } },
          currentStatus: true,
          officeHours: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          qrCodes: {
            where: { isActive: true },
            take: 1,
          },
        },
      });

      if (!professor || professor.visibility !== "PUBLIC") {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Faculty member not found" },
        });
        return;
      }

      const rawStatus = professor.currentStatus || {
        status: "UNKNOWN",
        expectedReturnAt: null,
        alternateLocation: null,
        publicMessage: null,
        expiresAt: null,
        updatedAt: professor.updatedAt,
      };

      res.json({
        id: professor.id,
        slug: professor.slug,
        displayName: professor.displayName,
        designation: professor.designation,
        photoUrl: professor.photoUrl,
        publicContact: professor.publicContact,
        consultationDetails: professor.consultationDetails,
        department: {
          id: professor.department.id,
          name: professor.department.name,
          code: professor.department.code,
        },
        office: professor.office
          ? {
              id: professor.office.id,
              buildingName: professor.office.building.name,
              buildingCode: professor.office.building.code,
              floor: professor.office.floor,
              room: professor.office.room,
              label: professor.office.label,
            }
          : null,
        currentStatus: formatStatusDetail(rawStatus),
        officeHours: professor.officeHours.map((oh) => ({
          id: oh.id,
          dayOfWeek: oh.dayOfWeek,
          startTime: oh.startTime,
          endTime: oh.endTime,
          notes: oh.notes,
        })),
        activeQrToken: professor.qrCodes[0]?.token || null,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:slug/status", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const professor = await prisma.professor.findUnique({
        where: { slug },
        include: { currentStatus: true },
      });

      if (!professor || professor.visibility !== "PUBLIC") {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Faculty member not found" } });
        return;
      }

      const rawStatus = professor.currentStatus || {
        status: "UNKNOWN",
        expectedReturnAt: null,
        alternateLocation: null,
        publicMessage: null,
        expiresAt: null,
        updatedAt: professor.updatedAt,
      };

      res.json(formatStatusDetail(rawStatus));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:slug/office-hours", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const professor = await prisma.professor.findUnique({
        where: { slug },
        include: {
          officeHours: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
        },
      });

      if (!professor || professor.visibility !== "PUBLIC") {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Faculty member not found" } });
        return;
      }

      res.json({
        officeHours: professor.officeHours.map((oh) => ({
          id: oh.id,
          dayOfWeek: oh.dayOfWeek,
          startTime: oh.startTime,
          endTime: oh.endTime,
          notes: oh.notes,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
