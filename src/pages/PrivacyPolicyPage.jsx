import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { ShieldCheck, ChevronRight, Lock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { siteSettings } = useApp();

  useSEO({
    title: 'Privacy Policy | FGC Spot',
    description: 'FGC Spot privacy policy: how we collect, handle, and protect user data and telemetry in compliance with privacy regulations.',
    canonical: '/privacy-policy'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Privacy Policy</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
              Website Privacy & Cookie Information
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Policy & Cookie Disclosure
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1 font-medium">
              Updated: November 2026 • Privacy and cookie information
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-600 dark:text-[#A8B3C2] text-sm sm:text-base space-y-6 leading-relaxed">
          
          <p>
            At {siteSettings?.websiteName || 'FGC Spot'}, accessible via our official domain, the privacy of our visitors is of paramount importance. This Privacy Policy document outlines the types of personal and anonymous analytics data collected and recorded by {siteSettings?.websiteName || 'FGC Spot'} and how we utilize it.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            1. Google DoubleClick DART Cookies & Third-Party Advertising
          </h2>
          <p>
            If Google advertising is enabled in the future, Google and its partners may use cookies to serve and measure ads. Current cookie use and visitor choices should be disclosed before any new advertising features are enabled.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#A8B3C2] space-y-2">
            <p>
              <strong className="text-slate-900 dark:text-white">User Opt-Out Choice:</strong> Visitors may opt out of the use of the DART cookie by visiting the official Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline font-semibold">https://policies.google.com/technologies/ads</a>.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            2. Log Files & Anonymous Analytics
          </h2>
          <p>
            {siteSettings?.websiteName || 'FGC Spot'} uses hosting logs to operate and secure the service. Depending on the provider, log information can include IP addresses, browser information, visit times and referring pages. IP addresses and similar online identifiers can be personal data under applicable privacy laws; they are not necessarily anonymous.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            3. Privacy Rights (GDPR & CCPA)
          </h2>
          <p>
            Under CCPA, among other rights, consumers have the right to request disclosure of personal data categories collected, request deletion of collected personal data, and request that a business not sell the consumer's personal data. Under GDPR, users are entitled to the right of access, rectification, erasure, and restriction of data processing.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            4. Consent
          </h2>
          <p>
            This policy describes our data practices; merely visiting the website does not mean you have consented to optional cookies. Use the Cookie Preferences control to manage available choices. If advertising is enabled later, we will provide any additional disclosures and consent choices required for that service.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            5. Contact Information &amp; Privacy Requests
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, wish to exercise applicable privacy rights, or request deletion of data, please contact us at <a href="mailto:fgcspot4@gmail.com" className="text-[#00E676] hover:text-[#00FF88] font-bold font-mono underline underline-offset-4 decoration-[#00E676]/40">fgcspot4@gmail.com</a>. We review privacy requests and respond in accordance with applicable requirements.
          </p>

        </div>

      </div>

    </div>
  );
}
