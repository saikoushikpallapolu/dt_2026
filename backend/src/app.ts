import { liveUpdates } from "./services/live-updates.js";
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

export function createApp(appEnv: AppEnv) {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: appEnv.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(authenticateSession);

  app.use('/api/v1', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.get('/api/v1/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const send = () => res.write('event: campus-change\ndata: {}\n\n');
    res.write('retry: 1000\nevent: connected\ndata: {}\n\n');
    liveUpdates.on('change', send);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000);
    req.on('close', () => { clearInterval(heartbeat); liveUpdates.off('change', send); });
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

  // 404 handler
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
