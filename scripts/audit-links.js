import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

/**
 * Audit all pre-rendered HTML files in dist/ to ensure that every internal link
 * resolves to an existing static file, directory, or known redirect alias.
 */
function getAllHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(full));
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

export function runLinkAudit() {
  const htmlFiles = getAllHtmlFiles(distDir);
  console.log(`[audit-links] Scanning ${htmlFiles.length} pre-rendered HTML files in dist/...`);

  const internalLinks = new Set();
  const brokenLinks = [];

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/href="(\/[^"]*)"/g);
    for (const m of matches) {
      const href = m[1].split('#')[0].split('?')[0];
      if (href && !href.startsWith('//') && !href.startsWith('/assets/')) {
        internalLinks.add(href);
        const targetFile = path.join(distDir, href, 'index.html');
        const targetDirect = path.join(distDir, href);
        const exists = fs.existsSync(targetFile) || fs.existsSync(targetDirect) || fs.existsSync(targetDirect + '.html');
        if (!exists && href !== '/') {
          brokenLinks.push({ source: path.relative(distDir, file), href });
        }
      }
    }
  }

  console.log(`[audit-links] Total unique internal href targets: ${internalLinks.size}`);
  console.log(`[audit-links] Broken internal links: ${brokenLinks.length}`);
  if (brokenLinks.length > 0) {
    console.error('[audit-links] FAIL: Broken internal links detected:', brokenLinks);
    return false;
  }
  console.log('[audit-links] PASS: 100% of internal links resolve to valid targets.');
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const success = runLinkAudit();
  if (!success) process.exit(1);
}
