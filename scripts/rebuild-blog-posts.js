import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PURGE_SLUGS = new Set([
  'understanding-crypto-market-cycles-halving-events-liquidity-flows-and-retail-psychology',
  'the-mechanics-of-carry-trade-how-interest-rate-differentials-drive-fx-volatility',
  'the-mechanics-of-sovereign-wealth-funds-how-national-capital-drives-global-asset-markets',
  'the-anatomy-of-liquidity-traps-why-zero-interest-rates-fail-to-stimulate-borrowing',
  'the-foreign-exchange-reserve-buffer-how-import-cover-shapes-sovereign-stability',
  'the-inverse-dynamic-between-gold-prices-and-the-us-dollar-index',
  'the-mechanics-of-current-account-deficits-why-trade-balances-drive-currency-revaluations',
  'the-mechanics-of-currency-swaps-how-central-banks-provide-offshore-dollar-liquidity',
  'sovereign-debt-cycles-and-currency-valuation-how-national-debt-impacts-foreign-exchange',
  'understanding-central-bank-interest-rates-how-the-federal-reserve-impacts-global-currencies',
  'decoding-the-sovereign-yield-curve-what-inversions-signal-to-global-markets'
]);

async function run() {
  const blogModule = await import('../src/data/blogPosts.js');
  const existingPosts = blogModule.BLOG_POSTS || [];

  console.log(`Starting with ${existingPosts.length} posts.`);

  // Filter out purged posts
  const filtered = existingPosts.filter(p => !PURGE_SLUGS.has(p.slug));
  console.log(`Filtered down to ${filtered.length} posts.`);

  // Format and upgrade remaining posts
  const upgraded = filtered.map(p => {
    let slug = p.slug;
    let title = p.title;

    if (slug === 'buying-gold-in-pakistan-tola-vs-gram-24k-vs-22k-and-how-jewelers-calculate-katt') {
      slug = 'buying-gold-in-pakistan-tola-karat-making-charges-guide';
      title = 'Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates';
    } else if (slug === 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-and-s-p-500-allocation-mechanics') {
      slug = 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide';
      title = 'Pakistan Stock Exchange (PSX) vs Global Equities: KSE-100 Valuation Multiples, Dividend Yields, and S&P 500 Comparison Guide';
    }

    return {
      ...p,
      slug,
      title,
      author: 'Sufyan Saleem, Lead Financial Analyst & Macro Strategist',
      date: p.date || 'October 24, 2026',
      created_at: p.created_at || '2026-10-24T12:00:00Z',
      updated_at: '2026-10-25T10:00:00Z',
      likes: p.likes || 142
    };
  });

  // Flagship freelance remittances guide
  const freelancePost = {
    id: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
    slug: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
    title: 'Freelance Remittances & Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Retention Accounts Explained',
    category: 'Banking & Remittances',
    author: 'Sufyan Saleem, Lead Financial Analyst & Macro Strategist',
    readTime: '6 min read',
    date: 'October 24, 2026',
    created_at: '2026-10-24T12:00:00Z',
    updated_at: '2026-10-25T10:00:00Z',
    likes: 189,
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    summary: 'Comprehensive roadmap for Pakistani software exporters and digital freelancers: opening 50% retention foreign currency accounts, e-PRC issuance, PSEB tax exemptions (0.25% final tax), and avoiding interbank conversion spreads.',
    excerpt: 'Comprehensive roadmap for Pakistani software exporters and digital freelancers: opening 50% retention foreign currency accounts, e-PRC issuance, PSEB tax exemptions (0.25% final tax), and avoiding interbank conversion spreads.',
    tags: ['Freelance Banking', 'FBR Tax', 'PSEB', 'Remittances', 'Forex', 'Retention Account', 'e-PRC'],
    content: `For Pakistani freelancers, IT exporters, and digital service providers, bringing foreign earnings into the country has historically been fraught with bureaucratic confusion, currency conversion losses, and tax anxiety. 

With the State Bank of Pakistan (SBP) and Federal Board of Revenue (FBR) implementing revised regulatory frameworks for IT exporters and remote workers, understanding how to legally minimize taxes and retain hard currency is essential for financial longevity.

This authoritative guide breaks down the banking mechanics, tax exemptions, and foreign currency accounts available to Pakistani digital exporters under current legislation.

---

### 1. The 50% Exporter Foreign Currency Retention Account

One of the most powerful yet underutilized facilities introduced by the State Bank of Pakistan is the **Special Foreign Currency Retention Account** (FE Circular No. 01 of 2023).

Under this policy:
- Authorized Dealer banks are mandated to allow IT exporters, digital agencies, and individual freelancers registered with the Pakistan Software Export Board (PSEB) or Pakistan Freelancers Association (PAFLA) to **retain up to 50% of their gross foreign exchange export proceeds** in a foreign currency account (USD, EUR, GBP).
- The retained 50% balance does **not** need to be converted to Pakistani Rupees (PKR) upon receipt.
- Freelancers can legally hold these funds in hard currency to hedge against PKR depreciation and make outbound business payments (e.g., AWS cloud hosting, software licenses, advertising fees, hardware procurement) without paying outward remittance taxes or interbank card conversion premiums (which often exceed 5% to 7%).

#### How to Open an Exporter Retention Account:
1. Maintain an active PKR business or personal freelancer account with any top tier commercial bank (e.g., Meezan, HBL, Bank Alfalah, Habib Metro, Standard Chartered).
2. Request your bank branch to open an attached **Exporters Special Foreign Currency Account (ESFCA)** linked to your primary account.
3. Provide your PSEB registration certificate, active NTN, and sample service contracts or Upwork/Fiverr invoices.
4. Establish standing instructions so that upon every incoming wire transfer or SWIFT transaction, 50% is credited to your USD account and 50% is converted to PKR.

---

### 2. Electronic Proceeds Realization Certificate (e-PRC)

Every single dollar brought into Pakistan through legitimate banking channels must be backed by a **Proceeds Realization Certificate (PRC)** or Electronic PRC (e-PRC).

- **What is an e-PRC?** It is an official bank document certifying that foreign currency was received from abroad via banking channels under designated SBP export purpose codes (typically Code 9110 for Computer Software Services or 9111 for IT-Enabled Services).
- **Why is it critical?** The FBR strictly disallows freelance tax exemptions or concessional withholding tax rates without matching e-PRC verification numbers. If you transfer money via peer-to-peer (P2P) crypto or unverified informal exchange services, you forfeit your e-PRC, rendering your income vulnerable to being categorized as unexplained local credits subject to standard personal income tax rates up to 35%.

**Best Practice:** Download and archive the e-PRC from your bank's portal for every single inbound remittance. Most major banks now issue digital e-PRCs within 24 to 48 hours of credit.

---

### 3. FBR Tax Regimes: Section 154A Explained

The Income Tax Ordinance 2001 provides a concessional final tax regime for export of computer software or IT-enabled services under **Section 154A**:

| Category | PSEB Registered Status | Tax Rate (Final) | FBR Filing Requirement |
| :--- | :--- | :--- | :--- |
| **IT Exporter / Freelancer** | **Registered with PSEB** | **0.25%** | Annual Income Tax Return & Wealth Statement |
| **IT Exporter / Freelancer** | **Not Registered with PSEB** | **1.00%** | Annual Income Tax Return & Wealth Statement |
| **Non-Filer / Unverified** | Unregistered | Standard Progressive (up to 35%) + Penalty | Audit Notice Risk |

#### Key Requirements to Qualify for the 0.25% Concessional Rate:
1. **PSEB Registration:** You must hold a valid, active registration with the Pakistan Software Export Board. Freelancers pay a nominal annual fee (starting around PKR 5,000 to PKR 10,000 depending on category).
2. **Sales Tax Return (if applicable):** File provincial sales tax returns (PRA, SRB, KPRA, or BRA) or claim software export zero-rating exemptions.
3. **SBP Purpose Codes:** Inward remittances must be received with purpose code 9110/9111.
4. **Timely FBR Filing:** File your annual income tax return on or before the statutory deadline (September 30th unless officially extended).

If all conditions are satisfied, the 0.25% tax deducted at source by your bank serves as a **Final Tax Discharge**, meaning no further tax audit or additional slab liability can be levied on that export turnover.

---

### 4. Avoiding Hidden Conversion Spreads & Wire Intermediaries

Freelancers often lose 2% to 4% of their gross earnings through hidden FX spreads when receiving international transfers. Here is how leading platforms compare:

1. **Direct SWIFT Wire to Bank (Best for high volumes > $2,000):**
   - Transferred directly from client or corporate treasury.
   - SBP interbank rates applied on conversion date.
   - Requires your IBAN and bank SWIFT BIC. Lowest percentage loss for sums above $2,500.

2. **Digital Multi-Currency Wallets (Elevate, Wise, Payoneer):**
   - **Elevate Pay:** Provides a US FDIC-insured depository account with routing number. Allows direct local transfers to Pakistani banks via SBP Raast or 1Link at transparent mid-market spreads.
   - **Payoneer:** Widely integrated with Upwork and Fiverr. Transfers directly into Pakistani bank accounts in PKR within minutes. Watch out for the 1.5% to 2% withdrawal spread.

3. **Sadapay Biz / Nayapay Digital Freelancer Tiers:**
   - Great for micro-freelancers receiving payments via credit card payment links or direct client invoices.
   - Inward remittances automatically generate SBP e-PRCs directly in the mobile app.

---

### 5. Annual Filing Checklist for Freelancers

When filing your annual return on the FBR Iris portal:
- Report total gross receipts under **Final / Fixed / Minimum Tax > Section 154A**.
- Enter the matching withholding tax deducted by your commercial bank (matching your annual tax deduction certificate).
- Reconcile inward remittances with your bank statement and SBP e-PRC totals.
- Accurately account for retained foreign currency in your Wealth Statement (Form 116) at the closing SBP interbank exchange rate as of June 30th.

By structuring your freelance banking with an Exporters Special Foreign Currency Account, maintaining PSEB certification, and securing digital e-PRCs, you preserve maximum capital, protect purchasing power against devaluation, and establish 100% compliant financial standing.`
  };

  // Check if freelance post already in list
  const existingFreelanceIndex = upgraded.findIndex(p => p.slug === freelancePost.slug);
  if (existingFreelanceIndex >= 0) {
    upgraded[existingFreelanceIndex] = freelancePost;
  } else {
    upgraded.unshift(freelancePost);
  }

  console.log(`Final upgraded posts count: ${upgraded.length}`);

  // Write to src/data/blogPosts.js
  const fileContent = `/**
 * FGC Spot Analytical Blog & Research Post Database
 * Authoritative, high-utility financial guides covering Forex, Gold Bullion, Equities, and Remittances.
 * Maintained by Sufyan Saleem, Lead Financial Analyst & Macro Strategist.
 */

export const BLOG_POSTS = ${JSON.stringify(upgraded, null, 2)};

export default BLOG_POSTS;
`;

  const targetPath = path.join(rootDir, 'src', 'data', 'blogPosts.js');
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`Successfully written to ${targetPath}`);
}

run().catch(console.error);
