import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const name = process.argv[2] || 'consumer';
const baseurl = process.argv[3] || '';
if (!/^[a-z0-9-]+$/.test(name))
  throw new Error('Consumer name must contain only lowercase letters, numbers, and hyphens.');
const snapshot = resolve(root, '.poc/theme-' + name);
const consumer = resolve(root, '.poc/' + name);
await mkdir(snapshot, { recursive: true });
for (const folder of ['_layouts', '_includes', '_sass', 'assets'])
  await cp(resolve(root, folder), resolve(snapshot, folder), { recursive: true });
const git = (...args) =>
  execFileSync('git', ['-C', snapshot, ...args], { encoding: 'utf8' }).trim();
git('init', '--quiet');
git('add', '.');
git(
  '-c',
  'user.name=Starlyt POC',
  '-c',
  'user.email=poc@localhost',
  '-c',
  'commit.gpgsign=false',
  'commit',
  '--quiet',
  '--allow-empty',
  '-m',
  'Snapshot theme for installation acceptance',
);
const consumerEnv = process.env.CONSUMER_PATH
  ? { ...process.env, PATH: process.env.CONSUMER_PATH }
  : process.env;
execFileSync('jigyll', ['new', consumer, '--theme', snapshot], {
  stdio: 'inherit',
  env: consumerEnv,
});
const fixture = JSON.parse(await readFile(resolve(root, 'tools/poc/fixtures.json'), 'utf8'));
await writeFile(
  resolve(consumer, '_config.yml'),
  JSON.stringify(
    {
      theme: 'theme-' + name,
      title: fixture.title,
      baseurl,
      navigation: fixture.navigation,
      defaults: [{ scope: { path: '' }, values: { layout: 'default' } }],
    },
    null,
    2,
  ),
);
await cp(resolve(root, 'fixtures/content'), consumer, { recursive: true });
await cp(resolve(root, 'fixtures/fixture.svg'), resolve(consumer, 'fixture.svg'));
for (const page of fixture.pages) {
  const file = resolve(consumer, page.file);
  const markdown = await readFile(file, 'utf8');
  await writeFile(file, markdown.replace('---\n', `---\npermalink: ${page.url}\n`));
}
execFileSync('jigyll', ['build', '--source', consumer], { stdio: 'inherit', env: consumerEnv });
await writeFile(
  resolve(root, 'evidence/poc', name + '-build.json'),
  JSON.stringify(
    {
      themeRevision: git('rev-parse', 'HEAD'),
      themeTree: git('rev-parse', 'HEAD^{tree}'),
      jigyll: execFileSync('jigyll', ['--version'], { encoding: 'utf8' }).trim(),
      baseurl,
      source: consumer,
      consumerPath: consumerEnv.PATH,
      commands: [
        `jigyll new ${consumer} --theme ${snapshot}`,
        `jigyll build --source ${consumer}`,
        `jigyll serve --source ${consumer}`,
      ],
    },
    null,
    2,
  ) + '\n',
);
