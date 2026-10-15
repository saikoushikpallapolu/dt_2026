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
  await ensureDatabase();
  const app = createApp(env);
  app.listen(env.API_PORT, () => {
    console.log(`API listening on http://localhost:${env.API_PORT}`);
    startAutomationWorker(env);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
