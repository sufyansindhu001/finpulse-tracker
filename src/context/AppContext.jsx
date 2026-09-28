import React, { createContext, useContext, useState, useCallback } from 'react';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../data/blogPosts';

const AppContext = createContext();

// -------------------------------------------------------------
// STANDARDIZED PORTAL LOCALSTORAGE KEYS
// -------------------------------------------------------------
export const PORTAL_KEYS = {
  ARTICLES: 'fgc_portal_articles',
  MESSAGES: 'fgc_portal_messages',
  SUBSCRIBERS: 'fgc_portal_subscribers',
  SETTINGS: 'fgc_portal_settings',
  CREDENTIALS: 'fgc_portal_credentials',
  DELETED_MESSAGES: 'fgc_portal_deleted_messages',
  DELETED_ARTICLES: 'fgc_portal_deleted_articles'
};

const DEFAULT_SETTINGS = {
  websiteName: 'FGC Spot',
  logoText: 'FGC',
  logoUrl: '/logo.png',
  contactEmail: 'fgcspot4@gmail.com',
  tagline: 'Real-Time Forex & Crypto Terminal'
};

const DEFAULT_MESSAGES = [
  {
    id: 'msg_welcome_01',
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@finconsult.com',
    subject: 'Forex API Integration & Commercial License',
    message: 'Greetings FGC Spot desk, we are developing an institutional treasury portal and would like to license your real-time interbank PKR and AED feed APIs.',
    timestamp: '2026-09-28T09:15:00.000Z',
    status: 'New'
  },
  {
    id: 'msg_welcome_02',
    name: 'Ayesha Khan',
    email: 'ayesha.k@karachitraders.pk',
    subject: 'Sarafa Gold Rate Calculation Query',
    message: 'Hello, your gold tola calculator is extremely helpful! Could you also add 21K jewelry calculations for Italian designs?',
    timestamp: '2026-09-28T11:42:00.000Z',
    status: 'In Progress'
  }
];

const DEFAULT_SUBSCRIBERS = [
  {
    id: 'sub_001',
    email: 'sufyansindhu001@gmail.com',
    source: 'Direct Portal',
    date: '2026-09-27',
    status: 'Active'
  },
  {
    id: 'sub_002',
    email: 'market.analyst@fgcspot.com',
    source: 'Newsletter Widget',
    date: '2026-09-28',
    status: 'Active'
  },
  {
    id: 'sub_003',
    email: 'treasury@karachifx.org',
    source: 'Daily FX Alert',
    date: '2026-09-28',
    status: 'Active'
  }
];

const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'Sufyansindhu001@gmail.com',
  password: 'Sindhu@101'
};

