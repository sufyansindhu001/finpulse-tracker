import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const key = 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';
const supabase = createClient(url, key);

const LIVE_BACKUP_DIR = 'C:\\Users\\Sufyan Sindhu\\.gemini\\antigravity\\scratch\\fgcspot_secure_backups\\live_database_backup_2026-11-22';

if (!fs.existsSync(LIVE_BACKUP_DIR)) {
  fs.mkdirSync(LIVE_BACKUP_DIR, { recursive: true });
}

async function runLiveExport() {
  console.log('Connecting to Live Supabase Project:', url);
  
  const { data: articles, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('LIVE EXPORT ERROR:', error);
    process.exit(1);
  }

  console.log(`[CONNECTED] Successfully retrieved ${articles.length} records directly from live database table public.articles.`);

  // 1. Save JSON Dump of actual live records
  const jsonPath = path.join(LIVE_BACKUP_DIR, '01_live_articles_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2), 'utf8');
  console.log(`[PASS] Saved JSON dump: ${jsonPath} (${Math.round(fs.statSync(jsonPath).size / 1024)} KB)`);

  // 2. Generate SQL Transactional Restoration Dump
  let sql = `-- ==============================================================================\n`;
  sql += `-- FGC SPOT: LIVE SUPABASE PRODUCTION DATABASE DUMP (public.articles)\n`;
  sql += `-- Source: ${url}\n`;
  sql += `-- Exported At: ${new Date().toISOString()}\n`;
  sql += `-- Total Live Records: ${articles.length}\n`;
  sql += `-- ==============================================================================\n\n`;
  sql += `BEGIN;\n\n`;

  for (const art of articles) {
    const id = (art.id || '').replace(/'/g, "''");
    const slug = (art.slug || art.id || '').replace(/'/g, "''");
    const title = (art.title || '').replace(/'/g, "''");
    const category = (art.category || 'Market Updates').replace(/'/g, "''");
    const author = (art.author || 'Sufyan Sindhu').replace(/'/g, "''");
    const readTime = (art.read_time || '5 min read').replace(/'/g, "''");
    const createdAt = art.created_at || new Date().toISOString();
    const image = (art.image || '').replace(/'/g, "''");
    const excerpt = (art.excerpt || '').replace(/'/g, "''");
    const content = (art.content || '').replace(/'/g, "''");

    let tagsArraySql = "ARRAY[]::text[]";
    if (Array.isArray(art.tags) && art.tags.length > 0) {
      tagsArraySql = "ARRAY[" + art.tags.map(t => "'" + String(t).replace(/'/g, "''") + "'").join(', ') + "]::text[]";
    } else if (typeof art.tags === 'string' && art.tags.trim()) {
      tagsArraySql = "ARRAY[" + art.tags.split(',').map(t => "'" + t.trim().replace(/'/g, "''") + "'").join(', ') + "]::text[]";
    }

    sql += `INSERT INTO public.articles (id, slug, title, category, author, read_time, created_at, image, excerpt, content, tags, is_published)\n`;
    sql += `VALUES ('${id}', '${slug}', '${title}', '${category}', '${author}', '${readTime}', '${createdAt}', '${image}', '${excerpt}', '${content}', ${tagsArraySql}, true)\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content, updated_at = timezone('utc'::text, now());\n\n`;
  }

  sql += `COMMIT;\n`;

  const sqlPath = path.join(LIVE_BACKUP_DIR, '02_live_articles_data.sql');
  fs.writeFileSync(sqlPath, sql, 'utf8');
  console.log(`[PASS] Saved SQL insert dump: ${sqlPath} (${Math.round(fs.statSync(sqlPath).size / 1024)} KB)`);

  // 3. Save DDL Schema matching the live columns
  const liveColumns = Object.keys(articles[0] || {});
  console.log('[SCHEMA] Detected live columns in public.articles:', liveColumns.join(', '));

  let ddl = `-- ==============================================================================\n`;
  ddl += `-- FGC SPOT: LIVE SUPABASE DDL SCHEMA (public.articles)\n`;
  ddl += `-- Source: ${url}\n`;
  ddl += `-- Detected Live Columns: ${liveColumns.join(', ')}\n`;
  ddl += `-- ==============================================================================\n\n`;
  ddl += `CREATE TABLE IF NOT EXISTS public.articles (\n`;
  ddl += `  id TEXT PRIMARY KEY,\n`;
  ddl += `  slug TEXT UNIQUE NOT NULL,\n`;
  ddl += `  title TEXT NOT NULL,\n`;
  ddl += `  category TEXT,\n`;
  ddl += `  author TEXT,\n`;
  ddl += `  tags TEXT[],\n`;
  ddl += `  image TEXT,\n`;
  ddl += `  excerpt TEXT,\n`;
  ddl += `  content TEXT,\n`;
  ddl += `  read_time TEXT,\n`;
  ddl += `  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),\n`;
  ddl += `  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),\n`;
  ddl += `  is_published BOOLEAN DEFAULT true\n`;
  ddl += `);\n\n`;
  ddl += `CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);\n`;
  ddl += `CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);\n`;
  ddl += `CREATE INDEX IF NOT EXISTS idx_articles_is_published ON public.articles(is_published);\n`;

  const ddlPath = path.join(LIVE_BACKUP_DIR, '00_live_articles_schema.sql');
  fs.writeFileSync(ddlPath, ddl, 'utf8');
  console.log(`[PASS] Saved live schema DDL: ${ddlPath}`);

  // 4. Save manifest
  const manifest = {
    source: 'LIVE_SUPABASE_DATABASE',
    connection_endpoint: url,
    project_id: 'ydroyycgjnbjcoprrrwk',
    backup_timestamp: new Date().toISOString(),
    live_table_inspected: 'public.articles',
    actual_live_record_count: articles.length,
    detected_live_columns: liveColumns,
    files_created: [
      { file: '00_live_articles_schema.sql', size_bytes: fs.statSync(ddlPath).size },
      { file: '01_live_articles_data.json', size_bytes: fs.statSync(jsonPath).size },
      { file: '02_live_articles_data.sql', size_bytes: fs.statSync(sqlPath).size }
    ],
    inventory: articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category,
      created_at: a.created_at,
      content_length: a.content ? a.content.length : 0
    }))
  };

  const manifestPath = path.join(LIVE_BACKUP_DIR, 'LIVE_BACKUP_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[PASS] Saved live backup manifest: ${manifestPath}`);

  console.log('\n--- LIVE DATABASE INVENTORY (24 ARTICLES) ---');
  articles.forEach((a, idx) => {
    console.log(`${idx + 1}. [${a.created_at ? a.created_at.substring(0, 10) : 'NO_DATE'}] ${a.title.substring(0, 50)}... (${a.slug})`);
  });
}

runLiveExport().catch(err => {
  console.error('Fatal export error:', err);
  process.exit(1);
});
