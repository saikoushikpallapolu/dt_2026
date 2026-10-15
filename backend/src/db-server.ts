import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, "../../.pgdata");

async function startDb() {
  console.log("Starting embedded Postgres in:", dbDir);
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: "wimp",
    password: "wimp",
    port: 5432,
    persistent: true,
  });

  try {
    await pg.initialise();
    console.log("Postgres initialised");
  } catch (err: any) {
    console.log("Init note:", err?.message || err);
  }

  await pg.start();
  console.log("Postgres started on port 5432");

  try {
    await pg.createDatabase("wimp");
    console.log("Database 'wimp' created");
  } catch (err: any) {
    console.log("Database create note (may already exist):", err?.message || err);
  }

  console.log("Postgres is ready for connections!");

  // Keep process alive if run directly
  process.on("SIGINT", async () => {
    console.log("Stopping Postgres...");
    await pg.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    console.log("Stopping Postgres...");
    await pg.stop();
    process.exit(0);
  });
}

startDb().catch((err) => {
  console.error("Failed to start embedded Postgres:", err);
  process.exit(1);
});
