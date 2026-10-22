import assert from 'node:assert/strict';
const base='http://localhost:4100/api/v1';
async function call(path,method='GET',body,cookie){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});const data=r.headers.get('content-type')?.includes('json')?await r.json():await r.arrayBuffer();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
async function login(email){const r=await call('/auth/login','POST',{email,password:'DemoPass123!'});assert.equal(r.status,200);return r.cookie;}
const professor=await login('ananya.reddy@vnr.demo');const student=await login('student@vnr.demo');const other=await login('vikram.rao@vnr.demo');
const list=await call('/faculty?limit=50');assert.equal(list.data.items.length,20);assert.equal(new Set(list.data.items.map(p=>p.activeQrToken)).size,20);
for(const p of list.data.items){const qr=await call('/qr/'+p.activeQrToken);assert.equal(qr.data.professor.id,p.id);}
console.log('PASS: 20 faculty, 20 unique persistent QR profiles');
const original=(await call('/faculty/me/status','GET',undefined,professor)).data;
assert.equal((await call('/faculty/me/status','PUT',{status:'AWAY'},student)).status,403);
const returnAt=new Date(Date.now()+3600000).toISOString();
assert.equal((await call('/faculty/me/status','PUT',{status:'IN_MEETING',expectedReturnAt:returnAt,publicMessage:'Demo verification'},professor)).status,200);
const live=await call('/qr/vnr-ananya-reddy');assert.equal(live.data.status.status,'IN_MEETING');assert.equal(live.data.status.expectedReturnAt,returnAt);
await call('/faculty/me/status','PUT',{status:original.status.status,expectedReturnAt:original.status.expectedReturnAt,publicMessage:original.status.publicMessage},professor);
console.log('PASS: role authorization and professor → public QR status propagation');
const old=(await call('/faculty/me/schedules','GET',undefined,professor)).data.officeHours;
const slots=[{dayOfWeek:1,startTime:'09:00',endTime:'10:00',notes:'Demo verification'}];
assert.equal((await call('/faculty/me/office-hours','PUT',{officeHours:slots},professor)).status,200);
assert.equal((await call('/qr/vnr-ananya-reddy')).data.officeHours[0].startTime,'09:00');
assert.equal((await call('/faculty/me/office-hours','PUT',{officeHours:[...slots,...slots]},professor)).status,400);
await call('/faculty/me/office-hours','PUT',{officeHours:old.map(({dayOfWeek,startTime,endTime,notes})=>({dayOfWeek,startTime,endTime,notes}))},professor);
console.log('PASS: availability persistence, public visibility and overlap validation');
const id=live.data.professor.id;
const start=new Date(Date.now()+86400000+Math.random()*86400000),end=new Date(start.getTime()+1800000);
const booking=await call('/meetings','POST',{professorId:id,reason:'Demo pipeline verification',proposedStart:start.toISOString(),proposedEnd:end.toISOString()},student);assert.equal(booking.status,201);
const mid=booking.data.meeting.id;
assert.equal((await call('/faculty/me/requests/'+mid,'PATCH',{action:'ACCEPT'},other)).status,404);
assert.equal((await call('/faculty/me/requests/'+mid,'PATCH',{action:'ACCEPT'},professor)).status,200);
assert.equal((await call('/meetings/mine','GET',undefined,student)).data.meetings.find(m=>m.id===mid).status,'ACCEPTED');
assert.equal((await call('/meetings','POST',{professorId:id,reason:'Conflict check',proposedStart:start.toISOString(),proposedEnd:end.toISOString()},student)).status,409);
assert.ok((await call('/notifications','GET',undefined,student)).data.notifications.length);
assert.equal((await call('/meetings/'+mid+'/cancel','PATCH',{},student)).status,200);
assert.equal((await call('/faculty/me/requests/'+mid,'PATCH',{action:'ACCEPT'},professor)).status,409);
assert.equal((await call('/faculty/automate-sync','POST',{})).status,401);
assert.equal((await call('/qr/vnr-ananya-reddy/image')).status,200);
assert.equal((await call('/qr/invalid-token/image')).status,404);
console.log('PASS: booking → professor approval → student update → notifications → conflict → cancellation; unauthorized automation and invalid QR rejected');
console.log('ALL DEMO PIPELINE CHECKS PASSED');
