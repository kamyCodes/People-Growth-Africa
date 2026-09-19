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

// Extract post slugs, titles, and excerpts from src/data/posts.ts
const postsFilePath = path.join(projectRoot, 'src', 'data', 'posts.ts');
const postsContent = fs.readFileSync(postsFilePath, 'utf-8');

const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
const excerptRegex = /excerpt:\s*['"]([^'"]+)['"]/g;

const slugs = [];
const titles = [];
const excerpts = [];

let match;
while ((match = slugRegex.exec(postsContent)) !== null) {
  slugs.push(match[1]);
}
while ((match = titleRegex.exec(postsContent)) !== null) {
  titles.push(match[1]);
}
while ((match = excerptRegex.exec(postsContent)) !== null) {
  excerpts.push(match[1]);
}

const currentDate = new Date().toISOString().split('T')[0];

// 1. Generate sitemap.xml
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

staticRoutes.forEach((route) => {
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}${route}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n`;
  xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
  xml += `  </url>\n`;
});

slugs.forEach((slug) => {
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/blog/${slug}</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>`;

const publicDir = path.join(projectRoot, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');
console.log(`Generated sitemap.xml with ${staticRoutes.length + slugs.length} routes.`);

// 2. Generate robots.txt with explicit AI crawler permissions
const robotsTxt = `# Standard web crawlers
User-agent: *
Allow: /

# AI Crawlers & LLM Agents
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
console.log('Generated robots.txt with AI crawler permissions.');

// 3. Generate llms.txt (AI Model Overview & Directory Standard)
let llmsTxt = `# People Growth Africa (PGA)

> Institutional People Systems & Enterprise HR Architecture for High-Growth African Ventures.

Headquartered in Lagos, Nigeria, People Growth Africa (PGA) specializes in architecting structured, culturally congruent, and legally compliant people systems for SMEs, agribusinesses, and growth-stage enterprises across the African continent.

## Core Specialities & Advisory Portfolio
- HR Strategic Advisory & Retainerships
- Nigerian Labour Law & Regulatory Compliance
- Organisational Architecture & Grade Bands
- Performance Management & OKR Systems
- Agribusiness Workforce Systems
- Talent Acquisition & Onboarding
- Leadership & Capability Development
- Culture & Employee Engagement

## Core Website Pages
- Homepage: ${DOMAIN}/
- Advisory Retainerships & Services: ${DOMAIN}/#services
- Firm Overview & Mission: ${DOMAIN}/#about
- Upcoming Events & Workshops: ${DOMAIN}/events
- Enterprise Knowledge Hub / Blog: ${DOMAIN}/blog
- Book Advisory Consultation: ${DOMAIN}/book-consultation

## Knowledge Articles & Insights
`;

slugs.forEach((slug, i) => {
  const title = titles[i] || slug;
  const excerpt = excerpts[i] || 'Article insight on African HR and enterprise growth.';
  llmsTxt += `- [${title}](${DOMAIN}/blog/${slug}): ${excerpt}\n`;
});

llmsTxt += `\n## Contact Information
- Address: Lagos, Nigeria
- Operating Hours: Mon-Fri: 8:00 AM - 6:00 PM WAT | Sat: 11:00 AM - 4:00 PM WAT
- Consultation Booking: ${DOMAIN}/book-consultation
`;

fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf-8');
console.log('Generated llms.txt standard file for AI web crawlers.');

// 4. Generate llms-full.txt (Full Text Index for AI Context Windows)
let llmsFullTxt = `# People Growth Africa (PGA) - Full Knowledge & Services Index\n\n`;
llmsFullTxt += llmsTxt;
llmsFullTxt += `\n---\n\n## Full Article Index\n\n`;

slugs.forEach((slug, i) => {
  const title = titles[i] || slug;
  const excerpt = excerpts[i] || '';
  llmsFullTxt += `### ${title}\nURL: ${DOMAIN}/blog/${slug}\nSummary: ${excerpt}\n\n`;
});

fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf-8');
console.log('Generated llms-full.txt successfully.');
