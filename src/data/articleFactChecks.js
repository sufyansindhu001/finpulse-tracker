/**
 * Reviewed corrections to legacy financial guides. These replace fabricated
 * precision with verifiable methodology, dated primary sources, or explicitly
 * hypothetical examples. This module never changes owner-created posts.
 * Keep transformations guarded: a changed legacy draft should fail loudly in
 * tests rather than silently publishing an incomplete fact check.
 */

function replaceExact(content, before, after) {
  if (!content.includes(before)) throw new Error(`Editorial source text missing: ${before.slice(0, 110)}`);
  return content.replace(before, after);
}

function replaceSection(content, start, end, replacement) {
  const first = content.indexOf(start);
  if (first === -1) throw new Error(`Editorial section missing: ${start}`);
  const last = content.indexOf(end, first + start.length);
  if (last === -1) throw new Error(`Editorial section boundary missing: ${end}`);
  return `${content.slice(0, first)}${replacement.trim()}\n\n---\n\n${content.slice(last)}`;
}

const corrections = {
  'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained': content => {
    content = replaceExact(content,
      'understanding how to legally minimize taxes and retain hard currency is essential for financial longevity.',
      'understanding applicable taxes, required records and permitted foreign-currency retention is important for financial planning.');
    content = replaceExact(content,
      'This authoritative guide breaks down the banking mechanics, tax exemptions, and foreign currency accounts available to Pakistani digital exporters under current legislation.',
      'This guide explains banking procedures, conditional tax concessions and foreign-currency retention options for Pakistani digital exporters. Requirements and service-provider fees may change.');
    content = replaceExact(content,
      'without paying outward remittance taxes or interbank card conversion premiums (which often exceed 5% to 7%).',
      'subject to bank documentation, applicable taxes, provider charges and any required foreign-exchange conversion.');
    content = replaceExact(content,
      'Most major banks now issue digital e-PRCs within 24 to 48 hours of credit.',
      'e-PRC issuance time and availability depend on the bank, receipt classification and applicable SBP process.');
    content = replaceExact(content,
      'Subject to the applicable legislation and every qualifying condition being met, certain export receipts may receive final-tax treatment under Section 154A. This does **not** eliminate recordkeeping obligations or prevent the tax authority from checking the facts and documents.',
      'The [FBR Finance Act 2026 salient features](https://www.fbr.gov.pk/Budget2026-27/SalientFeatures/Salient-Feature.pdf) confirm that the **0.25% concession for IT and IT-enabled service exporters continues through Tax Year 2029**. This is a conditional concessional tax **rate, not a tax exemption**. The alternative 1% rate and whether tax is final depend on the actual export category and requirements under Section 154A. Confirm the current [FBR withholding rate card](https://www.fbr.gov.pk/withholding-taxes-rate-card/174298/174301), registration, filings and supporting receipts; tax officials may still review records.');
    content = replaceExact(content,
      'Freelancers often lose 2% to 4% of their gross earnings through hidden FX spreads when receiving international transfers. Here is how leading platforms compare:',
      'Cross-border receipts can carry bank charges, intermediary deductions and exchange-rate spreads that differ by provider and transaction. Compare written quotes and applicable fees before choosing a route:');
    content = replaceExact(content,
      'SBP interbank rates applied on conversion date.',
      'The receiving bank sets its applicable conversion quote and fees; compare these with public reference rates.');
    content = replaceExact(content,
      'Requires your IBAN and bank SWIFT BIC. Lowest percentage loss for sums above $2,500.',
      'Requires account and SWIFT details. The total cost depends on the sender, intermediary banks and recipient bank.');
    content = replaceExact(content,
      'Transfers directly into Pakistani bank accounts in PKR within minutes. Watch out for the 1.5% to 2% withdrawal spread.',
      'May offer transfers to eligible Pakistani accounts; check the current delivery estimate, FX quote and transaction fees before confirming.');
    content = replaceExact(content,
      'Inward remittances automatically generate SBP e-PRCs directly in the mobile app.',
      'Confirm service availability, receipt categorization and whether the bank can issue the documentary evidence you require.');
    content = replaceExact(content,
      '| **e-PRC Document Protection** | **100% SBP Authenticated** | 100% SBP Authenticated | **Zero (Unexplained Cash Credit)** |',
      '| **Receipt documentation** | Bank-issued e-PRC when applicable | Bank-issued e-PRC when applicable | A P2P receipt does not itself create a bank-issued e-PRC |');
    content = replaceExact(content,
      'By maintaining active registration with the Pakistan Software Export Board, the consultant saves **PKR 126,000 in immediate taxes** every single year compared to an unregistered filer, while shielding $30,000 in USD reserves against local rupee currency devaluation.',
      'In this **hypothetical example** at PKR 280 per USD, a 0.25% versus 1% deduction on PKR 16.8 million of otherwise eligible receipts differs by **PKR 126,000**. This is not a guaranteed annual tax saving. Eligibility, bank processing, applicable rules and actual exchange rates determine the outcome. Foreign-currency balances remain subject to their own risks and restrictions.');
    return content;
  },
  'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide': content => {
    content = replaceExact(content,
      'routinely trade at forward P/E multiples ranging between **20x and 28x**',
      'may trade at higher forward P/E multiples than emerging-market peers, depending on the measurement date');
    content = replaceExact(content,
      'frequently trade at deeply discounted historical P/E multiples between **4.5x and 6.5x**, accompanied by annual cash dividend yields reaching **10% to 16%** among mature blue-chip companies',
      'can trade at lower earnings multiples than some developed-market peers; actual P/E ratios and dividend yields change with prices, earnings and distribution announcements');
    content = replaceExact(content,
      'Because the KSE-100 trades at deep valuation compression, reinvesting high cash dividends (DRIP) compounds wealth far faster than relying purely on capital appreciation.',
      'Dividend reinvestment may compound the number of shares owned, but outcomes depend on actual payouts, prices, taxes and trading costs. The following calculation is **illustrative, not a PSX return forecast**.');
    content = replaceSection(content,
      '### Institutional Valuation Matrix: KSE-100 vs S&P 500',
      '### Mathematical Compounding Model: Dividend Reinvestment (DRIP) vs Price Return',
      `### Comparison Method: KSE-100 vs S&P 500

| Comparative Dimension | KSE-100 (Pakistan) | S&P 500 (United States) | Verification |
| :--- | :--- | :--- | :--- |
| **Index methodology** | PSX publishes a total-return KSE-100 and separate KSE100PR price-return variant | The familiar S&P 500 headline index is generally price-return; total-return variants also exist | Check each index provider's methodology before comparing historical returns |
| **Valuation (P/E)** | Varies with current index earnings, share prices and index composition | Also changes daily and differs for trailing vs forward earnings | Record the date, P/E definition and primary data source |
| **Dividend yield** | Company distributions vary by year and are not guaranteed | Dividend payout and buybacks differ among constituents | Calculate actual trailing distributions against the matching index price |
| **Currency exposure** | PKR exposure for a USD-based investor | USD exposure for a PKR-based investor | Include realized FX moves and conversion fees |
| **Sector composition** | Banking, energy, fertilizer and other businesses have changing weights | Technology, finance, healthcare and other sectors have changing weights | Use current published index constituent weights, not fixed percentages |

**Primary methodology:** [Pakistan Stock Exchange KSE-100 & KSE100PR](https://www.psx.com.pk/psx/product-and-services/indices/kse-100-index). A total-return benchmark includes dividend adjustments in its index calculation; it does not mean shareholders automatically receive additional shares.\n`);
    content = replaceSection(content,
      '### Mathematical Compounding Model: Dividend Reinvestment (DRIP) vs Price Return',
      '### Frequently Asked Questions (FAQ)',
      `### Mathematical Compounding Model: A Clearly Hypothetical Example

Suppose a portfolio begins at **PKR 1,000,000**, its market price stays unchanged for five years, and the investor receives a **hypothetical 12% cash dividend yield every year**, with immediate reinvestment at the same price and no taxes, dealing fees or dividends cuts. These assumptions are intentionally simplified and do not describe a real company or index.

| Scenario | Calculation | End-of-year-five combined value |
| :--- | :--- | ---: |
| Collect dividends as cash | PKR 1,000,000 + (PKR 120,000 × 5) | **PKR 1,600,000** |
| Reinvest dividends | PKR 1,000,000 × (1.12)^5 | **Approximately PKR 1,762,342** |

In this *flat-price illustration*, reinvestment adds around **PKR 162,342** through compounding. Actual dividend yields, ex-dividend share prices, taxation and exchange rates may change the result substantially.

For cross-currency comparisons, calculate the FX-adjusted return as **(1 + local-currency return) × (1 + currency return) − 1**, with currency return defined from the foreign investor's perspective.

Screen current company disclosures on the [FGC Spot Equities Screener](/stocks).\n`);
    content = replaceExact(content,
      '#### Why is the KSE-100 P/E ratio historically lower than 6x while the S&P 500 trades above 22x?',
      '#### Why can KSE-100 valuations differ from S&P 500 valuations?');
    content = replaceExact(content,
      'guarantees 100% full repatriation of capital gains and dividend proceeds back into foreign currency accounts without requiring prior regulatory permissions',
      'provides a regulated route for eligible RDA investment proceeds to be repatriated, subject to the applicable account and bank procedures');
    content = replaceExact(content,
      'For active tax filers on the FBR Active Taxpayer List (ATL), cash dividends from listed companies are subject to a 15% final withholding tax deducted directly by the CDC. Capital gains tax (CGT) is computed and collected automatically by the National Clearing Company of Pakistan Limited (NCCPL) based on holding periods. Non-filers face punitive withholding rates up to 30%.',
      'Dividend withholding and capital-gains rules depend on the current Finance Act, asset type, acquisition date and taxpayer status. Confirm the current rates with the [FBR](https://www.fbr.gov.pk/) and NCCPL rather than relying on an undated percentage.');
    return content;
  },

  'forex-risk-management-why-most-retail-traders-blow-up-accounts-and-how-to-prevent-it': content => {
    content = replaceSection(content,
      '### The Mathematical Reality of Portfolio Drawdowns',
      '### Mathematical Position Sizing Formula & Risk Ceiling',
      `### The Mathematical Reality of Portfolio Drawdowns

The recovery percentage is a mathematical identity: **gain required = loss / (1 − loss)**. No trustworthy universal "probability of account survival" can be assigned from drawdown alone; it depends on strategy, funding and future outcomes.

| Drawdown | Balance remaining from $10,000 | Gain required to regain $10,000 |
| :--- | ---: | ---: |
| **10%** | $9,000 | **11.1%** |
| **20%** | $8,000 | **25.0%** |
| **30%** | $7,000 | **42.9%** |
| **50%** | $5,000 | **100.0%** |
| **75%** | $2,500 | **300.0%** |
| **90%** | $1,000 | **900.0%** |

These values say nothing about the chance a trader will recover a loss.\n`);
    content = replaceExact(content,
      'To ensure your account never experiences an unrecoverable drawdown, every trade must be sized using this strict mathematical formula:',
      'Position sizing limits planned risk but cannot guarantee a maximum loss during gaps, slippage or broker failure. A basic sizing formula is:');
    content = replaceExact(content,
      'Position Size = $50 / (25 pips * $10) = 0.20 Mini Lots (0.02 Standard Lots)',
      'Position Size = $50 / (25 pips * $10 per standard lot) = 0.20 Standard Lots (2.0 Mini Lots)');
    content = replaceExact(content,
      'If the trade hits the stop loss, the account loses exactly **$50**, leaving **$4,950 (99% of equity)** intact.',
      'If the trade fills at the planned stop level with no slippage, fees or spread changes, the modeled loss is **$50** and the remaining equity is **$4,950**. Actual execution can be worse.');
    content = replaceExact(content,
      'Adhering to this threshold mathematically eliminates the threat of ruin during unavoidable statistical losing streaks.',
      'This rule reduces the impact of each planned loss, but cannot eliminate loss of capital, gap risk or sequences of losing trades.');
    content = replaceExact(content,
      'the only mathematical shield against retail account insolvency',
      'useful safeguards, not guarantees against insolvency');
    content = replaceExact(content,
      'That means you enter with a 0.12 mini lot—not a penny more.',
      'For a USD-quoted major FX pair at approximately $10 per pip per standard lot, that is **0.12 standard lots (1.2 mini lots)**, before accounting for the instrument-specific pip value and fees.');
    return content;
  },

  'understanding-roshan-digital-account-rda-naya-pakistan-certificates-repatriation-rules-tax-shields': content => {
    content = replaceExact(content,
      '* **Historic Yield Range:** Typically 7.00% to 9.00% annualized depending on tenor.',
      '* **Profit Rate:** Consult the SBP rate schedule applicable on the certificate issue date; historical quotes are not current offers.');
    content = replaceExact(content,
      '* **Historic Yield Range:** Typically 15.00% to 21.00% annualized, moving alongside domestic central bank benchmark rates.',
      '* **Profit Rate:** Consult the dated PKR NPC schedule. A higher nominal rate does not imply a higher USD-adjusted return.');
    content = replaceExact(content,
      '* **Risk Profile:** Zero currency risk. The principal and profit are returned in pure US Dollars.',
      '* **Risk Profile:** USD denomination removes direct PKR denomination from the certificate, but issuer/sovereign, settlement and USD purchasing-power risks remain.');
    content = replaceExact(content,
      '* **Unrestricted Inflows and Outflows:** Funds transferred into an RDA, along with any net profits earned from NPCs, the Pakistan Stock Exchange, or approved mutual funds, are **100% freely repatriable**.',
      '* **Eligible Repatriation:** Qualifying RDA principal and proceeds can generally be repatriated using the bank process specified by the SBP framework. Product settlement and documentation conditions still matter.');
    content = replaceExact(content,
      '* **Zero Regulatory Pre-Approvals:** You do not need central bank approval or physical NOC letters to wire your original principal and capital gains back to your overseas bank account. Transfers are initiated directly via online mobile banking.',
      '* **Regulatory Process:** Eligible RDA repatriation is normally available without case-specific prior SBP approval; verify the originating bank\'s online and documentation procedures.');
    content = replaceExact(content,
      '* **No Local Municipal Levies:** RDA balances and sovereign certificate investments are fully exempt from local wealth taxes and automated zakat deductions at source (upon submission of declaration).',
      '* **Other Obligations:** SBP notes that compulsory Zakat deduction is not applicable to RDA under the cited Zakat rules. This is separate from any other tax or disclosure requirements that may apply to the investor.');
    content = replaceSection(content,
      '### Naya Pakistan Certificates (NPC) Tenor & Indicative Rate Comparison',
      '### Statutory Repatriation Guarantee: SBP FE Circular No. 04 of 2020',
      `### Naya Pakistan Certificates: Compare Official Rates by Issue Date

NPC profit rates depend on **currency, tenor, issue date and conventional versus Islamic structure**. Repeating a fixed percentage table without its effective date can mislead investors when SBP changes the schedule.

| Check before purchase | Official information to use |
| :--- | :--- |
| **Available currencies and tenors** | Review the current NPC offering and the chosen bank's investment screen |
| **Gross annual rate** | [SBP Naya Pakistan Certificate page](https://www.sbp.org.pk/our-operations/naya-pakistan-certificate) and relevant dated circular |
| **Effective date** | In 2026, SBP announced updated schedules with different commencement dates for different currencies; verify the rate valid for your issuance |
| **Islamic certificates** | Actual profit follows the declared Shariah-compliant profit-sharing arrangement, not an assumed guaranteed conventional rate |
| **Tax** | SBP's RDA FAQ says **10% at source on NPC profit**, generally full and final for eligible investors; other income may have separate obligations |

**Official rules:** [SBP Roshan Digital Account FAQ](https://www.sbp.org.pk/faqs/faqs-roshan-digital-account). Foreign-currency certificates avoid direct PKR-denominated principal exposure but still have sovereign, bank-operational, purchasing-power and conversion risks.\n`);
    content = replaceExact(content,
      'By combining sovereign-backed yields, automated full-and-final tax deductions, and unrestricted international repatriation, RDA provides genuine institutional security for your long-term capital.',
      'RDA can provide regulated access to Pakistani investments and eligible repatriation pathways. Returns, documentation, tax treatment and banking risks must still be reviewed for the particular investor and product.');
    content = replaceExact(content,
      'Under Section 152 of the Income Tax Ordinance 2001, withholding tax deducted at source on NPC profit certificates is a **Full and Final Tax Discharge**, exempting overseas investors from filing annual FBR tax returns or wealth declarations.',
      'The [SBP RDA FAQ](https://www.sbp.org.pk/faqs/faqs-roshan-digital-account) describes **10% tax deducted at source on NPC profit** as full and final for eligible holders, with no return required *in respect of that NPC profit*. It does **not** mean unrelated income, property or reporting obligations are automatically waived.');
    content = replaceExact(content,
      'Yes. SBP regulations guarantee 100% full and unencumbered repatriation of both principal capital and accrued profit from Roshan Digital Accounts back to the originating foreign account through online banking with zero regulatory clearance hurdles.',
      'Eligible RDA principal and investment proceeds can generally be repatriated under the SBP framework without case-by-case prior SBP approval, using the relevant bank process. Check current account terms, remittance documentation and any investment-specific settlement conditions.');
    content = replaceExact(content,
      'No. Under Section 152 of the Income Tax Ordinance 2001, withholding tax deducted on profit from Naya Pakistan Certificates is a full and final tax discharge. Overseas investors holding only RDA and NPC investments are completely exempt from filing an annual FBR return.',
      'According to the SBP RDA FAQ, eligible NPC profit is subject to a 10% full-and-final source deduction and does not itself require an income-tax return. Other Pakistan-source income or applicable filing obligations require a separate review.');
    content = replaceExact(content,
      '### Statutory Repatriation Guarantee: SBP FE Circular No. 04 of 2020\n\nThe defining structural feature of the Roshan Digital Account is its legal guarantee of **unrestricted capital repatriation**. Under State Bank of Pakistan Foreign Exchange Circular No. 04 of 2020:\n- Non-resident Pakistanis are legally entitled to transfer their original principal capital, capital gains, and accrued profit back to their overseas bank accounts at any time.\n- Commercial banks in Pakistan are strictly prohibited from demanding prior regulatory approvals or bureaucratic \'No Objection Certificates\' (NOC) before processing outward repatriation requests initiated through internet banking.',
      '### RDA Repatriation: Eligible Funds and Bank Processing\n\nThe [SBP Roshan Digital Account guidance](https://www.sbp.org.pk/our-operations/roshan-digital-accounts) allows eligible account balances and investment proceeds to be remitted abroad without case-specific prior SBP or bank approval. This does not waive identity checks, bank authentication, product settlement timelines, account eligibility rules or applicable charges.\n- Eligible principal and returns from investments made through the RDA can generally be repatriated under the published framework.\n- The processing bank must authenticate and execute the request according to the applicable RDA procedures; verify actual timing and transfer charges with that bank.');
    return content;
  },

  'the-architecture-of-forex-order-types-how-limit-stop-and-trailing-orders-protect-capital': content => {
    content = replaceExact(content,
      'While market orders guarantee immediate execution, they do not guarantee price certainty.',
      'Market orders prioritize execution but can be rejected or filled with slippage, and they do not guarantee price certainty.');
    content = replaceExact(content,
      'A limit order guarantees that you will either receive your requested price or a better one. It completely eliminates negative slippage on entry',
      'A filled limit order is intended to execute at its limit price or better under the venue rules. It may remain unfilled or fill partially');
    content = replaceExact(content,
      'Slippage Dollar Loss ($) = |Execution Price - Target Price| * Pip Value * Position Size (Lots)',
      'Slippage Dollar Loss ($) = (|Execution Price - Target Price| / Pip Size) * Pip Value per Standard Lot * Position Size (Standard Lots)');
    content = replaceExact(content,
      'Calculated Position Size: $150 / (30 pips * $10) = **0.50 Mini Lots**.',
      'Calculated Position Size: $150 / (30 pips * $10 per standard lot) = **0.50 standard lots (5 mini lots)**. The modeled pip value for this position is $5 per pip.');
    content = replaceExact(content,
      'Actual Risk Exposure = 30 pips * $5 = **$150 (Exactly 1.5% of equity)**.',
      'Modeled loss at the planned stop = 30 pips * $5 = **$150 (1.5% of equity)**, assuming no gap, slippage or transaction costs.');
    content = replaceExact(content,
      'Actual Dollar Loss if Stopped Out = 48 pips * $5 = **$240 (2.4% of equity — a 60% unintended risk expansion!)**.',
      'Modeled loss if the stop fills at 1.0820 = 48 pips * $5 = **$240 (2.4% of equity — 60% more than planned)**, before fees or additional slippage.');
    content = replaceExact(content,
      '> Regulatory Notice: Under Chapter 19 of the State Bank of Pakistan (SBP) Foreign Exchange Manual and SECP financial directives, domestic corporate hedgers and authorized dealers must adhere to rigorous execution standards to mitigate execution slippage.',
      '> Execution note: Broker-specific order types, margin requirements and execution protections vary. Consult your broker\'s published order execution terms; this example is educational, not a guaranteed maximum loss.');
    content = replaceExact(content,
      'A conventional stop-loss order converts into an immediate market order once the stop trigger price is touched, guaranteeing that the trade will close regardless of price, though slippage can occur in gap conditions.',
      'A conventional stop-loss order generally becomes a market order when its trigger is reached. The final price can differ sharply from the stop price, and execution can be delayed or rejected under market and broker conditions.');
    return replaceSection(content,
      '### Institutional Execution Comparison: Order Types Breakdown',
      '### Mathematical Calculation: Slippage Impact & Position Sizing',
      `### Order Types: Execution and Price Trade-offs

| Order mechanism | Trigger | Execution certainty | Price protection | Practical risk |
| :--- | :--- | :--- | :--- | :--- |
| **Market order** | Send to market now | Normally prioritizes execution, but fill is not guaranteed in all conditions | **No fixed execution price** | Slippage, rejection, gaps and spread widening |
| **Limit order** | Buy at a maximum / sell at a minimum price | **Not guaranteed** even when a quote touches the limit | Intended limit price or better if executed | Partial or no fill; some venues have extra conditions |
| **Stop-market order** | Stop price reached, then market execution requested | **Not guaranteed at stop price** | No price cap once triggered | Gap-through and adverse slippage |
| **Stop-limit order** | Stop activates a limit order | May remain unfilled | Limit bounds execution price | Unfilled position after a fast breakout |
| **Trailing stop** | Stop threshold follows favorable price movement | Depends on broker and order rules | Usually no guaranteed final fill price | Gaps, whipsaws and platform-specific behavior |

Broker and exchange order definitions vary. Always verify the broker's order execution policy, whether guaranteed stops exist and what additional charges apply.\n`);
  },

  'understanding-gold-liquidity-physical-bullion-etfs-and-digital-gold-compared': content => {
    content = replaceExact(content, 'Zero counterparty risk', 'No issuer obligation when directly held, but dealer and custody risks remain');
    content = replaceSection(content,
      '### Institutional Bullion Matrix: Physical vs Paper vs Digital Gold',
      '### Mathematical Carrying Cost & Liquidity Drag Formula',
      `### Bullion Access: Verify Current Terms Instead of Fixed Quotes

| Vehicle | Main ownership or exposure | Key cost to check today | Exit conditions and key risk |
| :--- | :--- | :--- | :--- |
| **Physical assayed bar** | Metal in direct custody | Dealer bid–ask spread, assay, insurance and secure storage | Sale depends on dealer demand and verification; theft and storage risk |
| **Regulated gold futures** | Derivative contract, not automatically a physical bar | Margin, exchange/broker charges and delivery specifications | Liquidation, margin calls and contract expiry; confirm current PMEX specifications |
| **Physically backed exchange-traded fund** | Fund shares backed by a specified custody structure | Current prospectus expense ratio, brokerage and FX conversion | Exchange trading hours, tracking difference and custodian risk |
| **Vaulted/digital gold program** | Contractual or beneficial interest according to provider terms | Storage, minting, redemption and platform fees | Verify audit, legal ownership, withdrawal process and local regulatory status |

There is **no universal minimum price, settlement time or regulation** for these vehicles; product terms and gold market prices change.\n`);
    return content;
  },

  'understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex': content => {
    return replaceSection(content,
      '### Global Central Bank Interest Rate Differentials Matrix',
      '### Mathematical Mechanics: Carry Trade Returns & Sudden Unwinding',
      `### How to Verify a Carry Differential

Policy rates are **time-sensitive**. A table that assigns fixed percentages to the Bank of Japan, Federal Reserve, Bank of England, ECB and SBP without an as-of date is not a reliable current quote.

| Input | Primary source to check | Why it matters |
| :--- | :--- | :--- |
| **JPY funding rate** | Bank of Japan monetary-policy announcements | Funding cost and reinvestment terms |
| **USD interest-rate environment** | Federal Reserve FOMC decisions | USD cash rates and yield differential |
| **GBP / EUR rates** | Bank of England / European Central Bank | Currency-specific policy comparison |
| **PKR monetary policy** | State Bank of Pakistan monetary-policy statement | Domestic policy rate; cross-border investibility still needs review |
| **Actual carry earned** | Executable FX forward, swap or broker terms | Policy-rate difference is **not** the same as a tradable net return |

Illustrative calculation: if a funded investment earns 5% annually and funding costs 2%, the **gross nominal interest differential is 3 percentage points**, before hedging, spreads, fees, taxes and exchange-rate changes. It is a hypothetical example, not a market quotation.\n`);
  },

  'central-bank-digital-currencies-vs-decentralized-crypto-the-battle-for-global-liquidity': content => {
    return replaceSection(content,
      '### Comparative Architecture: CBDCs vs Bitcoin vs Fiat Stablecoins',
      '### The State Bank of Pakistan\'s Digital Rupee Initiative',
      `### CBDCs, Bitcoin and Stablecoins: The Design Differences

| Feature | Central-bank digital currency (CBDC) | Bitcoin (BTC) | USD-backed stablecoin |
| :--- | :--- | :--- | :--- |
| **Issuer / control** | Central bank if implemented; architecture varies by jurisdiction | Distributed network following Bitcoin consensus rules | Private issuer and associated smart contracts |
| **Supply mechanism** | Defined by the central bank's monetary framework | Protocol targets a maximum issuance near 21 million BTC | Supply expands or contracts with issuance and redemptions; reserve quality differs |
| **Transaction control** | Depends on law, privacy model and architecture | Transactions may be delayed or censored by intermediaries or miners; access is not absolute | Issuer can often freeze addresses or restrict redemption |
| **Privacy / identity** | Varies by pilot design and local legal requirements | Public, pseudonymous ledger; users can be identified through analytics | Public ledger on many chains; exchanges generally require identity checks |
| **Settlement** | Depends on system rules | Probabilistic confirmation; number of confirmations depends on value and risk | Chain and off-chain settlement have different finality models |

**Important:** CBDC proposals are not all live systems. Do not assume every digital rupee prototype mandates expiry, CNIC biometrics, negative interest or permanent surveillance without evidence for the particular design.\n`);
  },

  'gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends': content => {
    return replaceSection(content,
      '### Historical Crisis Dynamics: DXY vs Gold vs Local Rupee Pricing',
      '### The Triangular Pricing Formula: Why Pakistani Gold Rates Surge',
      `### Historical Stress Episodes: What to Check in the Data

| Episode | Mechanism worth studying | Verify before claiming a measured return |
| :--- | :--- | :--- |
| **2008 financial crisis and aftermath** | Liquidity demand can strengthen USD while gold reacts to monetary policy | Compare like-for-like start and end dates for DXY, XAU/USD and USD/PKR |
| **2020 pandemic** | Early liquidity stress followed by policy support and gold demand | Use dated official/market closes; avoid mixing intraday highs and annual averages |
| **2022 tightening cycle** | Rising real yields and US-dollar strength can pressure gold in USD | Compare synchronized daily observations across all markets |
| **2024–2026 central-bank demand** | Reserve diversification may affect gold demand, alongside real yields | Use World Gold Council central-bank purchase data and dated bullion prices |

Exact percentage gains in Pakistani tola prices cannot be inferred merely from the global gold rally; currency moves, local premiums, purity and dealing spreads must also be measured.\n`);
  },

  'the-s-p-500-global-index-investing-why-90-of-active-fund-managers-fail-to-beat-the-market': content => {
    content = replaceSection(content,
      '### The SPIVA Scorecard: Empirical Proof of Active Management Failure',
      '### Mathematical Model: The Devastating Drag of Management Fees',
      `### SPIVA Scorecard: Use the Actual Report and Measurement Period

S&P Dow Jones Indices publishes its SPIVA research by **calendar period, active-fund category and investment horizon**. Exact multi-horizon percentages should not be presented without their corresponding dated report and fund universe.

| Research input | Correct interpretation |
| :--- | :--- |
| **Observed underperformance** | Identify the category (for example US large-cap equity funds), benchmark and the period in the report |
| **One-year versus long-term** | Different horizons have different fund samples, attrition and results; do not extrapolate from one to another |
| **Survivorship bias** | Consult SPIVA's treatment of funds that merged or closed |
| **Investor outcome** | A fund tracking an index has tracking difference and fees, so it does not deliver index returns exactly |

The [official SPIVA U.S. Scorecard](https://www.spglobal.com/spdji/en/spiva/article/spiva-us/) provides the latest comparable tables. The previously cited **79% underperformance** must be read in the report's defined 2025 US large-cap category and period—not as a universal law that 90% of all managers fail.\n`);
    return content;
  },

  'spotting-fake-gold-hallmarking-standards-the-complete-investor-guide-to-bullion-bars-vs-jewelry': content => {
    content = replaceExact(content,
      'the device produces an instant, non-destructive chemical breakdown of every element present (e.g., 99.6% Au, 0.3% Ag, 0.1% Cu)',
      'the device estimates the elemental composition of the **scanned surface region**; plating and a concealed core may remain undetected');
    content = replaceExact(content,
      'ultrasonic velocity testing or physical assay drilling reveals the tungsten core instantly because sound travels far faster through tungsten (5,200 m/s) than gold (3,240 m/s)',
      'a properly calibrated ultrasound examination or a controlled destructive assay may detect internal inconsistencies; neither a quick surface test nor a single density measurement proves the core is genuine');
    content = replaceExact(content,
      '> Regulatory Notice: The All Pakistan Sarafa Gems and Jewellers Association (APSGJA) advises consumers to demand certified assay stamps and official purchase receipts containing the merchant\'s National Tax Number (NTN) to guarantee full FBR compliance.',
      '> Buyer checklist: Ask for a dated invoice, seller identification, weight and purity details, and independently verifiable assay information where applicable. An NTN printed on a receipt does not by itself verify authenticity or guarantee tax compliance.');
    return replaceSection(content,
      '### Gold Assay & Counterfeit Detection Matrix',
      '### Step-by-Step Archimedes Specific Gravity Protocol',
      `### Gold Assay Methods: Strengths and Blind Spots

| Test | What it measures | Key limitation | Can it rule out a tungsten core by itself? |
| :--- | :--- | :--- | :--- |
| **Touchstone and acid** | Surface streak and chemical reaction | Can damage the sampled surface; plating may mislead | **No** |
| **Electrical conductivity** | Electrical response under a particular probe design | Penetration and calibration depend on the instrument | **Not reliably** |
| **Specific gravity / water displacement** | Bulk density estimated from weight and displaced water | Tungsten and gold have very similar densities; voids and geometry affect results | **No** |
| **X-ray fluorescence (XRF)** | Elemental composition near the scanned surface | Limited penetration cannot establish the composition of a concealed core | **No** |
| **Ultrasound / specialist imaging** | Internal acoustic or structural characteristics | Operator skill, geometry and calibration matter | **May help, but not infallible** |

The safest verification for significant purchases combines reliable provenance, calibrated independent tests and a reputable assayer; **no single non-destructive field test proves authenticity**.\n`);
  },

  'remittances-forex-spread-the-hidden-costs-of-sending-money-to-pakistan-and-how-to-get-real-rates': content => {
    return replaceSection(content,
      '### Inbound Remittance Corridors Comparison Table',
      '### Step-by-Step Formula: Exposing the "Zero Fee" Currency Markup',
      `### Comparing Remittance Channels: Check Actual Offers

Fees, FX spreads, transfer times and Pakistan Remittance Initiative (PRI) eligibility vary by corridor, amount, provider and date. The figures below are **checklists, not current price quotes**.

| Channel | Compare before sending | Documentation and practical caveats |
| :--- | :--- | :--- |
| **Regulated bank / RDA transfer** | Customer FX buy rate, bank and correspondent charges, cut-off times | Ask the bank whether a relevant e-PRC or account statement is issued for this transaction |
| **Commercial SWIFT transfer** | Sending, intermediary and receiving bank fees plus conversion spread | Correspondent routes and actual arrival date vary |
| **Licensed remittance app** | Final PKR received including promotional rates, fees and limits | e-PRC availability depends on the settlement bank and type of credit; an in-app receipt is not always an SBP e-PRC |
| **Licensed cash-pickup operator** | Final payout, cash availability and identification requirements | Delivery method and receipts differ by market |
| **Unlicensed informal transfer** | Do not rely on an advertised rate alone | Significant fraud, compliance and recourse risk; use authorized routes |

The [State Bank of Pakistan RDA FAQ](https://www.sbp.org.pk/faqs/faqs-roshan-digital-account) explains that the customer exchange rate can differ from the wholesale interbank rate. No channel has a universal guaranteed transfer time or percentage spread.\n`);
  },

  'storing-crypto-safely-exchanges-vs-wallets-guide': content => {
    return replaceSection(content,
      '### Cryptocurrency Custody Architecture Comparison Table',
      '### BIP-39 Cryptographic Seed Entropy Standards',
      `### Cryptocurrency Custody: Practical Risk Comparison

| Method | Who can authorize spending? | Main threat | Recovery consideration |
| :--- | :--- | :--- | :--- |
| **Centralized exchange** | Custodian under its account policies | Exchange insolvency, account lock, hacking and legal restrictions | Support and recovery depend on the provider |
| **Software wallet** | User holding signing keys | Malware, phishing, device loss and malicious approvals | Secure seed/backup method may restore compatible wallets |
| **Hardware wallet** | User, with keys held in specialized hardware | Social engineering, malicious signing, lost backup or physical theft | Check seed, passphrase, device compatibility and succession plan |
| **Offline metal seed backup** | Not a wallet: stores recovery information | Discovery, loss, tampering, fire/flood damage depending on construction | Test legibility and secure storage; metal is **not** indestructible |

There is **no universally safe allocation** such as "90% in hardware wallets" or "under 10% on an exchange." Appropriate custody depends on threat model, user capability, jurisdiction and financial circumstances. Never reveal the recovery phrase to anyone.\n`);
  },

  'usd-to-pkr-interbank-vs-open-market-guide': content => {
    content = replaceSection(content,
      '### Wholesale Interbank vs Retail Open Market Matrix',
      '### Mathematical Modeling: Calculating the Interbank vs Open Market Spread',
      `### Wholesale Interbank vs Retail Open Market

| Dimension | Interbank / bank customer market | Licensed retail exchange companies | Unlicensed informal networks |
| :--- | :--- | :--- | :--- |
| **Participants** | Banks, firms and eligible customers | Travelers, remitters and retail cash buyers/sellers | Unregulated operators; heightened compliance risk |
| **Price basis** | Institutional quotes and bank-specific customer rates | Customer buy/sell quotes including retail cash costs | Opaque quotes and limited recourse |
| **Spread** | Depends on currency liquidity, deal size and timing | Depends on cash inventory, costs and demand | Not independently verifiable |
| **Settlement** | Bank transfer and applicable settlement arrangements | Cash or licensed-company transfer mechanism | No assured regulated settlement protection |
| **Verification** | SBP published data and bank quote | Authorized company rate board and receipt | Prefer authorized channels |

There is no timeless **0.05–0.25 PKR interbank spread** or **0.75–2.50 PKR retail spread**. Compare same-time executable buy and sell rates for a meaningful comparison.\n`);
    content = replaceExact(content,
      'Under structural reform agreements with international financial institutions, the SBP enforces market discipline ensuring the spread between interbank wholesale rates and open market cash rates remains within a tight target band (around 1.25%). This eliminates speculative arbitrage and channels remittances into formal banking corridors.',
      'A historical spread-monitoring objective should not be treated as a standing, guaranteed retail rate cap. Consult the latest [SBP exchange-rate and policy publications](https://www.sbp.org.pk/) and compare actual market quotes; a target, where applicable, does not eliminate arbitrage or guarantee a customer price.');
    return content;
  }
};

export function applyArticleFactChecks(slug, originalContent) {
  const review = corrections[slug];
  return review ? review(originalContent) : originalContent;
}
