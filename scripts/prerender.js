/**
 * FGC Spot Pre-Rendering Engine (Phase 1: Pre-Rendering & HTML Hydration)
 * 
 * Generates high-fidelity static HTML for all 34 public canonical routes at build time:
 * - 14 Core Static & Tool Pages (Home, Stocks, Rates, Crypto, Gold, Charts, Converter, News, Blog, About, Contact, Privacy, Terms, Disclaimer)
 * - 20 In-Depth Financial Research Articles (/blog/:slug)
 * - 8 Clean HTTP Redirect Aliases (/psx, /forex, /matrix, etc.)
 * 
 * Guarantees that Googlebot, AdSense crawlers, and users receive 100% complete semantic HTML
 * with unique titles, meta descriptions, canonical URLs, OpenGraph tags, and Schema.org JSON-LD
 * directly in the initial HTTP response without requiring client-side JS execution.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArticleReferences } from '../src/data/articleReferences.js';
import { publishedDateISO, modifiedDateISO } from '../src/utils/articleDates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');

const BASE_URL = 'https://www.fgcspot.com';
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());

// Escape HTML special characters for attributes and text
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Convert inline markdown formatting (*italic*, **bold**, `code`, [link](url))
function formatInlineHtml(text) {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#00E676] hover:underline font-bold">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#00E676] font-mono text-xs font-semibold">$1</code>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800 dark:text-slate-300">$1</em>');
}

// Convert markdown tables into semantic HTML <table>
function formatMarkdownTable(lines) {
  const rows = lines.map(line => 
    line.split('|')
      .map(cell => cell.trim())
      .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
  );

  if (rows.length < 2) return '';

  const headerRow = rows[0];
  // rows[1] is separator line (:--- | :---)
  const dataRows = rows.slice(2);

  let html = '<div class="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs"><table class="w-full text-left text-xs sm:text-sm border-collapse">';
  html += '<thead class="bg-slate-100 dark:bg-[#0D1B2A] text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-white/10"><tr>';
  headerRow.forEach(h => {
    html += `<th class="p-3 sm:p-4 text-xs font-bold uppercase tracking-wider">${formatInlineHtml(h)}</th>`;
  });
  html += '</tr></thead><tbody class="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0A1726]">';
  dataRows.forEach(row => {
    html += '<tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">';
    row.forEach(cell => {
      html += `<td class="p-3 sm:p-4 text-slate-700 dark:text-[#A8B3C2]">${formatInlineHtml(cell)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

// Convert full article markdown content into semantic HTML
function renderMarkdownContent(content) {
  if (!content) return '';
  const paragraphs = content.replace(/\n(?=\d+\.\s)/g, '\n\n').split('\n\n');
  const htmlParts = [];

  for (let idx = 0; idx < paragraphs.length; idx++) {
    const trimmed = paragraphs[idx].trim();
    if (!trimmed) continue;

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      htmlParts.push('<hr class="my-8 border-slate-200 dark:border-white/10" />');
      continue;
    }

    // Markdown Table
    if (trimmed.includes('|') && trimmed.includes('\n|')) {
      const tableLines = trimmed.split('\n').filter(l => l.trim().startsWith('|'));
      if (tableLines.length >= 2) {
        htmlParts.push(formatMarkdownTable(tableLines));
        continue;
      }
    }

    // Headings (H1)
    if (trimmed.startsWith('# ')) {
      htmlParts.push(`<h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10">${escapeHtml(trimmed.replace(/^#\s*/, ''))}</h2>`);
      continue;
    }

    // Headings (H2)
    if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10">${escapeHtml(trimmed.replace(/^##\s*/, ''))}</h2>`);
      continue;
    }

    // Subheadings (H4)
    if (trimmed.startsWith('####')) {
      htmlParts.push(`<h4 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-3 pb-1">${escapeHtml(trimmed.replace(/^####\s*/, ''))}</h4>`);
      continue;
    }

    // Headings (H3)
    if (trimmed.startsWith('###')) {
      htmlParts.push(`<h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-5 pb-1">${escapeHtml(trimmed.replace(/^###\s*/, ''))}</h3>`);
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      htmlParts.push(`<blockquote class="my-5 pl-4 sm:pl-6 border-l-4 border-[#00E676] bg-slate-50 dark:bg-[#06111F] p-4 rounded-r-xl italic text-slate-700 dark:text-[#A8B3C2]">${formatInlineHtml(trimmed.replace(/^>\s*/, ''))}</blockquote>`);
      continue;
    }

    // Golden Rule / Editorial Callouts
    if (trimmed.startsWith('**The Golden Rule:**') || trimmed.startsWith('**Important:**')) {
      htmlParts.push(`<div class="my-5 p-5 sm:p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 text-slate-800 dark:text-[#A8B3C2] text-sm sm:text-base leading-relaxed shadow-xs">${formatInlineHtml(trimmed)}</div>`);
      continue;
    }

    // Numbered List Items
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+([\s\S]*)/);
      if (match) {
        const num = match[1];
        const body = match[2];
        const lines = body.split('\n').filter(l => l.trim().length > 0);
        let listHtml = `<div class="my-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-xs">
          <div class="w-8 h-8 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] font-extrabold text-sm shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,230,118,0.15)]">${num}</div>
          <div class="space-y-2 flex-1 text-slate-700 dark:text-[#A8B3C2] text-sm sm:text-base leading-relaxed">`;
        lines.forEach((line, bIdx) => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
            listHtml += `<div class="flex items-start gap-2.5 pl-3 py-0.5 text-xs sm:text-sm">
              <span class="text-[#00E676] font-bold shrink-0 mt-0.5">&bull;</span>
              <span class="text-slate-600 dark:text-[#A8B3C2] leading-relaxed">${formatInlineHtml(trimmedLine.replace(/^[*•-]\s*/, ''))}</span>
            </div>`;
          } else {
            listHtml += `<p class="${bIdx === 0 ? 'font-bold text-slate-900 dark:text-white' : 'leading-relaxed'}">${formatInlineHtml(trimmedLine)}</p>`;
          }
        });
        listHtml += `</div></div>`;
        htmlParts.push(listHtml);
        continue;
      }
    }

    // Bullet Lists
    if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.includes('\n*') || trimmed.includes('\n-')) {
      const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
      let bulletHtml = `<div class="my-4 pl-4 border-l-2 border-[#00E676]/50 space-y-2.5 py-1">`;
      lines.forEach(line => {
        bulletHtml += `<div class="flex items-start gap-2.5 text-sm sm:text-base">
          <span class="text-[#00E676] font-bold shrink-0 mt-0.5">&bull;</span>
          <span class="text-slate-600 dark:text-[#A8B3C2] leading-relaxed">${formatInlineHtml(line.replace(/^[*•-]\s*/, ''))}</span>
        </div>`;
      });
      bulletHtml += `</div>`;
      htmlParts.push(bulletHtml);
      continue;
    }

    // Standard Paragraph
    htmlParts.push(`<p class="leading-relaxed mb-4 text-slate-700 dark:text-[#A8B3C2] text-base">${formatInlineHtml(trimmed)}</p>`);
  }

  return htmlParts.join('\n');
}

// Common Top Ticker Bar HTML
function renderTickerBar() {
  const items = [
    { label: 'USD/PKR' },
    { label: 'EUR/PKR' },
    { label: 'GBP/PKR' },
    { label: 'SAR/PKR' },
    { label: 'AED/PKR' },
    { label: 'Gold 24K (Tola)' },
    { label: 'BTC/USD' },
    { label: 'ETH/USD' }
  ];

  let itemsHtml = items.map(i => `
    <div class="inline-flex items-center gap-2 px-3 py-1 text-xs border-r border-slate-200 dark:border-white/10 shrink-0">
      <span class="font-semibold text-slate-700 dark:text-[#A8B3C2]">${i.label}:</span>
      <span class="font-mono text-[10px] text-slate-500">Fetching reference quote</span>
    </div>
  `).join('');

  return `
    <div class="relative z-20 bg-white/90 dark:bg-[#06111F]/90 border-b border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden py-1">
      <div class="flex items-center whitespace-nowrap overflow-x-auto no-scrollbar max-w-7xl mx-auto px-4">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full mr-3 shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span> Market Data
        </span>
        <div class="flex items-center">${itemsHtml}</div>
      </div>
    </div>
  `;
}

