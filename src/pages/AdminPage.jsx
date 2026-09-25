import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';

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

  // Defensive check: guaranteed array
  const safeArticles = Array.isArray(articles) ? articles : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Auth Login State (Email & Password) ---
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Admin Navigation Tabs ---
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'articles'

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

  // --- Safe Blog / Article Manager Form State (All fields guaranteed non-null strings) ---
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
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
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

    console.log('[AdminPage] Submitting login form for:', cleanEmail);
    const res = loginAdmin(cleanEmail, cleanPass);
    if (!res || !res.success) {
      const msg = res?.message || 'Invalid email or password. Please verify your credentials.';
      setLoginError(msg);
      console.warn('[AdminPage] Login rejected:', msg);
    } else {
      setLoginError('');
      setPasswordInput('');
      console.log('[AdminPage] Login accepted! Dashboard unlocked.');
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


  // Handle Image Upload (Converts to Base64 Data URL)
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

  // Handle Article Form Submit (Create or Update)
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

    // Reset form safely
    setArticleForm(INITIAL_ARTICLE_FORM);
    setArticleSaved(true);
    setTimeout(() => setArticleSaved(false), 3000);
  };

  // Edit an existing article
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
    // Scroll smoothly to form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Cancel Edit mode
  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setArticleForm(INITIAL_ARTICLE_FORM);
  };

  // -------------------------------------------------------------
  // VIEW 1: LOGIN SCREEN (When Not Authenticated)
  // -------------------------------------------------------------
  if (!isAdminAuth) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Admin Portal Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your administrator email & password to manage site settings & publish articles.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
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
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
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
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Debug Alert / Log: Clear visible error message state in red text right below inputs */}
            {loginError && (
              <div 
                role="alert" 
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/40 flex items-center gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          {/* Secure Session Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Session auto-locks on browser tab close or clicking Logout &amp; Lock.
            </p>
          </div>

        </div>
      </div>
    );
  }


  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <AdminErrorBoundary title="Admin Dashboard Error">
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold border border-blue-200 dark:border-blue-500/20">
              Admin Portal
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Authenticated Session</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Content & Settings Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-sm"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={logoutAdmin}
            title="Immediately lock the admin dashboard and terminate session"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Logout & Lock</span>
          </button>
        </div>
      </div>


      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Site Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'articles'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Blog / Article Manager ({safeArticles.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: SITE SETTINGS & CREDENTIALS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          
          {/* Card 1: Website General Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
            
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Website General Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Changes saved here immediately update the Header, Footer, and Contact details across the live website.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold uppercase"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
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

          {/* Card 2: Security & Admin Login Credentials */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
            
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Admin Security & Login Credentials
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Change the administrator login email and password used to access this /admin portal.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Active: {adminCredentials?.email}</span>
              </div>
            </div>

            {credSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>{credSuccess}</span>
              </div>
            )}

            {credError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 animate-in fade-in">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
      {/* TAB 2: BLOG / ARTICLE MANAGER */}
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
            
            {/* Article Publishing / Editing Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>{editingArticleId ? 'Edit Article' : 'Publish New Financial Article'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Articles published here immediately generate dedicated dynamic routes at <code className="text-blue-600 dark:text-blue-400 font-mono">/blog/:id</code>.
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
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={articleForm?.category || 'Market Updates'}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Banner Image URL or Local File */}
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
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
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

                {/* Excerpt / Summary */}
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>

                {/* Full Content */}
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-sans"
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

            {/* Existing Articles Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
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
                          
                          {/* Title & Thumbnail */}
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

                          {/* Category */}
                          <td className="py-3 px-3 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {art?.category || 'Market Updates'}
                          </td>

                          {/* Author & Date */}
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div className="font-medium text-slate-800 dark:text-slate-300">{art?.author || 'FinPulse Team'}</div>
                            <div className="text-[10px] text-slate-400">{art?.date || ''}</div>
                          </td>

                          {/* Action buttons */}
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
