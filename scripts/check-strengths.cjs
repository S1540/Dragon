const { chromium, expect } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PREVIEW_URL || 'http://localhost:3000', { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('button', { name: 'Pause globe animation' }).click();
    await page.addStyleTag({ content: 'html {scroll-behavior:auto !important} nextjs-portal {visibility:hidden}' });
    const section = page.locator('#strengths');
    const choices = section.locator('.dm-strengths-choice');
    await expect(choices).toHaveCount(5);
    if (!await section.evaluate(el => el.previousElementSibling?.id === 'services')) throw Error('Section not after services');
    await section.scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    await expect(section).toHaveAttribute('data-running', 'true');
    await expect(section).toHaveAttribute('data-active', '1', { timeout: 8000 });
    await page.waitForTimeout(750);
    const slots = await choices.evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
    if (!(slots[1] < slots[2] && slots[2] < slots[3] && slots[3] < slots[4] && slots[4] < slots[0])) throw Error('Active strength did not move to top');
    results.push('Automatic advance and cyclic upward list movement');
    await choices.nth(4).click();
    await expect(section).toHaveAttribute('data-active', '4');
    await expect(section).toHaveAttribute('data-running', 'false');
    await page.waitForTimeout(5200);
    await expect(section).toHaveAttribute('data-active', '4');
    await page.mouse.move(1, 1);
    await expect(section).toHaveAttribute('data-running', 'true');
    await page.waitForTimeout(2000);
    await expect(section).toHaveAttribute('data-active', '4');
    await expect(section).toHaveAttribute('data-active', '0', { timeout: 4500 });
    results.push('Click selects immediately; hover pauses; timer restarts and wraps after five seconds');
    await choices.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(choices.nth(1)).toBeFocused();
    await expect(section).toHaveAttribute('data-active', '1');
    await expect(section).toHaveAttribute('data-running', 'false');
    await page.keyboard.press('End');
    await expect(section).toHaveAttribute('data-active', '4');
    results.push('Keyboard arrows, End, focus pause without page scrolling');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(section).toHaveAttribute('data-running', 'false');
    await expect(section.locator('.dm-strengths-hint')).toHaveText('Auto-advancing');
    for (const [width, height] of [[1440,1000],[1024,768],[768,1024],[390,844],[320,568]]) {
      await page.setViewportSize({ width, height });
      await choices.nth(0).click();
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const layout = await page.evaluate(() => {
        const section = document.querySelector('#strengths');
        const panel = section.querySelector('.dm-strengths-panel[data-active=true]');
        const copy = panel.querySelector('.dm-strengths-copy').getBoundingClientRect();
        const bounds = panel.getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, clipped: copy.top < bounds.top || copy.bottom > bounds.bottom + 1, font: getComputedStyle(document.querySelector('.hero-description')).fontSize, label: getComputedStyle(document.querySelector('.hero-topline')).fontSize };
      });
      if (layout.overflow || layout.clipped || layout.font !== '14px' || layout.label === '13px') throw Error(`Bad layout ${width}: ${JSON.stringify(layout)}`);
      for (let i=0; i<5; i++) {
        await choices.nth(i).click();
        await expect(section.locator(`#strength-panel-${i}`)).toHaveAttribute('aria-hidden', 'false');
        await expect(section.locator('.dm-strengths-backdrop img')).toHaveJSProperty('complete', true);
        await expect(section.locator('img')).toHaveCount(1);
      }
      await choices.nth(0).click();
      await section.screenshot({ path: `artifacts/strengths-${width}.png` });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `artifacts/typography-${width}.png` });
      results.push(`${width}px: five choices work, shared background, no overflow or clipped copy, 14px paragraphs`);
    }
    const mobile = await browser.newPage({ viewport: { width:390, height:844 }, hasTouch:true, isMobile:true });
    await mobile.goto(process.env.PREVIEW_URL || 'http://localhost:3000', { waitUntil:'load', timeout:120000 });
    await mobile.getByRole('button', { name:'Pause globe animation' }).tap();
    const mobileSection = mobile.locator('#strengths');
    await mobileSection.scrollIntoViewIfNeeded();
    await mobileSection.locator('.dm-strengths-choice').first().tap();
    await expect(mobileSection).toHaveAttribute('data-running','true');
    const scroll = await mobile.evaluate(() => scrollY);
    await expect(mobileSection).toHaveAttribute('data-active','1',{timeout:8000});
    if (Math.abs(await mobile.evaluate(() => scrollY) - scroll) > 2) throw Error('Autoplay moved the page');
    await mobile.close();
    results.push('Mobile autoplay preserves scroll position');
    if (errors.length) throw Error(errors.join('\n'));
    fs.writeFileSync('artifacts/strengths-qa.json', JSON.stringify({ results, errors },null,2));
    console.log(results.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
