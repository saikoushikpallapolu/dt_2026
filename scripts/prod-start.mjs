import { execSync } from 'node:child_process';

if (process.env.DATABASE_URL) {
  try {
    console.log('[prod-start] Running database migrations...');
    execSync('npx prisma migrate deploy --schema backend/prisma/schema.prisma', { stdio: 'inherit' });
    console.log('[prod-start] Ensuring demo faculty accounts exist...');
    execSync('npx tsx backend/prisma/demo.ts', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[prod-start] Notice running migrations/seed:', err.message);
  }
}

console.log('[prod-start] Starting backend server...');
execSync('npx tsx backend/src/index.ts', { stdio: 'inherit' });
