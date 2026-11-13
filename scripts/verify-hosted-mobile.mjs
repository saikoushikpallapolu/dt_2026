import { chromium, expect } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://dt-2026.onrender.com/login',{timeout:60000});
 await page.locator('input[type=email]').fill('student@vnr.demo');
 await page.locator('input[type=password]').fill('DemoPass123!');
 await page.locator('button[type=submit]').click();
 await expect(page).toHaveURL(/directory/,{timeout:20000});
 await page.goto('https://dt-2026.onrender.com/qr/vnr-ananya-reddy');
 await expect(page.getByText('Dr. Ananya Reddy',{exact:true}).first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
 console.log('PASS: live HTTPS deployment, demo student login, faculty profile at mobile width, no browser crashes');
 await page.screenshot({path:'artifacts/render-mobile-profile.png',fullPage:true});
} finally {await browser.close();}
