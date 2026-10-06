/**
 * ==============================================================================
 * SQLite Database Module
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 * 
 * Powered by Node.js native DatabaseSync (node:sqlite)
 * ==============================================================================
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';
import { hashPassword, isHashed } from './auth.js';
import { INITIAL_USERS, INITIAL_CAMPAIGNS, INITIAL_POSTS } from './src/lib/initialData.js';
import type { Campaign, ContentPost, UserProfile } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hgn.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for concurrent reads & writes and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/** Hash any password rows still stored as plaintext by older versions of the app. */
function migratePlaintextPasswords(): void {
  const rows = db.prepare('SELECT id, password FROM users').all() as { id: string; password: string | null }[];
  const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  for (const r of rows) {
    if (r.password && !isHashed(r.password)) update.run(hashPassword(r.password), r.id);
  }
}

/**
 * Initialize database tables
 */
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      role TEXT DEFAULT 'Marketing Officer',
      department TEXT DEFAULT 'Digital Marketing & Community',
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      category TEXT,
      start_date TEXT,
      end_date TEXT,
      season TEXT,
      target_audience TEXT,
      target_channels TEXT,
      budget_npr REAL DEFAULT 0,
      status TEXT DEFAULT 'Planning',
      kpis TEXT,
      safety_focus TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      campaign_name TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      platform TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'Draft',
      author TEXT,
      scheduled_for TEXT,
      published_at TEXT,
      hashtags TEXT,
      call_to_action TEXT,
      visual_prompt TEXT,
      primary_keyword TEXT,
      objective TEXT,
      quality_report TEXT,
      deterministic_score_result TEXT,
      analytics TEXT,
      version_history TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  migratePlaintextPasswords();

  // Seed default users if empty
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, role, department, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    // Demo accounts share this password. Override with DEMO_PASSWORD (min 8 chars) outside local dev.
    const demoPassword = process.env.DEMO_PASSWORD && process.env.DEMO_PASSWORD.length >= 8 ? process.env.DEMO_PASSWORD : 'password123';
    const demoHash = hashPassword(demoPassword);

    for (const u of INITIAL_USERS) {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        demoHash,
        u.role || 'Marketing Officer',
        u.department || 'Digital Marketing & Community',
        u.avatar || ''
      );
    }

    // Add general fallback account
    insertUser.run(
      'usr-default-marketing',
      'HGN Marketing Specialist',
      'marketing@himalayanguardian.org.np',
      demoHash,
      'Marketing Officer',
      'Digital Marketing & Community',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    );
  }

  // Seed default campaigns if empty
  const campCount = db.prepare('SELECT COUNT(*) as cnt FROM campaigns').get() as { cnt: number };
  if (campCount.cnt === 0) {
    for (const c of INITIAL_CAMPAIGNS) {
      insertCampaign(c);
    }
  }

  // Seed default posts if empty
  const postCount = db.prepare('SELECT COUNT(*) as cnt FROM posts').get() as { cnt: number };
  if (postCount.cnt === 0) {
    for (const p of INITIAL_POSTS) {
      insertPost(p);
    }
  }

  // Seed settings if empty
  const settingCount = db.prepare('SELECT COUNT(*) as cnt FROM settings').get() as { cnt: number };
  if (settingCount.cnt === 0) {
    const defaultSettings = {
      orgName: 'Himalayan Guardian Nepal',
      sector: 'Travel, Trekking, Adventure Safety, Tourism Protection & Emergency Support',
      headquarters: 'Thamel, Kathmandu, Bagmati Province, Nepal',
      emergencyHotline: '+977-1-4412345',
      mobileSatelliteDispatch: '+977-9801234567',
      touristPoliceHotline: '1144',
      website: 'https://www.himalayanguardian.org.np',
      licenseReg: 'HG-NEP-2024/ADV-8890',
    };
    saveSettings(defaultSettings);
  }
}

// -----------------------------------------------------------------------------
// CAMPAIGNS HELPERS
// -----------------------------------------------------------------------------

function rowToCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    category: row.category || 'Travel Safety',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    season: row.season || 'Autumn Peak',
    targetAudience: row.target_audience || '',
    targetChannels: row.target_channels ? JSON.parse(row.target_channels) : [],
    budgetNPR: Number(row.budget_npr) || 0,
    status: row.status || 'Planning',
    kpis: row.kpis ? JSON.parse(row.kpis) : {
      targetReach: 0,
      currentReach: 0,
      targetEngagement: 0,
      postsPlanned: 0,
      postsPublished: 0,
    },
    safetyFocus: row.safety_focus || '',
  };
}

export function getAllCampaigns(): Campaign[] {
  const rows = db.prepare('SELECT * FROM campaigns ORDER BY rowid ASC').all() as any[];
  return rows.map(rowToCampaign);
}

export function getCampaignById(id: string): Campaign | null {
  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id) as any;
  return row ? rowToCampaign(row) : null;
}

export function insertCampaign(c: Campaign): Campaign {
  const stmt = db.prepare(`
    INSERT INTO campaigns (
      id, name, code, description, category, start_date, end_date,
      season, target_audience, target_channels, budget_npr, status, kpis, safety_focus,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    c.id,
    c.name,
    c.code,
    c.description || '',
    c.category,
    c.startDate || '',
    c.endDate || '',
    c.season,
    c.targetAudience || '',
    JSON.stringify(c.targetChannels || []),
    c.budgetNPR || 0,
    c.status || 'Planning',
    JSON.stringify(c.kpis || {}),
    c.safetyFocus || ''
  );

  return c;
}

export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
  const existing = getCampaignById(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };

  const stmt = db.prepare(`
    UPDATE campaigns SET
      name = ?,
      code = ?,
      description = ?,
      category = ?,
      start_date = ?,
      end_date = ?,
      season = ?,
      target_audience = ?,
      target_channels = ?,
      budget_npr = ?,
      status = ?,
      kpis = ?,
      safety_focus = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    merged.name,
    merged.code,
    merged.description,
    merged.category,
    merged.startDate,
    merged.endDate,
    merged.season,
    merged.targetAudience,
    JSON.stringify(merged.targetChannels),
    merged.budgetNPR,
    merged.status,
    JSON.stringify(merged.kpis),
    merged.safetyFocus,
    id
  );

  return merged;
}

export function deleteCampaign(id: string): boolean {
  const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
  stmt.run(id);
  return true;
}

// -----------------------------------------------------------------------------
// POSTS HELPERS
// -----------------------------------------------------------------------------

