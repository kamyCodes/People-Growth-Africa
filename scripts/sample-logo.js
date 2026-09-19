import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const logoPath = path.join(projectRoot, 'public', 'images', 'icon-black.png');
const outputPath = path.join(projectRoot, 'src', 'data', 'precomputedLogoParts.json');

if (!fs.existsSync(logoPath)) {
  console.log('Logo file not found at:', logoPath);
  process.exit(0);
}

const buffer = fs.readFileSync(logoPath);
const png = PNG.sync.read(buffer);

const { width, height, data } = png;

let minX = width, maxX = 0, minY = height, maxY = 0;
let hasPixels = false;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const alpha = data[idx + 3];
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const isDark = alpha > 20 && !(r > 240 && g > 240 && b > 240);

    if (isDark) {
      hasPixels = true;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (!hasPixels) {
  minX = 0; maxX = width; minY = 0; maxY = height;
}

const bboxWidth = maxX - minX || width;
const bboxHeight = maxY - minY || height;
const density = 32;
const stepG = Math.max(4, Math.floor(bboxWidth / density));
const maxDotRadius = (stepG / bboxWidth) * 0.95;

const parts = [];

for (let gy = minY; gy < maxY; gy += stepG) {
  for (let gx = minX; gx < maxX; gx += stepG) {
    let sumCoverage = 0;
    let count = 0;
    let sumX = 0;
    let sumY = 0;

    for (let cy = gy; cy < Math.min(gy + stepG, maxY); cy++) {
      for (let cx = gx; cx < Math.min(gx + stepG, maxX); cx++) {
        const idx = (cy * width + cx) * 4;
        const alpha = data[idx + 3] / 255;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const coverage = alpha > 0.1 ? (alpha < 0.9 ? alpha : 1 - lum * 0.8) : 0;

        if (coverage > 0.05) {
          sumCoverage += coverage;
          sumX += cx;
          sumY += cy;
          count++;
        }
      }
    }

    if (count > 0) {
      const avgCoverage = sumCoverage / (stepG * stepG);
      if (avgCoverage >= 0.08) {
        const centroidX = (sumX / count - minX) / bboxWidth;
        const centroidY = (sumY / count - minY) / bboxHeight;
        const radius = Math.max(0.005, maxDotRadius * Math.sqrt(avgCoverage));
        parts.push({
          x: Number(centroidX.toFixed(4)),
          y: Number(centroidY.toFixed(4)),
          radius: Number(radius.toFixed(4))
        });
      }
    }
  }
}

// Cap to 55 parts max for silky smooth 60fps performance
let finalParts = parts;
const maxCap = 55;
if (parts.length > maxCap) {
  const stride = parts.length / maxCap;
  finalParts = [];
  for (let i = 0; i < maxCap; i++) {
    finalParts.push(parts[Math.floor(i * stride)]);
  }
}

const dataDir = path.join(projectRoot, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalParts, null, 2), 'utf-8');
console.log(`Successfully precomputed ${finalParts.length} logo parts into precomputedLogoParts.json`);
