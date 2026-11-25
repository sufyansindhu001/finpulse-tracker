import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';
import { fetchArticlesSWR, getCachedArticles, ARTICLES_CACHE_KEY, updateArticlesCache } from '../services/articlesService';

const AppContext = createContext();

// -------------------------------------------------------------
// STANDARDIZED PORTAL LOCALSTORAGE KEYS
// -------------------------------------------------------------
export const PORTAL_KEYS = {
  ARTICLES: ARTICLES_CACHE_KEY || 'fgc_portal_articles_v3',
  MESSAGES: 'fgc_portal_messages',
  SUBSCRIBERS: 'fgc_portal_subscribers',
  SETTINGS: 'fgc_portal_settings',
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

const DEFAULT_MESSAGES = [];

const DEFAULT_SUBSCRIBERS = [];

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
  const [articles, setArticles] = useState(() => getCachedArticles());

  // Keep AppContext articles synced with SWR edge cache in background
  useEffect(() => {
    let isMounted = true;

    fetchArticlesSWR((freshArticles) => {
      if (isMounted && Array.isArray(freshArticles) && freshArticles.length > 0) {
        setArticles(freshArticles);
      }
    });

    const handleSync = () => {
      const cached = getCachedArticles();
      if (isMounted && cached.length > 0) {
        setArticles(cached);
      }
    };

    window.addEventListener('fgc_articles_updated', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('fgc_articles_updated', handleSync);
    };
  }, []);

  const saveArticles = (newArticles) => {
    setArticles(newArticles);
    try {
      const cacheKey = ARTICLES_CACHE_KEY || 'fgc_portal_articles_v3';
      localStorage.setItem(cacheKey, JSON.stringify(newArticles));
      localStorage.setItem('fgc_portal_articles', JSON.stringify(newArticles));
      localStorage.setItem('fgc_spot_blog_posts', JSON.stringify(newArticles));
      updateArticlesCache(newArticles);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fgc_articles_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[AppContext] Error saving articles:', e);
    }
  };

  const addArticle = async (newArticle) => {
    const rawTitle = (newArticle.title || '').trim() || 'Untitled Financial Guide';
    const cleanSlug = newArticle.slug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `post-${Date.now()}`;
    const newId = newArticle.id || ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : cleanSlug);
    
    const articleWithId = normalizeArticle({
      ...newArticle,
      id: newId,
      slug: cleanSlug,
      title: rawTitle,
      date: newArticle.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: newArticle.readTime || `${Math.max(1, Math.ceil(((newArticle.content || '').split(' ').length) / 200))} min read`,
      author: newArticle.author || 'Sufyan Sindhu',
      summary: newArticle.summary || newArticle.excerpt || '',
      excerpt: newArticle.excerpt || newArticle.summary || '',
      image: newArticle.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
      tags: Array.isArray(newArticle.tags) ? newArticle.tags : (newArticle.tags ? newArticle.tags.split(',').map(t => t.trim()) : ['Market'])
    });

    try {
      await supabase.from('articles').insert([{
        id: articleWithId.id,
        slug: articleWithId.slug,
        title: articleWithId.title,
        category: articleWithId.category,
        author: articleWithId.author,
        tags: articleWithId.tags,
        image: articleWithId.image,
        excerpt: articleWithId.excerpt,
        content: articleWithId.content,
        read_time: articleWithId.read_time,
        created_at: articleWithId.created_at
      }]);
    } catch (e) {
      console.warn('[AppContext] Supabase insert error:', e);
    }

    let currentList = articles;
    try {
      const saved = localStorage.getItem(PORTAL_KEYS.ARTICLES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentList = parsed;
      }
    } catch {}

    const updated = [articleWithId, ...currentList.filter(a => a.id !== articleWithId.id && a.slug !== articleWithId.slug)];
    saveArticles(updated);
    return articleWithId;
  };

  const updateArticle = async (id, updatedFields) => {
    if (!id) return;
    const newImage = updatedFields.image !== undefined ? updatedFields.image : undefined;

    try {
      const dbUpdate = {
        title: updatedFields.title,
        category: updatedFields.category,
        author: updatedFields.author,
        tags: updatedFields.tags,
        excerpt: updatedFields.excerpt || updatedFields.summary,
        content: updatedFields.content,
        read_time: updatedFields.read_time || updatedFields.readTime
      };
      if (newImage !== undefined) {
        dbUpdate.image = newImage;
      }

      await supabase
        .from('articles')
        .update(dbUpdate)
        .or(`id.eq.${id},slug.eq.${id}`);
    } catch (e) {
      console.warn('[AppContext] Supabase update error:', e);
    }

    let currentList = articles;
    try {
      const cacheKey = ARTICLES_CACHE_KEY || 'fgc_portal_articles_v3';
      const saved = localStorage.getItem(cacheKey) || localStorage.getItem('fgc_portal_articles');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentList = parsed;
      }
    } catch {}

    const updated = currentList.map(art => {
      if (art.id === id || art.slug === id) {
        const summaryText = updatedFields.summary !== undefined ? updatedFields.summary : (art.summary || art.excerpt || '');
        const excerptText = updatedFields.excerpt !== undefined ? updatedFields.excerpt : (art.excerpt || summaryText);
        const resolvedImage = newImage !== undefined ? newImage : (art.image || art.coverImage);
        return normalizeArticle({
          ...art,
          ...updatedFields,
          image: resolvedImage,
          coverImage: resolvedImage,
          featuredImage: resolvedImage,
          summary: summaryText,
          excerpt: excerptText,
          updated_at: new Date().toISOString(),
          tags: Array.isArray(updatedFields.tags) 
            ? updatedFields.tags 
            : (updatedFields.tags ? updatedFields.tags.split(',').map(t => t.trim()) : art.tags)
        });
      }
      return art;
    });
    saveArticles(updated);
  };

  const deleteArticle = async (id) => {
    if (!id) return;
    try {
      await supabase.from('articles').delete().or(`id.eq.${id},slug.eq.${id}`);
    } catch (e) {
      console.warn('[AppContext] Supabase delete error:', e);
    }

    try {
      const deletedRaw = localStorage.getItem(PORTAL_KEYS.DELETED_ARTICLES);
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(PORTAL_KEYS.DELETED_ARTICLES, JSON.stringify(deletedIds));
      }
    } catch {}

    let currentList = articles;
    try {
      const saved = localStorage.getItem(PORTAL_KEYS.ARTICLES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentList = parsed;
      }
    } catch {}

    const updated = currentList.filter(art => art.id !== id && art.slug !== id);
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
  // 5. SUPABASE AUTHENTICATION & SECURE RBAC SESSION MANAGEMENT
  // -------------------------------------------------------------
  const [adminUser, setAdminUser] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Verifies whether an authenticated user is explicitly authorized in the database
   * administrator registry (public.admin_users) or via check_is_admin RPC.
   * Ordinary authenticated users without an admin_users entry are strictly denied.
   */
  const verifyAdminAuthorization = useCallback(async (user) => {
    if (!user || !user.id) return { isAuthorized: false, role: null };

    try {
      // 1. Primary check: Server-side check_is_admin RPC (security definer)
      const { data: isRpcAdmin, error: rpcErr } = await supabase.rpc('check_is_admin');
      if (!rpcErr && typeof isRpcAdmin === 'boolean') {
        if (isRpcAdmin) {
          return { isAuthorized: true, role: 'admin' };
        }
        return { isAuthorized: false, role: null };
      }

      // 2. Direct RLS query on public.admin_users (users may only view their own record)
      const { data: adminRecord, error: tableErr } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!tableErr && adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'super_admin')) {
        return { isAuthorized: true, role: adminRecord.role };
      }

      return { isAuthorized: false, role: null };
    } catch (err) {
      console.warn('[AppContext] Authorization verification error:', err);
      return { isAuthorized: false, role: null };
    }
  }, []);

  const checkAndSetUser = useCallback(async (user) => {
    if (!user) {
      setAdminUser(null);
      setAdminRole(null);
      setIsAdminAuth(false);
      return false;
    }

    const { isAuthorized, role } = await verifyAdminAuthorization(user);
    if (isAuthorized) {
      setAdminUser(user);
      setAdminRole(role);
      setIsAdminAuth(true);
      return true;
    } else {
      setAdminUser(user);
      setAdminRole(null);
      setIsAdminAuth(false);
      return false;
    }
  }, [verifyAdminAuthorization]);

  useEffect(() => {
    let isMounted = true;

    // Check existing active Supabase Auth session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          await checkAndSetUser(session.user);
        } else {
          setAdminUser(null);
          setAdminRole(null);
          setIsAdminAuth(false);
        }
        setAuthLoading(false);
      }
    }).catch(err => {
      console.warn('[AppContext] Supabase getSession error:', err);
      if (isMounted) setAuthLoading(false);
    });

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        if (session?.user) {
          await checkAndSetUser(session.user);
        } else {
          setAdminUser(null);
          setAdminRole(null);
          setIsAdminAuth(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [checkAndSetUser]);

  const loginAdmin = useCallback(async (inputEmail, inputPassword) => {
    const cleanEmail = (inputEmail || '').trim();
    const cleanPass = inputPassword || '';

    if (!cleanEmail || !cleanPass) {
      return { 
        success: false, 
        message: 'Please provide both your administrator email and password.' 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (error) {
        return { 
          success: false, 
          message: error.message || 'Invalid administrator credentials. Authentication failed.' 
        };
      }

      if (data?.user) {
        // Enforce database-level administrator role verification
        const isAuthorized = await checkAndSetUser(data.user);
        if (isAuthorized) {
          return { success: true, user: data.user };
        } else {
          // User is authenticated in Supabase Auth, but NOT an authorized administrator
          await supabase.auth.signOut();
          setAdminUser(null);
          setAdminRole(null);
          setIsAdminAuth(false);
          return { 
            success: false, 
            message: 'Access Denied: This account is authenticated, but is not registered in the database administrator registry (public.admin_users). Please contact the website owner.' 
          };
        }
      }

      return { success: false, message: 'Authentication failed. Please try again.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Unexpected authentication error.' };
    }
  }, [checkAndSetUser]);

  const logoutAdmin = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AppContext] Supabase signOut error:', err);
    } finally {
      setAdminUser(null);
      setAdminRole(null);
      setIsAdminAuth(false);
      try {
        sessionStorage.removeItem('fgc_spot_admin_logged_in');
      } catch {}
    }
  }, []);

  const updateAdminCredentials = useCallback(async (newEmail, newPassword) => {
    try {
      const updateData = {};
      if (newEmail && newEmail.trim()) {
        updateData.email = newEmail.trim();
      }
      if (newPassword && newPassword.trim()) {
        updateData.password = newPassword.trim();
      }

      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) {
        return { success: false, message: error.message || 'Failed to update admin credentials.' };
      }

      if (data?.user) {
        setAdminUser(data.user);
      }
      return { success: true, message: 'Administrator credentials updated successfully in Supabase Auth.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Error updating credentials.' };
    }
  }, []);

  // Backwards-compatible credential object for components reading adminCredentials?.email
  const adminCredentials = {
    email: adminUser?.email || ''
  };

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
      adminUser,
      adminRole,
      adminCredentials,
      updateAdminCredentials,
      isAdminAuth,
      authLoading,
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
