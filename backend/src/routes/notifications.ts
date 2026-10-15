import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export function createNotificationsRouter(): Router {
  const router = Router();

  router.get("/", requireAuth, async (req, res, next) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      res.json({
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          payload: n.payload,
          readAt: n.readAt?.toISOString() || null,
          createdAt: n.createdAt.toISOString(),
        })),
        unreadCount: notifications.filter((n) => !n.readAt).length,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/read", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;

      await prisma.notification.updateMany({
        where: { id, userId: req.user!.id },
        data: { readAt: new Date() },
      });

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post("/read-all", requireAuth, async (req, res, next) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, readAt: null },
        data: { readAt: new Date() },
      });

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
