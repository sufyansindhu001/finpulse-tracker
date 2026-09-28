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
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-semibold">Privacy Policy</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-[#0A1726] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
              Legal & AdSense Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy Policy & Cookie Disclosure
            </h1>
            <p className="text-xs text-[#A8B3C2] mt-1 font-medium">
              Effective Date: September 2026 • Compliant with GDPR, CCPA & Google Publisher Guidelines
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-[#A8B3C2] text-sm sm:text-base space-y-6 leading-relaxed">
          
          <p>
            At {siteSettings?.websiteName || 'FGC Spot'}, accessible via our official domain, the privacy of our visitors is of paramount importance. This Privacy Policy document outlines the types of personal and anonymous telemetry collected and recorded by {siteSettings?.websiteName || 'FGC Spot'} and how we utilize it.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            1. Google DoubleClick DART Cookies & Third-Party Advertising
          </h2>
          <p>
            Google is a third-party vendor on our site. Google uses cookies, specifically known as <strong className="text-white">DART cookies</strong>, to serve advertisements to visitors based on their visit to {siteSettings?.websiteName || 'FGC Spot'} and other websites across the Internet. 
          </p>
          <div className="p-4 rounded-xl bg-[#0D1B2A] border border-white/10 text-xs text-[#A8B3C2] space-y-2">
            <p>
              <strong className="text-white">User Opt-Out Choice:</strong> Visitors may opt out of the use of the DART cookie by visiting the official Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline font-semibold">https://policies.google.com/technologies/ads</a>.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            2. Log Files & Anonymous Analytics
          </h2>
          <p>
            {siteSettings?.websiteName || 'FGC Spot'} follows a standard procedure of using log files. These files log visitors when they navigate the application. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            3. Privacy Rights (GDPR & CCPA)
          </h2>
          <p>
            Under CCPA, among other rights, consumers have the right to request disclosure of personal data categories collected, request deletion of collected personal data, and request that a business not sell the consumer's personal data. Under GDPR, users are entitled to the right of access, rectification, erasure, and restriction of data processing.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            4. Consent
          </h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>

        </div>

      </div>

    </div>
  );
}
