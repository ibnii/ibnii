#!/usr/bin/env node
/**
 * Renders the portfolio portrait as a 1-bit Bayer-dithered PNG and inlines it
 * into hero.svg as a base64 data URI.
 *
 * Mirrors src/ui/dither.js in the portfolio repo:
 *   168px wide, Rec.709 luma, midtone lift, Bayer 4x4, values 232 / 8.
 *
 * Usage:
 *   node scripts/make-dither.mjs [source.png] [target.svg]
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BAYER_4X4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, process.argv[2] ?? '../../Portofolio/public/images/img_profile.png');
const target = resolve(root, process.argv[3] ?? 'hero.svg');
const cacheDir = resolve(root, '.cache');
const rawPath = resolve(cacheDir, 'portrait-dither.gray');
const pngPath = resolve(cacheDir, 'portrait-dither.png');

const width = 168;

const rgb = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', source, '-vf', `scale=${width}:-2:flags=lanczos,format=rgb24`, '-f', 'rawvideo', 'pipe:1'],
    { maxBuffer: 64 * 1024 * 1024 }
);

if (rgb.length % (width * 3) !== 0) {
    throw new Error(`Unexpected raw size ${rgb.length} for width ${width}`);
}

const height = rgb.length / (width * 3);
const gray = Buffer.alloc(width * height);

for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 3;
        const luminance = 0.2126 * rgb[index] + 0.7152 * rgb[index + 1] + 0.0722 * rgb[index + 2];
        const lifted = Math.min(255, Math.max(0, (luminance - 118) * 1.22 + 130));
        const threshold = ((BAYER_4X4[y % 4][x % 4] + 0.5) / 16) * 255;
        gray[y * width + x] = lifted > threshold ? 232 : 8;
    }
}

mkdirSync(cacheDir, { recursive: true });
writeFileSync(rawPath, gray);

execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${width}x${height}`,
    '-i', rawPath,
    '-vf', 'scale=iw*2:ih*2:flags=neighbor',
    '-frames:v', '1', '-pix_fmt', 'gray',
    pngPath
]);

const base64 = readFileSync(pngPath).toString('base64');
const svg = readFileSync(target, 'utf8');
const dataUri = `href="data:image/png;base64,${base64}"`;
const placeholder = /__PORTRAIT_BASE64__/;
const existing = /(<image\b[^>]*?href="data:image\/png;base64,)[^"]*(")/;

const hasPlaceholder = placeholder.test(svg);
const hasData = existing.test(svg);

if (!hasPlaceholder && !hasData) {
    throw new Error(`Could not find the portrait placeholder in ${target}`);
}

const updated = hasPlaceholder
    ? svg.replace(placeholder, base64)
    : svg.replace(existing, `$1${base64}$2`);

writeFileSync(target, updated);

const unique = new Set(gray).size;
console.log(`source   ${source}`);
console.log(`grid     ${width}x${height} (1-bit, ${unique} values)`);
console.log(`png      ${pngPath} (${readFileSync(pngPath).length} bytes)`);
console.log(`svg      ${target} (${Buffer.byteLength(updated)} bytes, ${dataUri.length} byte data URI)`);
