import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ChevronRight, Lock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { siteSettings } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Privacy Policy</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Legal & AdSense Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Policy & Cookie Disclosure
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Effective Date: September 24, 2026 • Compliant with GDPR, CCPA & Google Publisher Guidelines
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base space-y-6 leading-relaxed">
          
          <p>
            At {siteSettings?.websiteName || 'FinPulse'}, accessible via our official domain, the privacy of our visitors is of paramount importance. This Privacy Policy document outlines the types of personal and anonymous telemetry collected and recorded by {siteSettings?.websiteName || 'FinPulse'} and how we utilize it.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Google DoubleClick DART Cookies & Third-Party Advertising
          </h2>
          <p>
            Google is a third-party vendor on our site. Google uses cookies, specifically known as <strong>DART cookies</strong>, to serve advertisements to visitors based on their visit to FinPulse and other websites across the Internet. 
          </p>
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p>
              <strong>User Opt-Out Choice:</strong> Visitors may opt out of the use of the DART cookie by visiting the official Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://policies.google.com/technologies/ads</a>.
            </p>
            <p>
              Third-party ad networks or ad servers use technologies such as cookies, JavaScript, or Web Beacons within their respective advertisements and links that appear on FinPulse. These are sent directly to users' browsers, which automatically receive your IP address. These technologies measure the effectiveness of advertising campaigns and personalize advertising content.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Cookies, LocalStorage & Web Analytics
          </h2>
          <p>
            FinPulse utilizes modern browser cookies and <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs text-blue-600 dark:text-blue-400">localStorage</code> exclusively to record visitor preferences, such as:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>User theme selection (Light Mode or Dark Mode preference stored locally).</li>
            <li>Last selected currency pairs (e.g. USD to PKR, EUR to USD) to provide immediate calculation continuity.</li>
            <li>Browser type and anonymous navigational metrics to optimize page load speeds.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            3. Log Files & Diagnostic Telemetry
          </h2>
          <p>
            FinPulse follows standard procedures for utilizing server log files. The information collected by log files includes internet protocol (IP) addresses, browser specification, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and the number of clicks. This data is not linked to any personally identifiable information and is used exclusively for diagnosing network performance and administering the site.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            4. CCPA Privacy Rights (Do Not Sell My Personal Information)
          </h2>
          <p>
            Under the California Consumer Privacy Act (CCPA), California consumers have the right to:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Request disclosure of categories and specific pieces of personal data collected.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Request that a business delete any personal data collected about the consumer.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Request that a business that sells personal data not sell the consumer's personal data. <strong>FinPulse does not sell user personal data.</strong></span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            5. GDPR Data Protection Rights
          </h2>
          <p>
            Every user is entitled to data protection rights under the General Data Protection Regulation (GDPR), including the Right to Access, Right to Rectification, Right to Erasure, Right to Restrict Processing, and Right to Data Portability. If you submit a request, we have one calendar month to respond.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            6. Children's Information Protection (COPPA)
          </h2>
          <p>
            FinPulse does not knowingly collect any Personal Identifiable Information from children under the age of 13. If a parent or guardian believes that FinPulse has in its database personal information of a child, please contact us immediately and we will promptly remove such information from our records.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            7. Contacting Our Data Protection Officer
          </h2>
          <p>
            If you have questions or require more information regarding our Privacy Policy or cookie management, please reach out via our dedicated contact portal:
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <span>Submit a Privacy Request</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
