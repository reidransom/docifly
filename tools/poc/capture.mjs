import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = JSON.parse(await readFile(resolve(root, 'tools/poc/fixtures.json'), 'utf8'));
const kind = process.argv[2] || 'reference';
const origin = process.argv[3] || 'http://localhost:4321';
const directory = resolve(root, 'evidence/poc', kind);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
const environment = {
  chromium: browser.version(),
  executableSha256: createHash('sha256')
    .update(await readFile('/usr/lib/chromium/chromium'))
    .digest('hex'),
  kernel: execFileSync('uname', ['-srmo'], { encoding: 'utf8' }).trim(),
  fontconfig: execFileSync('fc-list', ['--format', '%{file}: %{family}\n'], { encoding: 'utf8' })
    .split('\n')
    .sort(),
  dpr: 1,
  zoom: 1,
  defaultFontSize: 16,
  locale: 'en-US',
  timezone: 'UTC',
};
const manifest = { environment, origin, captures: [] };
const cases = fixture.pages.flatMap((page) =>
  fixture.primary.map((size) => ({ page, size, state: 'top' })),
);
for (const size of fixture.boundaries) cases.push({ page: fixture.pages[1], size, state: 'top' });
for (const state of ['menu', 'toc', 'collapsed', 'expanded', 'scrolled', 'focus', 'copy']) {
  cases.push({
    page: fixture.pages[state === 'copy' ? 2 : 1],
    size: ['menu', 'toc'].includes(state) ? [390, 844] : [1440, 900],
    state,
  });
}
try {
  for (const mode of fixture.modes)
    for (const specimen of cases) {
      const [width, height] = specimen.size;
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        colorScheme: mode,
        locale: 'en-US',
        timezoneId: 'UTC',
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      await context.addInitScript((mode) => {
        localStorage.setItem('starlight-theme', mode);
        sessionStorage.clear();
      }, mode);
      const page = await context.newPage();
      await page.goto(origin + specimen.page.url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, 0);
      });
      await page.addStyleTag({
        content:
          '*,*::before,*::after { animation-duration: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; scroll-behavior: auto !important; }',
      });
      const reference = kind.startsWith('reference');
      if (specimen.state === 'menu')
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
      if (specimen.state === 'toc')
        await page.locator(reference ? 'mobile-starlight-toc summary' : '#toc summary').click();
      if (['collapsed', 'expanded'].includes(specimen.state)) {
        await page
          .locator(reference ? '#starlight__sidebar details' : '#site-nav details')
          .evaluateAll((groups, open) => {
            for (const group of groups) if (group instanceof HTMLDetailsElement) group.open = open;
          }, specimen.state === 'expanded');
      }
      if (specimen.state === 'scrolled')
        await page
          .getByRole('heading', { name: 'Maintain the examples', exact: true })
          .scrollIntoViewIfNeeded();
      if (specimen.state === 'focus') {
        await page.keyboard.press('Tab');
        await page.getByRole('link', { name: 'Skip to content' }).focus();
      }
      let clipboard;
      if (specimen.state === 'copy') {
        const button = page.getByRole('button', { name: /Copy to clipboard|Copy code/ }).first();
        await button.focus();
        await button.click();
        clipboard = await page.evaluate(() => navigator.clipboard.readText());
      }
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      const name = `${specimen.page.title.toLowerCase().replaceAll(' ', '-')}-${width}x${height}-${mode}-${specimen.state}`;
      const screenshot = await page.screenshot({
        path: resolve(directory, name + '.png'),
        fullPage: true,
        animations: 'disabled',
      });
      const repeat = await page.screenshot({ fullPage: true, animations: 'disabled' });
      const a = PNG.sync.read(screenshot),
        b = PNG.sync.read(repeat);
      const noise = pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.1 });
      const metrics = await page.evaluate(() => ({
        scroll: [scrollX, scrollY],
        fonts: {
          body: getComputedStyle(document.body).fontFamily,
          code: document.querySelector('pre')
            ? getComputedStyle(document.querySelector('pre')).fontFamily
            : null,
        },
        code: Array.from(document.querySelectorAll('pre')).map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
        }),
      }));
      const cdp = await context.newCDPSession(page);
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const doc = await cdp.send('DOM.getDocument');
      const node = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'p' });
      const fonts = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: node.nodeId });
      manifest.captures.push({
        name,
        ...specimen,
        mode,
        width: a.width,
        height: a.height,
        ...metrics,
        resolvedFonts: fonts.fonts,
        clipboard,
        repeatDifferingPixels: noise,
        repeatDifferencePercent: (noise / (a.width * a.height)) * 100,
      });
      await context.close();
      console.log(`${name}: repeat noise ${noise} pixels`);
    }
} finally {
  await browser.close();
  await writeFile(resolve(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}
if (manifest.captures.some((capture) => capture.repeatDifferencePercent > 0.1))
  process.exitCode = 1;