function rowToPost(row: any): ContentPost {
  return {
    id: row.id,
    campaignId: row.campaign_id || '',
    campaignName: row.campaign_name || '',
    title: row.title || '',
    content: row.content || '',
    platform: row.platform,
    category: row.category,
    status: row.status || 'Draft',
    author: row.author || 'HGN Specialist',
    scheduledFor: row.scheduled_for || undefined,
    publishedAt: row.published_at || undefined,
    hashtags: row.hashtags ? JSON.parse(row.hashtags) : [],
    callToAction: row.call_to_action || '',
    visualPrompt: row.visual_prompt || undefined,
    primaryKeyword: row.primary_keyword || undefined,
    objective: row.objective || undefined,
    qualityReport: row.quality_report ? JSON.parse(row.quality_report) : undefined,
    deterministicScoreResult: row.deterministic_score_result ? JSON.parse(row.deterministic_score_result) : undefined,
    analytics: row.analytics ? JSON.parse(row.analytics) : undefined,
    versionHistory: row.version_history ? JSON.parse(row.version_history) : undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function getAllPosts(): ContentPost[] {
  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as any[];
  return rows.map(rowToPost);
}

export function getPostById(id: string): ContentPost | null {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
  return row ? rowToPost(row) : null;
}

export function insertPost(p: ContentPost): ContentPost {
  const stmt = db.prepare(`
    INSERT INTO posts (
      id, campaign_id, campaign_name, title, content, platform, category,
      status, author, scheduled_for, published_at, hashtags, call_to_action,
      visual_prompt, primary_keyword, objective, quality_report,
      deterministic_score_result, analytics, version_history, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    p.id,
    p.campaignId || '',
    p.campaignName || '',
    p.title,
    p.content,
    p.platform,
    p.category || 'Trekking Safety',
    p.status || 'Draft',
    p.author || 'HGN Specialist',
    p.scheduledFor || null,
    p.publishedAt || null,
    JSON.stringify(p.hashtags || []),
    p.callToAction || '',
    p.visualPrompt || null,
    p.primaryKeyword || null,
    p.objective || null,
    p.qualityReport ? JSON.stringify(p.qualityReport) : null,
    p.deterministicScoreResult ? JSON.stringify(p.deterministicScoreResult) : null,
    p.analytics ? JSON.stringify(p.analytics) : null,
    p.versionHistory ? JSON.stringify(p.versionHistory) : null,
    p.createdAt || new Date().toISOString()
  );

  return p;
}

export function updatePost(id: string, updates: Partial<ContentPost>): ContentPost | null {
  const existing = getPostById(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };

  const stmt = db.prepare(`
    UPDATE posts SET
      campaign_id = ?,
      campaign_name = ?,
      title = ?,
      content = ?,
      platform = ?,
      category = ?,
      status = ?,
      author = ?,
      scheduled_for = ?,
      published_at = ?,
      hashtags = ?,
      call_to_action = ?,
      visual_prompt = ?,
      primary_keyword = ?,
      objective = ?,
      quality_report = ?,
      deterministic_score_result = ?,
      analytics = ?,
      version_history = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    merged.campaignId || '',
    merged.campaignName || '',
    merged.title,
    merged.content,
    merged.platform,
    merged.category || 'Trekking Safety',
    merged.status || 'Draft',
    merged.author || 'HGN Specialist',
    merged.scheduledFor || null,
    merged.publishedAt || null,
    JSON.stringify(merged.hashtags || []),
    merged.callToAction || '',
    merged.visualPrompt || null,
    merged.primaryKeyword || null,
    merged.objective || null,
    merged.qualityReport ? JSON.stringify(merged.qualityReport) : null,
    merged.deterministicScoreResult ? JSON.stringify(merged.deterministicScoreResult) : null,
    merged.analytics ? JSON.stringify(merged.analytics) : null,
    merged.versionHistory ? JSON.stringify(merged.versionHistory) : null,
    id
  );

  return merged;
}

export function deletePost(id: string): boolean {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  stmt.run(id);
  return true;
}

export function schedulePost(id: string, scheduledFor: string): ContentPost | null {
  return updatePost(id, {
    status: 'Scheduled',
    scheduledFor,
  });
}

export function publishPost(id: string): ContentPost | null {
  return updatePost(id, {
    status: 'Published',
    publishedAt: new Date().toISOString(),
  });
}

// -----------------------------------------------------------------------------
// USERS & AUTH HELPERS
// -----------------------------------------------------------------------------

export function getAllUsers(): UserProfile[] {
  const rows = db.prepare('SELECT id, name, email, role, department, avatar FROM users ORDER BY created_at ASC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    department: r.department,
    avatar: r.avatar,
  }));
}

export function getUserByEmail(email: string): any {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
}

export function createUser(user: { id?: string; name: string; email: string; password?: string; role?: string; department?: string; avatar?: string }): UserProfile {
  const id = user.id || `usr-${crypto.randomUUID()}`;
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, role, department, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    user.name,
    user.email.toLowerCase(),
    hashPassword(user.password || crypto.randomBytes(18).toString('base64url')),
    user.role || 'Marketing Officer',
    user.department || 'Digital Marketing & Community',
    user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  return {
    id,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role || 'Marketing Officer',
    department: user.department || 'Digital Marketing & Community',
    avatar: user.avatar || '',
  };
}

// -----------------------------------------------------------------------------
// SETTINGS HELPERS
// -----------------------------------------------------------------------------

export function getSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

export function saveSettings(settingsObj: Record<string, string>): void {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  for (const [key, value] of Object.entries(settingsObj)) {
    stmt.run(key, String(value));
  }
}

export function resetDatabase(): void {
  db.exec(`
    DELETE FROM posts;
    DELETE FROM campaigns;
    DELETE FROM users;
    DELETE FROM settings;
  `);

  initDb();
}

export function getUserById(id: string): any {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}
