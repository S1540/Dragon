const { chromium, expect } = require('@playwright/test');
const fs = require('fs');
const base = process.env.CHECK_URL || 'http://localhost:3020';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 const results=[]; const errors=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:120000});
  await page.locator('#services[data-pinned=true]').waitFor({timeout:60000});
  await page.addStyleTag({content:'html {scroll-behavior:auto !important}'});
  await page.getByRole('button',{name:'Pause globe animation'}).click();
  const section=page.locator('#services');
  const articles=section.locator('article');
  const spacer=section.locator('.pin-spacer');
  const bounds=await spacer.evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
  const travel=600;
  for(let i=0;i<6;i++) {
   await page.evaluate(y=>window.scrollTo(0,y),bounds.top+(i+.35)/6*travel);
   await expect(section).toHaveAttribute('data-active-service',String(i+1),{timeout:15000});
   await page.waitForTimeout(650);
   const chapter=articles.nth(i);
   await expect(chapter).toHaveAttribute('data-active','true');
   const frame=chapter.getByRole('img');
   const box=await frame.boundingBox();
   if(!box || box.y<0 || box.y+box.height>1000) throw Error(`Preview clipped at chapter ${i+1}: ${JSON.stringify(box)}`);
   const chrome=await frame.locator('i').evaluateAll(els=>els.map(e=>getComputedStyle(e).backgroundColor));
   for(const color of ['rgb(255, 96, 88)','rgb(254, 188, 46)','rgb(41, 200, 64)']) if(!chrome.includes(color)) throw Error(`Missing dot ${color}`);
   await page.screenshot({path:`artifacts/services-desktop-${i+1}.png`});
   results.push(`Desktop chapter ${i+1}: visible, synchronized, three colored dots`);
  }
  const cursor=articles.nth(5).locator('[data-cursor]');
  const before=await cursor.getAttribute('style');
  await page.waitForTimeout(1800);
  const after=await cursor.getAttribute('style');
  if(before===after) throw Error('Cursor did not animate');
  await section.getByRole('button',{name:'Pause previews'}).click();
  const stopped=await cursor.getAttribute('style');
  await page.waitForTimeout(500);
  if(stopped!==await cursor.getAttribute('style')) throw Error('Pause failed');
  await section.getByRole('button',{name:'Play previews'}).click();
  await articles.nth(5).getByRole('button',{name:'Connect Team'}).click();
  await expect(page.locator('dialog')).toBeVisible();
  await expect(page.locator('#project-brief')).toHaveValue(/Creative & Business Automation/);
  await page.getByRole('button',{name:'Close dialog'}).click();
  await page.evaluate(y=>window.scrollTo(0,y),bounds.top+travel+800);
  await page.waitForTimeout(500);
  const pinnedTop=await spacer.locator(':scope > div').evaluate(el=>el.getBoundingClientRect().top);
  if(pinnedTop>=0) throw Error('Pinned section did not release');
  results.push('Cursor motion, pause, service CTA and natural pin release passed');
  await page.setViewportSize({width:390,height:844});
  await expect(section).toHaveAttribute('data-pinned','false');
  if(await section.locator('.pin-spacer').count()) throw Error('Pin spacer left on mobile');
  for(let i=0;i<6;i++) {
   await articles.nth(i).scrollIntoViewIfNeeded();
   const frame=articles.nth(i).getByRole('img');
   await frame.scrollIntoViewIfNeeded();
   await page.waitForTimeout(150);
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Mobile overflow');
   await expect(frame).toBeVisible();
   if(i===0||i===2||i===5) await page.screenshot({path:`artifacts/services-mobile-${i+1}.png`});
  }
  results.push('All six mobile chapters accessible with no horizontal overflow');
  await page.setViewportSize({width:1280,height:800});
  await expect(section).toHaveAttribute('data-pinned','true');
  if(await section.locator('.pin-spacer').count()!==1) throw Error('Duplicate pin spacer after resize');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(section).toHaveAttribute('data-pinned','false');
  if(await section.locator('.pin-spacer').count()) throw Error('Reduced motion still pinned');
  await expect(articles.nth(5)).not.toHaveAttribute('aria-hidden','true');
  results.push('Resize cleanup and reduced-motion natural layout passed');
  await page.setViewportSize({width:320,height:568});
  await articles.nth(0).scrollIntoViewIfNeeded();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('320px overflow');
  await page.evaluate(()=>scrollTo(0,0));
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await expect(page.getByRole('button',{name:'Close navigation menu'})).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  results.push('320px layout and existing mobile navigation passed');
  if(errors.length) throw Error(errors.join('\n'));
  fs.writeFileSync('artifacts/services-qa.json',JSON.stringify({results,errors},null,2));
  console.log(results.join('\n'));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});

