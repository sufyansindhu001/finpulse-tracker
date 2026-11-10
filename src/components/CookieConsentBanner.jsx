import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Check, Sliders, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const STORAGE_KEY = 'fgc_cookie_consent';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    advertising: true
  });

  useEffect(() => {
    // Check if consent has already been recorded
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Small delay to ensure smooth initial page render
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setPreferences({
            necessary: true,
            analytics: parsed.analytics !== false,
            advertising: parsed.advertising !== false
          });
        }
      }
    } catch {
      setIsVisible(true);
    }

    // Global listener allowing users to re-open preferences via footer link
    const handleOpenPreferences = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener('fgc_open_cookie_preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('fgc_open_cookie_preferences', handleOpenPreferences);
    };
  }, []);

  const saveConsent = (updatedPrefs) => {
    try {
      const payload = {
        ...updatedPrefs,
        necessary: true,
        consentedAt: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist cookie consent:', e);
    }
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, analytics: true, advertising: true };
    setPreferences(all);
    saveConsent(all);
  };

  const handleAcceptNecessaryOnly = () => {
    const essentialOnly = { necessary: true, analytics: false, advertising: false };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-6 md:bottom-6 md:max-w-lg z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 dark:bg-[#0A1726]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-slate-200 text-xs transition-colors">
        
        {/* Banner Top Row: Icon, Title & Dismiss */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                Cookie & Privacy Consent
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#A8B3C2]">
                Compliant with Google AdSense & Privacy Standards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAcceptNecessaryOnly}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close and accept necessary only"
            title="Dismiss non-essential cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Description */}
        <p className="text-slate-600 dark:text-[#A8B3C2] leading-relaxed mb-3.5">
          We use cookies and telemetry feeds to deliver institutional market data, personalize exchange rates, and serve compliant financial ads via Google AdSense. Read our{' '}
          <Link 
            to="/privacy-policy" 
            className="text-[#00E676] hover:underline font-semibold"
          >
            Privacy Policy
          </Link>{' '}
          to learn how we safeguard your browsing data.
        </p>

        {/* Detailed Preferences Panel (Accordion) */}
        {showPreferences && (
          <div className="space-y-2.5 mb-4 pt-3 border-t border-slate-200 dark:border-white/10 animate-in fade-in duration-200">
            
            {/* Category 1: Strictly Necessary */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Essential & System</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00E676] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Always Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Required for core website routing, financial ticker caching, and security verification.
              </p>
            </div>

            {/* Category 2: Analytics & Speed Insights */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Analytics & Performance</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00E676]"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Measures platform latency, Core Web Vitals, and aggregate traffic to optimize load times.
              </p>
            </div>

            {/* Category 3: Advertising & Personalization */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>AdSense & Advertising</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(e) => setPreferences(prev => ({ ...prev, advertising: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00E676]"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Enables Google AdSense partner networks to serve relevant financial product offers.
              </p>
            </div>

          </div>
        )}

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {showPreferences ? (
            <>
              <button
                type="button"
                onClick={handleAcceptNecessaryOnly}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#06111F] dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] font-semibold text-xs cursor-pointer transition-all active:scale-95"
              >
                Essential Only
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="px-2.5 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] font-bold text-xs shadow-md shadow-[#00E676]/25 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Choices</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white text-xs font-semibold py-1.5 cursor-pointer transition-colors"
              >
                <Sliders className="w-3 h-3 text-[#00E676]" />
                <span>Manage Preferences</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptNecessaryOnly}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#06111F] dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] font-semibold text-xs cursor-pointer transition-all active:scale-95"
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] font-bold text-xs shadow-md shadow-[#00E676]/25 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
