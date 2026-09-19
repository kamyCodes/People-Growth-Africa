import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const DOMAIN = 'https://peoplegrowthafrica.com';

const staticRoutes = [
  '/',
  '/blog',
  '/events',
  '/book-consultation',
];

// Extract post slugs from src/data/posts.ts
const postsFilePath = path.join(projectRoot, 'src', 'data', 'posts.ts');
const postsContent = fs.readFileSync(postsFilePath, 'utf-8');

const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
const slugs = [];
let match;
while ((match = slugRegex.exec(postsContent)) !== null) {
  slugs.push(match[1]);
}

const currentDate = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Add static routes
staticRoutes.forEach((route) => {
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}${route}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n`;
  xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
  xml += `  </url>\n`;
});

// Add dynamic blog routes
slugs.forEach((slug) => {
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/blog/${slug}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>`;

// Write sitemap.xml to public/ and dist/ if dist exists
const publicDir = path.join(projectRoot, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');
console.log(`Generated sitemap.xml with ${staticRoutes.length + slugs.length} routes.`);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
console.log('Generated robots.txt successfully.');