export function AppProvider({ children }) {
  // -------------------------------------------------------------
  // 1. SITE SETTINGS PERSISTENCE (Key: fgc_portal_settings)
  // -------------------------------------------------------------
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(PORTAL_KEYS.SETTINGS) || localStorage.getItem('fgc_spot_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.contactEmail === 'support@fgcspot.com') {
            parsed.contactEmail = 'fgcspot4@gmail.com';
          }
          if (!parsed.logoUrl || parsed.logoUrl.trim() === '') {
            parsed.logoUrl = '/logo.png';
          }
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          localStorage.setItem(PORTAL_KEYS.SETTINGS, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Error reading site settings:', e);
    }
    try {
      localStorage.setItem(PORTAL_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const updateSiteSettings = (newSettings) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);
    try {
      localStorage.setItem(PORTAL_KEYS.SETTINGS, JSON.stringify(updated));
      localStorage.setItem('fgc_spot_site_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('[AppContext] Error saving site settings:', e);
    }
  };

  // -------------------------------------------------------------
  // 2. ARTICLE MANAGER PERSISTENCE (Key: fgc_portal_articles)
  // -------------------------------------------------------------
  const [articles, setArticles] = useState(() => {
    try {
      const deletedRaw = localStorage.getItem(PORTAL_KEYS.DELETED_ARTICLES);
      const userDeletedList = deletedRaw ? JSON.parse(deletedRaw) : [];

      const legacyBlacklist = [
        'usd-pkr-interbank-vs-open-market-guide',
        'forex-market-volatility-strategies',
        'crypto-market-cycles-bitcoin-dominance',
        'emerging-market-currencies-usd-pegs',
        'crypto-security-wallet-best-practices',
        'digital-remittance-revolution'
      ];

      const allExclusions = new Set([...legacyBlacklist, ...userDeletedList]);

      // 1. Primary check: fgc_portal_articles
      const saved = localStorage.getItem(PORTAL_KEYS.ARTICLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter(post => {
            if (!post) return false;
            return !allExclusions.has(post.id) && !allExclusions.has(post.slug);
          });

          // If empty because user deleted all, return sanitized empty array
          if (parsed.length > 0 && sanitized.length === 0 && userDeletedList.length > 0) {
            return [];
          }

          // If newly initialised or missing our 2 approved human-written guides, merge them if not deleted
          const missingDefaults = INITIAL_BLOG_POSTS.filter(
            initPost => !allExclusions.has(initPost.id) && 
                        !allExclusions.has(initPost.slug) &&
                        !sanitized.some(s => s.id === initPost.id || s.slug === initPost.slug)
          );

          const finalArticles = [...sanitized, ...missingDefaults];
          try {
            localStorage.setItem(PORTAL_KEYS.ARTICLES, JSON.stringify(finalArticles));
            localStorage.setItem('fgc_spot_blog_posts', JSON.stringify(finalArticles));
          } catch {}
          return finalArticles;
        }
      }

      // 2. Fallback check: legacy fgc_spot_blog_posts
      const legacy = localStorage.getItem('fgc_spot_blog_posts');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const sanitized = parsedLegacy.filter(post => {
            if (!post) return false;
            return !allExclusions.has(post.id) && !allExclusions.has(post.slug);
          });
          const missingDefaults = INITIAL_BLOG_POSTS.filter(
            initPost => !allExclusions.has(initPost.id) && 
                        !allExclusions.has(initPost.slug) &&
                        !sanitized.some(s => s.id === initPost.id || s.slug === initPost.slug)
          );
          const finalArticles = [...sanitized, ...missingDefaults];
          localStorage.setItem(PORTAL_KEYS.ARTICLES, JSON.stringify(finalArticles));
          return finalArticles;
        }
      }

      // 3. Not found: Seed with only our 2 approved human-written articles
      const seedArticles = INITIAL_BLOG_POSTS.filter(
        p => !allExclusions.has(p.id) && !allExclusions.has(p.slug)
      );
      try {
        localStorage.setItem(PORTAL_KEYS.ARTICLES, JSON.stringify(seedArticles));
        localStorage.setItem('fgc_spot_blog_posts', JSON.stringify(seedArticles));
      } catch {}
      return seedArticles;
    } catch (e) {
      console.warn('[AppContext] Error initializing articles:', e);
    }
    return INITIAL_BLOG_POSTS;
  });

  const saveArticles = (newArticles) => {
    setArticles(newArticles);
    try {
      localStorage.setItem(PORTAL_KEYS.ARTICLES, JSON.stringify(newArticles));
      localStorage.setItem('fgc_spot_blog_posts', JSON.stringify(newArticles));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fgc_articles_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[AppContext] Error saving articles:', e);
    }
  };

  const addArticle = (newArticle) => {
    const rawTitle = newArticle.title || 'Untitled Financial Guide';
    const generatedSlug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const articleWithId = {
      ...newArticle,
      id: newArticle.id || generatedSlug || `post-${Date.now()}`,
      slug: newArticle.slug || generatedSlug || `post-${Date.now()}`,
      date: newArticle.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: newArticle.readTime || `${Math.max(2, Math.ceil((newArticle.content?.split(' ').length || 100) / 180))} min read`,
      author: newArticle.author || 'FGC Spot Research Team',
      summary: newArticle.summary || newArticle.excerpt || '',
      excerpt: newArticle.excerpt || newArticle.summary || '',
      image: newArticle.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
      tags: Array.isArray(newArticle.tags) ? newArticle.tags : (newArticle.tags ? newArticle.tags.split(',').map(t => t.trim()) : ['Market'])
    };
    const updated = [articleWithId, ...articles];
    saveArticles(updated);
    return articleWithId;
  };

  const updateArticle = (id, updatedFields) => {
    if (!id) return;
    const updated = articles.map(art => {
      if (art.id === id || art.slug === id) {
        const summaryText = updatedFields.summary !== undefined ? updatedFields.summary : (art.summary || art.excerpt || '');
        const excerptText = updatedFields.excerpt !== undefined ? updatedFields.excerpt : (art.excerpt || summaryText);
        return {
          ...art,
          ...updatedFields,
          summary: summaryText,
          excerpt: excerptText,
          tags: Array.isArray(updatedFields.tags) 
            ? updatedFields.tags 
            : (updatedFields.tags ? updatedFields.tags.split(',').map(t => t.trim()) : art.tags)
        };
      }
      return art;
    });
    saveArticles(updated);
  };

  const deleteArticle = (id) => {
    if (!id) return;
    try {
      const deletedRaw = localStorage.getItem(PORTAL_KEYS.DELETED_ARTICLES);
      const deletedList = deletedRaw ? JSON.parse(deletedRaw) : [];
      const target = articles.find(art => art.id === id || art.slug === id);
      const identifiersToExclude = [id];
      if (target?.id && !identifiersToExclude.includes(target.id)) identifiersToExclude.push(target.id);
      if (target?.slug && !identifiersToExclude.includes(target.slug)) identifiersToExclude.push(target.slug);

      identifiersToExclude.forEach(identifier => {
        if (!deletedList.includes(identifier)) {
          deletedList.push(identifier);
        }
      });
      localStorage.setItem(PORTAL_KEYS.DELETED_ARTICLES, JSON.stringify(deletedList));
    } catch (e) {
      console.warn('[AppContext] Error tracking deleted article:', e);
    }

    const updated = articles.filter(art => art.id !== id && art.slug !== id);
    saveArticles(updated);
    return updated;
  };

  // -------------------------------------------------------------
  // 3. MESSAGES & INQUIRIES PERSISTENCE (Key: fgc_portal_messages)
  // -------------------------------------------------------------
  const [messages, setMessages] = useState(() => {
    try {
      const deletedRaw = localStorage.getItem(PORTAL_KEYS.DELETED_MESSAGES);
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];

      // 1. Primary check: fgc_portal_messages
      const saved = localStorage.getItem(PORTAL_KEYS.MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => m && !deletedIds.includes(m.id));
        }
      }

      // 2. Fallback check: legacy fgc_spot_inquiries
      const legacy = localStorage.getItem('fgc_spot_inquiries');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const filtered = parsedLegacy.filter(m => m && !deletedIds.includes(m.id));
          localStorage.setItem(PORTAL_KEYS.MESSAGES, JSON.stringify(filtered));
          return filtered;
        }
      }

      // 3. Seed once with default initial messages
      localStorage.setItem(PORTAL_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
      localStorage.setItem('fgc_spot_inquiries', JSON.stringify(DEFAULT_MESSAGES));
      return DEFAULT_MESSAGES;
    } catch (e) {
      console.warn('[AppContext] Error initializing messages:', e);
    }
    return DEFAULT_MESSAGES;
  });

  const saveMessages = (newMessages) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(PORTAL_KEYS.MESSAGES, JSON.stringify(newMessages));
      localStorage.setItem('fgc_spot_inquiries', JSON.stringify(newMessages));
    } catch (e) {
      console.warn('[AppContext] Error saving messages:', e);
    }
  };

  const addMessage = (newMsg) => {
    const msgWithId = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: (newMsg.name || 'Anonymous Guest').trim(),
      email: (newMsg.email || 'no-reply@domain.com').trim(),
      subject: newMsg.subject || 'General Inquiry',
      message: (newMsg.message || '').trim(),
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    const updated = [msgWithId, ...messages];
    saveMessages(updated);
    return msgWithId;
  };

  const updateMessageStatus = (id, newStatus) => {
    const updated = messages.map(m => m.id === id ? { ...m, status: newStatus } : m);
    saveMessages(updated);
    return updated;
  };

  const deleteMessage = (id) => {
    if (!id) return;
    try {
      const deletedRaw = localStorage.getItem(PORTAL_KEYS.DELETED_MESSAGES);
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(PORTAL_KEYS.DELETED_MESSAGES, JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.warn('[AppContext] Error tracking deleted message:', e);
    }

    const filtered = messages.filter(m => m.id !== id);
    saveMessages(filtered);
    return filtered;
  };

  // -------------------------------------------------------------
  // 4. SUBSCRIBER LIST PERSISTENCE (Key: fgc_portal_subscribers)
  // -------------------------------------------------------------
  const [subscribers, setSubscribers] = useState(() => {
    try {
      const saved = localStorage.getItem(PORTAL_KEYS.SUBSCRIBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      localStorage.setItem(PORTAL_KEYS.SUBSCRIBERS, JSON.stringify(DEFAULT_SUBSCRIBERS));
    } catch (e) {
      console.warn('[AppContext] Error initializing subscribers:', e);
    }
    return DEFAULT_SUBSCRIBERS;
  });

  const saveSubscribers = (newSubscribers) => {
    setSubscribers(newSubscribers);
    try {
      localStorage.setItem(PORTAL_KEYS.SUBSCRIBERS, JSON.stringify(newSubscribers));
    } catch (e) {
      console.warn('[AppContext] Error saving subscribers:', e);
    }
  };

  const addSubscriber = (email, source = 'Website') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (subscribers.some(s => s.email.toLowerCase() === cleanEmail)) {
      return { success: true, message: 'You are already subscribed to market updates!' };
    }
    const newSub = {
      id: 'sub_' + Date.now(),
      email: cleanEmail,
      source,
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    const updated = [newSub, ...subscribers];
    saveSubscribers(updated);
    return { success: true, message: 'Successfully subscribed to real-time market alerts!', subscriber: newSub };
  };

  const deleteSubscriber = (idOrEmail) => {
    const updated = subscribers.filter(s => s.id !== idOrEmail && s.email.toLowerCase() !== idOrEmail.toLowerCase());
    saveSubscribers(updated);
    return updated;
  };

  // -------------------------------------------------------------
  // 5. ADMIN CREDENTIALS PERSISTENCE (Key: fgc_portal_credentials)
  // -------------------------------------------------------------
  const [adminCredentials, setAdminCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem(PORTAL_KEYS.CREDENTIALS) || localStorage.getItem('fgc_spot_admin_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password && parsed.email.toLowerCase() !== 'admin@fgcspot.com') {
          const creds = {
            email: parsed.email.trim(),
            password: parsed.password
          };
          localStorage.setItem(PORTAL_KEYS.CREDENTIALS, JSON.stringify(creds));
          return creds;
        }
      }
    } catch (e) {
      console.warn('[AppContext] Error reading credentials:', e);
    }
    try {
      localStorage.setItem(PORTAL_KEYS.CREDENTIALS, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
    } catch {}
    return DEFAULT_ADMIN_CREDENTIALS;
  });

  const updateAdminCredentials = (newEmail, newPassword) => {
    const updated = {
      email: (newEmail || '').trim(),
      password: newPassword
    };
    setAdminCredentials(updated);
    try {
      localStorage.setItem(PORTAL_KEYS.CREDENTIALS, JSON.stringify(updated));
      localStorage.setItem('fgc_spot_admin_credentials', JSON.stringify(updated));
    } catch (e) {
      console.warn('[AppContext] Error saving credentials:', e);
    }
    return { success: true };
  };

  // -------------------------------------------------------------
  // 6. ADMIN AUTHENTICATION SESSION GATE
  // -------------------------------------------------------------
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    try {
      return sessionStorage.getItem('fgc_spot_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const loginAdmin = useCallback((inputEmail, inputPassword) => {
    const cleanInputEmail = (inputEmail || '').trim().toLowerCase();
    const cleanSavedEmail = (adminCredentials?.email || DEFAULT_ADMIN_CREDENTIALS.email || '').trim().toLowerCase();
    const cleanInputPass = (inputPassword || '').trim();
    const exactInputPass = inputPassword || '';
    const cleanSavedPass = (adminCredentials?.password || DEFAULT_ADMIN_CREDENTIALS.password || '').trim();
    const exactSavedPass = adminCredentials?.password || DEFAULT_ADMIN_CREDENTIALS.password;

    const isPasswordMatch = exactInputPass === exactSavedPass || cleanInputPass === cleanSavedPass;

    if (cleanInputEmail === cleanSavedEmail && isPasswordMatch) {
      setIsAdminAuth(true);
      try {
        sessionStorage.setItem('fgc_spot_admin_logged_in', 'true');
      } catch (err) {
        console.warn('sessionStorage is unavailable:', err);
      }
      return { success: true };
    }

    if (cleanInputEmail !== cleanSavedEmail) {
      return { 
        success: false, 
        message: 'Invalid Admin Email address. Please check your email.' 
      };
    }

    return { 
      success: false, 
      message: 'Invalid Admin Password. Please check your password.' 
    };
  }, [adminCredentials]);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuth(false);
    try {
      sessionStorage.removeItem('fgc_spot_admin_logged_in');
    } catch (err) {
      console.warn('sessionStorage is unavailable:', err);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      // Site Settings
      siteSettings,
      updateSiteSettings,
      // Article Manager
      articles,
      addArticle,
      updateArticle,
      deleteArticle,
      // Messages & Inquiries
      messages,
      inquiries: messages,
      addMessage,
      recordInquiry: addMessage,
      updateMessageStatus,
      updateInquiryStatus: updateMessageStatus,
      deleteMessage,
      deleteInquiry: deleteMessage,
      // Subscriber List
      subscribers,
      addSubscriber,
      deleteSubscriber,
      // Admin Credentials & Auth
      adminCredentials,
      updateAdminCredentials,
      isAdminAuth,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
