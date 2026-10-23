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
  const data = r.headers.get('content-type')?.includes('json')
    ? await r.json()
    : await r.text();
  return {
    status: r.status,
    data,
    cookie: r.headers.get('set-cookie')?.split(';')[0],
  };
}

async function login(email, password = 'DemoPass123!') {
  const r = await call('/auth/login', 'POST', { email, password });
  assert.equal(r.status, 200, `Login failed for ${email}`);
  return { cookie: r.cookie, user: r.data.user };
}

console.log('--- Starting Notification Verification ---');

// 1. Log in users
const studentAuth = await login('student@vnr.demo');
const prasannaAuth = await login('prasanna@vnr.demo');
const thirupathiAuth = await login('thirupathi.nanuvala@vnr.demo');

console.log('Logged in student and professors successfully');

// Find Prasanna's professor ID
const prasannaMe = await call('/faculty/me/status', 'GET', undefined, prasannaAuth.cookie);
assert.equal(prasannaMe.status, 200);

// Find Thirupathi's professor ID
const thirupathiMe = await call('/faculty/me/status', 'GET', undefined, thirupathiAuth.cookie);
assert.equal(thirupathiMe.status, 200);

// Get faculty list to get their IDs
const facultyList = await call('/faculty?limit=50');
const prasannaProf = facultyList.data.items.find(p => p.slug === 'prasanna' || p.displayName.includes('Prasanna'));
const thirupathiProf = facultyList.data.items.find(p => p.slug.includes('thirupathi') || p.displayName.includes('Thirupathi'));

assert.ok(prasannaProf, 'Prasanna Mam not found in faculty list');
assert.ok(thirupathiProf, 'Thirupathi Sir not found in faculty list');

console.log(`Found Prasanna ID: ${prasannaProf.id}, Thirupathi ID: ${thirupathiProf.id}`);

// --- TEST 1: NOTIFY WHEN AVAILABLE ---
console.log('\n[TEST 1] Testing Student Favorite & Notify When Available...');

// Step 1: Set Prasanna status to IN_CLASS first
await call('/faculty/me/status', 'PUT', {
  status: 'IN_CLASS',
  alternateLocation: 'Room 127',
  publicMessage: 'Delivering Operating Systems lecture',
}, prasannaAuth.cookie);

// Step 2: Ensure student has Prasanna favorited with notifyWhenAvailable: true
await call(`/favorites/${prasannaProf.id}`, 'POST', {}, studentAuth.cookie);
await call(`/favorites/${prasannaProf.id}/notify`, 'PATCH', { notifyWhenAvailable: true }, studentAuth.cookie);

const favs = await call('/favorites', 'GET', undefined, studentAuth.cookie);
const prasannaFav = favs.data.favorites.find(f => f.id === prasannaProf.id);
assert.ok(prasannaFav, 'Prasanna should be in student favorites');
assert.equal(prasannaFav.notifyWhenAvailable, true, 'notifyWhenAvailable should be true');

// Clear existing unread notifications for student to measure accurately
await call('/notifications/read-all', 'POST', {}, studentAuth.cookie);

// Step 3: Prasanna updates status to AVAILABLE
console.log('Prasanna Mam updates status to AVAILABLE...');
const updateRes = await call('/faculty/me/status', 'PUT', {
  status: 'AVAILABLE',
  publicMessage: 'Back in cabin Room 127 for doubts',
}, prasannaAuth.cookie);
assert.equal(updateRes.status, 200);

// Step 4: Verify student received notification
const studentNotifs = await call('/notifications', 'GET', undefined, studentAuth.cookie);
assert.equal(studentNotifs.status, 200);
const availNotif = studentNotifs.data.notifications.find(n => n.type === 'FACULTY_AVAILABLE' && n.payload?.professorId === prasannaProf.id);

assert.ok(availNotif, 'Student should receive FACULTY_AVAILABLE notification');
console.log('PASS: Student received notification:', availNotif.title, '—', availNotif.body);

// Test toggling notify off
await call(`/favorites/${prasannaProf.id}/notify`, 'PATCH', { notifyWhenAvailable: false }, studentAuth.cookie);
const favsAfterToggle = await call('/favorites', 'GET', undefined, studentAuth.cookie);
const favUpdated = favsAfterToggle.data.favorites.find(f => f.id === prasannaProf.id);
assert.equal(favUpdated.notifyWhenAvailable, false, 'notifyWhenAvailable should now be false');
console.log('PASS: Toggle notifyWhenAvailable to false confirmed');

// Reset notify back to true
await call(`/favorites/${prasannaProf.id}/notify`, 'PATCH', { notifyWhenAvailable: true }, studentAuth.cookie);


// --- TEST 2: PROFESSOR NOTIFIED ON MEETING REQUEST ---
console.log('\n[TEST 2] Testing Professor Notification on Meeting Request...');

// Clear existing notifications for Thirupathi Sir
await call('/notifications/read-all', 'POST', {}, thirupathiAuth.cookie);

// Student requests a meeting with Thirupathi Sir
const start = new Date(Date.now() + 172800000); // 2 days in future
const end = new Date(start.getTime() + 1800000);

const meetRes = await call('/meetings', 'POST', {
  professorId: thirupathiProf.id,
  reason: 'Discussion on Compiler Design assignment & seminar guidance',
  proposedStart: start.toISOString(),
  proposedEnd: end.toISOString(),
  note: 'Urgent consultation regarding final evaluation',
}, studentAuth.cookie);

assert.equal(meetRes.status, 201, 'Meeting booking should succeed');
const meetingId = meetRes.data.meeting.id;
console.log(`Meeting requested with ID: ${meetingId}`);

// Verify Thirupathi Sir receives MEETING_REQUESTED notification
const profNotifs = await call('/notifications', 'GET', undefined, thirupathiAuth.cookie);
assert.equal(profNotifs.status, 200);

const meetNotif = profNotifs.data.notifications.find(n => n.type === 'MEETING_REQUESTED' && n.payload?.meetingId === meetingId);
assert.ok(meetNotif, 'Professor should receive MEETING_REQUESTED notification');
console.log('PASS: Professor received meeting request notification:', meetNotif.title, '—', meetNotif.body);

// Professor accepts the meeting
const acceptRes = await call(`/faculty/me/requests/${meetingId}`, 'PATCH', { action: 'ACCEPT' }, thirupathiAuth.cookie);
assert.equal(acceptRes.status, 200);
console.log('PASS: Professor accepted consultation meeting');

console.log('\n======================================================');
console.log('ALL NOTIFICATION & FAVORITE SUBSCRIBER CHECKS PASSED!');
console.log('======================================================');
