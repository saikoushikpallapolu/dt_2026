import { liveUpdates } from "./services/live-updates.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import type { AppEnv } from "./config/env.js";
import { authenticateSession } from "./middleware/auth.js";
import { createAuthRouter } from "./routes/auth.js";
import { createQrRouter } from "./routes/qr.js";
import { createFacultyRouter } from "./routes/faculty.js";
import { createDepartmentsRouter } from "./routes/departments.js";
import { createMeetingsRouter } from "./routes/meetings.js";
import { createFavoritesRouter } from "./routes/favorites.js";
import { createNotificationsRouter } from "./routes/notifications.js";
import { createAdminRouter } from "./routes/admin.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp(appEnv: AppEnv) {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: appEnv.FRONTEND_ORIGIN || true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(authenticateSession);

  app.use('/api/v1', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.get('/api/v1/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const sendChange = () => {
      try {
        res.write(`event: campus-change\ndata: {"time":${Date.now()}}\n\n`);
        (res as any).flush?.();
      } catch {
        // Socket closed
      }
    };

    res.write(`retry: 1000\nevent: connected\ndata: {"time":${Date.now()}}\n\n`);
    (res as any).flush?.();

    liveUpdates.on('change', sendChange);
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
        (res as any).flush?.();
      } catch {
        // Socket closed
      }
    }, 15000);

    const cleanup = () => {
      clearInterval(heartbeat);
      liveUpdates.off('change', sendChange);
    };

    req.on('close', cleanup);
    res.on('close', cleanup);
  });
  // Health and meta endpoints
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "where-is-my-professor-api" });
  });

  app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true, version: "v1" });
  });

  app.get("/api/v1/meta", (_req, res) => {
    res.json({
      publicBaseUrl: appEnv.PUBLIC_BASE_URL,
      statusDefaultTtlMinutes: appEnv.STATUS_DEFAULT_TTL_MINUTES,
      locationTracking: false,
      statusModel: "self-reported",
    });
  });

  // API v1 Routers
  app.use("/api/v1/auth", createAuthRouter(appEnv));
  app.use("/api/v1/qr", createQrRouter(appEnv));
  app.use("/api/v1/faculty", createFacultyRouter(appEnv));
  app.use("/api/v1/departments", createDepartmentsRouter());
  app.use("/api/v1/meetings", createMeetingsRouter());
  app.use("/api/v1/favorites", createFavoritesRouter());
  app.use("/api/v1/notifications", createNotificationsRouter());
  app.use("/api/v1/admin", createAdminRouter(appEnv));

  // Serve frontend SPA in production if built
  const candidateDirs = [
    path.resolve(here, "../../frontend/dist"),
    path.resolve(here, "../frontend/dist"),
    path.resolve(process.cwd(), "frontend/dist"),
    path.resolve(process.cwd(), "../frontend/dist"),
    "/opt/render/project/src/frontend/dist",
  ];
  const clientDist = candidateDirs.find((d) => fs.existsSync(path.join(d, "index.html")));
  if (clientDist) {
    console.log(`[production] Serving frontend SPA from: ${clientDist}`);
    app.use(express.static(clientDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path === "/health") {
        return next();
      }
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    console.warn("[production] Warning: frontend/dist/index.html not found in:", candidateDirs);
  }

  app.get("/api/v1/debug-deploy", (_req, res) => {
    res.json({
      here,
      cwd: process.cwd(),
      commit: process.env.RENDER_GIT_COMMIT || "local",
      databaseUrlSet: !!process.env.DATABASE_URL,
      candidates: candidateDirs.map((d) => ({
        dir: d,
        exists: fs.existsSync(d),
        hasIndex: fs.existsSync(path.join(d, "index.html")),
      })),
    });
  });

  // 404 handler for unmatched API routes
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `No route for ${req.method} ${req.path}`,
      },
    });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Unhandled API error:", err);
    res.status(err.status || 500).json({
      error: {
        code: err.code || "INTERNAL_ERROR",
        message: err.message || "An unexpected server error occurred",
      },
    });
  });

  return app;
}
