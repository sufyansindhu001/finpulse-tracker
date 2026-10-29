import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Check, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  BookOpen, 
  Image as ImageIcon,
  Upload,
  Loader2
} from 'lucide-react';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';
import { compressImageFile } from '../utils/imageCompressor';
import GalleryModal from './GalleryModal';
import { ARTICLES_CACHE_KEY, updateArticlesCache } from '../services/articlesService';

const STORAGE_KEY = ARTICLES_CACHE_KEY || 'fgc_portal_articles_v3';
const LEGACY_STORAGE_KEY = 'fgc_spot_blog_posts';

const INITIAL_FORM_STATE = {
  title: '',
  category: 'Stocks & Equities',
  image: '',
  author: 'Sufyan Saleem (Financial Research Desk)',
  summary: '',
  content: '',
  tags: 'Stocks, Equities, Market'
};

export default function ArticleManager() {
  const [articles, setArticles] = useState([]);
  const [articleForm, setArticleForm] = useState(INITIAL_FORM_STATE);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleSaved, setArticleSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('ALL');

  // Local storage fallback loader
  const loadArticlesFromStorage = useCallback(() => {
    try {
      const deletedRaw = localStorage.getItem('fgc_portal_deleted_articles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];

      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('fgc_portal_articles');
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.flatMap(a => [a.id, a.slug]));
          const missingBuiltins = INITIAL_BLOG_POSTS.filter(b => 
            !existingIds.has(b.id) && 
            !existingIds.has(b.slug) && 
            !deletedIds.includes(b.id) && 
            !deletedIds.includes(b.slug)
          );
          if (missingBuiltins.length > 0) {
            const merged = [...parsed, ...missingBuiltins].map(normalizeArticle);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(merged));
            setArticles(merged);
            return;
          }
          setArticles(parsed.map(normalizeArticle));
          return;
        }
      }

      // Seed only when key is completely null
      const defaultNormalized = INITIAL_BLOG_POSTS.map(normalizeArticle);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNormalized));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(defaultNormalized));
      setArticles(defaultNormalized);
    } catch (e) {
      console.error('[ArticleManager] Error loading articles:', e);
      setArticles(INITIAL_BLOG_POSTS.map(normalizeArticle));
    }
  }, []);

  // Primary cloud loader: fetch from Supabase
  const fetchArticlesFromSupabase = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeArticle);
        setArticles(normalized);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(normalized));
        } catch {}
        return;
      }
    } catch (err) {
      console.warn('[ArticleManager] Supabase fetch error, fallback to local storage:', err);
    } finally {
      setLoading(false);
    }

    loadArticlesFromStorage();
  }, [loadArticlesFromStorage]);

  useEffect(() => {
    fetchArticlesFromSupabase();

    const handleSync = () => fetchArticlesFromSupabase();
    window.addEventListener('fgc_articles_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('fgc_articles_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchArticlesFromSupabase]);

  // Helper to persist articles list to storage & dispatch sync events
  const persistArticles = (updatedList) => {
    setArticles(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      localStorage.setItem('fgc_portal_articles', JSON.stringify(updatedList));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedList));
      updateArticlesCache(updatedList);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fgc_articles_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('[ArticleManager] Error persisting articles:', e);
    }
  };

  // 2. Publish / Edit Submission Handler
  const handleArticleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const rawTitle = (articleForm.title || '').trim();
    if (!rawTitle) {
      alert('Please enter an article title.');
      return;
    }

    // Auto-generate a URL slug from the title if not provided
    const slug = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `article-${Date.now()}`;

    const tags = Array.isArray(articleForm.tags) 
      ? articleForm.tags 
      : (typeof articleForm.tags === 'string' ? articleForm.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Market']);

    const content = articleForm.content || '';
    const read_time = `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min read`;
    const author = articleForm.author || 'Sufyan Saleem (Financial Research Desk)';
    const excerpt = articleForm.summary || articleForm.excerpt || '';
    const category = articleForm.category || 'Stocks & Equities';

    // Find existing article if in edit mode
    const currentArticle = editingArticleId 
      ? articles.find(a => a.id === editingArticleId || a.slug === editingArticleId) 
      : null;

    // Resolve cover image: prioritize freshly selected form state image, then existing article image, then smart category fallback
    let image = (articleForm.image || '').trim();
    if (!image && currentArticle) {
      image = (currentArticle.image || currentArticle.coverImage || currentArticle.cover_image || currentArticle.featuredImage || '').trim();
    }
    if (!image) {
      const cat = category.toLowerCase();
      if (cat.includes('crypto')) {
        image = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80';
      } else if (cat.includes('gold') || cat.includes('metal')) {
        image = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80';
      } else if (cat.includes('forex') || cat.includes('currency')) {
        image = 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80';
      } else {
        image = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';
      }
    }

    if (editingArticleId) {
      // NOTE: Supabase articles schema contains ONLY 'image' column (NO 'cover_image' column!)
      const dbUpdatePayload = {
        title: rawTitle,
        category,
        author,
        tags,
        image,
        excerpt,
        content,
        read_time
      };

      try {
        const { error } = await supabase
          .from('articles')
          .update(dbUpdatePayload)
          .or(`id.eq.${editingArticleId},slug.eq.${editingArticleId}`);
        if (error) {
          console.error('[ArticleManager] Supabase update error:', error);
        }
      } catch (err) {
        console.warn('[ArticleManager] Supabase update error:', err);
      }

      const updatedList = articles.map(art => {
        if (art.id === editingArticleId || art.slug === editingArticleId) {
          return normalizeArticle({
            ...art,
            ...dbUpdatePayload,
            cover_image: image,
            coverImage: image,
            featuredImage: image,
            updated_at: new Date().toISOString()
          });
        }
        return art;
      });

      persistArticles(updatedList);
      setEditingArticleId(null);
    } else {
      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `art-${Date.now()}`;
      // NOTE: Supabase articles schema contains ONLY 'image' column (NO 'cover_image' column!)
      const newDbArticle = {
        id: newId,
        slug,
        title: rawTitle,
        category,
        author,
        tags,
        image,
        excerpt,
        content,
        read_time,
        created_at: new Date().toISOString()
      };

      try {
        const { error } = await supabase.from('articles').insert([newDbArticle]);
        if (error) {
          console.error('[ArticleManager] Supabase insert error:', error);
        }
      } catch (err) {
        console.warn('[ArticleManager] Supabase insert error:', err);
      }

      const normalized = normalizeArticle({
        ...newDbArticle,
        cover_image: image,
        coverImage: image,
        featuredImage: image
      });
      const updatedList = [normalized, ...articles.filter(a => a.id !== normalized.id && a.slug !== normalized.slug)];
      persistArticles(updatedList);
    }

    setArticleForm(INITIAL_FORM_STATE);
    setArticleSaved(true);
    setTimeout(() => setArticleSaved(false), 3000);
  };

  // Edit action
  const handleEditArticle = (art) => {
    if (!art) return;
    setEditingArticleId(art.id || art.slug || null);
    const existingImg = art.image || art.coverImage || art.cover_image || art.featuredImage || art.img || '';
    setArticleForm({
      title: art.title || '',
      category: art.category || 'Stocks & Equities',
      image: existingImg,
      author: art.author || 'Sufyan Saleem (Financial Research Desk)',
      summary: art.summary || art.excerpt || '',
      content: art.content || '',
      tags: Array.isArray(art.tags) ? art.tags.join(', ') : (art.tags || '')
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingArticleId(null);
    setArticleForm(INITIAL_FORM_STATE);
  };

  // Delete action: immediately update Supabase & localStorage
  const handleDeleteArticle = async (targetId) => {
    if (!window.confirm('Are you sure you want to permanently delete this article?')) return;
    
    try {
      await supabase
        .from('articles')
        .delete()
        .or(`id.eq.${targetId},slug.eq.${targetId}`);
    } catch (err) {
      console.warn('[ArticleManager] Supabase delete error:', err);
    }

    try {
      const deletedRaw = localStorage.getItem('fgc_portal_deleted_articles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(targetId)) {
        deletedIds.push(targetId);
        localStorage.setItem('fgc_portal_deleted_articles', JSON.stringify(deletedIds));
      }
    } catch {}

    const updated = articles.filter(a => a.id !== targetId && a.slug !== targetId);
    persistArticles(updated);
  };

  // File Upload Handler with /api/upload integration & fallback
  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file fires onChange cleanly
    e.target.value = '';

    setIsUploadingImage(true);
    setUploadSuccessMsg('');

    try {
      // 1. Instant client-side compression to lightweight high-res WebP/JPEG (~60-90KB)
      const compressedDataUrl = await compressImageFile(file, 1200, 800, 0.82);
      const readyImage = compressedDataUrl || '';

      // Immediately bind to state so the preview updates with zero latency
      if (readyImage) {
        setArticleForm(prev => ({ ...prev, image: readyImage }));
      }

      // 2. Post to /api/upload endpoint for verification/server-side processing
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: readyImage,
            filename: file.name,
            type: file.type
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result && result.success && result.url) {
            setArticleForm(prev => ({ ...prev, image: result.url }));
          }
        }
      } catch (apiErr) {
        // Fallback already bound via readyImage; continue seamlessly
        console.warn('[ArticleManager] /api/upload network fallback to client data URL:', apiErr);
      }

      setUploadSuccessMsg('Cover image loaded successfully!');
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[ArticleManager] Image upload error:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setArticleForm(prev => ({ ...prev, image: String(reader.result) }));
          setUploadSuccessMsg('Cover image loaded!');
          setTimeout(() => setUploadSuccessMsg(''), 4000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getCategoryBadgeClass = (category = '') => {
    const c = (category || '').toLowerCase();
    if (c.includes('stock') || c.includes('equit')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (c.includes('crypto') || c.includes('bitcoin')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    if (c.includes('forex') || c.includes('currenc') || c.includes('market')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (c.includes('gold') || c.includes('commodit') || c.includes('metal')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (c.includes('econom') || c.includes('central bank')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  };

  const filteredArticles = useMemo(() => {
    if (tableCategoryFilter === 'ALL') return articles;
    return articles.filter(a => {
      const cat = (a.category || '').toLowerCase();
      const target = tableCategoryFilter.toLowerCase();
      return cat.includes(target) || target.includes(cat);
    });
  }, [articles, tableCategoryFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Article Publishing / Editing Form */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              <span>{editingArticleId ? 'Edit Article' : 'Publish New Financial Article'}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Articles published here are permanently saved to <code className="text-blue-500 font-mono">fgc_portal_articles</code> and immediately live on <code className="text-blue-500 font-mono">/blog</code>.
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
            <span>Article successfully saved to localStorage and live on /blog!</span>
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
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Understanding Interbank vs Open Market Currency Rates"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Category *
              </label>
              <select
                value={articleForm.category}
                onChange={(e) => setArticleForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Stocks & Equities">Stocks & Equities (Company Deep-Dives, Market Analysis)</option>
                <option value="Cryptocurrency">Cryptocurrency (Bitcoin, Altcoins, Digital Assets)</option>
                <option value="Markets & Forex">Markets & Forex (Exchange Rates, FX Corridors)</option>
                <option value="Gold & Commodities">Gold & Commodities (Bullion, Precious Metals, Oil)</option>
                <option value="Economy & Central Banks">Economy & Central Banks (SBP, Fed, Macro Policy)</option>
                <option value="Macro Analysis">Macro Analysis (Long-term Economic Research)</option>
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
                value={articleForm.author}
                onChange={(e) => setArticleForm(prev => ({ ...prev, author: e.target.value }))}
                placeholder="e.g. Sufyan Saleem"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                Tags (Comma-Separated)
              </label>
              <input
                type="text"
                value={articleForm.tags}
                onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g. USDPKR, Interbank, Gold, Market"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                Cover Image
              </label>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Browse Curated Gallery</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={articleForm.image}
                onChange={(e) => setArticleForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL (https://...) or upload below"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 font-mono text-xs"
              />

              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Gallery</span>
              </button>

              <label className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 border transition-all ${
                isUploadingImage
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 cursor-wait'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}>
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Upload File</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadSuccessMsg && (
              <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {articleForm.image && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200 dark:bg-slate-900 relative">
                    <img
                      src={articleForm.image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Cover Image Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-xs sm:max-w-md font-mono">
                      {articleForm.image.startsWith('data:') ? 'Custom Upload (WebP / Base64)' : articleForm.image}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleForm(prev => ({ ...prev, image: '' }))}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <GalleryModal
              isOpen={isGalleryOpen}
              onClose={() => setIsGalleryOpen(false)}
              onSelect={(url) => {
                setArticleForm(prev => ({ ...prev, image: url }));
                setUploadSuccessMsg('Curated cover image selected!');
                setTimeout(() => setUploadSuccessMsg(''), 4000);
              }}
              currentUrl={articleForm.image}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Executive Summary / Excerpt *
            </label>
            <textarea
              required
              rows={2}
              value={articleForm.summary}
              onChange={(e) => setArticleForm(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Brief executive takeaway displayed in cards and previews..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Full Article Body (Markdown Supported: # H1, ## H2, ### H3, &gt; Quotes, Lists)
            </label>
            <textarea
              rows={8}
              value={articleForm.content}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>Published Financial Articles ({filteredArticles.length})</span>
              {loading && <span className="text-xs text-blue-500 font-semibold animate-pulse">• Syncing...</span>}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Key: fgc_portal_articles
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Stocks & Equities', 'Cryptocurrency', 'Markets & Forex', 'Gold & Commodities', 'Economy & Central Banks', 'Macro Analysis'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setTableCategoryFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tableCategoryFilter === f
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
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
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No articles found for selected category. Use the form above to publish your first article.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art, idx) => (
                  <tr key={art.id || `post-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={art.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=100&fm=webp&q=75'}
                          alt={art.title || 'Article thumbnail'}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          width="40"
                          height="40"
                          loading="lazy"
                        />
                        <div>
                          <Link
                            to={`/blog/${art.slug || art.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 flex items-center gap-1"
                          >
                            <span>{art.title || 'Untitled Article'}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">/blog/{art.slug || art.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(art.category)}`}>
                        {art.category || 'Stocks & Equities'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-300">{art.author || 'FGC Spot Lead'}</div>
                      <div className="text-[10px] text-slate-400">{art.date || ''}</div>
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
                          onClick={() => handleDeleteArticle(art.id || art.slug)}
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
  );
}
