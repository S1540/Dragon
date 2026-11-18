const { chromium, expect } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 947 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:3000', { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    const copy = await page.locator('.hero-description, .dm-service-description, .dm-service-introGrid > p, .dm-service-priceNote').evaluateAll(els => els.map(el => ({ size: parseFloat(getComputedStyle(el).fontSize), font: getComputedStyle(el).fontFamily })));
    if (copy.some(s => s.size !== 14 || !s.font.includes('Google Sans'))) throw Error(JSON.stringify(copy));
    const preview = page.locator('[data-kind=web]');
    await preview.scrollIntoViewIfNeeded();
    await expect(preview).toHaveAttribute('data-phase', '1', { timeout: 20000 });
    await expect(preview).toHaveAttribute('data-phase', '2', { timeout: 10000 });
    const loaded = await preview.locator('img').evaluateAll(imgs => imgs.length === 3 && imgs.every(img => img.complete && img.naturalWidth > 0));
    if (!loaded) throw Error('Screenshot did not load');
    await page.locator('#services').getByRole('button', { name: 'Pause previews' }).click();
    const cursor = preview.locator('[data-cursor]');
    const stopped = await cursor.getAttribute('style');
    await page.waitForTimeout(350);
    if (stopped !== await cursor.getAttribute('style')) throw Error('Pause failed');
    await page.screenshot({ path: 'artifacts/web-preview-desktop.png' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(cursor).toBeHidden();
    await page.setViewportSize({ width: 390, height: 844 });
    await preview.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Mobile overflow');
    await page.screenshot({ path: 'artifacts/web-preview-mobile.png' });
    if (errors.length) throw Error(errors.join('\n'));
    console.log('PASS: real screenshots loaded; cursor reached both screens; pause and reduced motion; Google Sans body copy 14px; mobile has no overflow.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
