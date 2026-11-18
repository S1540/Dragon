const { chromium } = require('@playwright/test');
const fs = require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:3000',{waitUntil:'load',timeout:120000});
 await page.locator('.earth-canvas[data-ready=true]').waitFor({timeout:30000});await page.waitForTimeout(1000);
 await page.screenshot({path:'artifacts/desktop.png'});
 const first=await page.locator('.earth-canvas').getAttribute('data-rotation');await page.waitForTimeout(1200);const second=await page.locator('.earth-canvas').getAttribute('data-rotation');
 await page.getByRole('button',{name:'Pause globe animation'}).click();await page.waitForTimeout(300);const pause1=await page.locator('.earth-canvas').getAttribute('data-rotation');await page.waitForTimeout(600);const pause2=await page.locator('.earth-canvas').getAttribute('data-rotation');
 await page.getByRole('button',{name:'Resume globe animation'}).click();
 const desktop=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,sections:document.querySelectorAll('section').length,resources:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0)}));
 await page.getByRole('button',{name:'Explore Our Services'}).click();const services=await page.getByRole('dialog').isVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Start a Project',exact:true}).click();await page.getByLabel('Your project brief').fill('A premium online store for our new clothing collection.');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download project brief'}).click();const file=await download;const downloadName=file.suggestedFilename();await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'load',timeout:120000});await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
 const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);const reduced1=await page.locator('.earth-canvas').getAttribute('data-rotation');await page.waitForTimeout(600);const reduced2=await page.locator('.earth-canvas').getAttribute('data-rotation');
 await page.setViewportSize({width:768,height:1024});await page.screenshot({path:'artifacts/tablet.png'});const tablet=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth}));
 const result={errors,rotates:first!==second,pauses:pause1===pause2,reducedMotion:reduced1===reduced2,desktop,mobile,tablet,services,downloadName};fs.writeFileSync('artifacts/qa.json',JSON.stringify(result,null,2));console.log(result);
 if(errors.length||!result.rotates||!result.pauses||!result.reducedMotion||mobile.overflow||desktop.overflow||tablet.overflow)process.exitCode=1;
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

