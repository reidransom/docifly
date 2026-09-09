import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = process.env.STARLIGHT_SOURCE || '/home/reid/tmp/starlight';
const revision = '39d4e71f23b3fb6fde0e77eb983fcd38629b70b9';
const target = resolve(root, '.poc/reference');
await mkdir(target, { recursive: true });
// Export a disposable build tree. Never change the frozen source checkout.
const archive = execFileSync('git', ['-C', source, 'archive', revision], {
  maxBuffer: 64 * 1024 * 1024,
});
execFileSync('tar', ['-x', '-C', target], { input: archive });
const pnpm = resolve(root, 'tools/poc/node_modules/.bin/pnpm');
execFileSync(pnpm, ['install', '--frozen-lockfile'], { cwd: target, stdio: 'inherit' });
execFileSync(pnpm, ['build'], { cwd: target, stdio: 'inherit' });
const fixture = JSON.parse(await readFile(resolve(root, 'tools/poc/fixtures.json'), 'utf8'));
const example = resolve(target, 'examples/basics');
await rm(resolve(example, 'src/content/docs'), { recursive: true, force: true });
await cp(resolve(root, 'fixtures/content'), resolve(example, 'src/content/docs'), {
  recursive: true,
});
await cp(resolve(root, 'fixtures/fixture.svg'), resolve(example, 'public/fixture.svg'));
await cp(resolve(root, 'fixtures/fixture.svg'), resolve(example, 'src/content/docs/fixture.svg'));
await writeFile(
  resolve(example, 'astro.config.mjs'),
  `import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
export default defineConfig({ integrations: [starlight({
  title: ${JSON.stringify(fixture.title)},
  pagefind: false,
  pagination: false,
  credits: false,
  expressiveCode: { defaultProps: { showLineNumbers: false, frame: 'none' } },
  sidebar: ${JSON.stringify(fixture.navigation)}
})] });
`,
);
execFileSync(pnpm, ['build'], { cwd: example, stdio: 'inherit' });
await mkdir(resolve(root, 'evidence/poc'), { recursive: true });
await writeFile(
  resolve(root, 'evidence/poc/reference-build.json'),
  JSON.stringify(
    {
      revision,
      source,
      node: process.version,
      pnpm: execFileSync(pnpm, ['--version'], { encoding: 'utf8' }).trim(),
      lockfileSha256: execFileSync('sha256sum', [resolve(target, 'pnpm-lock.yaml')], {
        encoding: 'utf8',
      }).split(' ')[0],
      configuration: await readFile(resolve(example, 'astro.config.mjs'), 'utf8'),
      fixtureFiles: fixture.pages,
    },
    null,
    2,
  ) + '\n',
);