// Common Fixed Header Navigation HTML
function renderHeader(currentPath = '/') {
  const navLinks = [
    { label: 'Stocks', path: '/stocks' },
    { label: 'Rates', path: '/rates' },
    { label: 'Crypto', path: '/crypto' },
    { label: 'Gold', path: '/gold' },
    { label: 'Charts', path: '/charts' },
    { label: 'Converter', path: '/converter' },
    { label: 'News', path: '/news' },
    { label: 'Research', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const linksHtml = navLinks.map(l => {
    const isActive = currentPath === l.path || (l.path === '/blog' && currentPath.startsWith('/blog'));
    return `
      <a href="${l.path}" class="text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
        isActive 
          ? 'text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20' 
          : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
      }">${l.label}</a>
    `;
  }).join('');

  return `
    <header class="sticky top-0 z-40 bg-white/95 dark:bg-[#06111F]/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-xl transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <a href="/" class="flex items-center gap-3 group shrink-0">
          <img src="/logo.png" alt="FGC Spot" width="36" height="36" class="w-9 h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform" />
          <div class="flex flex-col">
            <span class="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-none">
              FGC <span class="text-[#00E676]">SPOT</span>
            </span>
            <span class="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-[#A8B3C2]">Financial Terminal</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav class="hidden lg:flex items-center gap-1">${linksHtml}</nav>

        {/* Header Actions (Live Status, Search, Theme) */}
        <div class="flex items-center gap-2.5">
          <button type="button" aria-label="Live Market Feeds Active" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[#00E676] text-xs font-semibold shadow-xs">
            <span class="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span class="hidden sm:inline">Live</span>
          </button>
          
          <a href="/converter" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00E676] hover:bg-emerald-400 text-[#06111F] transition-all shadow-xs">
            Convert
          </a>
        </div>

      </div>
    </header>
  `;
}

// Common Footer HTML
function renderFooter() {
  const corridors = [
    { from: 'USD', to: 'PKR', label: 'USD to PKR (Pakistan)' },
    { from: 'EUR', to: 'PKR', label: 'EUR to PKR (Euro)' },
    { from: 'GBP', to: 'PKR', label: 'GBP to PKR (Pound)' },
    { from: 'AED', to: 'PKR', label: 'AED to PKR (Dirham)' },
    { from: 'SAR', to: 'PKR', label: 'SAR to PKR (Riyal)' },
    { from: 'CAD', to: 'PKR', label: 'CAD to PKR (Canada)' }
  ];

  const corridorLinks = corridors.map(c => `
    <li>
      <a href="/converter?from=${c.from}&to=${c.to}" class="hover:text-[#00E676] transition-colors flex items-center justify-between py-0.5">
        <span>${c.label}</span>
        <span class="font-mono text-[10px] opacity-75">Live</span>
      </a>
    </li>
  `).join('');

  return `
    <footer class="w-full bg-slate-50 dark:bg-[#06111F] border-t border-slate-200 dark:border-white/10 pt-14 pb-12 text-slate-600 dark:text-[#A8B3C2] text-xs transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          
          {/* Brand & Editorial Column */}
          <div class="lg:col-span-2 space-y-4">
            <a href="/" class="flex items-center gap-3">
              <img src="/logo.png" alt="FGC Spot" width="40" height="40" class="w-10 h-10 rounded-xl object-contain" />
              <span class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">FGC Spot</span>
            </a>
            <p class="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-[#A8B3C2] max-w-sm">
              Financial education and market-data tools covering public foreign-exchange references, bullion calculations, equities and original research. Prices depend on independent providers.
            </p>
            <div class="pt-2 flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span class="w-2 h-2 rounded-full bg-[#00E676]"></span>
              <span>Provider-Based Reference Data</span>
            </div>
          </div>

          {/* Market Terminals */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Market Terminals</h4>
            <ul class="space-y-2">
              <li><a href="/rates" class="hover:text-[#00E676] transition-colors">Forex Rates (Interbank & Open)</a></li>
              <li><a href="/stocks" class="hover:text-[#00E676] transition-colors">PSX Equities & Screener</a></li>
              <li><a href="/gold" class="hover:text-[#00E676] transition-colors">Gold & Bullion Calculator</a></li>
              <li><a href="/crypto" class="hover:text-[#00E676] transition-colors">Cryptocurrency Terminal</a></li>
              <li><a href="/converter" class="hover:text-[#00E676] transition-colors">Currency Converter</a></li>
              <li><a href="/charts" class="hover:text-[#00E676] transition-colors">Interactive Technical Charts</a></li>
              <li><a href="/news" class="hover:text-[#00E676] transition-colors">Financial News Wire</a></li>
            </ul>
          </div>

          {/* Research & Guides */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Research & Analysis</h4>
            <ul class="space-y-2">
              <li><a href="/blog" class="hover:text-[#00E676] transition-colors">Market Research Archive</a></li>
              <li><a href="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide" class="hover:text-[#00E676] transition-colors">Gold Buyer's Guide</a></li>
              <li><a href="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained" class="hover:text-[#00E676] transition-colors">Freelance Remittance & Taxes</a></li>
              <li><a href="/blog/pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide" class="hover:text-[#00E676] transition-colors">PSX KSE-100 vs S&P 500</a></li>
              <li><a href="/blog/usd-to-pkr-interbank-vs-open-market-guide" class="hover:text-[#00E676] transition-colors">USD/PKR Rate Mechanics</a></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Trust & Governance</h4>
            <ul class="space-y-2">
              <li><a href="/about" class="hover:text-[#00E676] transition-colors">About Us</a></li>
              <li><a href="/author/sufyan-sindhu" class="hover:text-[#00E676] transition-colors">Author &amp; Research Desk</a></li>
              <li><a href="/editorial-policy" class="hover:text-[#00E676] transition-colors">Editorial Policy</a></li>
              <li><a href="/data-sources" class="hover:text-[#00E676] transition-colors">Data Sources &amp; Governance</a></li>
              <li><a href="/contact" class="hover:text-[#00E676] transition-colors">Contact Support</a></li>
              <li><a href="/privacy-policy" class="hover:text-[#00E676] transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" class="hover:text-[#00E676] transition-colors">Terms of Service</a></li>
              <li><a href="/disclaimer" class="hover:text-[#00E676] transition-colors">Financial Disclaimer</a></li>
            </ul>
          </div>

        </div>

        {/* Regulatory Risk Notice */}
        <div class="p-4 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-2 text-[11px] leading-relaxed text-slate-500 dark:text-[#A8B3C2]">
          <p class="font-bold text-slate-800 dark:text-white uppercase tracking-wider">Regulatory Compliance & Financial Disclaimer</p>
          <p>
            FGC Spot publishes financial education, research and indicative data from available public providers. Quotes may be delayed or unavailable, and may differ from official central-bank, exchange or dealer prices. FGC Spot is not an investment broker, foreign exchange dealer or licensed investment advisory service. The content is not personal financial, legal, tax or investment advice.
          </p>
        </div>

        {/* Bottom Copyright */}
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#A8B3C2] pt-4">
          <p>&copy; ${new Date().getFullYear()} FGC Spot. All institutional rights reserved.</p>
          <div class="flex flex-wrap items-center gap-4">
            <a href="/author/sufyan-sindhu" class="hover:text-[#00E676] transition-colors">Author Desk</a>
            <a href="/editorial-policy" class="hover:text-[#00E676] transition-colors">Editorial Policy</a>
            <a href="/data-sources" class="hover:text-[#00E676] transition-colors">Data Sources</a>
            <a href="/privacy-policy" class="hover:text-[#00E676] transition-colors">Privacy</a>
            <a href="/terms" class="hover:text-[#00E676] transition-colors">Terms</a>
            <a href="/disclaimer" class="hover:text-[#00E676] transition-colors">Disclaimers</a>
            <a href="/contact" class="hover:text-[#00E676] transition-colors">Contact</a>
          </div>
        </div>

      </div>
    </footer>
  `;
}

// Cookie Consent Banner HTML
function renderCookieBanner() {
  return `
    <div id="cookie-consent-banner" class="fixed bottom-0 inset-x-0 z-50 p-4 bg-slate-900/95 dark:bg-[#06111F]/95 text-slate-200 border-t border-slate-700 dark:border-white/10 backdrop-blur-md shadow-2xl transition-transform duration-300">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs sm:text-sm text-slate-300">
          FGC Spot uses cookies and analytics telemetry to optimize market rate calculations and comply with Google AdSense standards. Review our <a href="/privacy-policy" class="underline hover:text-[#00E676]">Privacy Policy</a>.
        </p>
        <div class="flex items-center gap-3 shrink-0">
          <a href="/privacy-policy" class="px-3 py-1.5 rounded-xl border border-slate-600 hover:border-slate-400 text-xs font-semibold text-slate-300 transition-colors">Manage Preferences</a>
          <button type="button" onclick="document.getElementById('cookie-consent-banner').style.display='none'; localStorage.setItem('fgc_cookie_consent','accepted');" class="px-4 py-1.5 rounded-xl bg-[#00E676] hover:bg-emerald-400 text-[#06111F] text-xs font-bold transition-all shadow-xs">Accept All</button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// PAGE CONTENT GENERATORS
// -------------------------------------------------------------

function renderHomePage() {
  return `
    <div class="space-y-0">
      
      {/* Hero Section */}
      <section class="py-12 sm:py-20 lg:py-24 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#06111F] relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="max-w-3xl space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
              <span>● Institutional Market Intelligence Terminal</span>
            </div>
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Real-Time Forex, Gold & <br class="hidden sm:inline" />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-emerald-400">
                Financial Market Analytics
              </span>
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-2xl">
              Explore public foreign-exchange reference rates, indicative gold conversions, stock-market information, and cryptocurrency metrics. Updates depend on external data providers.
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="/rates" class="px-6 py-3 rounded-2xl bg-[#00E676] hover:bg-emerald-400 text-[#06111F] font-bold text-sm transition-all shadow-lg shadow-[#00E676]/20">
                Explore Forex Rates
              </a>
              <a href="/converter" class="px-6 py-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm hover:border-[#00E676]/50 transition-all">
                Currency Converter
              </a>
              <a href="/gold" class="px-6 py-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm hover:border-[#00E676]/50 transition-all">
                Gold Bullion Calculator
              </a>
            </div>
          </div>

          {/* Live Quick Market Cards */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
              <span class="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2]">USD to PKR (Reference)</span>
              <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
              <span class="text-[11px] font-semibold text-[#00E676]">Fetching provider quote</span>
            </div>
            <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
              <span class="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2]">Open-Market Cash Rate</span>
              <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
              <span class="text-[11px] font-semibold text-amber-500">Ask licensed exchange providers</span>
            </div>
            <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
              <span class="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2]">Gold 24K (Per Tola)</span>
              <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
              <span class="text-[11px] font-semibold text-[#00E676]">Fetching metals reference</span>
            </div>
            <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
              <span class="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2]">Bitcoin (BTC/USD)</span>
              <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
              <span class="text-[11px] font-semibold text-[#00E676]">Fetching market quote</span>
            </div>
          </div>

        </div>
      </section>

      {/* What We Offer Section */}
      <section class="py-12 sm:py-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#06111F]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Analytical Suites</h2>
            <p class="text-sm text-slate-600 dark:text-[#A8B3C2]">Engineered for business treasuries, freelance exporters, and everyday investors navigating emerging market volatility.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Interbank Foreign Exchange Terminal</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">Reference-rate calculations across major fiat currencies, including the Pakistani Rupee (PKR). Bank bid/ask quotes and physical cash exchange prices may differ.</p>
              <a href="/rates" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline">Launch Rates Terminal &rarr;</a>
            </div>
            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Gold Bullion & Karat Calculator</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">Indicative valuation formulas for 24K, 22K, 21K and 18K gold using available spot and FX references. Local Sarafa shop prices can differ.</p>
              <a href="/gold" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline">Calculate Gold Rates &rarr;</a>
            </div>
            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pakistan Stock Exchange Screener</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">Comprehensive KSE-100 equity screener. Filter blue-chip equities by price-to-earnings (P/E) compression, dividend yield, market capitalization, and sector performance.</p>
              <a href="/stocks" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline">Open Stock Screener &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence Methodology Block (Original 600+ Word Content) */}
      <section class="py-12 sm:py-16 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#06111F]/70">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="max-w-3xl space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Institutional Framework</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Institutional Market Intelligence & Multi-Asset Research Methodology</h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              How FGC Spot aggregates, verifies, and normalizes low-latency market data across Foreign Exchange corridors, physical gold bullion benchmarks, decentralized digital assets, and cross-border equity exchanges.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">1. Foreign Exchange & Sovereign Currency Corridors</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                FGC Spot uses available public foreign-exchange reference feeds. Cross-currency values are calculated from a common USD base. These references are not direct quotes from institutional dealing desks, the European Central Bank or the State Bank of Pakistan.
              </p>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                In markets such as Pakistan, banks and licensed cash exchange businesses may quote different rates. FGC Spot's reference conversion alone cannot establish a dealer's actual cash premium or fee. Compare the amount a provider will deliver before committing a payment.
              </p>
            </div>
            <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">2. Precious Metals & Sarafa Bullion Benchmarks</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Gold and silver calculations use available public spot references and USD/PKR reference data. They are not official LBMA fixings or independently verified Sarafa dealer quotes.
              </p>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                The conversion formula translates troy ounces into tola and gram units, then applies gold purity ratios. Results are indicative metal values; jewelers may charge fabrication premiums and local market prices can differ.
              </p>
            </div>
            <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">3. Decentralized Digital Assets & Multi-Exchange Aggregation</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Cryptocurrency values are sourced from available public market-data endpoints when they respond. The site does not operate a live multi-exchange order-book or WebSocket trading feed.
              </p>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                PKR equivalents are calculated from available USD crypto prices and FX reference quotes. They are educational estimates, not guaranteed conversion, trading or custody offers.
              </p>
            </div>
            <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">4. Equity Screener & Fundamental Valuation Ratios</h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Our Pakistan Stock Exchange (PSX) and global equity screener processes company fundamentals, enterprise multiples, dividend coverage ratios, and Piotroski F-Scores across 50+ international jurisdictions.
              </p>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                By contextualizing local KSE-100 valuations against frontier and developed benchmarks like the S&P 500 and MSCI Emerging Markets, we provide institutional-grade clarity into dividend reinvestment strategies, inflationary earnings pass-through, and sovereign interest rate cyclicality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research Archive Section */}
      <section class="py-12 sm:py-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#06111F]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Flagship Research</span>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Original Financial Research & Analytical Guides</h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2]">Educational explainers on currency markets, investing concepts, remittances, and gold calculations.</p>
            </div>
            <a href="/blog" class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#00E676] text-xs font-bold text-slate-900 dark:text-white transition-colors">
              Browse All 20 Articles &rarr;
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Precious Metals</span>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  <a href="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide" class="hover:text-[#00E676] transition-colors">
                    Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates
                  </a>
                </h3>
                <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Everything you need to know about purchasing physical gold bullion in Pakistan: 24K vs 22K karat testing, Tola (11.66g) vs 10-gram weight pricing, avoiding unfair jeweler making charges, and hallmarking standards.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
                <span>By Sufyan Sindhu</span>
                <a href="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide" class="font-bold text-[#00E676]">Read Guide &rarr;</a>
              </div>
            </article>

            <article class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Banking & Remittances</span>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  <a href="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained" class="hover:text-[#00E676] transition-colors">
                    Freelance Remittances & Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Retention Accounts Explained
                  </a>
                </h3>
                <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Educational guide to exporter retention accounts, e-PRC documentation, conditional tax treatment and comparing bank conversion costs.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
                <span>By Sufyan Sindhu</span>
                <a href="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained" class="font-bold text-[#00E676]">Read Guide &rarr;</a>
              </div>
            </article>

            <article class="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Equity Research</span>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  <a href="/blog/pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide" class="hover:text-[#00E676] transition-colors">
                    Pakistan Stock Exchange (PSX) vs Global Equities: KSE-100 Valuation Multiples, Dividend Yields, and S&P 500 Guide
                  </a>
                </h3>
                <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  An institutional comparative analysis evaluating the PSX KSE-100's sub-5.0x P/E multiple compression, double-digit dividend reinvestment yields (11.8%), and real purchasing power returns against the S&P 500.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
                <span>By Sufyan Sindhu</span>
                <a href="/blog/pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide" class="font-bold text-[#00E676]">Read Guide &rarr;</a>
              </div>
            </article>
          </div>
        </div>
      </section>

    </div>
  `;
}

function renderRatesPage() {
  const currencyRows = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'OMR', name: 'Omani Rial' }
  ];

  const rowsHtml = currencyRows.map(c => `
    <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/5">
      <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="font-mono text-[#00E676]">${c.code}</span>
        <span class="text-xs text-slate-500 font-normal">(${c.name})</span>
      </td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono text-xs text-slate-500">Awaiting feed</td>
      <td class="p-4 text-right">
        <a href="/converter?from=${c.code}&to=PKR" class="px-3 py-1 rounded-lg bg-[#00E676]/10 text-[#00E676] hover:bg-[#00E676] hover:text-[#06111F] text-xs font-bold transition-all">Convert</a>
      </td>
    </tr>
  `).join('');

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Foreign Exchange Rates</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Currency Exchange Rates in Pakistan (Interbank & Open Market)
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Indicative public-reference FX data loads in the interactive app. Official bank or licensed-dealer bid, ask and cash quotes are not independently available in this pre-rendered view.
        </p>
      </div>

      {/* Primary Rates Table */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-50 dark:bg-[#0D1B2A] text-slate-700 dark:text-[#A8B3C2] text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th class="p-4">Currency Pair</th>
                <th class="p-4">Interbank Buying</th>
                <th class="p-4">Interbank Selling</th>
                <th class="p-4">Open Mkt Buying</th>
                <th class="p-4">Open Mkt Selling</th>
                <th class="p-4">24h Net</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>

      {/* Methodological Context & SBP Guidelines */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Cross-Rate Parity</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Triangular Parity Formula</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Rate(Base/Quote) = (USD/Quote) / (USD/Base)</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            All cross-rates (such as EUR/PKR or GBP/PKR) are algorithmically derived through the US Dollar anchor rate to ensure mathematical consistency with global liquidity pools.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Spread Measurement</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Bid-Ask & Open Market Premium</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Spread (%) = ((Ask - Bid) / Mid) &times; 100</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            The spread can be computed when independently verified buy and sell quotes are provided. Retail transactions may include additional charges.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Remittance Protection</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">e-PRC Remittance Records</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Bank-issued transaction documentation</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Receiving banks can issue e-PRCs for eligible inward payments. A certificate documents the receipt; it is not itself an automatic tax exemption.
          </p>
        </div>
      </div>

      {/* Practical Remittance Comparison */}
      <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Practical Remittance Example: $1,000 Inward Transfer
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
          Hypothetical arithmetic only: at an assumed rate of 277.10 PKR per USD, $1,000 would equal Rs. 277,100 before provider charges or taxes. This is not a live market quote. Actual bank and cash rates must be confirmed separately. For remittance documentation and current tax conditions, see our <a href="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained" class="text-[#00E676] underline font-semibold">Remittance &amp; Banking Guide</a>.
        </p>
        <p class="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
          <strong>Regulatory Notice:</strong> FGC Spot is an independent financial technology aggregator. We are not an authorized foreign exchange dealer or bank under the Foreign Exchange Regulation Act, 1947. Rates are published for informational purposes.
        </p>
      </div>

    </div>
  `;
}

function renderGoldPage() {
  const goldItems = [
    { purity: '24K Gold (Pure Bullion 99.9%)' },
    { purity: '22K Gold (Jewelry Standard 91.6%)' },
    { purity: '21K Gold (87.5% Purity)' },
    { purity: '18K Gold (75.0% Purity)' },
    { purity: 'Silver Fine 999' }
  ];

  const goldRows = goldItems.map(g => `
    <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/5">
      <td class="p-4 font-bold text-slate-900 dark:text-white">${g.purity}</td>
      <td class="p-4 font-mono font-bold text-[#00E676]">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">N/A</td>
      <td class="p-4 font-mono font-semibold text-slate-600 dark:text-[#A8B3C2]">N/A</td>
    </tr>
  `).join('');

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Gold Rates & Bullion Calculator</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Gold Rates in Pakistan — 24K, 22K, 21K Tola & 10 Gram Bullion Calculator
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Indicative gold and silver conversions are calculated when source quotations are available. This page does not represent an official Karachi Sarafa or LBMA fixing.
        </p>
      </div>

      {/* Gold Table */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-50 dark:bg-[#0D1B2A] text-slate-700 dark:text-[#A8B3C2] text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th class="p-4">Asset & Karat Specification</th>
                <th class="p-4">Rate Per Tola (11.66g)</th>
                <th class="p-4">Rate Per 10 Grams</th>
                <th class="p-4">Rate Per Gram</th>
                <th class="p-4">Global Spot (USD/oz)</th>
              </tr>
            </thead>
            <tbody>${goldRows}</tbody>
          </table>
        </div>
      </div>

      {/* Bullion Valuation Methodology */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">24K Tola Formula</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Bullion Weight Conversion</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Rate/Tola = (Spot / 31.1035) &times; USD_PKR &times; 11.664</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            One tola is approximately 11.664 grams. The formula converts a USD-per-troy-ounce reference into a PKR-per-tola equivalent before any local jeweler premium.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">Purity Calculation</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Karat Purity Proportions</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Rate(22K) = Rate(24K) &times; (22 / 24) = 91.67%</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            22K jewelry gold contains 91.67% pure gold alloyed with copper/silver; 21K contains 87.50% gold; 18K contains 75.00% pure gold.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">Cost Transparency</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Making Charges (Mazdoori)</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Total = (Weight &times; Gold Rate) + Mazdoori</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Jeweler fabrication fees vary by product, seller and date. Always ask for the full purchase and potential resale charges before comparing jewelry with bullion.
          </p>
        </div>
      </div>

      {/* Practical Gold Buyer's Guide */}
      <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Practical Investment Example: Purchasing 2.5 Tolas of 22K Jewelry
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
          At a 22K rate of Rs. 260,790/tola: Gold Content Cost = 2.5 &times; 260,790 = Rs. 651,975. If the jeweler charges Rs. 2,500/tola making charges (Rs. 6,250 total), Total Invoice = Rs. 658,225. Upon resale, the jeweler deducts the making charges and tests purity via acid streak or XRF spectrometer. Read our complete guide: <a href="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide" class="text-[#00E676] underline font-semibold">Buying Gold in Pakistan: Complete Investor Guide</a>.
        </p>
        <p class="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
          <strong>Bullion Market Disclaimer:</strong> Gold benchmarks are indicative wholesale rates published by the All Pakistan Sarafa Gems and Jewellers Association (APSGJA) and LBMA feeds. FGC Spot is an analytical publisher, not a bullion dealer or jewelry merchant.
        </p>
      </div>

    </div>
  `;
}

function renderStocksPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Stocks Screener & PSX Terminal</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Pakistan Stock Exchange (PSX KSE-100) & Global Equity Screener
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Screen equities across KSE-100 and 50+ global markets. Analyze valuation multiples, dividend coverage, enterprise multiples, and Piotroski F-Scores.
        </p>
      </div>

      {/* Benchmark Indices Cards */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-1">
          <span class="text-xs font-semibold text-slate-500">PSX KSE-100 Index</span>
          <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
          <span class="text-xs text-slate-500">Awaiting verified quote</span>
        </div>
        <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-1">
          <span class="text-xs font-semibold text-slate-500">KSE-30 Index</span>
          <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
          <span class="text-xs text-slate-500">Awaiting verified quote</span>
        </div>
        <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-1">
          <span class="text-xs font-semibold text-slate-500">S&P 500 (US)</span>
          <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
          <span class="text-xs text-slate-500">Awaiting verified quote</span>
        </div>
        <div class="p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-1">
          <span class="text-xs font-semibold text-slate-500">KSE-100 Avg Div Yield</span>
          <div class="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">N/A</div>
          <span class="text-xs font-bold text-slate-500">Awaiting sourced data</span>
        </div>
      </div>

      {/* Quantitative Screener Framework */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Valuation Multiples</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Price-to-Earnings (P/E)</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">P/E = Market Price per Share / EPS (TTM)</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            P/E compares a stock price with trailing earnings per share. Index-level valuation varies over time and should be checked against a dated exchange publication.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Cash Generation</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Dividend Yield &amp; Payout</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Yield (%) = (Annual DPS / Share Price) &times; 100</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Dividend yields vary by company and reporting period. No current index-wide yield estimate is asserted without a dated source.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Solvency Health</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Piotroski F-Score (0–9)</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">F-Score = &sum; (9 Fundamental Tests)</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Evaluates corporate operational efficiency, leverage, and cash flow quality. Scores &ge; 7 indicate exceptional balance sheet durability.
          </p>
        </div>
      </div>

      {/* PSX Screener Overview */}
      <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Key Sectors & Blue-Chip PSX Equities</h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
          The Pakistan Stock Exchange includes companies from banking, energy, fertilizers, cement, technology and other sectors. Quote availability and delay vary by provider. For current index composition, exchange hours and verified prices, check the <a href="https://www.psx.com.pk/" class="text-[#00E676] underline">Pakistan Stock Exchange</a> directly.
        </p>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
          For an in-depth analytical comparison with the S&P 500, read: <a href="/blog/pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide" class="text-[#00E676] underline font-semibold">PSX KSE-100 Valuation Multiples vs Global Equities</a>.
        </p>
        <p class="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
          <strong>SECP Statutory Disclaimer:</strong> FGC Spot is an independent financial data publishing portal. We are not a registered securities broker or investment advisor under the Securities Act, 2015. Data is published for educational and research transparency only.
        </p>
      </div>

    </div>
  `;
}

function renderCryptoPage() {
  const coins = [
    { name: 'Bitcoin', symbol: 'BTC' },
    { name: 'Ethereum', symbol: 'ETH' },
    { name: 'Binance Coin', symbol: 'BNB' },
    { name: 'Solana', symbol: 'SOL' },
    { name: 'Ripple', symbol: 'XRP' },
    { name: 'Cardano', symbol: 'ADA' },
    { name: 'Dogecoin', symbol: 'DOGE' }
  ];

  const rows = coins.map(c => `
    <tr class="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-white/5">
      <td class="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="font-mono text-[#00E676]">${c.symbol}</span>
        <span class="text-xs text-slate-500 font-normal">(${c.name})</span>
      </td>
      <td class="p-4 font-mono font-bold text-slate-900 dark:text-white">N/A</td>
      <td class="p-4 font-mono font-semibold text-[#00E676]">N/A</td>
      <td class="p-4 font-mono text-xs text-slate-500">Awaiting feed</td>
      <td class="p-4 font-mono text-xs text-slate-600 dark:text-[#A8B3C2]">N/A</td>
      <td class="p-4 font-mono text-xs text-slate-600 dark:text-[#A8B3C2]">N/A</td>
    </tr>
  `).join('');

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Cryptocurrency Terminal</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Cryptocurrency Market Terminal — Top Digital Assets in USD & PKR
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Public digital-asset price, volume and market-cap data is displayed when available from upstream providers. Initial HTML includes no fabricated quotes.
        </p>
      </div>

      {/* Crypto Table */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead class="bg-slate-50 dark:bg-[#0D1B2A] text-slate-700 dark:text-[#A8B3C2] text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th class="p-4">Asset</th>
                <th class="p-4">Price (USD)</th>
                <th class="p-4">Counter-Value (PKR)</th>
                <th class="p-4">24h Net</th>
                <th class="p-4">Market Cap</th>
                <th class="p-4">24h Volume</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>

      {/* Valuation Methodology & Regulatory Notice */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">PKR Parity</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Counter-Value Conversion</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">PKR Parity = Spot (USD) &times; Interbank (USD/PKR)</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Available CoinGecko USD reference quotes can be converted to PKR using the site's public FX reference feed; this is not an official interbank execution rate.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">Regulatory Notice</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Regulatory Status Can Change</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Consult current regulator guidance</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Digital-asset legal treatment and payment restrictions differ by jurisdiction and can change. Consult current financial-regulator guidance before acting. Quotes here are for reference and education.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-full">Asset Security</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Cold Storage Custody</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Hardware Wallets vs Exchanges</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Custodial exchanges present counterparty insolvency risk. Non-custodial hardware wallets ensure private key isolation: <a href="/blog/storing-crypto-safely-exchanges-vs-wallets-guide" class="text-[#00E676] underline font-semibold">Cold Storage Guide</a>.
          </p>
        </div>
      </div>

    </div>
  `;
}

function renderConverterPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Currency Converter</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Currency Converter & Cross-Rate Calculation Engine
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Convert using indicative public foreign-exchange reference rates when available. Your bank or remittance service may offer a different rate and charge fees.
        </p>
      </div>

      {/* Converter Interactive Terminal Shell */}
      <div class="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-[#A8B3C2] uppercase tracking-wider">Amount</label>
            <input type="number" value="1000" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F] text-slate-900 dark:text-white font-mono font-bold" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-[#A8B3C2] uppercase tracking-wider">From Currency</label>
            <div class="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F] text-slate-900 dark:text-white font-mono font-bold">USD - US Dollar</div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-[#A8B3C2] uppercase tracking-wider">To Currency</label>
            <div class="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F] text-slate-900 dark:text-white font-mono font-bold">PKR - Pakistani Rupee</div>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold text-slate-600 dark:text-[#A8B3C2]">Indicative Conversion Value</span>
            <div class="text-2xl sm:text-3xl font-black font-mono text-[#00E676]">N/A</div>
            <span class="text-xs font-mono text-slate-500">Awaiting verified FX reference feed</span>
          </div>
          <a href="/rates" class="px-6 py-2.5 rounded-xl bg-[#00E676] text-[#06111F] font-bold text-xs">
            View All Currency Rates
          </a>
        </div>
      </div>

      {/* Converter Calculation Methodology */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Calculation Engine</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Triangular Cross-Parity</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Conversion = Amount &times; ((USD/To) / (USD/From))</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Converts currencies through a common USD reference base without inserting an arbitrary bank spread; actual executable dealer rates may differ.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Banking Friction</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Taxes &amp; Cross-Border Fees</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Provider charge + applicable taxes</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Retail transactions may involve provider conversion spreads, processing charges and taxes according to current law and customer circumstances.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">Practical Scenario</span>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">$1,000 Inward Conversion</h2>
          <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Gross = $1,000 &times; actual quoted rate</p>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Eligible inward remittances may receive bank-issued e-PRC documentation. Ask the receiving institution about charges, documentation and applicable tax rules.
          </p>
        </div>
      </div>

    </div>
  `;
}

function renderChartsPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Interactive Financial Charts</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Interactive Financial Market Charts & Technical Analysis
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Multi-timeframe candlestick and area charts covering USD/PKR, Gold Bullion, KSE-100 equities, and cryptocurrency benchmark assets.
        </p>
      </div>

      {/* Chart Terminal Overview Card */}
      <div class="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Active Asset</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">USD / PKR — Interbank Spot</div>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold">1D</span>
            <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold">1W</span>
            <span class="px-3 py-1.5 rounded-lg bg-[#00E676] text-[#06111F] font-bold">1M</span>
            <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold">1Y</span>
            <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold">5Y</span>
          </div>
        </div>

        {/* Technical Explanations */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Exponential Moving Averages (EMA)</h3>
            <p class="font-mono text-xs text-slate-700 dark:text-slate-300">EMA_t = (P_t &times; &alpha;) + (EMA_t-1 &times; (1 - &alpha;))</p>
            <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              Track 50-day and 200-day trendlines to determine macroeconomic support zones and long-term currency depreciation velocity.
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Relative Strength Index (RSI)</h3>
            <p class="font-mono text-xs text-slate-700 dark:text-slate-300">RSI = 100 - (100 / (1 + RS))</p>
            <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              14-period momentum oscillator identifying overbought (&gt;70) and oversold (&lt;30) market turning zones.
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Support & Resistance Corridors</h3>
            <p class="font-mono text-xs text-slate-700 dark:text-slate-300">Corridor Range = Period High - Period Low</p>
            <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              Highlights price concentration zones where central bank market liquidity interventions pause or reverse trend momentum.
            </p>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderNewsPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Financial News Wire</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-semibold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          <span>Live Financial Wire</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Real-Time Financial News Wire & Macroeconomic Intelligence
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Real-time syndicated market intelligence covering monetary policy updates, foreign exchange reserve changes, Pakistan Stock Exchange movements, and global commodity trends.
        </p>
      </div>

      {/* Editorial Transparency & Syndication Disclosure Banner */}
      <div class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1 max-w-3xl">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">Syndicated Wire Index</span>
            <span class="text-xs text-slate-500">Fair-Use Headline Aggregation</span>
          </div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">Third-Party News Syndicate Attribution</h2>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Headlines and summaries on this live wire are syndicated from independent external publications (MarketWatch, CNBC, Business Recorder, Profit Pakistan, Cointelegraph) under fair use with full attribution to original publishers. For FGC Spot's original, empirical research articles, explore our research library.
          </p>
        </div>
        <a href="/blog" class="px-5 py-2.5 rounded-xl bg-[#00E676] text-[#06111F] font-bold text-xs shrink-0">
          View Original Research &rarr;
        </a>
      </div>

      {/* Live Wire Real-Time Container */}
      <div class="p-8 rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-center space-y-4">
        <div class="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center mx-auto">
          <span class="w-3 h-3 rounded-full bg-[#00E676] animate-pulse"></span>
        </div>
        <div class="space-y-1 max-w-lg mx-auto">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Connecting to Real-Time Financial Wire</h2>
          <p class="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
            Incoming dispatches, market quotes, and monetary announcements are fetched and verified in real time directly from upstream financial feeds.
          </p>
        </div>
        <div class="pt-2">
          <a href="/blog" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all">
            Explore FGC Spot Research Hub &rarr;
          </a>
        </div>
      </div>

    </div>
  `;
}

function renderBlogIndexPage(articles = []) {
  const articleCards = articles.map(art => `
    <article class="p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-xs hover:border-[#00E676]/40 transition-all">
      <div class="space-y-2">
        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span class="font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full">${escapeHtml(art.category || 'Financial Research')}</span>
          <span>${escapeHtml(art.readTime || '6 min read')}</span>
        </div>
        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          <a href="/blog/${art.slug}" class="hover:text-[#00E676] transition-colors">
            ${escapeHtml(art.title)}
          </a>
        </h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-3">
          ${escapeHtml(art.excerpt || art.summary || '')}
        </p>
      </div>
      <div class="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500">
        <span>By ${escapeHtml(art.author ? art.author.split(',')[0] : 'Sufyan Sindhu')}</span>
        <a href="/blog/${art.slug}" class="font-bold text-[#00E676] hover:underline">Read Article &rarr;</a>
      </div>
    </article>
  `).join('');

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Research & Analytical Guides</span>
      </nav>

      {/* Header */}
      <div class="space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Institutional Market Research & Financial Analysis
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-3xl leading-relaxed">
          Comprehensive, empirical research articles authored by macroeconomic analysts. Covering gold investment strategies, freelance tax regimes, PSX equity multiples, carry trade mechanics, and inflation preservation.
        </p>
      </div>

      {/* Articles Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${articleCards}</div>

    </div>
  `;
}

function renderArticleDetailPage(article, allArticles = []) {
  const related = allArticles
    .filter(a => a.slug !== article.slug)
    .slice(0, 3);

  const relatedHtml = related.map(r => `
    <div class="p-5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
      <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676]">${escapeHtml(r.category || 'Research')}</span>
      <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
        <a href="/blog/${r.slug}" class="hover:text-[#00E676] transition-colors">${escapeHtml(r.title)}</a>
      </h4>
      <p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(r.excerpt || '')}</p>
    </div>
  `).join('');

  const bodyHtml = renderMarkdownContent(article.content || '');
  const sourceLinksHtml = getArticleReferences(article)
    .map(ref => `<li><a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer" class="text-[#00E676] hover:underline font-semibold">${escapeHtml(ref.label)}</a></li>`)
    .join('');

  return `
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <a href="/blog" class="hover:text-[#00E676] transition-colors">Research</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold truncate max-w-xs sm:max-w-md">${escapeHtml(article.title)}</span>
      </nav>

      {/* Article Container */}
      <article class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Article Header */}
        <header class="space-y-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
              ${escapeHtml(article.category || 'Macroeconomic Research')}
            </span>
            <span class="text-xs text-slate-500 font-medium">● Educational analysis</span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            ${escapeHtml(article.title)}
          </h1>

          {/* Author Byline & Date */}
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-[#A8B3C2] pt-2">
            <a href="/author/sufyan-sindhu" class="flex items-center gap-2.5 hover:text-[#00E676] transition-colors">
              <img src="/sufyan-author.jpg" alt="Sufyan Sindhu" class="w-8 h-8 rounded-full object-cover border border-[#00E676]/40" />
              <span class="font-semibold text-slate-900 dark:text-white hover:text-[#00E676]">${escapeHtml((article.author || 'Sufyan Sindhu').split(',')[0])}</span>
            </a>
            <span>•</span>
            <time datetime="${escapeHtml(publishedDateISO(article) || '')}">Published: ${escapeHtml(article.date || (publishedDateISO(article) || '').slice(0, 10))}</time>
            ${article.updated_at ? `<span>•</span><span class="text-[#00E676] font-medium">Updated: ${escapeHtml(article.updated_at.split('T')[0])}</span>` : ''}
            <span>•</span>
            <span>${escapeHtml(article.readTime || '6 min read')}</span>
          </div>
        </header>

        {/* Featured Image */}
        ${article.image || article.coverImage ? `
          <figure class="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
            <img src="${escapeHtml(article.image || article.coverImage)}" alt="${escapeHtml(article.title)}" class="w-full h-auto max-h-96 object-cover" />
            <figcaption class="p-3 text-center text-xs text-slate-500 bg-slate-50 dark:bg-[#06111F]">
              FGC Spot Financial Research Archive • ${escapeHtml(article.title)}
            </figcaption>
          </figure>
        ` : ''}

        {/* Executive Summary Box */}
        ${article.excerpt ? `
          <div class="p-5 sm:p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 space-y-2">
            <strong class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Executive Summary</strong>
            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              ${escapeHtml(article.excerpt)}
            </p>
          </div>
        ` : ''}

        {/* Article Body Content */}
        <div class="text-slate-700 dark:text-[#A8B3C2] text-base leading-relaxed space-y-6">
          ${bodyHtml}
        </div>

        {/* Author Bio Box */}
        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div class="flex items-center gap-4">
            <img src="/sufyan-author.jpg" alt="Sufyan Sindhu" class="w-14 h-14 rounded-2xl object-cover border-2 border-[#00E676]/40 shrink-0" />
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  <a href="/author/sufyan-sindhu" class="hover:text-[#00E676] transition-colors">Sufyan Sindhu</a>
                </h3>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/20">FGC Spot Publisher</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Publisher and Editor at FGC Spot. Author of comprehensive empirical research guides covering Pakistan interbank forex, Karachi Sarafa gold benchmarks, PSX valuation multiples, and freelance export tax regimes.
              </p>
            </div>
          </div>
          <a href="/author/sufyan-sindhu" class="px-4 py-2 bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-bold rounded-xl transition-all shrink-0">
            View Author Profile &rarr;
          </a>
        </div>

        ${sourceLinksHtml ? `
        {/* Topical reading links, not a generic claim of independent verification */}
        <section aria-label="Relevant source documents" class="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-[#0D1B2A]/60 border border-slate-200 dark:border-white/10 space-y-3">
          <h2 class="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Sources &amp; Further Reading</h2>
          <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">These official documents and original research sources provide context for this topic. They do not independently verify every illustrative figure or forecast above. Confirm current rates and rules with the issuing authority.</p>
          <ul class="list-disc pl-5 text-xs leading-relaxed space-y-2">${sourceLinksHtml}</ul>
          <a href="/editorial-policy" class="text-xs text-[#00E676] hover:underline font-semibold">Read our Editorial Policy</a>
        </section>` : ''}

        {/* Related Articles Section */}
        ${relatedHtml ? `
          <div class="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Related Financial Research</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${relatedHtml}</div>
          </div>
        ` : ''}

      </article>

    </div>
  `;
}

function renderAboutPage() {
  return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">About Us</span>
      </nav>

      {/* Main Content Card */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Enterprise & Intelligence</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">About FGC Spot</h1>
          <p class="text-sm text-slate-600 dark:text-[#A8B3C2]">Pakistan's Institutional Financial Information Portal</p>
        </header>

        <div class="space-y-4 text-sm sm:text-base text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
          <p>
            FGC Spot was founded with a singular, unambiguous mission: to eliminate predatory pricing markups, currency exchange obscurity, and information asymmetry across Pakistani and regional financial corridors.
          </p>
          <p>
            FGC Spot helps readers compare currency rates, understand gold valuation formulas, and learn about market concepts. Rates are indicative and depend on publicly available upstream sources.
          </p>

          <h2 class="text-xl font-bold text-slate-900 dark:text-white pt-4">Our Core Pillars</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">Public Data Sources</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2]">Reference data from third-party market feeds, with availability and limitations described.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">Empirical Research</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2]">Original, in-depth macroeconomic guides grounded in statutory central bank policies and mathematical parity.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">Editorial Integrity</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2]">Transparent calculation methods, source attribution, and a public corrections contact.</p>
            </div>
          </div>

          {/* Author Spotlight */}
          <div class="pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Publisher &amp; Editorial Information</h2>
            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <img src="/sufyan-author.jpg" alt="Sufyan Sindhu" class="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E676]/40 shrink-0" />
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900 dark:text-white">Sufyan Sindhu</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/20">Publisher and Editor</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-xl">
                    Publisher and editor of FGC Spot, covering currency markets, gold calculations, equities, and remittances for an international audience.
                  </p>
                </div>
              </div>
              <a href="/author/sufyan-sindhu" class="px-4 py-2 bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-bold rounded-xl transition-all shrink-0">
                View Full Profile &rarr;
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <a href="/editorial-policy" class="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-colors space-y-1 block">
                <span class="font-bold text-xs uppercase tracking-wider text-[#00E676] block">Editorial Policy &rarr;</span>
                <p class="text-xs text-slate-500 dark:text-[#A8B3C2]">Fact-checking standards, primary sources, correction policy, and commercial independence.</p>
              </a>
              <a href="/data-sources" class="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-colors space-y-1 block">
                <span class="font-bold text-xs uppercase tracking-wider text-[#00E676] block">Data Sources &rarr;</span>
                <p class="text-xs text-slate-500 dark:text-[#A8B3C2]">Transparent disclosure of APIs, polling cadences, calculation formulas, and market limitations.</p>
              </a>
              <a href="/disclaimer" class="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-colors space-y-1 block">
                <span class="font-bold text-xs uppercase tracking-wider text-amber-500 block">Risk Disclaimer &rarr;</span>
                <p class="text-xs text-slate-500 dark:text-[#A8B3C2]">Statutory non-advisory notices, volatility warnings, and indicative rate boundaries.</p>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function renderContactPage() {
  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Contact Us</span>
      </nav>

      {/* Main Content Card */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Institutional Desk</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Contact FGC Spot</h1>
          <p class="text-sm text-slate-600 dark:text-[#A8B3C2]">Send questions, corrections, or feedback to the FGC Spot editorial contact.</p>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Direct Email Desk</span>
            <div class="text-lg font-bold text-slate-900 dark:text-white font-mono">fgcspot4@gmail.com</div>
            <p class="text-xs text-slate-500">Guaranteed response within 24-48 business hours.</p>
          </div>
          <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Digital Operations Desk</span>
            <div class="text-base font-bold text-slate-900 dark:text-white">FGC Spot Editorial &amp; Technology Desk</div>
            <p class="text-xs text-slate-500">Digital Publishing &bull; Mon-Fri (09:00 - 18:00 PKT)</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-[#A8B3C2] py-2">
          <a href="/author/sufyan-sindhu" class="hover:text-[#00E676] underline">Author Desk (Sufyan Sindhu)</a>
          <span>•</span>
          <a href="/editorial-policy" class="hover:text-[#00E676] underline">Editorial Policy &amp; Corrections</a>
          <span>•</span>
          <a href="/data-sources" class="hover:text-[#00E676] underline">Data Feeds &amp; Sources</a>
        </div>

        <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Submit an Inquiry or Feedback</h2>
          <form class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Your Name" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1726] text-slate-900 dark:text-white text-xs" />
              <input type="email" placeholder="Your Email Address" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1726] text-slate-900 dark:text-white text-xs" />
            </div>
            <textarea rows="4" placeholder="Your Message, Data Inconsistency Report, or Partnership Inquiry" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A1726] text-slate-900 dark:text-white text-xs"></textarea>
            <button type="button" class="px-6 py-2.5 rounded-xl bg-[#00E676] text-[#06111F] font-bold text-xs">
              Send Message
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

function renderPrivacyPolicyPage() {
  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Privacy Policy</span>
      </nav>

      {/* Main Content Card */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Legal & Compliance</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p class="text-xs text-slate-500">Last updated: November 2026 • Privacy and cookie information</p>
        </header>

        <div class="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">1. Overview & Information Collection</h2>
          <p>
            At FGC Spot (https://www.fgcspot.com), the privacy of our visitors is of paramount importance. This Privacy Policy details the types of personal information that is received and collected by FGC Spot and how it is used. We do not collect personally identifiable information unless voluntarily provided through inquiry forms.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">2. Google AdSense & Cookies</h2>
          <p>
            If Google advertising is enabled in the future, Google and its partners may use cookies to deliver and measure ads. FGC Spot will update its disclosures and consent options when advertising features are enabled.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">3. Log Files & Analytics Telemetry</h2>
          <p>
            FGC Spot uses hosting logs and analytics telemetry to understand site reliability and visitor activity. Depending on the service, records may include IP addresses, browser type, visit times, referring pages, and navigation events. Contact us for privacy questions or data requests.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">4. User Rights & Inquiries</h2>
          <p>
            Users hold the right to inspect, update, or request the deletion of any voluntarily submitted contact information. For privacy concerns or data requests, contact our privacy desk directly at fgcspot4@gmail.com.
          </p>
        </div>
      </div>

    </div>
  `;
}

function renderTermsPage() {
  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Terms of Service</span>
      </nav>

      {/* Main Content Card */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Legal Agreement</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
          <p class="text-xs text-slate-500">Last updated: October 2026</p>
        </header>

        <div class="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and utilizing the market terminals, calculators, and research publications on FGC Spot (https://www.fgcspot.com), you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">2. Use License & Intellectual Property</h2>
          <p>
            All original research articles, computational algorithms, and proprietary software interfaces on FGC Spot are protected under applicable intellectual property laws. Permission is granted to view, share with attribution, and use our tools for non-commercial informational research.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">3. Market Data Limitations & Liability</h2>
          <p>
            While FGC Spot exercises rigorous standards to verify rate accuracy across interbank and Sarafa feeds, all market data is provided "as is" without warranties of completeness or merchantability. In no event shall FGC Spot be liable for any trading losses or commercial decisions resulting from the use of our services.
          </p>
        </div>
      </div>

    </div>
  `;
}

function renderDisclaimerPage() {
  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Financial Disclaimer</span>
      </nav>

      {/* Main Content Card */}
      <div class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-rose-500">Regulatory Disclosure</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Financial Disclaimer</h1>
          <p class="text-xs text-slate-500">SECP &amp; SBP Compliance Notice • Educational &amp; Research Boundaries</p>
        </header>

        <div class="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">1. Educational &amp; Computational Nature</h2>
          <p>
            FGC Spot (https://www.fgcspot.com) operates strictly as a financial information portal, data aggregator, and educational research platform. All tools, currency converters, gold calculators, stock screeners, and research publications are designed to provide mathematical calculations and empirical market transparency.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">2. Statutory Non-Advisory &amp; Non-Broker Status</h2>
          <p>
            FGC Spot is not an investment advisor, broker-dealer, portfolio manager, foreign exchange dealer, or licensed financial intermediary under the regulatory oversight of the Securities and Exchange Commission of Pakistan (SECP) or the State Bank of Pakistan (SBP). None of the materials, calculations, or articles published on this platform constitute individual financial, investment, legal, or tax advice.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">3. Volatility Risks &amp; Real-World Market Boundaries</h2>
          <p>
            Foreign exchange rates, equities, physical bullion and digital assets fluctuate and may involve capital risk. Indicative quotes exclude provider spreads, bank or card charges, applicable taxes, jeweler making charges and local dealer premiums. Check current regulations and final prices independently.
          </p>

          <h2 class="text-base font-bold text-slate-900 dark:text-white">4. Independent Due Diligence &amp; Data Verification</h2>
          <p>
            Users are advised to conduct independent due diligence and consult licensed financial advisors before entering commercial transactions. FGC Spot maintains strict data governance procedures (<a href="/data-sources" class="text-[#00E676] underline">reviewed here</a>) and never utilizes disclaimers to excuse inaccurate data.
          </p>
        </div>
      </div>

    </div>
  `;
}

function renderAuthorPage(articles = []) {
  const articleListHtml = articles.map(art => `
    <article class="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-xs">
      <div class="space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20">
          ${escapeHtml(art.category || 'Financial Research')}
        </span>
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
          <a href="/blog/${art.slug}" class="hover:text-[#00E676] transition-colors">${escapeHtml(art.title)}</a>
        </h3>
        <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-3">
          ${escapeHtml(art.summary || art.excerpt || '')}
        </p>
      </div>
      <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
        <span>${escapeHtml(art.date || 'October 2026')}</span>
        <a href="/blog/${art.slug}" class="font-bold text-[#00E676] hover:underline">Read Guide &rarr;</a>
      </div>
    </article>
  `).join('');

  return `
    <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <a href="/about" class="hover:text-[#00E676] transition-colors">About</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Author Profile: Sufyan Sindhu</span>
      </nav>

      {/* Author Profile Header Card */}
      <section class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
          <img 
            src="/sufyan-author.jpg" 
            alt="Sufyan Sindhu — Publisher and Editor" 
            width="128" 
            height="128" 
            class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-100 dark:border-white/10 shadow-md ring-2 ring-[#00E676]/30"
          />
          <div class="space-y-3 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20">
                Publisher &amp; Editor
              </span>
              <span class="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                ● FGC Spot Publisher
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Sufyan Sindhu
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-3xl">
              Sufyan Sindhu publishes and edits FGC Spot, an independent financial information website. Its educational guides cover currency exchange, gold calculations, equities, and remittance banking; they are not personal investment or tax advice.
            </p>
            <div class="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-[#A8B3C2]">
              <a href="mailto:fgcspot4@gmail.com" class="font-semibold text-[#00E676] hover:underline">
                fgcspot4@gmail.com (Attn: Sufyan Sindhu)
              </a>
              <span>•</span>
              <span>${articles.length} Published Research Guides</span>
              <span>•</span>
              <a href="/editorial-policy" class="hover:text-[#00E676] underline">Editorial Standards &amp; Review Policy</a>
            </div>
          </div>
        </div>

        {/* Areas of Editorial Focus */}
        <div class="space-y-4">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Areas of Editorial Focus &amp; Financial Coverage
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">1. Pakistan Foreign Exchange Corridors</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Interbank wholesale pricing, open market cash spread dynamics, SBP daily weighted closing benchmarks, and USD/PKR triangular parity.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">2. Physical Gold &amp; Bullion Valuation</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Sarafa Bazaar pricing mechanics, 24K vs 22K karat assay testing, tola-to-gram conversions, making charges (mazdoori), and inflation hedging.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">3. Pakistan Stock Exchange (PSX KSE-100)</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Equity multiple compression (P/E), double-digit dividend reinvestment yields (DRIP), corporate balance sheet solvency, and Piotroski F-Scores.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">4. Exporter &amp; Freelance Remittances</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                FBR Section 154A final tax regimes (0.25% vs 1%), SBP 50% foreign currency retention accounts (ESFCA), and electronic e-PRC certificates.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">5. Digital Asset Valuation &amp; Custody</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                Algorithmic PKR counter-value derivation, multi-exchange VWAP indexation, SBP Circular BPRD/2018-03 compliance, and hardware cold storage.
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <h3 class="font-bold text-[#00E676] text-sm">6. Editorial Integrity Statement</h3>
              <p class="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                All research is grounded in primary SBP, FBR, and APSGJA documentation. Zero paid endorsements, token shilling, or hidden promotional links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Published Research Guides */}
      <section class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Published Research Guides (${articles.length})
            </h2>
            <p class="text-xs text-slate-500 dark:text-[#A8B3C2] mt-0.5">
              Comprehensive empirical analyses authored by Sufyan Sindhu on FGC Spot
            </p>
          </div>
          <a href="/blog" class="text-xs text-[#00E676] hover:underline font-bold">
            Browse Full Blog Archive &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${articleListHtml}
        </div>
      </section>

    </div>
  `;
}

function renderEditorialPolicyPage() {
  return `
    <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <a href="/about" class="hover:text-[#00E676] transition-colors">About</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Editorial Policy</span>
      </nav>

      {/* Article Container */}
      <article class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Publishing Ethics &amp; Integrity</span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            FGC Spot Editorial Policy &amp; Standards
          </h1>
          <p class="text-xs text-slate-500">Effective Date: October 2026 • Governs all financial analysis, tools, and publications</p>
        </header>

        <div class="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed space-y-6">
          <p class="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
            FGC Spot is committed to producing accurate, objective, and actionable financial research and data tools. This Editorial Policy defines the mandatory standards governing topic selection, primary source verification, data validation, correction workflows, and commercial independence across our publications.
          </p>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              1. Topic Selection &amp; Financial Utility
            </h2>
            <p>
              We prioritize topics that offer genuine, high-utility value to individuals, businesses, exporters, and investors navigating the Pakistani and global financial ecosystems. Topics are selected based on practical utility, regulatory timeliness (SBP and FBR changes), and market opacity resolution.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              2. Research Methodology &amp; Primary Sources
            </h2>
            <p>
              Our editorial goal is to reference publicly available documents where relevant, including SBP and FBR publications, exchange disclosures, and market-provider methodologies. Readers should verify time-sensitive rules with the issuing authority.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              3. Financial Data Checking &amp; Model Validation
            </h2>
            <p>
              Cross-rate and gold-weight formulas are tested for mathematical accuracy and missing-data handling. FGC Spot does not certify public-provider values against official SBP closing rates. We disclose provider-dependent quote delays, retail making charges and possible transaction fees.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              4. Transparent Corrections &amp; Retractions
            </h2>
            <p>
              If a factual or computational inaccuracy is identified, it is corrected immediately. For substantive changes, a clear correction notice is appended specifying the date, the nature of the error, and corrected figures. Readers can report inaccuracies to <a href="mailto:fgcspot4@gmail.com" class="text-[#00E676] underline font-mono">fgcspot4@gmail.com</a>.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              5. Article Maintenance &amp; Update Cadence
            </h2>
            <p>
              Research articles are reviewed whenever the State Bank of Pakistan updates the policy discount rate or when Federal Budget Finance Acts amend export tax regimes (e.g., Section 154A or Section 236Y). When substantive updates occur, the article displays an updated date stamp alongside its original publication date.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              6. Separation of Original Research vs. Syndicated News
            </h2>
            <p>
              The Research &amp; Analysis Portal (/blog) contains educational articles and commentary published by FGC Spot. The Market News Wire (/news) links to external publishers for the original reporting.
            </p>
          </div>

          <div class="space-y-3">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              7. Commercial Independence &amp; Anti-Paid Shilling
            </h2>
            <p>
              We do not accept paid compensation to review, promote, or endorse cryptocurrency tokens, ICOs, commercial bank products, or jewelry vendors. No commercial advertiser has pre-publication review privileges. Any future sponsored advertising will be labeled clearly as "Sponsored" or "Advertisement".
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Editorial Inquiries &amp; Oversight</h3>
            <p class="text-xs text-slate-600 dark:text-[#A8B3C2]">
              For questions regarding our editorial policy or to submit a correction request, contact our editorial review board at <span class="font-mono text-[#00E676] font-bold">fgcspot4@gmail.com</span>.
            </p>
          </div>
        </div>
      </article>

    </div>
  `;
}

function renderDataSourcesPage() {
  return `
    <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <a href="/" class="hover:text-[#00E676] transition-colors">Home</a>
        <span>/</span>
        <a href="/about" class="hover:text-[#00E676] transition-colors">About</a>
        <span>/</span>
        <span class="text-slate-900 dark:text-white font-semibold">Data Sources &amp; Governance</span>
      </nav>

      {/* Main Content Card */}
      <article class="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <header class="space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00E676]">Data Transparency &amp; Governance</span>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            FGC Spot Market Data Sources &amp; Feeds
          </h1>
          <p class="text-xs text-slate-500">Complete disclosure of data providers, polling intervals, mathematical formulas, and real-world trading limitations</p>
        </header>

        <div class="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
          <p class="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
            Financial transparency begins with data integrity. FGC Spot uses available public market-data endpoints and documented calculations. We distinguish these reference figures from official central-bank publications and executable dealer quotes.
          </p>

          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 dark:text-white">1. Currency Reference Rates (/rates)</h2>
                <span class="text-xs text-[#00E676] font-bold">Indicative FX Data</span>
              </div>
              <p><strong>Providers:</strong> open.er-api.com, FloatRates and public currency API mirrors.</p>
              <p><strong>Update Cadence:</strong> Two-minute fresh cache, with earlier fetched values briefly available while revalidating; upstream timestamps may vary.</p>
              <p><strong>Methodology:</strong> Triangular cross-rate parity through USD anchor: Rate(Base/Quote) = (USD/Quote) / (USD/Base).</p>
              <p><strong>Limitations:</strong> Not official SBP closings or executable interbank quotes. Actual bank spreads, transaction charges and current tax rules vary.</p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 dark:text-white">2. Open-Market Cash Context (/converter)</h2>
                <span class="text-xs text-[#00E676] font-bold">Educational Comparison</span>
              </div>
              <p><strong>Providers:</strong> No direct real-time cash-dealer or ECAP quote integration.</p>
              <p><strong>Update Cadence:</strong> Live retail counter quotes are not collected by this tool.</p>
              <p><strong>Methodology:</strong> Bid-ask spread reflecting dealer cash transport, insurance, security, and customs handling.</p>
              <p><strong>Limitations:</strong> Confirm the cash buy/sell price with a licensed dealer. An e-PRC documents qualifying bank remittances, not a general tax exemption.</p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 dark:text-white">3. Gold &amp; Silver Bullion (/gold)</h2>
                <span class="text-xs text-[#00E676] font-bold">Indicative Spot Conversion</span>
              </div>
              <p><strong>Providers:</strong> Available public commodities feeds and metals reference sources.</p>
              <p><strong>Update Cadence:</strong> Requested as needed with short client caching. No direct APSGJA association fixing is ingested.</p>
              <p><strong>Methodology:</strong> Indicative tola value = (Spot Gold USD / 31.1034768) * USD_PKR * 11.664, with purity ratios for lower karats.</p>
              <p><strong>Limitations:</strong> This is not an official LBMA or Karachi Sarafa retail quote; jewelers may apply market premiums and making charges.</p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 dark:text-white">4. Stock Screener &amp; PSX Terminal (/stocks)</h2>
                <span class="text-xs text-[#00E676] font-bold">Provider-Dependent Timing</span>
              </div>
              <p><strong>Providers:</strong> Market API Proxy (api/stocks.js) &amp; PSX listed company filings.</p>
              <p><strong>Update Cadence:</strong> Quotes are updated according to provider availability and may be delayed or unavailable.</p>
              <p><strong>Methodology:</strong> P/E = Price/EPS, Dividend Yield = DPS/Price, Piotroski F-Score (9-factor fundamental test).</p>
              <p><strong>Limitations:</strong> Confirm current trading prices and company filings with the exchange or official issuer disclosures.</p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 dark:text-white">5. Cryptocurrency Market Index (/crypto)</h2>
                <span class="text-xs text-[#00E676] font-bold">CoinGecko Public Data</span>
              </div>
              <p><strong>Providers:</strong> CoinGecko Public Markets API.</p>
              <p><strong>Update Cadence:</strong> Fetched when needed with two-minute client caching; upstream timestamps vary.</p>
              <p><strong>Methodology:</strong> Indicative PKR Counter-Value = Coin USD Reference * Public USD/PKR FX Reference.</p>
              <p><strong>Limitations:</strong> Not an independently calculated VWAP or an executable offer. Market spreads, network fees and applicable regulations must be checked separately.</p>
            </div>
          </div>
        </div>
      </article>

    </div>
  `;
}

// -------------------------------------------------------------
// CORE PRE-RENDERING ENGINE
// -------------------------------------------------------------

async function prerenderAll() {
  console.log('[prerender] Starting Phase 1 Static Pre-Rendering...');
  
  if (!fs.existsSync(templatePath)) {
    console.error(`[prerender] Base template missing at: ${templatePath}. Run "vite build" first.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  // Load local blog articles
  let articles = [];
  try {
    const blogPostsModule = await import('../src/data/blogPosts.js');
    articles = blogPostsModule.BLOG_POSTS || [];
    console.log(`[prerender] Loaded ${articles.length} in-depth research articles.`);
  } catch (err) {
    console.error('[prerender] Error loading blog posts:', err.message);
  }

  // Define 14 Static Core Routes
  const staticRoutes = [
    {
      route: '/',
      title: 'FGC Spot — Live Forex, Gold & Crypto Terminals',
      description: 'Institutional-grade real-time market rates, live analytics, and financial terminal tracking for Forex, Gold Bullion, and Digital Assets in Pakistan.',
      render: () => renderHomePage()
    },
    {
      route: '/stocks',
      title: 'Global Stock Screener & PSX Equity Terminal | FGC Spot',
      description: 'Investing.com style institutional global stock screener. Filter 50+ countries, KSE-100 equities, P/E compression, Piotroski F-Score, and multi-asset metrics.',
      render: () => renderStocksPage()
    },
    {
      route: '/rates',
      title: 'Live Currency Exchange Rates & Forex Terminal | FGC Spot',
      description: 'Real-time interbank foreign exchange rates, open market cash spreads, and central bank benchmarks for USD, EUR, GBP, SAR, and global currency pairs.',
      render: () => renderRatesPage()
    },
    {
      route: '/crypto',
      title: 'Live Cryptocurrency Market Terminal & Prices | FGC Spot',
      description: 'Real-time cryptocurrency tracking, market capitalizations, 24h volume, and instant PKR counter-values for top digital assets on FGC Spot.',
      render: () => renderCryptoPage()
    },
    {
      route: '/gold',
      title: 'Live Gold & Silver Bullion Rates Terminal | FGC Spot',
      description: 'Real-time spot prices for Gold (XAU) and Silver (XAG) per ounce, gram, and tola in USD and local currencies (PKR) on FGC Spot.',
      render: () => renderGoldPage()
    },
    {
      route: '/charts',
      title: 'Live Interactive Financial Charts & Technical Terminal | FGC Spot',
      description: 'Multi-timeframe technical charts, moving averages, and historical valuation analytics for Forex, Gold, and Crypto assets on FGC Spot.',
      render: () => renderChartsPage()
    },
    {
      route: '/converter',
      title: 'Live Currency Converter & Cross-Rate Matrix | FGC Spot',
      description: 'Calculate indicative conversions using available public FX reference rates. Compare provider charges and actual quotes before transacting.',
      render: () => renderConverterPage()
    },
    {
      route: '/news',
      title: 'Live Financial News Wire — Forex, Crypto & Commodities | FGC Spot',
      description: 'Real-time institutional financial news wire, central bank announcements, macroeconomic events, and market-moving intelligence on FGC Spot.',
      robots: 'noindex, follow',
      render: () => renderNewsPage()
    },
    {
      route: '/blog',
      title: 'Institutional Market Research & Financial Analysis | FGC Spot',
      description: 'In-depth market research, macroeconomic analysis, central bank monetary policy updates, and foreign exchange forecasts for Pakistan and global markets.',
      render: () => renderBlogIndexPage(articles)
    },
    {
      route: '/about',
      title: 'About Us — Institutional Market Analytics | FGC Spot',
      description: 'Learn how FGC Spot provides financial education, public reference-rate tools, source disclosures and original research.',
      render: () => renderAboutPage()
    },
    {
      route: '/contact',
      title: 'Contact Us — Institutional Financial Market Intelligence | FGC Spot',
      description: 'Connect with the FGC Spot institutional markets team, data desk, research team, and developer support for enterprise integrations.',
      render: () => renderContactPage()
    },
    {
      route: '/privacy-policy',
      title: 'Privacy Policy — User Data & Protection Standards | FGC Spot',
      description: 'Review how FGC Spot protects user data, adheres to global privacy standards, and ensures transparent analytics practices.',
      render: () => renderPrivacyPolicyPage()
    },
    {
      route: '/terms',
      title: 'Terms of Service — Platform Usage & Licensing | FGC Spot',
      description: 'Review the official terms of service, platform usage conditions, API licensing agreements, and service guidelines for FGC Spot.',
      render: () => renderTermsPage()
    },
    {
      route: '/disclaimer',
      title: 'Financial Disclaimer — Risk Disclosures & Regulatory Notice | FGC Spot',
      description: 'Read the official FGC Spot financial disclaimer, market data terms, and risk disclosures regarding currency, crypto, and precious metals tracking.',
      render: () => renderDisclaimerPage()
    },
    {
      route: '/author/sufyan-sindhu',
      title: 'Sufyan Sindhu — Publisher & Editor | FGC Spot',
      description: 'Author profile and educational financial guides by Sufyan Sindhu, Publisher and Editor at FGC Spot covering Pakistan forex, gold bullion, PSX equities, and remittance tax regimes.',
      render: () => renderAuthorPage(articles)
    },
    {
      route: '/editorial-policy',
      title: 'Editorial Policy & Fact-Checking Standards | FGC Spot',
      description: 'FGC Spot editorial standards, empirical research methodologies, primary source verification, data check procedures, corrections policy, and independence standards.',
      render: () => renderEditorialPolicyPage()
    },
    {
      route: '/data-sources',
      title: 'Data Sources & Market Feeds Governance | FGC Spot',
      description: 'Detailed transparency regarding FGC Spot market data feeds: upstream providers, refresh frequencies, calculation methodologies, and real-world trading limitations.',
      render: () => renderDataSourcesPage()
    }
  ];

  // Dynamic Blog Article Routes (20 Articles)
  const articleRoutes = articles.map(art => ({
    route: `/blog/${art.slug}`,
    title: `${art.title} | FGC Spot Financial Research`,
    description: art.excerpt || art.summary || 'In-depth macroeconomic analysis and empirical financial research from FGC Spot.',
    article: art,
    render: () => renderArticleDetailPage(art, articles)
  }));

  const allRoutes = [...staticRoutes, ...articleRoutes];
  console.log(`[prerender] Pre-rendering ${allRoutes.length} canonical routes (${staticRoutes.length} static + ${articleRoutes.length} articles)...`);

  let renderedCount = 0;

  for (const item of allRoutes) {
    const canonicalUrl = `${BASE_URL}${item.route === '/' ? '/' : item.route}`;
    const pageHtml = item.render();

    // Assemble complete semantic body inside <div id="root">
    const fullBodyHtml = `
      <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#06111F] dark:text-[#A8B3C2] flex flex-col font-sans selection:bg-[#00E676] selection:text-[#06111F] relative w-full max-w-full overflow-x-hidden transition-colors duration-200">
        ${renderTickerBar()}
        ${renderHeader(item.route)}
        <main class="flex-1 w-full max-w-full mx-auto relative z-10 overflow-x-hidden pt-0">
          ${pageHtml}
        </main>
        ${renderFooter()}
        ${renderCookieBanner()}
      </div>
    `;

    // Generate Route-Specific Schema.org JSON-LD
    let schemaJsonLd = '';
    if (item.article) {
      const art = item.article;
      schemaJsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            'headline': art.title,
            'description': item.description,
            'image': art.image || art.coverImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
            'author': {
              '@type': 'Person',
              'name': art.author ? art.author.split(',')[0].trim() : 'Sufyan Sindhu',
              'jobTitle': 'Publisher & Editor',
              'url': 'https://www.fgcspot.com/author/sufyan-sindhu'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'FGC Spot',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://www.fgcspot.com/logo.png'
              }
            },
            'datePublished': publishedDateISO(art) || TODAY,
            'dateModified': modifiedDateISO(art) || TODAY,
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': canonicalUrl
            }
          },
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://www.fgcspot.com'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Research',
                'item': 'https://www.fgcspot.com/blog'
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': art.title,
                'item': canonicalUrl
              }
            ]
          }
        ]
      });
    } else if (item.route.startsWith('/author/')) {
      schemaJsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Sufyan Sindhu',
        'jobTitle': 'Publisher & Editor',
        'worksFor': {
          '@type': 'Organization',
          'name': 'FGC Spot',
          'url': 'https://www.fgcspot.com'
        },
        'image': 'https://www.fgcspot.com/sufyan-author.jpg',
        'url': canonicalUrl,
        'description': item.description
      });
    } else if (item.route === '/') {
      schemaJsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'FGC Spot',
        'url': BASE_URL,
        'logo': 'https://www.fgcspot.com/logo.png',
        'description': item.description,
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'fgcspot4@gmail.com',
          'contactType': 'customer support'
        }
      });
    }

    // Replace Head Metadata
    let html = baseHtml;

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(item.title)}</title>`);
    html = html.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${escapeHtml(item.title)}" />`);
    
    // Update <meta name="description">
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${escapeHtml(item.description)}" />`);

    // Honor per-route indexation decisions in pre-rendered HTML, before JS runs.
    if (item.robots) {
      html = html.replace(/<meta name="robots" content=".*?" \/>/i, `<meta name="robots" content="${escapeHtml(item.robots)}" />`);
    }

    // Update <link rel="canonical">
    html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);

    // Update OpenGraph
    html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${escapeHtml(item.title)}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${escapeHtml(item.description)}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
    if (item.article) {
      html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="article" />`);
      if (item.article.image || item.article.coverImage) {
        html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${escapeHtml(item.article.image || item.article.coverImage)}" />`);
      }
    }

    // Update Twitter
    html = html.replace(/<meta property="twitter:title" content=".*?" \/>/i, `<meta property="twitter:title" content="${escapeHtml(item.title)}" />`);
    html = html.replace(/<meta property="twitter:description" content=".*?" \/>/i, `<meta property="twitter:description" content="${escapeHtml(item.description)}" />`);
    html = html.replace(/<meta property="twitter:url" content=".*?" \/>/i, `<meta property="twitter:url" content="${escapeHtml(canonicalUrl)}" />`);

    // Inject Article Schema if applicable
    if (schemaJsonLd) {
      html = html.replace('</head>', `  <script type="application/ld+json">\n  ${schemaJsonLd}\n  </script>\n</head>`);
    }

    // Replace <div id="root"></div> with full semantic content
    html = html.replace('<div id="root"></div>', `<div id="root">${fullBodyHtml}</div>`);

    // Determine output file path
    let outFilePath;
    if (item.route === '/') {
      outFilePath = path.join(distDir, 'index.html');
    } else {
      const cleanRoute = item.route.replace(/^\//, '');
      const targetDir = path.join(distDir, cleanRoute);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      outFilePath = path.join(targetDir, 'index.html');
    }

    fs.writeFileSync(outFilePath, html, 'utf8');
    renderedCount++;
  }

  // /admin is intentionally absent from the public canonical route list and sitemap.
  // It still needs a real static entry file: without one, direct navigation or a
  // browser refresh on /admin returns Vercel's 404 before React Router can start.
  // The client replaces this loading shell with the Supabase-protected login UI.
  const adminHtml = baseHtml
    .replace(/<title>.*?<\/title>/i, '<title>Admin Control Portal | FGC Spot</title>')
    .replace(/<meta name="title" content=".*?" \/>/i, '<meta name="title" content="Admin Control Portal | FGC Spot" />')
    .replace(/<meta name="description" content=".*?" \/>/i, '<meta name="description" content="Secure FGC Spot administrator sign-in." />')
    .replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex, nofollow" />')
    .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${BASE_URL}/admin" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${BASE_URL}/admin" />`)
    .replace(/<meta property="twitter:url" content=".*?" \/>/i, `<meta property="twitter:url" content="${BASE_URL}/admin" />`)
    .replace('<div id="root"></div>', '<div id="root"><main role="status" class="min-h-screen bg-[#06111F] text-white flex items-center justify-center"><p>Loading secure FGC Spot admin sign-in...</p></main></div>');
  const adminDir = path.join(distDir, 'admin');
  fs.mkdirSync(adminDir, { recursive: true });
  fs.writeFileSync(path.join(adminDir, 'index.html'), adminHtml, 'utf8');

  // Generate Clean Redirect Aliases and Legacy Article Redirects
  const redirects = [
    { from: 'psx', to: '/stocks' },
    { from: 'equities', to: '/stocks' },
    { from: 'forex', to: '/rates' },
    { from: 'matrix', to: '/converter' },
    { from: 'tools', to: '/converter' },
    { from: 'research', to: '/blog' },
    { from: 'author', to: '/author/sufyan-sindhu' },
    { from: 'author/sufyan-saleem', to: '/author/sufyan-sindhu' },
    { from: 'privacy', to: '/privacy-policy' },
    { from: 'terms-of-service', to: '/terms' },
    // 16 Legacy Articles smoothly redirected to new comprehensive guides
    { from: 'blog/navigating-central-bank-rate-decisions-and-currency-volatility-in-modern-markets', to: '/blog/the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies' },
    { from: 'blog/gold-prices-hold-near-record-highs-as-investors-flock-to-safe-haven-assets-amid-global-economic-shifts', to: '/blog/gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends' },
    { from: 'blog/understanding-the-u-s-dollar-index-dxy-currency-trends-and-global-market-impact', to: '/blog/gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends' },
    { from: 'blog/us-gold-investment-safe-haven-assets-navigating-inflation-and-economic-uncertainty', to: '/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide' },
    { from: 'blog/understanding-crypto-market-cycles-halving-events-liquidity-flows-and-retail-psychology', to: '/blog/storing-crypto-safely-exchanges-vs-wallets-guide' },
    { from: 'blog/the-mechanics-of-carry-trade-how-interest-rate-differentials-drive-fx-volatility', to: '/blog/understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex' },
    { from: 'blog/the-mechanics-of-sovereign-wealth-funds-how-national-capital-drives-global-asset-markets', to: '/blog/pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide' },
    { from: 'blog/the-anatomy-of-liquidity-traps-why-zero-interest-rates-fail-to-stimulate-borrowing', to: '/blog/the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies' },
    { from: 'blog/the-foreign-exchange-reserve-buffer-how-import-cover-shapes-sovereign-stability', to: '/blog/usd-to-pkr-interbank-vs-open-market-guide' },
    { from: 'blog/the-inverse-dynamic-between-gold-prices-and-the-us-dollar-index', to: '/blog/gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends' },
    { from: 'blog/the-mechanics-of-current-account-deficits-why-trade-balances-drive-currency-revaluations', to: '/blog/global-energy-markets-commodity-supercycles-how-crude-oil-brent-vs-wti-shapes-the-world-economy' },
    { from: 'blog/the-mechanics-of-currency-swaps-how-central-banks-provide-offshore-dollar-liquidity', to: '/blog/usd-to-pkr-interbank-vs-open-market-guide' },
    { from: 'blog/sovereign-debt-cycles-and-currency-valuation-how-national-debt-impacts-foreign-exchange', to: '/blog/the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies' },
    { from: 'blog/understanding-central-bank-interest-rates-how-the-federal-reserve-impacts-global-currencies', to: '/blog/the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies' },
    { from: 'blog/decoding-the-sovereign-yield-curve-what-inversions-signal-to-global-markets', to: '/blog/the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies' },
    { from: 'blog/navigating-gold-and-currency-volatility-in-pakistan-why-safe-haven-assets-remain-in-high-demand', to: '/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide' }
  ];

  for (const r of redirects) {
    const dir = path.join(distDir, r.from);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${r.to}...</title>
  <meta http-equiv="refresh" content="0; url=${r.to}">
  <link rel="canonical" href="${BASE_URL}${r.to}">
  <meta name="robots" content="noindex, follow">
</head>
<body>
  <p>Redirecting to <a href="${r.to}">${r.to}</a>...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml, 'utf8');
  }

  // Pre-render static 404.html for Vercel and direct error responses
  const notFoundHtml = baseHtml
    .replace(/<title>.*?<\/title>/i, '<title>404 — Page Not Found | FGC Spot Financial Terminal</title>')
    .replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex, follow" />')
    .replace('<div id="root"></div>', `<div id="root">
      <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#06111F] dark:text-[#A8B3C2] flex flex-col font-sans">
        ${renderTickerBar()}
        ${renderHeader('/404')}
        <main class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">HTTP 404 — Terminal Resource Not Found</div>
          <h1 class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">Page Not Located</h1>
          <p class="text-sm text-slate-600 dark:text-[#A8B3C2] max-w-md mx-auto">The requested financial terminal endpoint or research guide could not be located.</p>
          <div class="pt-4"><a href="/" class="px-5 py-2.5 rounded-xl bg-[#00E676] text-slate-950 font-bold hover:bg-[#00c865] text-sm">&larr; Return to Terminal Home</a></div>
        </main>
        ${renderFooter()}
      </div>
    </div>`);
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');

  console.log(`[prerender] SUCCESS! Pre-rendered ${renderedCount} canonical pages + ${redirects.length} redirect aliases + 404.html.`);
}

prerenderAll().catch(err => {
  console.error('[prerender] Fatal error during pre-rendering:', err);
  process.exit(1);
});
