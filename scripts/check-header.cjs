const { chromium } = require('@playwright/test');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page = await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://localhost:3010', {waitUntil:'domcontentloaded',timeout:120000});
 const toggle = page.getByRole('button',{name:'Open navigation menu'});
 await toggle.click();
 await page.waitForTimeout(400);
 if(await toggle.getAttribute('aria-expanded') !== 'true') throw Error('Menu did not open');
 await page.screenshot({path:'artifacts/header-menu-mobile.png'});
 await page.keyboard.press('Escape');
 if(await toggle.getAttribute('aria-expanded') !== 'false') throw Error('Escape did not close');
 await toggle.click();
 await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name:'Our expertise'}).click();
 if(!await page.locator('dialog').evaluate(el=>el.open)) throw Error('Expertise dialog failed');
 await page.getByRole('button',{name:'Close dialog'}).click();
 await toggle.click();
 await page.mouse.click(10,400);
 if(await toggle.getAttribute('aria-expanded') !== 'false') throw Error('Outside click failed');
 await toggle.click();
 await page.setViewportSize({width:1440,height:900});
 await page.waitForTimeout(400);
 console.log('PASS: menu open, Escape, outside click, expertise action, desktop resize');
 console.log(await page.locator('.navigation').evaluate(el=>({navFont:getComputedStyle(el).fontSize})));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});


