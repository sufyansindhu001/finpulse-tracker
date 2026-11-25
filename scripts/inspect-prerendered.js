import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

console.log('=== STEP 3: INSPECT PRERENDERED HTML (scripts/inspect-prerendered.js) ===\n');

const sampleRoutes = [
  { path: 'index.html', name: 'Homepage' },
  { path: 'rates/index.html', name: 'Forex Rates' },
  { path: 'gold/index.html', name: 'Gold Rates & Calculator' },
  { path: 'crypto/index.html', name: 'Crypto Terminal' },
  { path: 'stocks/index.html', name: 'PSX & Global Stocks' },
  { path: 'converter/index.html', name: 'Currency Converter' },
  { path: 'blog/index.html', name: 'Research Hub' },
  { path: 'author/sufyan-saleem/index.html', name: 'Author Profile' },
  { path: 'blog/buying-gold-in-pakistan-tola-karat-making-charges-guide/index.html', name: 'Article: Buying Gold' },
  { path: 'blog/usd-to-pkr-interbank-vs-open-market-guide/index.html', name: 'Article: USD to PKR' },
  { path: '404.html', name: '404 Error Page' }
];

let passed = 0;
let failed = 0;

sampleRoutes.forEach(r => {
  const full = path.join(distDir, r.path);
  if (!fs.existsSync(full)) {
    console.error(`[FAIL] ${r.name} missing: ${full}`);
    failed++;
    return;
  }
  const content = fs.readFileSync(full, 'utf8');
  const title = content.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const desc = content.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  const canon = content.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || '';
  const robots = content.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '';
  const h1 = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const lengthKb = (content.length / 1024).toFixed(1);

  const isValid = title && desc && canon && h1;
  if (isValid) {
    passed++;
    console.log(`[PASS] ${r.name} (${r.path}) — ${lengthKb} KB`);
    console.log(`   TITLE:     ${title}`);
    console.log(`   CANONICAL: ${canon}`);
    console.log(`   ROBOTS:    ${robots}`);
    console.log(`   H1:        ${h1.slice(0, 75)}...`);
    console.log(`   DESC:      ${desc.slice(0, 90)}...`);
    console.log('--------------------------------------------------');
  } else {
    failed++;
    console.error(`[FAIL] ${r.name} incomplete tags!`, { title, desc, canon, h1 });
  }
});

console.log(`\ninspect-prerendered.js Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
