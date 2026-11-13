import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.APP_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const teacher = await browser.newContext({ viewport: { width: 390, height: 844 } });
const student = await browser.newContext({ viewport: { width: 390, height: 844 } });
const p = await teacher.newPage(), s = await student.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message)); s.on('pageerror', e => errors.push(e.message));
let originalStatus, originalSchedules;
async function api(context, path, method='GET', data) {
 const r = await context.request.fetch(base+'/api/v1'+path, {method, data});
 if (!r.ok()) throw new Error(`${path}: ${r.status()} ${await r.text()}`);
 return r.json();
}
try {
 await p.goto(base+'/login');
 await p.locator('input[type=email]').fill('ananya.reddy@vnr.demo');
 await p.locator('input[type=password]').fill('DemoPass123!');
 await p.locator('button[type=submit]').click();
 await expect(p).toHaveURL(/faculty\/dashboard/);
 originalStatus = await api(teacher, '/faculty/me/status');
 originalSchedules = await api(teacher, '/faculty/me/schedules');
 await api(student, '/auth/login', 'POST', {email:'student@vnr.demo', password:'DemoPass123!'});
 await s.goto(base+'/qr/vnr-ananya-reddy');
 const stamp = 'Dynamic demo '+Date.now();
 const timetable = p.locator('section').filter({has:p.getByRole('heading',{name:'Weekly class timetable',exact:true})});
 // Replace only through the teacher's visible timetable editor.
 while (await timetable.getByRole('button',{name:/Remove slot/}).count()) await timetable.getByRole('button',{name:/Remove slot/}).first().click();
 await timetable.getByRole('button',{name:'Add slot',exact:true}).click();
 await timetable.getByLabel('Start time 1',{exact:true}).fill('09:00');
 await timetable.getByLabel('End time 1',{exact:true}).fill('10:00');
 await timetable.getByLabel('Slot note 1',{exact:true}).fill(stamp+' · Algorithms · Room 201');
 await timetable.getByRole('button',{name:'Publish class timetable',exact:true}).click();
 await expect(timetable.getByRole('status')).toContainText('published');
 await expect(s.getByRole('region',{name:'Class timetable'})).toContainText(stamp,{timeout:12000});
 console.log('PASS: teacher timetable editor → mobile student view without reload');
 await api(teacher, '/faculty/me/status', 'PUT', {status:'IN_CLASS',publicMessage:stamp});
 await expect(s.getByText(stamp,{exact:true})).toBeVisible({timeout:12000});
 console.log('PASS: status change → separate student browser without reload');
 await api(teacher, '/faculty/me/office-hours', 'PUT', {officeHours:[{dayOfWeek:2,startTime:'15:00',endTime:'16:00',notes:stamp+' office'}]});
 await expect(s.getByText(new RegExp(stamp+' office')).first()).toBeVisible({timeout:12000});
 console.log('PASS: office slot change → student view without reload');
 await student.route('**/api/v1/events', route => route.abort());
 await s.reload();
 await expect(s.getByRole('region',{name:'Class timetable'})).toContainText(stamp);
 await api(teacher, '/faculty/me/status', 'PUT', {status:'AVAILABLE',publicMessage:stamp+' fallback'});
 await expect(s.getByText(stamp+' fallback',{exact:true})).toBeVisible({timeout:12000});
 console.log('PASS: polling fallback with SSE disabled');
 const invalid = await teacher.request.put(base+'/api/v1/faculty/me/timetable',{data:{classes:[{dayOfWeek:1,startTime:'09:00',endTime:'08:00'}]}});
 expect(invalid.status()).toBe(400);
 const forbidden = await student.request.put(base+'/api/v1/faculty/me/timetable',{data:{classes:[]}});
 expect(forbidden.status()).toBe(403);
 await s.reload(); await expect(s.getByRole('region',{name:'Class timetable'})).toContainText(stamp);
 for (const page of [p,s]) expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
 await fs.mkdir('artifacts',{recursive:true});
 await s.screenshot({path:'artifacts/student-mobile-dynamic.png',fullPage:true});
 await p.screenshot({path:'artifacts/teacher-mobile-timetable.png',fullPage:true});
 console.log('PASS: persistence, invalid times rejected, student writes forbidden, no mobile overflow or JS crashes');
} finally {
 if(originalStatus) await api(teacher,'/faculty/me/status','PUT',originalStatus.status);
 if(originalSchedules) {
  await api(teacher,'/faculty/me/office-hours','PUT',{officeHours:originalSchedules.officeHours});
  await api(teacher,'/faculty/me/timetable','PUT',{classes:originalSchedules.classes});
 }
 await browser.close();
}
