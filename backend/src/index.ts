import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db.js";
import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (_err) {
    console.log("PostgreSQL not responding on port 5432. Starting embedded instance...");
    const dbDir = path.resolve(__dirname, "../../.pgdata");
    const pg = new EmbeddedPostgres({
      databaseDir: dbDir,
      user: "wimp",
      password: "wimp",
      port: 5432,
      persistent: true,
    });
    try {
      await pg.initialise();
    } catch (_) {}
    await pg.start();
    try {
      await pg.createDatabase("wimp");
    } catch (_) {}
    console.log("Embedded PostgreSQL started successfully.");
  }
}

import { startAutomationWorker } from "./services/automation-service.js";

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    await ensureDatabase();
  }
  const app = createApp(env);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : env.API_PORT;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
    // Published availability is controlled by faculty. Timetable simulation is admin-only.
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
