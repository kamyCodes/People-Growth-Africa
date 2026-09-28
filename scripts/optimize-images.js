// One-off brand-asset optimizer: run with `node scripts/optimize-images.js`
//
// 1. Resizes the four brand PNGs (source 4000x3000) to 512px tall and
//    quantizes them to palette PNGs (alpha preserved) - right-sized for
//    navbar marks, favicons and social previews.
// 2. Builds public/images/og-image.jpg (1200x630, brand green background,
//    white logo mark centred) for Open Graph / Twitter card previews.
//
// Originals are NOT backed up here; keep them in brand asset storage.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'public', 'images');

const BRAND_FILES = ['logo-black.png', 'logo-white.png', 'icon-black.png', 'icon-white.png'];
const GREEN = { r: 0x0f, g: 0x6e, b: 0x56, alpha: 1 }; // #0F6E56 (index.html theme-color)

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' kB';
}

async function optimizeBrandPng(file) {
  const filePath = path.join(imagesDir, file);
  const before = fs.statSync(filePath).size;
  const meta = await sharp(filePath).metadata();

  const tmp = filePath + '.tmp';
  await sharp(filePath)
    .resize({ height: 512, fit: 'inside' }) // preserve aspect, never upscale
    .png({ palette: true, compressionLevel: 9, effort: 10 })
    .toFile(tmp);
  fs.renameSync(tmp, filePath);

  const after = fs.statSync(filePath).size;
  console.log(
    `${file}: ${meta.width}x${meta.height} ${kb(before)} -> ${kb(after)} ` +
      `(${Math.round((1 - after / before) * 100)}% smaller)`
  );
}

async function buildOgImage() {
  const outPath = path.join(imagesDir, 'og-image.jpg');
  // The white logo variant (icon + wordmark) centred on the brand green.
  const mark = await sharp(path.join(imagesDir, 'logo-white.png'))
    .resize({ height: 420, fit: 'inside' })
    .png()
    .toBuffer();
  const markMeta = await sharp(mark).metadata();

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: GREEN },
  })
    .composite([
      {
        input: mark,
        top: Math.round((630 - markMeta.height) / 2),
        left: Math.round((1200 - markMeta.width) / 2),
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);

  console.log(`og-image.jpg: 1200x630 ${kb(fs.statSync(outPath).size)}`);
}

let totalBefore = 0;
let totalAfter = 0;
for (const file of BRAND_FILES) {
  const filePath = path.join(imagesDir, file);
  totalBefore += fs.statSync(filePath).size;
  await optimizeBrandPng(file);
  totalAfter += fs.statSync(filePath).size;
}
console.log(`---\nBrand PNGs total: ${kb(totalBefore)} -> ${kb(totalAfter)}`);

await buildOgImage();
