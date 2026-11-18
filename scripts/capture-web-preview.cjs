const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 947 }, deviceScaleFactor: 1 });
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:3000', { waitUntil: 'load', timeout: 120000 });
    await page.locator('.earth-canvas[data-ready=true]').waitFor({ timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    await page.addStyleTag({ content: '.cursor-follower, .click-ripple, nextjs-portal { visibility:hidden !important; }' });
    fs.mkdirSync('public/previews', { recursive: true });
    const capture = name => page.screenshot({ path: `public/previews/dragon-${name}.jpg`, type: 'jpeg', quality: 90 });
    const bounds = async locator => {
      const b = await locator.boundingBox();
      return { left: `${b.x / 1440 * 100}%`, top: `${b.y / 947 * 100}%`, width: `${b.width / 1440 * 100}%`, height: `${b.height / 947 * 100}%` };
    };
    const first = await bounds(page.getByRole('button', { name: 'Explore Our Services', exact: true }));
    await capture('hero');
    await page.getByRole('button', { name: 'Explore Our Services', exact: true }).click();
    await page.waitForTimeout(350);
    const second = await bounds(page.locator('dialog').getByRole('button', { name: 'Start a Project', exact: true }));
    await capture('expertise');
    await page.locator('dialog').getByRole('button', { name: 'Start a Project', exact: true }).click();
    await page.waitForTimeout(350);
    await capture('project');
    fs.writeFileSync('src/components/services/web-preview-targets.json', JSON.stringify({ first, second }, null, 2) + '\n');
    console.log('Captured actual hero, expertise and project screens with cursor targets.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
