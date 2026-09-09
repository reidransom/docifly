import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../evidence/poc');
const left = process.argv[2] || 'reference';
const right = process.argv[3] || 'consumer';
const a = JSON.parse(await readFile(resolve(root, left, 'manifest.json'), 'utf8'));
const b = JSON.parse(await readFile(resolve(root, right, 'manifest.json'), 'utf8'));
if (JSON.stringify(a.environment) !== JSON.stringify(b.environment))
  throw new Error('Rendering environments differ; refusing an invalid comparison.');
if (a.captures.length !== 40 || b.captures.length !== 40)
  throw new Error('Incomplete capture matrix: expected 40 cases on each side.');
const destination = resolve(root, `${left}-vs-${right}`);
await mkdir(destination, { recursive: true });
const results = [];
for (const capture of a.captures) {
  const counterpart = b.captures.find((item) => item.name === capture.name);
  if (!counterpart) throw new Error(`Missing paired capture: ${capture.name}`);
  const original = PNG.sync.read(await readFile(resolve(root, left, capture.name + '.png')));
  const candidate = PNG.sync.read(await readFile(resolve(root, right, capture.name + '.png')));
  const width = Math.max(original.width, candidate.width),
    height = Math.max(original.height, candidate.height);
  // Pad rather than resize/crop: differences in page extent remain failures.
  const padded = [original, candidate].map((image) => {
    const target = new PNG({ width, height });
    target.data.fill(255);
    PNG.bitblt(image, target, 0, 0, image.width, image.height, 0, 0);
    return target;
  });
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(padded[0].data, padded[1].data, diff.data, width, height, {
    threshold: 0.1,
    diffColor: [255, 0, 0],
    aaColor: [255, 255, 0],
  });
  const codeRects = [...capture.code, ...counterpart.code];
  let codeArea = 0,
    codeDifference = 0;
  if (codeRects.length) {
    const firstRow = Math.max(0, Math.ceil(Math.min(...codeRects.map((r) => r.y))));
    const lastRow = Math.min(height, Math.ceil(Math.max(...codeRects.map((r) => r.y + r.height))));
    for (let y = firstRow; y < lastRow; y++) {
      const intervals = codeRects
        .filter((r) => y >= r.y && y < r.y + r.height)
        .map((r) => [
          Math.min(width, Math.max(0, Math.ceil(r.x))),
          Math.min(width, Math.ceil(r.x + r.width)),
        ])
        .sort((a, b) => a[0] - b[0]);
      let end = 0;
      for (const interval of intervals) {
        const start = Math.max(end, interval[0]);
        end = Math.max(end, interval[1]);
        codeArea += end - start;
        for (let x = start; x < end; x++) {
          const pixel = (y * width + x) * 4;
          // Pixelmatch paints differences red; its unchanged backdrop is grayscale and AA is yellow.
          if (diff.data[pixel] === 255 && diff.data[pixel + 1] === 0 && diff.data[pixel + 2] === 0)
            codeDifference++;
        }
      }
    }
  }
  const proseDifference = pixels - codeDifference;
  await writeFile(resolve(destination, capture.name + '.png'), PNG.sync.write(diff));
  const geometryMatches =
    original.width === candidate.width && original.height === candidate.height;
  const codeGeometryMatches = JSON.stringify(capture.code) === JSON.stringify(counterpart.code);
  const prosePercent = (proseDifference / (width * height - codeArea)) * 100;
  results.push({
    name: capture.name,
    geometryMatches,
    codeGeometryMatches,
    wholeDifferencePercent: (pixels / (width * height)) * 100,
    shellProseDifferencePercent: prosePercent,
    codeDifferencePercent: codeArea ? (codeDifference / codeArea) * 100 : null,
    pass: geometryMatches && codeGeometryMatches && prosePercent <= 0.1,
  });
}
await writeFile(
  resolve(destination, 'results.json'),
  JSON.stringify({ threshold: 0.1, maxDifferencePercent: 0.1, results }, null, 2) + '\n',
);
console.log(
  `${results.filter((result) => result.pass).length}/${results.length} comparisons meet the shell/prose gate and page geometry.`,
);
if (results.some((result) => !result.pass)) process.exitCode = 1;
