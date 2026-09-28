import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

import { recordInquiry } from '../utils/telemetry';

export default function ContactPage() {
  const { siteSettings } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      recordInquiry({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
    } catch (err) {
      console.warn('Error recording inquiry telemetry:', err);
    }
    setSubmitted(true);
    // Reset form after short delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Contact Us</span>
      </nav>

      {/* Main Centered Contact Form */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
        
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
              Direct Desk & Support
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Contact {siteSettings?.websiteName || 'FGC Spot'}
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
          Have questions regarding our live exchange rate calculations, cryptocurrency tracking data, advertising opportunities, or editorial suggestions? Send us a message and our support team will reply within 24 to 48 business hours.
        </p>

        {submitted ? (
          <div className="py-12 px-6 rounded-2xl bg-slate-50 dark:bg-[#0D1B2A] border border-[#00E676]/30 text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-[#00E676] mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thank You! Your Message Has Been Sent.</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] max-w-md mx-auto">
              A member of our editorial or technical team has received your ticket and will respond via email shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-5 py-2.5 bg-[#00E676] hover:bg-[#00FF88] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,230,118,0.25)] cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] mb-1.5">
                Subject / Inquiry Type *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00E676] cursor-pointer"
              >
                <option value="General Inquiry" className="bg-white dark:bg-[#0A1726]">General Question / Feedback</option>
                <option value="Exchange Rate Correction" className="bg-white dark:bg-[#0A1726]">Exchange Rate or Data Correction</option>
                <option value="AdSense / Advertising" className="bg-white dark:bg-[#0A1726]">Advertising & Partnership Inquiry</option>
                <option value="Editorial & Press" className="bg-white dark:bg-[#0A1726]">Editorial & Press Inquiries</option>
                <option value="Privacy / GDPR" className="bg-white dark:bg-[#0A1726]">Privacy & Data Request (GDPR / CCPA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] mb-1.5">
                Your Message *
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe how we can assist you with our data or website..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2] pt-1">
              <Clock className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Standard response window: 24 to 48 business hours</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#00E676] hover:bg-[#00FF88] text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:shadow-[0_0_25px_rgba(0,255,136,0.35)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
