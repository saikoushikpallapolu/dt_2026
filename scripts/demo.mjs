import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const root=path.resolve(import.meta.dirname,'..');
process.env.DATABASE_URL='postgresql://wimp:wimp@localhost:55432/wimp';
process.env.COOKIE_SECURE='false';
process.env.API_PORT='4100';
process.env.DEMO_API_TARGET='http://localhost:4100';
const {default:EmbeddedPostgres}=await import('embedded-postgres');
const {PrismaClient}=await import('@prisma/client');
const db=new PrismaClient();
let pg;
try{await db.$queryRawUnsafe('SELECT 1');}catch{
 pg=new EmbeddedPostgres({databaseDir:path.join(root,'.demo-pgdata'),user:'wimp',password:'wimp',port:55432,persistent:true});
 if(!fs.existsSync(path.join(root,'.demo-pgdata','PG_VERSION')))await pg.initialise();
 await pg.start();
 try{await pg.createDatabase('wimp');}catch{}
}
await db.$disconnect();
const children=[];
function run(script,args=[],wait=true){const child=spawn(process.execPath,[script,...args],{cwd:root,env:process.env,stdio:'inherit',windowsHide:true});children.push(child);return wait?new Promise((resolve,reject)=>child.on('exit',code=>code===0?resolve():reject(new Error('Process failed: '+code)))):child;}
await run(require.resolve('prisma/build/index.js'),['migrate','deploy','--schema','backend/prisma/schema.prisma']);
await run(require.resolve('tsx/cli'),['backend/prisma/demo.ts']);
run(require.resolve('tsx/cli'),['watch','backend/src/index.ts'],false);
run(path.join(root,'node_modules/vite/bin/vite.js'),['--config','frontend/vite.config.ts','frontend','--host','0.0.0.0'],false);
console.log('VNR demo ready: http://localhost:5173 — open the Wi-Fi URL printed by Vite on your phone.');
async function stop(){for(const child of children)if(child.exitCode===null)child.kill();if(pg)await pg.stop();process.exit();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
