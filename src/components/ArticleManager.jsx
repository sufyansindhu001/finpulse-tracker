import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Check, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  FileText, 
  BookOpen, 
  Clock, 
  User, 
  Image as ImageIcon 
} from 'lucide-react';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../data/blogPosts';

const STORAGE_KEY = 'fgc_portal_articles';
const LEGACY_STORAGE_KEY = 'fgc_spot_blog_posts';

const INITIAL_FORM_STATE = {
  title: '',
  category: 'Market Updates',
  image: '',
  author: 'FGC Spot Research Lead',
  summary: '',
  content: '',
  tags: 'Forex, Crypto, Market'
};

export default function ArticleManager() {
  const [articles, setArticles] = useState([]);
  const [articleForm, setArticleForm] = useState(INITIAL_FORM_STATE);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [articleSaved, setArticleSaved] = useState(false);

  // 1. Critical Persistence Safeguard:
  // On page load/refresh, check if localStorage.getItem('fgc_portal_articles') exists.
  // If it exists, merge any newly added built-in articles (unless explicitly deleted).
  // Only seed initial articles if the key is completely null.
  const loadArticlesFromStorage = useCallback(() => {
    try {
      const deletedRaw = localStorage.getItem('fgc_portal_deleted_articles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];

      const stored = localStorage.getItem(STORAGE_KEY);
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
            const merged = [...parsed, ...missingBuiltins];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(merged));
            setArticles(merged);
            return;
          }
          setArticles(parsed);
          return;
        }
      }

      // Check legacy key if primary is completely null
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy !== null) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const existingIds = new Set(parsedLegacy.flatMap(a => [a.id, a.slug]));
          const missingBuiltins = INITIAL_BLOG_POSTS.filter(b => 
            !existingIds.has(b.id) && 
            !existingIds.has(b.slug) && 
            !deletedIds.includes(b.id) && 
            !deletedIds.includes(b.slug)
          );
          const merged = missingBuiltins.length > 0 ? [...parsedLegacy, ...missingBuiltins] : parsedLegacy;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setArticles(merged);
          return;
        }
      }

      // Seed only when key is completely null
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(INITIAL_BLOG_POSTS));
      setArticles(INITIAL_BLOG_POSTS);
    } catch (e) {
      console.error('[ArticleManager] Error loading articles:', e);
      setArticles(INITIAL_BLOG_POSTS);
    }
  }, []);

  useEffect(() => {
    loadArticlesFromStorage();

    const handleSync = () => loadArticlesFromStorage();
    window.addEventListener('fgc_articles_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('fgc_articles_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadArticlesFromStorage]);

  // Helper to persist articles list to storage & dispatch sync events
  const persistArticles = (updatedList) => {
    setArticles(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedList));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('fgc_articles_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('[ArticleManager] Error persisting articles:', e);
    }
  };

  // 2. Publish / Edit Submission Handler
  const handleArticleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const rawTitle = (articleForm.title || '').trim();
    if (!rawTitle) {
      alert('Please enter an article title.');
      return;
    }

    // Generate a clean slug from title if missing
    const generatedSlug = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `article-${Date.now()}`;

    // Read current articles directly from localStorage first
    let currentList = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentList = parsed;
      } else {
        currentList = [...INITIAL_BLOG_POSTS];
      }
    } catch {
      currentList = articles.length > 0 ? articles : [...INITIAL_BLOG_POSTS];
    }

    if (editingArticleId) {
      // Update existing article
      const updatedList = currentList.map(art => {
        if (art.id === editingArticleId || art.slug === editingArticleId) {
          return {
            ...art,
            title: rawTitle,
            category: articleForm.category || 'Market Updates',
            image: articleForm.image || art.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
            author: articleForm.author || art.author || 'FGC Spot Research Lead',
            summary: articleForm.summary || '',
            excerpt: articleForm.summary || '',
            content: articleForm.content || '',
            tags: Array.isArray(articleForm.tags) 
              ? articleForm.tags 
              : (articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()) : art.tags)
          };
        }
        return art;
      });

      persistArticles(updatedList);
      setEditingArticleId(null);
    } else {
      // Create full article object and prepend into localStorage
      const newArticle = {
        id: generatedSlug,
        slug: generatedSlug,
        title: rawTitle,
        category: articleForm.category || 'Market Updates',
        image: articleForm.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
        author: articleForm.author || 'FGC Spot Research Lead',
        summary: articleForm.summary || '',
        excerpt: articleForm.summary || '',
        content: articleForm.content || '',
        tags: typeof articleForm.tags === 'string' 
          ? articleForm.tags.split(',').map(t => t.trim()).filter(Boolean)
          : (Array.isArray(articleForm.tags) ? articleForm.tags : ['Market']),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: `${Math.max(2, Math.ceil(((articleForm.content || '').split(' ').length) / 180))} min read`
      };

      const updatedList = [newArticle, ...currentList.filter(a => a.id !== newArticle.id && a.slug !== newArticle.slug)];
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
    setArticleForm({
      title: art.title || '',
      category: art.category || 'Market Updates',
      image: art.image || '',
      author: art.author || 'FGC Spot Research Lead',
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

  // Delete action: immediately update localStorage
  const handleDeleteArticle = (targetId) => {
    if (!window.confirm('Are you sure you want to permanently delete this article?')) return;
    
    try {
      const deletedRaw = localStorage.getItem('fgc_portal_deleted_articles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(targetId)) {
        deletedIds.push(targetId);
        localStorage.setItem('fgc_portal_deleted_articles', JSON.stringify(deletedIds));
      }
    } catch {}

    let currentList = articles;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) currentList = parsed;
      }
    } catch {}

    const updated = currentList.filter(a => a.id !== targetId && a.slug !== targetId);
    persistArticles(updated);
  };

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
                <option value="Market Updates">Market Updates</option>
                <option value="Personal Finance & Currency">Personal Finance & Currency</option>
                <option value="Precious Metals & Wealth">Precious Metals & Wealth</option>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
              Cover Image URL or File Upload
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={articleForm.image}
                onChange={(e) => setArticleForm(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-[#07090E] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-slate-300 dark:border-slate-700">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {articleForm.image && (
              <div className="mt-3 w-32 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={articleForm.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
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
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>Published Financial Articles ({articles.length})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Key: fgc_portal_articles
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
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No articles found in storage. Use the form above to publish your first article.
                  </td>
                </tr>
              ) : (
                articles.map((art, idx) => (
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

                    <td className="py-3 px-3 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {art.category || 'Market Updates'}
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
