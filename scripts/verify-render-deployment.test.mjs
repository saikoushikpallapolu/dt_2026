import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyDeployment } from './verify-render-deployment.mjs';

const sha = 'a'.repeat(40);
function server(overrides = {}) {
  let reads = 0;
  return async url => {
    const path = url.pathname;
    if (overrides[path]) return overrides[path](++reads);
    if (path === '/api/v1/debug-deploy') return Response.json({ commit: sha });
    if (path === '/api/v1/health') return Response.json({ ok: true });
    if (path === '/api/v1/faculty') return Response.json({ items: [{ id: 'demo' }] });
    if (path === '/login') return new Response('<div id="root"></div><script type="module" src="/assets/app.js"></script>');
    if (path === '/assets/app.js') return new Response('console.log("app")', { headers: { 'content-type': 'application/javascript' } });
    throw new Error('Unexpected request: ' + path);
  };
}
test('marks a matching, readable deployment ready', async () => {
  assert.equal((await verifyDeployment('https://example.com', sha, server())).ready, true);
});
test('never marks an older deployment successful', async () => {
  const result = await verifyDeployment('https://example.com', sha, server({ '/api/v1/debug-deploy': () => Response.json({ commit: 'b'.repeat(40) }) }));
  assert.equal(result.ready, false); assert.match(result.reason, /Waiting/);
});
test('requires working database reads despite healthy API', async () => {
  const result = await verifyDeployment('https://example.com', sha, server({ '/api/v1/faculty': () => new Response('Database unavailable', { status: 500 }) }));
  assert.equal(result.ready, false); assert.match(result.reason, /HTTP 500/);
});
test('rejects missing frontend and HTML returned in place of a bundle', async () => {
  assert.equal((await verifyDeployment('https://example.com', sha, server({ '/login': () => new Response('Not built') }))).ready, false);
  assert.equal((await verifyDeployment('https://example.com', sha, server({ '/assets/app.js': () => new Response('<html/>', { headers: { 'content-type': 'text/html' } }) }))).ready, false);
});
test('rejects a different revision appearing during the check', async () => {
  const result = await verifyDeployment('https://example.com', sha, server({ '/api/v1/debug-deploy': read => Response.json({ commit: read === 1 ? sha : 'b'.repeat(40) }) }));
  assert.equal(result.ready, false); assert.match(result.reason, /changed/);
});
test('network errors stay pending instead of producing a green result', async () => {
  const result = await verifyDeployment('https://example.com', sha, async () => { throw new Error('Network unavailable'); });
  assert.equal(result.ready, false); assert.match(result.reason, /Network/);
});
