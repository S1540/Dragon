const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000',{waitUntil:'load',timeout:120000});
    await page.getByRole('button',{name:'Pause globe animation'}).click();
    for (const width of [1440,390,320]) {
      await page.setViewportSize({width,height:900});
      const labels = await page.locator('.hero-topline,.hero-copy > .eyebrow').evaluateAll(els => els.map(el => getComputedStyle(el).fontSize));
      console.log(width, labels);
      if (labels.includes('13px')) throw Error('Hero label override is still present');
      await page.locator('.hero').screenshot({path:`artifacts/hero-restored-${width}.png`});
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
