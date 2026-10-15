import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@wimp/shared";
import { prisma } from "../db.js";
import type { AppEnv } from "../config/env.js";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  professorId?: string;
  professorSlug?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      sessionToken?: string;
    }
  }
}

export const COOKIE_NAME = "wimp_session";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: string, ttlDays = 7): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export function setSessionCookie(res: Response, token: string, appEnv: AppEnv): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: appEnv.COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function resolveSessionUser(req: Request): Promise<SessionUser | undefined> {
  const rawToken = req.cookies?.[COOKIE_NAME];
  if (!rawToken || typeof rawToken !== "string") {
    return undefined;
  }

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          professor: true,
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    return undefined;
  }

  req.sessionToken = rawToken;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as UserRole,
    displayName: session.user.professor?.displayName || session.user.email.split("@")[0],
    professorId: session.user.professor?.id,
    professorSlug: session.user.professor?.slug,
  };
}

export function authenticateSession(req: Request, _res: Response, next: NextFunction) {
  resolveSessionUser(req)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(err);
    });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "You must be signed in to perform this action",
      },
    });
    return;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to perform this action",
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires one of roles: ${roles.join(", ")}`,
        },
      });
      return;
    }

    next();
  };
}
