/**
 * SQLite storage (node:sqlite). Posts and brands keep their full shape as JSON
 * so the schema doesn't change every time the content model does.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import { config } from './config.js';
import { hashPassword, isHashed } from './auth.js';
import type { Brand, Post, UserProfile } from './src/types/index.js';

const dataDir = path.join(config.root, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'hgn.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export const SAMPLE_BRAND: Brand = {
  id: 'brand-sample',
  name: 'Sample Brand',
  tagline: 'Edit this brand profile to match yours',
  industry: 'General',
  voice: 'Friendly, clear and confident. Short sentences. No jargon.',
  audience: 'Curious people who follow the brand on Instagram',
  website: '',
  handle: '',
  colors: { primary: '#2bb5a6', accent: '#f2a93b', background: '#0a1114', text: '#ffffff' },
  hashtags: [],
  cta: 'Follow for more.',
  avoid: [],
  topics: ['Tips', 'Behind the scenes', 'News'],
};

function migratePlaintextPasswords(): void {
  const rows = db.prepare('SELECT id, password FROM users').all() as { id: string; password: string | null }[];
  const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  for (const r of rows) {
    if (r.password && !isHashed(r.password)) update.run(hashPassword(r.password), r.id);
  }
}

/** Old (pre-brand) tables are renamed, never deleted. */
function archiveLegacyTables(): void {
  const cols = db.prepare("PRAGMA table_info('posts')").all() as { name: string }[];
  if (cols.length && !cols.some(c => c.name === 'data')) {
    db.exec('DROP TABLE IF EXISTS legacy_posts; ALTER TABLE posts RENAME TO legacy_posts;');
  }
  const camp = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='campaigns'").get();
  if (camp) db.exec('DROP TABLE IF EXISTS legacy_campaigns; ALTER TABLE campaigns RENAME TO legacy_campaigns;');
  const sett = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();
  if (sett) db.exec('DROP TABLE IF EXISTS legacy_settings; ALTER TABLE settings RENAME TO legacy_settings;');
}

export function initDb() {
  archiveLegacyTables();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      role TEXT DEFAULT 'Marketer',
      department TEXT DEFAULT '',
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft',
      scheduled_for TEXT,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_posts_due ON posts(status, scheduled_for);
  `);

  migratePlaintextPasswords();

  const demoPassword =
    process.env.DEMO_PASSWORD && process.env.DEMO_PASSWORD.length >= 8 ? process.env.DEMO_PASSWORD : 'password123';
  if (!getUserByEmail('demo@campaignflow.app')) {
    createUser({ name: 'Demo Marketer', email: 'demo@campaignflow.app', password: demoPassword });
  }

  const brandCount = db.prepare('SELECT COUNT(*) as cnt FROM brands').get() as { cnt: number };
  if (brandCount.cnt === 0) insertBrand(SAMPLE_BRAND);
}

// -----------------------------------------------------------------------------
// Brands
// -----------------------------------------------------------------------------
export function getAllBrands(): Brand[] {
  return (db.prepare('SELECT data FROM brands ORDER BY rowid ASC').all() as any[]).map(r => JSON.parse(r.data));
}
export function getBrandById(id: string): Brand | null {
  const r = db.prepare('SELECT data FROM brands WHERE id = ?').get(id) as any;
  return r ? JSON.parse(r.data) : null;
}
export function insertBrand(b: Brand): Brand {
  db.prepare('INSERT INTO brands (id, data) VALUES (?, ?)').run(b.id, JSON.stringify(b));
  return b;
}
export function updateBrand(id: string, updates: Partial<Brand>): Brand | null {
  const existing = getBrandById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates, id };
  db.prepare('UPDATE brands SET data = ? WHERE id = ?').run(JSON.stringify(merged), id);
  return merged;
}
export function deleteBrand(id: string): boolean {
  const posts = db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE brand_id = ?').get(id) as { cnt: number };
  if (posts.cnt > 0) return false;
  db.prepare('DELETE FROM brands WHERE id = ?').run(id);
  return true;
}

// -----------------------------------------------------------------------------
// Posts
// -----------------------------------------------------------------------------
const parsePost = (r: any): Post => JSON.parse(r.data);

export function getAllPosts(): Post[] {
  return (db.prepare('SELECT data FROM posts ORDER BY created_at DESC, rowid DESC').all() as any[]).map(parsePost);
}
export function getPostById(id: string): Post | null {
  const r = db.prepare('SELECT data FROM posts WHERE id = ?').get(id) as any;
  return r ? parsePost(r) : null;
}
export function insertPost(p: Post): Post {
  db.prepare('INSERT INTO posts (id, brand_id, status, scheduled_for, data) VALUES (?, ?, ?, ?, ?)').run(
    p.id,
    p.brandId,
    p.status,
    p.scheduledFor || null,
    JSON.stringify(p)
  );
  return p;
}
export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const existing = getPostById(id);
  if (!existing) return null;
  const merged: Post = { ...existing, ...updates, id };
  db.prepare(
    "UPDATE posts SET brand_id = ?, status = ?, scheduled_for = ?, data = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(merged.brandId, merged.status, merged.scheduledFor || null, JSON.stringify(merged), id);
  return merged;
}
export function deletePost(id: string): boolean {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return true;
}
export function getDuePosts(nowIso: string): Post[] {
  const rows = db
    .prepare("SELECT data FROM posts WHERE status = 'Scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= ?")
    .all(nowIso) as any[];
  return rows.map(parsePost);
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------
export function getUserByEmail(email: string): any {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
}
export function getUserById(id: string): any {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}
export function createUser(user: { name: string; email: string; password?: string; role?: string }): UserProfile {
  const id = `usr-${crypto.randomUUID()}`;
  const email = user.email.toLowerCase();
  db.prepare('INSERT INTO users (id, name, email, password, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id,
    user.name,
    email,
    hashPassword(user.password || crypto.randomBytes(18).toString('base64url')),
    user.role || 'Marketer',
    '',
    ''
  );
  return { id, name: user.name, email, role: user.role || 'Marketer', department: '', avatar: '' };
}
