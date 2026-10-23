import { Router } from "express";
import { z } from "zod";
import { MeetingRequestStatus } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { publishCampusChange } from "../services/live-updates.js";
import type { MeetingRequestItem } from "@wimp/shared";

const createMeetingSchema = z.object({
  professorId: z.string().uuid(),
  reason: z.string().min(3).max(200),
  proposedStart: z.string().datetime(),
  proposedEnd: z.string().datetime(),
  note: z.string().max(500).optional(),
});

export function createMeetingsRouter(): Router {
  const router = Router();

  router.post("/", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const parsed = createMeetingSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid meeting request data",
            details: parsed.error.flatten(),
          },
        });
        return;
      }

      const { professorId, reason, proposedStart, proposedEnd, note } = parsed.data;
      const start = new Date(proposedStart);
      const end = new Date(proposedEnd);

      if (start <= new Date()) { res.status(400).json({ error: { code: "PAST_TIME", message: "Choose a future consultation time" } }); return; }

      if (end <= start) {
        res.status(400).json({
          error: {
            code: "INVALID_TIME_RANGE",
            message: "End time must be after start time",
          },
        });
        return;
      }

      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
        include: { user: true },
      });

      if (!professor || professor.visibility !== "PUBLIC" || !professor.user.isActive) {
        res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "Professor not found",
          },
        });
        return;
      }

      // Check conflict with existing ACCEPTED meetings for this professor
      const conflict = await prisma.meetingRequest.findFirst({
        where: {
          professorId,
          status: MeetingRequestStatus.ACCEPTED,
          AND: [{ proposedStart: { lt: end } }, { proposedEnd: { gt: start } }],
        },
      });

      if (conflict) {
        res.status(409).json({
          error: {
            code: "BOOKING_CONFLICT",
            message: "Professor has another accepted meeting during this scheduled time",
          },
        });
        return;
      }

      const meeting = await prisma.$transaction(async (tx) => {
        const created = await tx.meetingRequest.create({
          data: {
            studentUserId: req.user!.id,
            professorId,
            reason,
            proposedStart: start,
            proposedEnd: end,
            note: note || null,
            status: MeetingRequestStatus.PENDING,
          },
        });

        await tx.meetingRequestEvent.create({
          data: {
            meetingRequestId: created.id,
            actorUserId: req.user!.id,
            fromStatus: null,
            toStatus: MeetingRequestStatus.PENDING,
            note: "Requested by student",
          },
        });

        // Notify professor
        await tx.notification.create({
          data: {
            userId: professor.userId,
            type: "MEETING_REQUESTED",
            title: `New Consultation Request: ${req.user!.displayName || req.user!.email}`,
            body: `${reason} (${start.toLocaleDateString()} at ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
            payload: {
              meetingId: created.id,
              studentEmail: req.user!.email,
            },
          },
        });

        return created;
      });

      publishCampusChange();

      res.status(201).json({
        ok: true,
        meeting: {
          id: meeting.id,
          studentUserId: meeting.studentUserId,
          studentEmail: req.user!.email,
          professorId: meeting.professorId,
          professorName: professor.displayName,
          professorSlug: professor.slug,
          reason: meeting.reason,
          proposedStart: meeting.proposedStart.toISOString(),
          proposedEnd: meeting.proposedEnd.toISOString(),
          note: meeting.note,
          status: meeting.status,
          createdAt: meeting.createdAt.toISOString(),
          updatedAt: meeting.updatedAt.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/mine", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const meetings = await prisma.meetingRequest.findMany({
        where: { studentUserId: req.user!.id },
        include: {
          professor: {
            include: { department: true },
          },
          events: {
            orderBy: { createdAt: "asc" },
            include: { actor: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const response: MeetingRequestItem[] = meetings.map((m) => ({
        id: m.id,
        studentUserId: m.studentUserId,
        studentEmail: req.user!.email,
        professorId: m.professorId,
        professorName: m.professor.displayName,
        professorSlug: m.professor.slug,
        reason: m.reason,
        proposedStart: m.proposedStart.toISOString(),
        proposedEnd: m.proposedEnd.toISOString(),
        note: m.note,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        events: m.events.map((e) => ({
          id: e.id,
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          note: e.note,
          createdAt: e.createdAt.toISOString(),
          actorEmail: e.actor.email,
        })),
      }));

      res.json({ meetings: response });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/cancel", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const { id } = req.params;

      const meeting = await prisma.meetingRequest.findUnique({
        where: { id },
        include: { professor: { include: { user: true } } },
      });

      if (!meeting || meeting.studentUserId !== req.user!.id) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Meeting request not found" } });
        return;
      }

      if (meeting.status === MeetingRequestStatus.COMPLETED || meeting.status === MeetingRequestStatus.CANCELLED) {
        res.status(400).json({ error: { code: "INVALID_STATE", message: "Meeting cannot be cancelled" } });
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        const m = await tx.meetingRequest.update({
          where: { id },
          data: { status: MeetingRequestStatus.CANCELLED },
        });

        await tx.meetingRequestEvent.create({
          data: {
            meetingRequestId: id,
            actorUserId: req.user!.id,
            fromStatus: meeting.status,
            toStatus: MeetingRequestStatus.CANCELLED,
            note: "Cancelled by student",
          },
        });

        // Notify professor
        await tx.notification.create({
          data: {
            userId: meeting.professor.userId,
            type: "MEETING_CANCELLED",
            title: `Meeting Cancelled: ${req.user!.displayName || req.user!.email}`,
            body: `Student cancelled the meeting for "${meeting.reason}".`,
            payload: { meetingId: id },
          },
        });

        return m;
      });

      res.json({ ok: true, meeting: updated });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
