import { Router } from "express";
import { prisma } from "../db.js";

export function createDepartmentsRouter(): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const departments = await prisma.department.findMany({
        include: {
          _count: {
            select: { professors: true },
          },
        },
        orderBy: { name: "asc" },
      });

      res.json({
        departments: departments.map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          professorCount: d._count.professors,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
