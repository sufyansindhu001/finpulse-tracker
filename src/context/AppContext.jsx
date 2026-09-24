import React, { createContext, useContext, useState } from 'react';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../data/blogPosts';

const AppContext = createContext();


const DEFAULT_SETTINGS = {
  websiteName: 'FinPulse',
  logoText: 'FX',
  logoUrl: '',
  contactEmail: 'support@finpulse-tracker.com',
  tagline: 'Real-Time Forex & Crypto Terminal'
};

export function AppProvider({ children }) {
  // 1. Site Settings with LocalStorage persistence
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('finpulse_site_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading site settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSiteSettings = (newSettings) => {
    const updated = { ...siteSettings, ...newSettings };
    setSiteSettings(updated);
    try {
      localStorage.setItem('finpulse_site_settings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving site settings to localStorage:', e);
    }
  };

  // 2. Blog Posts with LocalStorage persistence
  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('finpulse_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading articles from localStorage:', e);
    }
    return INITIAL_BLOG_POSTS;
  });

  const saveArticles = (newArticles) => {
    setArticles(newArticles);
    try {
      localStorage.setItem('finpulse_blog_posts', JSON.stringify(newArticles));
    } catch (e) {
      console.warn('Error saving articles to localStorage:', e);
    }
  };

  const addArticle = (newArticle) => {
    const articleWithId = {
      ...newArticle,
      id: newArticle.id || newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `post-${Date.now()}`,
      slug: newArticle.slug || newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      date: newArticle.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: newArticle.readTime || `${Math.max(2, Math.ceil((newArticle.content?.split(' ').length || 100) / 180))} min read`,
      author: newArticle.author || 'FinPulse Research Team',
      image: newArticle.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      tags: Array.isArray(newArticle.tags) ? newArticle.tags : (newArticle.tags ? newArticle.tags.split(',').map(t => t.trim()) : ['Market'])
    };
    const updated = [articleWithId, ...articles];
    saveArticles(updated);
    return articleWithId;
  };

  const updateArticle = (id, updatedFields) => {
    const updated = articles.map(art => {
      if (art.id === id) {
        return {
          ...art,
          ...updatedFields,
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
    const updated = articles.filter(art => art.id !== id);
    saveArticles(updated);
  };

  // 3. Configurable Admin Credentials with LocalStorage persistence
  const DEFAULT_ADMIN_CREDENTIALS = {
    email: 'admin@finpulse.com',
    password: 'YourSecretPassword2026'
  };

  const [adminCredentials, setAdminCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('finpulse_admin_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) return parsed;
      }
    } catch (e) {
      console.warn('Error reading admin credentials from localStorage:', e);
    }
    return DEFAULT_ADMIN_CREDENTIALS;
  });

  const updateAdminCredentials = (newEmail, newPassword) => {
    const updated = {
      email: (newEmail || '').trim().toLowerCase(),
      password: newPassword
    };
    setAdminCredentials(updated);
    try {
      localStorage.setItem('finpulse_admin_credentials', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving admin credentials to localStorage:', e);
    }
    return { success: true };
  };

  // 4. Session-Based Admin Authentication (Auto-Locks when session ends or tab closes)
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    try {
      return sessionStorage.getItem('finpulse_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const loginAdmin = (inputEmail, inputPassword) => {
    const cleanEmail = (inputEmail || '').trim().toLowerCase();
    const cleanPass = inputPassword || '';

    if (
      cleanEmail === adminCredentials.email.toLowerCase() &&
      cleanPass === adminCredentials.password
    ) {
      setIsAdminAuth(true);
      try {
        sessionStorage.setItem('finpulse_admin_logged_in', 'true');
      } catch {
        // sessionStorage might be disabled in private browsing
      }
      return { success: true };
    }

    if (cleanEmail !== adminCredentials.email.toLowerCase()) {
      return { 
        success: false, 
        message: 'Invalid Admin Email address.' 
      };
    }

    return { 
      success: false, 
      message: 'Invalid Admin Password. Please check your password.' 
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuth(false);
    try {
      sessionStorage.removeItem('finpulse_admin_logged_in');
    } catch {
      // sessionStorage might be disabled in private browsing
    }
  };

  return (
    <AppContext.Provider value={{
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
