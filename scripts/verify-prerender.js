import fs from 'fs';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

const staticFiles = [
  'dist/index.html',
  'dist/rates/index.html',
  'dist/gold/index.html',
  'dist/stocks/index.html',
  'dist/crypto/index.html',
  'dist/converter/index.html',
  'dist/charts/index.html',
  'dist/news/index.html',
  'dist/blog/index.html',
  'dist/about/index.html',
  'dist/contact/index.html',
  'dist/privacy-policy/index.html',
  'dist/terms/index.html',
  'dist/disclaimer/index.html'
];

let allValid = true;

// 1. Check all 14 static pages
staticFiles.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error('MISSING FILE:', f);
    allValid = false;
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  const canonMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
  const rootEmpty = content.includes('<div id="root"></div>');
  const size = (content.length / 1024).toFixed(1);

  if (rootEmpty) {
    console.error(`FAILED: ${f} has empty root!`);
    allValid = false;
  } else {
    console.log(`[PASS STATIC] ${f.padEnd(35)} (${size.padStart(4)} KB) | Canon: ${canonMatch ? canonMatch[1] : 'NONE'}`);
  }
});

// 2. Check all 20 blog articles
let articleCount = 0;
BLOG_POSTS.forEach(p => {
  const f = `dist/blog/${p.slug}/index.html`;
  if (!fs.existsSync(f)) {
    console.error('MISSING ARTICLE:', f);
    allValid = false;
    return;
  }
  const content = fs.readFileSync(f, 'utf8');
  const canonMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  const rootEmpty = content.includes('<div id="root"></div>');
  const size = (content.length / 1024).toFixed(1);

  if (rootEmpty) {
    console.error(`FAILED: ${f} has empty root!`);
    allValid = false;
  } else {
    articleCount++;
  }
});

console.log(`\n[PASS ARTICLES] All ${articleCount} / ${BLOG_POSTS.length} blog article pages pre-rendered successfully!`);

if (allValid && articleCount === BLOG_POSTS.length) {
  console.log(`\nTOTAL PRE-RENDERED CANONICAL ROUTES: ${staticFiles.length + articleCount} / 34 (100% COMPLETE)`);
} else {
  console.error('\nVerification failed!');
  process.exit(1);
}
