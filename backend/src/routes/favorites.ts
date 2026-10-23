import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { formatStatusDetail } from "../services/status-service.js";

export function createFavoritesRouter(): Router {
  const router = Router();

  router.get("/", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { studentUserId: req.user!.id },
        include: {
          professor: {
            include: {
              department: true,
              office: { include: { building: true } },
              currentStatus: true,
              qrCodes: { where: { isActive: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const items = favorites.map((fav) => {
        const prof = fav.professor;
        const rawStatus = prof.currentStatus || {
          status: "UNKNOWN",
          expectedReturnAt: null,
          alternateLocation: null,
          publicMessage: null,
          expiresAt: null,
          updatedAt: prof.updatedAt,
        };

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
          currentStatus: formatStatusDetail(rawStatus),
          activeQrToken: prof.qrCodes[0]?.token || null,
          isFavorited: true,
          notifyWhenAvailable: fav.notifyWhenAvailable ?? true,
        };
      });

      res.json({ favorites: items });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:professorId", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const { professorId } = req.params;
      const notifyWhenAvailable = req.body?.notifyWhenAvailable !== false;

      const professor = await prisma.professor.findUnique({
        where: { id: professorId },
      });

      if (!professor) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Professor not found" } });
        return;
      }

      await prisma.favorite.upsert({
        where: {
          studentUserId_professorId: {
            studentUserId: req.user!.id,
            professorId,
          },
        },
        create: {
          studentUserId: req.user!.id,
          professorId,
          notifyWhenAvailable,
        },
        update: {
          notifyWhenAvailable,
        },
      });

      res.json({ ok: true, favorited: true, notifyWhenAvailable });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:professorId/notify", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const { professorId } = req.params;
      const notifyWhenAvailable = req.body?.notifyWhenAvailable !== false;

      const updated = await prisma.favorite.update({
        where: {
          studentUserId_professorId: {
            studentUserId: req.user!.id,
            professorId,
          },
        },
        data: {
          notifyWhenAvailable,
        },
      });

      res.json({ ok: true, notifyWhenAvailable: updated.notifyWhenAvailable });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:professorId", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
    try {
      const { professorId } = req.params;

      await prisma.favorite.deleteMany({
        where: {
          studentUserId: req.user!.id,
          professorId,
        },
      });

      res.json({ ok: true, favorited: false });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
