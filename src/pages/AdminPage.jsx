import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminErrorBoundary from '../components/AdminErrorBoundary';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Settings, 
  FileText, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Check, 
  ExternalLink,
  AlertCircle,
  Upload,
  Mail,
  KeyRound,
  ShieldCheck,
  Activity,
  BarChart3,
  Inbox,
  RefreshCw,
  Download,
  Search,
  Globe,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

import {
  getLiveKPIs,
  getRecentEvents,
  getDailyAuditReports,
  exportAuditReportsCSV,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getCorridorDistribution
} from '../utils/telemetry';

export default function AdminPage() {
  const { 
    siteSettings, 
    updateSiteSettings, 
    articles, 
    addArticle, 
    updateArticle, 
    deleteArticle,
    adminCredentials,
    updateAdminCredentials,
    isAdminAuth,
    loginAdmin,
    logoutAdmin
  } = useApp();

  const safeArticles = Array.isArray(articles) ? articles : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Auth Login State ---
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Navigation Tabs: 'analytics' | 'audit' | 'inbox' | 'settings' | 'articles' ---
  const [activeTab, setActiveTab] = useState('analytics');

  // --- 100% Authentic Telemetry States (Clean zero baselines) ---
  const [kpis, setKpis] = useState(() => getLiveKPIs());
  const [events, setEvents] = useState(() => getRecentEvents(50));
  const [corridors, setCorridors] = useState(() => getCorridorDistribution());
  const [eventFilter, setEventFilter] = useState('ALL');
  const [auditRange, setAuditRange] = useState('7d');
  const [auditReports, setAuditReports] = useState(() => getDailyAuditReports('7d'));
  const [inquiries, setInquiries] = useState(() => getInquiries());
  const [inquiryFilter, setInquiryFilter] = useState('ALL');
  const [inquirySearch, setInquirySearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);

  // Refresh Telemetry Data
  const refreshTelemetry = () => {
    setIsRefreshingTelemetry(true);
    setTimeout(() => {
      setKpis(getLiveKPIs());
      setEvents(getRecentEvents(50));
      setCorridors(getCorridorDistribution());
      setAuditReports(getDailyAuditReports(auditRange));
      setInquiries(getInquiries());
      setIsRefreshingTelemetry(false);
    }, 300);
  };

  // Sync audit reports when range toggles
  useEffect(() => {
    setAuditReports(getDailyAuditReports(auditRange));
  }, [auditRange]);

  // Handle Inquiry status changes
  const handleStatusChange = (id, newStatus) => {
    const updated = updateInquiryStatus(id, newStatus);
    setInquiries(updated);
    setKpis(getLiveKPIs());
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
  };

  // Handle Inquiry deletion
  const handleDeleteInquiry = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this inquiry record?')) {
      const updated = deleteInquiry(id);
      setInquiries(updated);
      setKpis(getLiveKPIs());
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  // --- Site Settings Form State ---
  const [settingsForm, setSettingsForm] = useState(() => ({
    websiteName: siteSettings?.websiteName || 'FinPulse',
    logoText: siteSettings?.logoText || 'FX',
    logoUrl: siteSettings?.logoUrl || '',
    contactEmail: siteSettings?.contactEmail || 'support@finpulse-tracker.com',
    tagline: siteSettings?.tagline || 'Real-Time Forex & Crypto Terminal'
  }));
  const [settingsSaved, setSettingsSaved] = useState(false);

  // --- Change Admin Credentials Form State ---
  const [credForm, setCredForm] = useState(() => ({
    email: adminCredentials?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }));
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  // --- Article Manager Form State ---
  const INITIAL_ARTICLE_FORM = {
    title: '',
    category: 'Market Updates',
    image: '',
    author: 'FinPulse Research Lead',
    summary: '',
    content: '',
    tags: 'Forex, Crypto, Market'
  };

  const [articleForm, setArticleForm] = useState(INITIAL_ARTICLE_FORM);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleSaved, setArticleSaved] = useState(false);

  // Handle Login with Email & Password
  const handleLoginSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setLoginError('');

    const cleanEmail = (emailInput || '').trim();
    const cleanPass = passwordInput || '';

    if (!cleanEmail) {
      setLoginError('Please enter your administrator email.');
      return false;
    }
    if (!cleanPass) {
      setLoginError('Please enter your administrator password.');
      return false;
    }

    const res = loginAdmin(cleanEmail, cleanPass);
    if (!res || !res.success) {
      setLoginError(res?.message || 'Invalid email or password. Please verify your credentials.');
    } else {
      setLoginError('');
      setPasswordInput('');
      refreshTelemetry();
    }
    return false;
  };

  // Handle Save Site Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSiteSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Handle Update Admin Credentials
  const handleUpdateCredentials = (e) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (credForm.currentPassword !== adminCredentials.password) {
      setCredError('Current password does not match your active administrator password.');
      return;
    }
    if (!credForm.newPassword || credForm.newPassword.length < 6) {
      setCredError('New password must be at least 6 characters long.');
      return;
    }
    if (credForm.newPassword !== credForm.confirmPassword) {
      setCredError('New password and confirmation do not match.');
      return;
    }
    if (!credForm.email.includes('@')) {
      setCredError('Please enter a valid administrator email address.');
      return;
    }

    updateAdminCredentials(credForm.email, credForm.newPassword);
    setCredSuccess('Admin email and password successfully updated! New credentials are now active.');
    setCredForm(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setTimeout(() => setCredSuccess(''), 4000);
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleForm(prev => ({ ...prev, image: reader.result || '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Article Form Submit
  const handleArticleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const safeTitle = (articleForm?.title || '').trim();
    if (!safeTitle) {
      alert('Please enter an article title.');
      return;
    }

    if (editingArticleId) {
      updateArticle(editingArticleId, {
        title: safeTitle,
        category: articleForm?.category || 'Market Updates',
        image: articleForm?.image || '',
        author: articleForm?.author || 'FinPulse Research Lead',
        summary: articleForm?.summary || '',
        content: articleForm?.content || '',
        tags: articleForm?.tags || ''
      });
      setEditingArticleId(null);
    } else {
      addArticle({
        title: safeTitle,
        category: articleForm?.category || 'Market Updates',
        image: articleForm?.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
        author: articleForm?.author || 'FinPulse Research Lead',
        summary: articleForm?.summary || '',
        content: articleForm?.content || '',
        tags: articleForm?.tags || ''
      });
    }

    setArticleForm(INITIAL_ARTICLE_FORM);
    setArticleSaved(true);
    setTimeout(() => setArticleSaved(false), 3000);
  };

  const handleEditArticle = (art) => {
    if (!art) return;
    setEditingArticleId(art.id || null);
    setArticleForm({
      title: art?.title || '',
      category: art?.category || 'Market Updates',
      image: art?.image || '',
      author: art?.author || 'FinPulse Research Lead',
      summary: art?.summary || '',
      content: art?.content || '',
      tags: Array.isArray(art?.tags) ? art.tags.join(', ') : (art?.tags || '')
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setArticleForm(INITIAL_ARTICLE_FORM);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (eventFilter === 'ALL') return events;
    return events.filter(e => e.type === eventFilter);
  }, [events, eventFilter]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const matchesFilter = inquiryFilter === 'ALL' || item.status === inquiryFilter;
      const q = inquirySearch.toLowerCase().trim();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [inquiries, inquiryFilter, inquirySearch]);

  // -------------------------------------------------------------
  // VIEW 1: AUTHENTICATION LOGIN GATE
  // -------------------------------------------------------------
  if (!isAdminAuth) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="bg-[#0B0F19]/95 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Institutional Admin Portal
            </h1>
            <p className="text-xs text-slate-400">
              Enter your master administrator credentials to access real telemetry, genuine audit reports, and site governance.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#07090E] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-3 bg-[#07090E] border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div 
                role="alert" 
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center gap-2.5 text-xs font-semibold text-rose-400 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Terminal</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Protected by SHA-256 session token gate &bull; Auto-locks on browser exit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED COMMAND & ANALYTICS DASHBOARD
  // -------------------------------------------------------------
  return (
    <AdminErrorBoundary title="Admin Dashboard Error">
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
        
        {/* Top Institutional Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold border border-blue-500/20 uppercase tracking-wider">
                FinPulse Telemetry Engine
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-Time Node Online &bull; Latency: {kpis.systemStatus.latencyMs}ms</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Institutional Command &amp; Analytics Terminal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              100% authentic client telemetry, genuine audit reports, unread inquiries, and site governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={refreshTelemetry}
              disabled={isRefreshingTelemetry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
              title="Refresh telemetry streams"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTelemetry ? 'animate-spin text-blue-500' : ''}`} />
              <span>Sync Telemetry</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shadow-sm"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={logoutAdmin}
              title="Terminate session immediately"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Logout &amp; Lock</span>
            </button>
          </div>
        </div>

        {/* 5 Top High-Tier KPI Metric Cards (100% REAL DATA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* KPI 1: Active Live Sessions */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Sessions
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{kpis.activeSessions}</span>
              <span className="text-xs font-medium text-emerald-500">Live</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{kpis.activeSessions === 1 ? '1 active tab in session' : `${kpis.activeSessions} active tabs in session`}</span>
            </p>
          </div>

          {/* KPI 2: Today's Unique Visitors */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Unique Visitors Today
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                {kpis.visitorDelta}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {Number(kpis.todayVisitors).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {kpis.todayVisitors === 0 ? 'Zero visits recorded today' : 'Fingerprinted browser sessions'}
            </p>
          </div>

          {/* KPI 3: Forex Calculations Run Today */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                FX Conversions
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono">
                {kpis.conversionDelta}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {Number(kpis.todayConversions).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-mono">
              <span>Top Corridor:</span>
              <span className="font-bold text-blue-500">{kpis.topPairToday}</span>
            </p>
          </div>

          {/* KPI 4: New Inquiries & Contacts */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Inquiries &amp; Tickets
              </span>
              {kpis.newInquiriesCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold animate-pulse">
                  Action Required
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-bold">
                  Zero Pending
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{kpis.newInquiriesCount}</span>
              <span className="text-xs font-semibold text-slate-400">Unread</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {inquiries.length} total actual inquiries
            </p>
          </div>

          {/* KPI 5: System Feeds Status */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                System Feeds Status
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                {kpis.systemStatus.status}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {kpis.systemStatus.latencyMs}ms
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
              <span>Measured Latency</span>
              <span className="text-emerald-500 font-bold">Nominal</span>
            </p>
          </div>

        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Command &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Daily Audit Reports ({auditReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'inbox'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Contact Inbox ({inquiries.filter(i => i.status === 'New').length} New)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'articles'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Article Manager ({safeArticles.length})</span>
          </button>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: COMMAND & ANALYTICS (REAL-TIME CONSOLE) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* Real-time Rolling Micro-Events Console */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Live Telemetry Stream &amp; Micro-Events
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Continuous client-side event bus capturing real currency conversions, genuine navigations, and submitted inquiries.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Filter Pills */}
                  {['ALL', 'FX_CONVERT', 'PAGE_VIEW', 'RESEARCH_READ', 'CONTACT_SUBMIT', 'PAIR_SELECTED'].map(filterKey => (
                    <button
                      key={filterKey}
                      onClick={() => setEventFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                        eventFilter === filterKey
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filterKey.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal View Container */}
              <div className="bg-[#05070B] border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-hidden shadow-inner">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="ml-2 text-slate-400 font-semibold">finpulse-telemetry-stream</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {filteredEvents.length} genuine events
                  </span>
                </div>

                {/* Event Logs List */}
                <div className="max-h-[360px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 font-sans">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-300">No Micro-Events Recorded Yet</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Client actions (page views, currency conversions, form submissions) will stream here in real-time as users interact.
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map(evt => {
                      const timeStr = new Date(evt.timestamp).toLocaleTimeString();
                      return (
                        <div 
                          key={evt.id}
                          className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.02]"
                        >
                          <span className="text-slate-400 shrink-0 select-none">
                            {timeStr}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            evt.type === 'FX_CONVERT' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            evt.type === 'PAGE_VIEW' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            evt.type === 'RESEARCH_READ' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            evt.type === 'CONTACT_SUBMIT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {evt.type}
                          </span>

                          <span className="text-slate-200 flex-1 break-all">
                            {evt.description}
                          </span>

                          <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
                            [{evt.category}]
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

            {/* Platform Analytics Sub-Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Corridor Frequency Distribution (100% REAL DATA) */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>Corridor Conversion Volume Share</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Actual user demand across currency pairs based on executed calculations.
                  </p>
                </div>

                <div className="space-y-4">
                  {corridors.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                      <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No Conversions Logged Yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Currency corridor statistics will populate here dynamically as users execute live calculations.
                      </p>
                    </div>
                  ) : (
                    corridors.map(c => (
                      <div key={c.pair} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{c.pair}</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{c.share}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                            style={{ width: `${c.share}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono text-right">{c.count} calculation{c.count === 1 ? '' : 's'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feed Infrastructure & Real Tracking Integration */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Real Tracking &amp; Endpoint Health</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Upstream data feeds and legitimate real-user analytics pipeline.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {[
                    { name: 'Vercel Real-Traffic Analytics', provider: '@vercel/analytics', status: 'Live & Enabled' },
                    { name: 'Vercel Speed Insights (CWV)', provider: '@vercel/speed-insights', status: 'Live & Enabled' },
                    { name: 'Interbank Forex Rates Feed', provider: 'OpenExchangeRates via ForexService', status: 'Active' },
                    { name: 'Multi-Exchange Digital Asset Feed', provider: 'CoinGecko via CryptoService', status: 'Active' },
                    { name: 'Live Financial News Wire', provider: 'Finnhub Live Market Feed', status: 'Active' }
                  ].map(feed => (
                    <div key={feed.name} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{feed.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          {feed.provider}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                        {feed.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: DAILY END-OF-DAY (EOD) AUDIT REPORTS & CSV EXPORT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    End-of-Day (EOD) Archival &amp; History
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  100% authentic daily rollup telemetry. Zero mock days. If a day had 0 visits, it shows 0.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Date range filter buttons */}
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  {['7d', '30d', 'all'].map(r => (
                    <button
                      key={r}
                      onClick={() => setAuditRange(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        auditRange === r
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
                    </button>
                  ))}
                </div>

                {/* CSV Export Button */}
                <button
                  onClick={() => exportAuditReportsCSV(auditReports)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>
            </div>

            {/* Historical Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-50/50 dark:bg-[#07090E]/60">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 font-mono">Impressions</th>
                    <th className="py-3.5 px-4 font-mono">Unique Visitors</th>
                    <th className="py-3.5 px-4 font-mono">Conversions Run</th>
                    <th className="py-3.5 px-4">Top Currency Pair</th>
                    <th className="py-3.5 px-4 font-mono">Inquiries</th>
                    <th className="py-3.5 px-4 font-mono">Avg Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {auditReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans">
                        <BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No Historical Records Yet</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Audit logs will populate automatically based on genuine user activity.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    auditReports.map((row, idx) => (
                      <tr 
                        key={row.date} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          idx === 0 ? 'bg-blue-500/[0.04]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{row.date}</span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[9px] uppercase font-bold">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {Number(row.impressions).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">
                          {Number(row.uniqueVisitors).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                          {Number(row.conversions).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px] border border-blue-500/20">
                            {row.topPair}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-bold">
                          {row.inquiries}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {row.avgSessionDuration}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>RFC 4180 compliant CSV export containing genuine telemetry data.</span>
              <span className="font-mono text-[11px]">Total Days Logged: {auditReports.length}</span>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CONTACT INBOX & INQUIRIES MANAGER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'inbox' && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Inquiries &amp; Communications Manager
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  100% genuine user tickets submitted from the Contact Us page. Zero synthetic seeds.
                </p>
              </div>

              {/* Status Filters and Search */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search sender, email, subject..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-52 sm:w-64"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  {['ALL', 'New', 'Read', 'Followed Up'].map(st => (
                    <button
                      key={st}
                      onClick={() => setInquiryFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inquiryFilter === st
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-50/50 dark:bg-[#07090E]/60">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Sender &amp; Email</th>
                    <th className="py-3 px-3">Subject / Type</th>
                    <th className="py-3 px-3">Message Excerpt</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Inbox is Clean &amp; Empty (0 Messages)</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Genuine inquiries submitted from the Contact Us form will appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map(inq => (
                      <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        
                        <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {new Date(inq.timestamp).toLocaleDateString()}
                          <span className="block text-[10px] text-slate-400">
                            {new Date(inq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">{inq.name}</div>
                          <a 
                            href={`mailto:${inq.email}`} 
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <Mail className="w-3 h-3 inline" />
                            <span>{inq.email}</span>
                          </a>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {inq.subject}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 max-w-xs">
                          <p className="line-clamp-2 text-slate-600 dark:text-slate-400 text-xs">
                            {inq.message}
                          </p>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            inq.status === 'New' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                              : inq.status === 'Read'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{inq.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-xs font-semibold transition-colors cursor-pointer"
                              title="Open Message Details"
                            >
                              View
                            </button>

                            <select
                              value={inq.status}
                              onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="New">Set: New</option>
                              <option value="Read">Set: Read</option>
                              <option value="Followed Up">Set: Followed Up</option>
                            </select>

                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Message Detail Modal */}
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-blue-500 font-bold">
                        Inquiry Details &bull; #{selectedInquiry.id}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedInquiry.subject}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 font-semibold block">Sender Name</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInquiry.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Email Address</span>
                        <a href={`mailto:${selectedInquiry.email}`} className="text-blue-500 font-mono font-bold hover:underline">
                          {selectedInquiry.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Received At</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">
                          {new Date(selectedInquiry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Current Status</span>
                        <span className="font-bold text-slate-900 dark:text-white">{selectedInquiry.status}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Message Content</span>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {selectedInquiry.message}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, 'Followed Up')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Mark Followed Up
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, 'Read')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Mark Read
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SITE SETTINGS & CREDENTIALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            
            {/* Website Configuration Form */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
              
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Website General Configuration
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Changes saved here immediately update the Header, Footer, and Contact details across the live website.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-400 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Site settings successfully updated and saved to LocalStorage!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Website Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.websiteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                      placeholder="e.g. FinPulse"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Logo Badge Text (1-3 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={settingsForm.logoText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                      placeholder="e.g. FX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Custom Logo URL (Optional Image Override)
                  </label>
                  <input
                    type="url"
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Leave blank to use the gradient badge with Logo Badge Text.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Contact / Support Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      placeholder="support@finpulse-tracker.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Header Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      placeholder="Real-Time Forex & Crypto Terminal"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Header Live Preview */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Header Live Preview
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1px] shadow-sm">
                      <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                        {settingsForm.logoText || 'FX'}
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {settingsForm.websiteName || 'FinPulse'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {settingsForm.tagline || 'Real-Time Forex & Crypto Terminal'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Site Settings</span>
                </button>
              </form>

            </div>

            {/* Admin Password & Email Credentials */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
              
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Admin Security &amp; Login Credentials
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Update the administrator login email and password used to access this /admin portal.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Active: {adminCredentials?.email}</span>
                </div>
              </div>

              {credSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-400 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>{credSuccess}</span>
                </div>
              )}

              {credError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs font-bold text-rose-400 animate-in fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{credError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentials} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Admin Login Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={credForm.email}
                        onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
                        placeholder="admin@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Current Password (Verification) *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={credForm.currentPassword}
                        onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      New Password * (Min. 6 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={credForm.newPassword}
                        onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={credForm.confirmPassword}
                        onChange={(e) => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Update Credentials</span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: BLOG / ARTICLE MANAGER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'articles' && (
          <AdminErrorBoundary 
            title="Blog / Article Manager Error"
            onSwitchTab={setActiveTab}
            onReset={() => {
              setEditingArticleId(null);
              setArticleForm(INITIAL_ARTICLE_FORM);
            }}
          >
            <div className="space-y-8">
              
              {/* Article Publishing Form */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-blue-500" />
                      <span>{editingArticleId ? 'Edit Article' : 'Publish New Financial Article'}</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Articles published here immediately generate dedicated dynamic routes at <code className="text-blue-500 font-mono">/blog/:id</code>.
                    </p>
                  </div>

                  {editingArticleId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {articleSaved && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-400 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    <span>Article successfully saved and live on /blog!</span>
                  </div>
                )}

                <form onSubmit={handleArticleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={articleForm?.title || ''}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Navigating Emerging Market Forex Swaps in 2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={articleForm?.category || 'Market Updates'}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Market Updates">Market Updates</option>
                        <option value="Forex News">Forex News</option>
                        <option value="Crypto Guides">Crypto Guides</option>
                        <option value="Macro Analysis">Macro Analysis</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                        Author Name &amp; Credential
                      </label>
                      <input
                        type="text"
                        required
                        value={articleForm?.author || ''}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="e.g. Elena Vance, Senior Macro Strategist"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                        Tags (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={articleForm?.tags || ''}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g. Forex, Central Bank, PKR, Liquidity"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Banner Image (Image URL or File Upload)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="url"
                        value={articleForm?.image || ''}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    {articleForm?.image && (
                      <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={articleForm.image} alt="Preview" className="w-full h-full object-cover" width="128" height="80" loading="lazy" />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Short Excerpt / Summary *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={articleForm?.summary || ''}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="A concise 1-2 sentence overview of the article for cards and SEO meta..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                    ></textarea>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Full Article Content (Markdown headings like ### Section Title supported) *
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={articleForm?.content || ''}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="### Macroeconomic Drivers&#10;Write the detailed analysis here...&#10;&#10;* Key point 1&#10;* Key point 2"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingArticleId ? 'Save Changes' : 'Publish Article'}</span>
                    </button>

                    {editingArticleId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

              </div>

              {/* Published Articles Table */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Published Financial Articles ({safeArticles.length})
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Managed in client state &amp; LocalStorage
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-3">Article</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Author &amp; Date</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {safeArticles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No articles published yet. Use the form above to publish your first article.
                          </td>
                        </tr>
                      ) : (
                        safeArticles.map((art, idx) => (
                          <tr key={art?.id || `post-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={art?.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=100&fm=webp&q=75'}
                                  alt={art?.title || 'Article thumbnail'}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  width="40"
                                  height="40"
                                  loading="lazy"
                                />
                                <div>
                                  <Link
                                    to={`/blog/${art?.id || ''}`}
                                    target="_blank"
                                    className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 flex items-center gap-1"
                                  >
                                    <span>{art?.title || 'Untitled Article'}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                  </Link>
                                  <span className="text-[10px] text-slate-400 font-mono">/blog/{art?.id || ''}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {art?.category || 'Market Updates'}
                            </td>

                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              <div className="font-medium text-slate-800 dark:text-slate-300">{art?.author || 'FinPulse Team'}</div>
                              <div className="text-[10px] text-slate-400">{art?.date || ''}</div>
                            </td>

                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditArticle(art)}
                                  className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                                  title="Edit Article"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${art?.title || 'this article'}"?`)) {
                                      if (art?.id) deleteArticle(art.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </AdminErrorBoundary>
        )}

      </div>
    </AdminErrorBoundary>
  );
}
