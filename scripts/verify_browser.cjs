/* Optional development check: requires Playwright with an installed Edge browser.
 * NODE_PATH may point at an existing Playwright installation.
 * Only visits the local preview. Contact requests are intercepted, never sent.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.SITE_TEST_URL || 'http://localhost:1313';
const output = process.env.SITE_TEST_OUTPUT || '.cache/visual';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
  throw new Error('Browser verification is restricted to a local preview.');
}
const routes = ['/', '/projects/', '/projects/xii-engine/', '/blog/',
  '/blog/xii-coding-standard/', '/blog/gpumicrobotswarmsimulation/',
  '/blog/determinism-in-robotics-frameworks/', '/about/', '/leadership/',
  '/contact/', '/archive/', '/search/', '/tags/', '/404.html'];
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    let submissions = 0;
    await context.route('https://formsubmit.co/**', route => {
      submissions++;
      return route.fulfill({ status: 200, contentType: 'text/plain', body: 'Intercepted local test.' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        const response = await page.goto(base + route);
        assert(response.ok(), width + ' ' + route + ': HTTP error');
        await page.locator('h1').waitFor();
        const checks = await page.evaluate(() => ({
          h1: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          broken: [...document.images].filter(i => i.getAttribute('src') && i.complete && !i.naturalWidth).map(i => i.src)
        }));
        assert.equal(checks.h1, 1, route + ': main heading');
        assert(!checks.overflow, width + ' ' + route + ': horizontal overflow');
        assert.deepEqual(checks.broken, [], route + ': missing image');
      }
      console.log('Responsive routes passed at ' + width + 'px');
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('#theme-toggle').click();
    await page.reload();
    assert(await page.locator('body').evaluate(el => el.classList.contains('dark')));
    await page.screenshot({ path: output + '/homepage-mobile-dark.png', fullPage: true });
    await page.locator('#theme-toggle').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: output + '/homepage-desktop-light.png', fullPage: true });

    await page.goto(base + '/search/?q=ray+tracing');
    await page.waitForFunction(() => document.querySelector('#search-status').textContent.includes('results'));
    assert(await page.locator('#searchResults').getByRole('link', { name: 'CPU Ray Tracing', exact: true }).isVisible());
    await page.locator('#searchInput').fill('zzzznomatch987');
    await page.waitForFunction(() => document.querySelector('#search-status').textContent.startsWith('No results'));
    await page.reload();
    await page.locator('#searchInput').fill('<img src=x onerror=alert(1)>');
    await page.locator('#search-form button').click();
    assert.equal(await page.locator('#searchResults img').count(), 0);

    await page.goto(base + '/projects/xii-engine/');
    await page.locator('.gallery-image').first().click();
    assert(await page.locator('dialog').isVisible());
    await page.getByRole('button', { name: 'Next image', exact: true }).click();
    assert.equal(await page.locator('.gallery-toolbar span').textContent(), '2 / 10');
    await page.keyboard.press('Escape');
    assert(!(await page.locator('dialog').isVisible()));
    assert(await page.locator('.gallery-image').first().evaluate(el => el === document.activeElement));

    await page.goto(base + '/blog/determinism-in-robotics-frameworks/');
    await page.waitForSelector('.katex');
    assert.equal(await page.locator('.katex-error').count(), 0);
    assert((await page.locator('.katex annotation').allTextContents()).includes('U < 78\\%'));
    await page.screenshot({ path: output + '/article-desktop-light.png' });
    await page.goto(base + '/blog/xii-coding-standard/');
    assert(await page.locator('pre > code').count());
    await page.locator('.copy-btn').first().click();
    await page.waitForFunction(() => [...document.querySelectorAll('.copy-btn')].some(el => el.textContent === 'Copied'));

    await page.goto(base + '/contact/');
    await page.getByRole('button', { name: 'Send message ↗', exact: true }).click();
    assert.equal(submissions, 0);
    await page.locator('#name').fill('Local validation test');
    await page.locator('#email').fill('invalid');
    await page.locator('#message').fill('This is an intercepted local browser test.');
    await page.getByRole('button', { name: 'Send message ↗', exact: true }).click();
    assert.equal(submissions, 0);
    await page.locator('#email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send message ↗', exact: true }).click();
    await page.waitForURL('https://formsubmit.co/**');
    assert.equal(submissions, 1);

    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const plain = await nojs.newPage();
    await plain.goto(base);
    assert(await plain.locator('#menu').getByRole('link', { name: 'Work', exact: true }).isVisible());
    await plain.goto(base + '/projects/xii-engine/');
    assert(await plain.locator('.gallery-image img').first().isVisible());
    assert(await plain.locator('.gallery-image').first().getAttribute('href'));
    const reduced = await browser.newContext({ reducedMotion: 'reduce' });
    const quiet = await reduced.newPage();
    await quiet.goto(base);
    assert.equal(await quiet.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior), 'auto');
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    console.log('Search, themes, navigation, gallery, math, code copy, intercepted form, no-JS, and reduced-motion checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
