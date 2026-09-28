import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FileText, ChevronRight, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
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
        <span className="text-white font-semibold">Terms of Service</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-[#0A1726] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
              Legal Agreement
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Terms of Service &amp; User Agreement
            </h1>
            <p className="text-xs text-[#A8B3C2] mt-1 font-medium">
              Effective Date: September 2026 • Governs access and use of {siteSettings?.websiteName || 'FGC Spot'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-[#A8B3C2] text-sm sm:text-base space-y-6 leading-relaxed">
          
          <p>
            Welcome to {siteSettings?.websiteName || 'FGC Spot'}. By accessing or using our websites, conversion tools, charting interfaces, and financial data feeds, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            1. Informational & Educational Use Only
          </h2>
          <p>
            The exchange rates, cryptocurrency valuations, gold bullion calculations, and financial indicators provided by {siteSettings?.websiteName || 'FGC Spot'} are intended strictly for computational, reference, and informational purposes. We do not provide banking, brokerage, investment advisory, or custodian services.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            2. Intellectual Property & Brand Rights
          </h2>
          <p>
            All custom graphics, interface designs, chart components, algorithms, and software code on {siteSettings?.websiteName || 'FGC Spot'} are the property of {siteSettings?.websiteName || 'FGC Spot'} Media &amp; Data. You may utilize our calculators for personal and internal business analysis, but may not scrape, redistribute, or mirror our compiled feeds without explicit written consent.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            3. Accuracy of Data & Third-Party Feeds
          </h2>
          <p>
            While we aggregate rate data from recognized international central banks and high-frequency digital asset venues, market conditions change with high volatility. We make no warranty that rate calculations will be uninterrupted, error-free, or identical to specific retail bank cash rates.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall {siteSettings?.websiteName || 'FGC Spot'} or its affiliates be held liable for any commercial loss, currency slippage, or trading decisions made based on the data displayed on this platform. Users are solely responsible for verifying transaction rates with licensed institutions before executing money transfers or asset trades.
          </p>

          <h2 className="text-xl font-bold text-white pt-2 border-b border-white/10 pb-2">
            5. Modifications to Terms
          </h2>
          <p>
            We reserve the right to revise these terms at any time. Continued use of the platform after updates constitutes acceptance of the amended terms.
          </p>

        </div>

      </div>

    </div>
  );
}
