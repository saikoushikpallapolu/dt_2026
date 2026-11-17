import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Render auto-deploys main. Record success only after that exact commit is live.
export async function verifyDeployment(base, expectedCommit, fetcher = fetch) {
  async function get(path) {
    const response = await fetcher(new URL(path, base), {
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return response;
  }
  try {
    const revision = await (await get('/api/v1/debug-deploy')).json();
    if (revision.commit !== expectedCommit) {
      return { ready: false, reason: `Waiting for ${expectedCommit}; live revision is ${revision.commit || 'unknown'}` };
    }
    const health = await (await get('/api/v1/health')).json();
    if (health.ok !== true) return { ready: false, reason: 'API health is not ready' };
    // Unlike the liveness endpoint, faculty reads exercise database connectivity.
    const directory = await (await get('/api/v1/faculty?limit=1')).json();
    if (!Array.isArray(directory.items) || directory.items.length === 0) {
      return { ready: false, reason: 'Public faculty data is not ready' };
    }
    const html = await (await get('/login')).text();
    const bundle = html.match(/<script\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1];
    if (!html.includes('id="root"') || !bundle) return { ready: false, reason: 'Frontend bundle is not ready' };
    const bundleUrl = new URL(bundle, base);
    if (bundleUrl.origin !== new URL(base).origin) throw new Error('Unexpected frontend bundle origin');
    const asset = await get(bundleUrl.pathname);
    if (!/javascript/i.test(asset.headers.get('content-type') || '')) {
      return { ready: false, reason: 'Frontend script did not return JavaScript' };
    }
    await asset.arrayBuffer();
    const finalRevision = await (await get('/api/v1/debug-deploy')).json();
    if (finalRevision.commit !== expectedCommit) return { ready: false, reason: 'Live revision changed during verification' };
    return { ready: true, reason: 'Matching commit, healthy API, faculty data, frontend page and JavaScript bundle verified' };
  } catch (error) {
    return { ready: false, reason: error.message };
  }
}

async function main() {
  const base = process.env.APP_URL || 'https://dt-2026.onrender.com';
  const expected = process.env.EXPECTED_COMMIT;
  if (!/^[a-f0-9]{40}$/i.test(expected || '')) throw new Error('EXPECTED_COMMIT must be a full Git commit SHA');
  if (new URL(base).protocol !== 'https:') throw new Error('Production APP_URL must use HTTPS');
  const deadline = Date.now() + 20 * 60 * 1000;
  let lastReason = '';
  while (Date.now() < deadline) {
    const result = await verifyDeployment(base, expected);
    lastReason = result.reason;
    console.log(lastReason);
    if (result.ready) {
      if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        `## Production deployment verified\n\nApp: ${base}\n\nCommit: ${expected}\n\n${result.reason}.\n`);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  throw new Error(`Render did not serve a verified deployment within 20 minutes: ${lastReason}. Check Render auto-deploy and build logs.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
