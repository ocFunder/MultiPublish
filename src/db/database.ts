import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'multipublish.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // 确保 data 目录存在
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      cover_image TEXT,
      images TEXT,
      tags TEXT,
      category TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS publish_records (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      platform_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      published_at TEXT,
      simulated_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (content_id) REFERENCES contents(id)
    );
  `);
}

// ============================================================
// Content CRUD
// ============================================================

export interface ContentRow {
  id: string;
  title: string;
  body: string;
  cover_image: string | null;
  images: string;
  tags: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export function saveContent(content: {
  id: string;
  title: string;
  body: string;
  coverImage?: string;
  images: string[];
  tags: string[];
  category?: string;
}): ContentRow {
  const d = getDb();
  const stmt = d.prepare(`
    INSERT INTO contents (id, title, body, cover_image, images, tags, category)
    VALUES (@id, @title, @body, @coverImage, @images, @tags, @category)
    ON CONFLICT(id) DO UPDATE SET
      title = @title,
      body = @body,
      cover_image = @coverImage,
      images = @images,
      tags = @tags,
      category = @category,
      updated_at = datetime('now')
  `);
  stmt.run({
    id: content.id,
    title: content.title,
    body: content.body,
    coverImage: content.coverImage || null,
    images: JSON.stringify(content.images),
    tags: JSON.stringify(content.tags),
    category: content.category || null,
  });
  return getContent(content.id)!;
}

export function getContent(id: string): ContentRow | undefined {
  const d = getDb();
  return d.prepare('SELECT * FROM contents WHERE id = ?').get(id) as ContentRow | undefined;
}

export function listContents(): ContentRow[] {
  const d = getDb();
  return d.prepare('SELECT * FROM contents ORDER BY created_at DESC').all() as ContentRow[];
}

// ============================================================
// Publish Records
// ============================================================

export interface PublishRecordRow {
  id: string;
  content_id: string;
  platform_id: string;
  platform_name: string;
  status: string;
  message: string | null;
  published_at: string | null;
  simulated_url: string | null;
  created_at: string;
}

export function savePublishRecord(record: {
  id: string;
  contentId: string;
  platformId: string;
  platformName: string;
  status: string;
  message: string;
  publishedAt: string;
  simulatedUrl?: string;
}): void {
  const d = getDb();
  d.prepare(`
    INSERT INTO publish_records (id, content_id, platform_id, platform_name, status, message, published_at, simulated_url)
    VALUES (@id, @contentId, @platformId, @platformName, @status, @message, @publishedAt, @simulatedUrl)
  `).run({
    id: record.id,
    contentId: record.contentId,
    platformId: record.platformId,
    platformName: record.platformName,
    status: record.status,
    message: record.message,
    publishedAt: record.publishedAt,
    simulatedUrl: record.simulatedUrl || null,
  });
}

export function listPublishRecords(): PublishRecordRow[] {
  const d = getDb();
  return d.prepare('SELECT * FROM publish_records ORDER BY created_at DESC').all() as PublishRecordRow[];
}

export function getPublishRecordsByContent(contentId: string): PublishRecordRow[] {
  const d = getDb();
  return d.prepare('SELECT * FROM publish_records WHERE content_id = ? ORDER BY created_at DESC').all(contentId) as PublishRecordRow[];
}
