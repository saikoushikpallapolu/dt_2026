import assert from 'node:assert/strict';

const base = 'http://localhost:4100/api/v1';

async function call(path, method = 'GET', body, cookie) {
  const r = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = r.headers.get('content-type')?.includes('json') ? await r.json() : await r.arrayBuffer();
  return { status: r.status, data, cookie: r.headers.get('set-cookie')?.split(';')[0] };
}

async function login(email, password = 'DemoPass123!') {
  const r = await call('/auth/login', 'POST', { email, password });
  assert.equal(r.status, 200, `Login failed for ${email}`);
  return r.cookie;
}

async function run() {
  console.log('--- STARTING VERIFICATION FOR 3 SPECIFIC PROFESSORS ---');

  // 1. Verify Login for all 3 professors and 1 student
  console.log('1. Logging in all accounts...');
  const studentCookie = await login('student@vnr.demo');
  const prasannaCookie = await login('prasanna@vnr.demo');
  const thirupathiCookie = await login('thirupathi.nanuvala@vnr.demo');
  const akhilCookie = await login('akhil@vnr.demo');
  console.log('✓ All 4 accounts authenticated successfully (Prasanna Mam, Thirupathi Nanuvala Sir, Akhil Sir, Student Patel)');

  // 2. Test Prasanna Mam's pipeline
  console.log('\n2. Testing Prasanna Mam (Room 127)...');
  const ret1 = new Date(Date.now() + 45 * 60000).toISOString();
  const up1 = await call('/faculty/me/status', 'PUT', {
    status: 'IN_CLASS',
    expectedReturnAt: ret1,
    publicMessage: 'CSE 3rd Year Lecture in Room 127',
  }, prasannaCookie);
  assert.equal(up1.status, 200);

  // Student scans / queries her QR
  const qrPrasanna = await call('/qr/vnr-prasanna', 'GET', undefined, studentCookie);
  assert.equal(qrPrasanna.status, 200);
  assert.equal(qrPrasanna.data.professor.displayName, 'Prasanna Mam');
  assert.equal(qrPrasanna.data.professor.office.room, '127');
  assert.equal(qrPrasanna.data.status.status, 'IN_CLASS');
  assert.equal(qrPrasanna.data.status.publicMessage, 'CSE 3rd Year Lecture in Room 127');
  console.log('✓ Prasanna Mam status updated to IN_CLASS and verified by student via QR token vnr-prasanna');

  // 3. Test Thirupathi Nanuvala Sir's pipeline
  console.log('\n3. Testing Thirupathi Nanuvala Sir (Room 201)...');
  const ret2 = new Date(Date.now() + 60 * 60000).toISOString();
  const up2 = await call('/faculty/me/status', 'PUT', {
    status: 'IN_MEETING',
    expectedReturnAt: ret2,
    publicMessage: 'HOD & Faculty Sync in Room 201',
  }, thirupathiCookie);
  assert.equal(up2.status, 200);

  const qrThirupathi = await call('/qr/vnr-thirupathi-nanuvala', 'GET', undefined, studentCookie);
  assert.equal(qrThirupathi.status, 200);
  assert.equal(qrThirupathi.data.professor.displayName, 'Thirupathi Nanuvala Sir');
  assert.equal(qrThirupathi.data.professor.office.room, '201');
  assert.equal(qrThirupathi.data.status.status, 'IN_MEETING');
  assert.equal(qrThirupathi.data.status.publicMessage, 'HOD & Faculty Sync in Room 201');
  console.log('✓ Thirupathi Nanuvala Sir status updated to IN_MEETING and verified by student via QR token vnr-thirupathi-nanuvala');

  // 4. Test Akhil Sir's pipeline
  console.log('\n4. Testing Akhil Sir (Room 031)...');
  const up3 = await call('/faculty/me/status', 'PUT', {
    status: 'AVAILABLE',
    expectedReturnAt: null,
    publicMessage: 'Available for student consultations in Room 031',
  }, akhilCookie);
  assert.equal(up3.status, 200);

  const qrAkhil = await call('/qr/vnr-akhil', 'GET', undefined, studentCookie);
  assert.equal(qrAkhil.status, 200);
  assert.equal(qrAkhil.data.professor.displayName, 'Akhil Sir');
  assert.equal(qrAkhil.data.professor.office.room, '031');
  assert.equal(qrAkhil.data.status.status, 'AVAILABLE');
  assert.equal(qrAkhil.data.status.publicMessage, 'Available for student consultations in Room 031');
  console.log('✓ Akhil Sir status updated to AVAILABLE and verified by student via QR token vnr-akhil');

  // 5. Test Live Server-Sent Events (SSE) Stream
  console.log('\n5. Testing Live Real-Time SSE Stream...');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const stream = await fetch(base + '/events', { signal: controller.signal });
    assert.equal(stream.status, 200);
    const reader = stream.body.getReader();
    
    // Read connected
    const firstChunk = await reader.read();
    assert.ok(new TextDecoder().decode(firstChunk.value).includes('connected'));

    // Trigger status change from Prasanna Mam
    await call('/faculty/me/status', 'PUT', {
      status: 'AVAILABLE',
      publicMessage: 'Lecture finished. In Room 127.',
    }, prasannaCookie);

    // Read SSE broadcast
    let received = '';
    while (!received.includes('campus-change')) {
      const chunk = await reader.read();
      received += new TextDecoder().decode(chunk.value);
    }
    assert.ok(received.includes('event: campus-change'));
    console.log('✓ Real-time SSE broadcast verified: status changes trigger instantaneous campus-change events');
    await reader.cancel();
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }

  // 6. Verify QR Image Placard generation for all 3
  console.log('\n6. Checking QR placard image endpoints...');
  for (const token of ['vnr-prasanna', 'vnr-thirupathi-nanuvala', 'vnr-akhil']) {
    const img = await fetch(`${base}/qr/${token}/image`);
    assert.equal(img.status, 200, `Failed to load QR image for ${token}`);
    assert.equal(img.headers.get('content-type'), 'image/png');
  }
  console.log('✓ All 3 QR image endpoints stream valid PNGs with correct headers');

  console.log('\n======================================================');
  console.log('🎉 ALL PIPELINE CHECKS PASSED FOR ALL 3 PROFESSORS! 🎉');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
