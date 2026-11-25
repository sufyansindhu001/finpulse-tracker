import { stripSpanMarkup } from '../src/lib/supabase.js';

console.log('=== VERIFYING SUPABASE CITATION SANITIZER ===');

const testCases = [
  {
    name: '1. Numeric citation marker [cite: 1]',
    input: 'Gold exposure across vehicles.[cite: 1]',
    expectedMatch: '[cite: 1]'
  },
  {
    name: '2. Numeric citation marker [cite: 2]',
    input: 'Cash devaluation rate.[cite: 2]',
    expectedMatch: '[cite: 2]'
  },
  {
    name: '3. Statutory SBP citation [cite: SBP FE Circular No. 01 of 2023]',
    input: 'ESFCA retention limits mandate 50% retention.[cite: SBP FE Circular No. 01 of 2023]',
    expectedMatch: '[cite: SBP FE Circular No. 01 of 2023]'
  },
  {
    name: '4. FBR Section 154A citation',
    input: 'Concessional tax regime applies at 0.25%.[cite: FBR Section 154A]',
    expectedMatch: '[cite: FBR Section 154A]'
  },
  {
    name: '5. State Bank regulatory citation',
    input: 'Virtual assets advisory compliance.[cite: State Bank of Pakistan]',
    expectedMatch: '[cite: State Bank of Pakistan]'
  },
  {
    name: '6. SECP corporate regulations citation',
    input: 'Listed corporate disclosure guidelines.[cite: SECP Listed Regulations]',
    expectedMatch: '[cite: SECP Listed Regulations]'
  },
  {
    name: '7. APSGJA bullion trade citation',
    input: 'Karachi wholesale gold trade.[cite: APSGJA Karachi]',
    expectedMatch: '[cite: APSGJA Karachi]'
  },
  {
    name: '8. LBMA standard citation',
    input: 'Physical good delivery bullion bars.[cite: LBMA Bullion Standard]',
    expectedMatch: '[cite: LBMA Bullion Standard]'
  },
  {
    name: '9. Income Tax Ordinance citation',
    input: 'Tax deduction at source rules.[cite: Income Tax Ordinance 2001]',
    expectedMatch: '[cite: Income Tax Ordinance 2001]'
  },
  {
    name: '10. Roshan Digital Account framework citation',
    input: 'Repatriation guarantees on NPC certificates.[cite: Roshan Digital Account Framework]',
    expectedMatch: '[cite: Roshan Digital Account Framework]'
  },
  {
    name: '11. IMF consultation citation (with citation prefix)',
    input: 'Macroeconomic structural review.[citation: IMF Article IV Consultation]',
    expectedMatch: '[cite: IMF Article IV Consultation]'
  },
  {
    name: '12. HTML injection prevention (strip <script> tags)',
    input: 'Analysis content <script>alert("xss")</script>[cite: Safe Reference]',
    expectedMatch: '[cite: Safe Reference]',
    mustNotContain: '<script>'
  },
  {
    name: '13. Span token removal alongside citation',
    input: '[span_0](start_span)Empirical findings[cite: 1] end_span',
    expectedMatch: '[cite: 1]',
    mustNotContain: 'span_0'
  }
];

let passed = 0;
for (const tc of testCases) {
  const output = stripSpanMarkup(tc.input);
  const hasMatch = output.includes(tc.expectedMatch);
  const safeFromTags = tc.mustNotContain ? !output.includes(tc.mustNotContain) : true;
  
  if (hasMatch && safeFromTags) {
    console.log(`PASS: ${tc.name}`);
    passed++;
  } else {
    console.error(`FAIL: ${tc.name}`);
    console.error(`  Input:  ${tc.input}`);
    console.error(`  Output: ${output}`);
  }
}

console.log(`\nCitation Sanitizer Results: ${passed} / ${testCases.length} tests passed.`);
if (passed !== testCases.length) {
  process.exit(1);
}
