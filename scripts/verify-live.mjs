import assert from 'node:assert/strict';
import {PrismaClient} from '@prisma/client';
import fs from 'node:fs/promises';
const base='http://localhost:5173/api/v1';
const db=new PrismaClient({datasourceUrl:'postgresql://wimp:wimp@localhost:55432/wimp'});
async function call(path,method='GET',body,cookie){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});assert.ok(r.ok,`${path}: ${r.status} ${!r.ok?await r.text():''}`);return {data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const professor=(await call('/auth/login','POST',{email:'ananya.reddy@vnr.demo',password:'DemoPass123!'})).cookie;
const original=(await call('/faculty/me/status','GET',undefined,professor)).data;
const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
try{
 const stream=await fetch(base+'/events',{signal:controller.signal});assert.equal(stream.status,200);const reader=stream.body.getReader();
 let initial=await reader.read();assert.ok(new TextDecoder().decode(initial.value).includes('connected'));
 const note='Live verification '+Date.now();
 await call('/faculty/me/status','PUT',{status:'AWAY',publicMessage:note},professor);
 let event='';while(!event.includes('campus-change')){const chunk=await reader.read();event+=new TextDecoder().decode(chunk.value);}
 const stored=await db.professorStatus.findUnique({where:{professorId:original.professorId}});assert.equal(stored.status,'AWAY');assert.equal(stored.publicMessage,note);
 // Change the browser session's role, then read all student-facing paths.
 const student=(await call('/auth/login','POST',{email:'student@vnr.demo',password:'DemoPass123!'},professor)).cookie;
 for(const path of ['/qr/vnr-ananya-reddy','/faculty/ananya-reddy','/faculty?search=Ananya']){
  const {data}=await call(path,'GET',undefined,student);const status=data.status||data.currentStatus||data.items[0].currentStatus;
  assert.equal(status.status,'AWAY');assert.equal(status.publicMessage,note);
 }
 console.log('PASS: committed PostgreSQL status, SSE through Vite proxy, student role switch, QR profile, slug profile and directory agree.');
 await reader.cancel();
}finally{
 clearTimeout(timeout);controller.abort();
 const current=(await call('/auth/login','POST',{email:'ananya.reddy@vnr.demo',password:'DemoPass123!'})).cookie;
 await call('/faculty/me/status','PUT',{status:original.status.status,publicMessage:original.status.publicMessage,expectedReturnAt:original.status.expectedReturnAt,alternateLocation:original.status.alternateLocation},current);
 await db.$disconnect();
}
await fs.mkdir('artifacts',{recursive:true});
for(const slug of ['ananya-reddy','vikram-rao','meera-sharma','arjun-kumar','kavitha-devi']){
 const {data}=await call('/qr/vnr-'+slug);assert.ok(data.isActive);
 const image=await fetch(base+'/qr/vnr-'+slug+'/image?origin='+encodeURIComponent('http://192.168.29.62:5173'));assert.ok(image.ok);
 await fs.writeFile('artifacts/'+slug+'-phone-qr.png',Buffer.from(await image.arrayBuffer()));
 console.log('QR saved: '+data.professor.displayName);
}
