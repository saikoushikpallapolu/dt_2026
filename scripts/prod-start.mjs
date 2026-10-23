import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
process.chdir(rootDir);

// 1. Ensure frontend is built if dist does not exist
const clientDist = path.resolve(rootDir, 'frontend/dist/index.html');
if (!fs.existsSync(clientDist)) {
  console.log('[prod-start] frontend/dist not found, building frontend bundle now...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  } catch (err) {
    console.error('[prod-start] Failed to build frontend:', err.message);
  }
}

// 2. Ensure database migrations and initial accounts
if (process.env.DATABASE_URL) {
  try {
    console.log('[prod-start] Running database migrations...');
    execSync('npx prisma migrate deploy --schema backend/prisma/schema.prisma', { stdio: 'inherit', cwd: rootDir });
    console.log('[prod-start] Ensuring demo faculty accounts exist...');
    execSync('npx tsx backend/prisma/demo.ts', { stdio: 'inherit', cwd: rootDir });
  } catch (err) {
    console.warn('[prod-start] Notice running migrations/seed:', err.message);
  }
}

console.log('[prod-start] Starting backend server...');
execSync('npx tsx backend/src/index.ts', { stdio: 'inherit', cwd: rootDir });
