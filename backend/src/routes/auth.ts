import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import {
  clearSessionCookie,
  createSession,
  hashToken,
  setSessionCookie,
} from "../middleware/auth.js";
import type { AppEnv } from "../config/env.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function createAuthRouter(appEnv: AppEnv): Router {
  const router = Router();

  router.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email or password format",
            details: parsed.error.flatten(),
          },
        });
        return;
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { professor: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
        return;
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
        return;
      }

      const token = await createSession(user.id);
      setSessionCookie(res, token, appEnv);

      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "AUTH_LOGIN",
          entityType: "user",
          entityId: user.id,
        },
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: user.professor?.displayName || user.email.split("@")[0],
          professorId: user.professor?.id,
          professorSlug: user.professor?.slug,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 8 characters",
            details: parsed.error.flatten(),
          },
        });
        return;
      }

      const email = parsed.data.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({
          error: {
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists",
          },
        });
        return;
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.STUDENT,
        },
      });

      const token = await createSession(user.id);
      setSessionCookie(res, token, appEnv);

      await prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "AUTH_REGISTER",
          entityType: "user",
          entityId: user.id,
        },
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: user.email.split("@")[0],
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      if (req.sessionToken) {
        const tokenHash = hashToken(req.sessionToken);
        await prisma.session.deleteMany({
          where: { tokenHash },
        });
      }
      clearSessionCookie(res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.get("/me", (req, res) => {
    res.json({
      user: req.user || null,
    });
  });

  return router;
}
