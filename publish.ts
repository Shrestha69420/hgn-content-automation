/**
 * Media storage, folder export, Instagram publishing and the scheduler.
 *
 * Final slide PNGs are rendered in the browser (so what you see in the editor is what ships)
 * and uploaded to data/media/<postId>/final-NN.png when a post is approved or scheduled.
 */
import fs from 'fs';
import path from 'path';
import { config, instagramConfigured } from './config.js';
import { publicMediaToken } from './auth.js';
import { getDuePosts, getPostById, updatePost } from './db.js';
import type { Post, PublishEntry } from './src/types/index.js';

const safeId = (s: string) => /^[A-Za-z0-9_-]{1,100}$/.test(s);
const postDir = (postId: string) => path.join(config.mediaDir, postId);

export function mediaFile(postId: string, file: string): string | null {
  if (!safeId(postId) || !/^[A-Za-z0-9_.-]{1,100}\.(png|jpg|jpeg|webp)$/.test(file)) return null;
  const p = path.join(postDir(postId), file);
  return fs.existsSync(p) ? p : null;
}

export function saveMedia(postId: string, file: string, data: Buffer): void {
  if (!safeId(postId)) throw new Error('Invalid post id');
  fs.mkdirSync(postDir(postId), { recursive: true });
  fs.writeFileSync(path.join(postDir(postId), file), data);
}

export const finalName = (i: number) => `final-${String(i + 1).padStart(2, '0')}.png`;

export function finalFiles(post: Post): string[] {
  return post.slides.map((_, i) => path.join(postDir(post.id), finalName(i))).filter(p => fs.existsSync(p));
}

export function deleteMedia(postId: string): void {
  if (safeId(postId)) fs.rmSync(postDir(postId), { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Folder export: <EXPORT_DIR>/<YYYY-MM-DD>_<title>/slide-01.png + caption.txt
// ---------------------------------------------------------------------------
const slug = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60) || 'post';

export function captionText(post: Post): string {
  return [post.caption.trim(), post.callToAction.trim() && !post.caption.includes(post.callToAction.trim()) ? post.callToAction.trim() : '', post.hashtags.join(' ')]
    .filter(Boolean)
    .join('\n\n');
}

export function exportToFolder(post: Post): string {
  const files = finalFiles(post);
  if (files.length !== post.slides.length || files.length === 0) {
    throw new Error('Final images have not been rendered yet. Open the post in Studio and save it first.');
  }
  const date = (post.scheduledFor || new Date().toISOString()).slice(0, 10);
  const dir = path.join(config.exportDir, `${date}_${slug(post.title)}`);
  fs.mkdirSync(dir, { recursive: true });
  files.forEach((f, i) => fs.copyFileSync(f, path.join(dir, `slide-${String(i + 1).padStart(2, '0')}.png`)));
  fs.writeFileSync(path.join(dir, 'caption.txt'), captionText(post) + '\n');
  return dir;
}

// ---------------------------------------------------------------------------
// Instagram Graph API (carousel). Own Business/Creator account, Meta app in development mode.
// ---------------------------------------------------------------------------
const GRAPH = `${config.instagram.host}/v21.0`;

async function graph(pathName: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${GRAPH}/${pathName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...params, access_token: config.instagram.token }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error?.message || `Instagram API error ${res.status}`);
  return json;
}

async function waitReady(containerId: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(config.instagram.token)}`
    );
    const json: any = await res.json().catch(() => ({}));
    if (json.status_code === 'FINISHED') return;
    if (json.status_code === 'ERROR' || json.status_code === 'EXPIRED') throw new Error(`Media container ${json.status_code}`);
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Timed out waiting for Instagram to process the media');
}

export async function publishToInstagram(post: Post): Promise<string> {
  if (!instagramConfigured()) throw new Error('Instagram is not configured (IG_USER_ID, IG_ACCESS_TOKEN and APP_URL are required).');
  const files = finalFiles(post);
  if (files.length !== post.slides.length || !files.length) throw new Error('Final images have not been rendered yet.');
  const token = publicMediaToken(post.id);
  const urls = files.map(f => `${config.appUrl}/public-media/${post.id}/${token}/${path.basename(f)}`);
  const uid = config.instagram.userId;
  const caption = captionText(post);

  let creationId: string;
  if (urls.length === 1) {
    creationId = (await graph(`${uid}/media`, { image_url: urls[0], caption })).id;
  } else {
    const children: string[] = [];
    for (const url of urls) {
      const c = await graph(`${uid}/media`, { image_url: url, is_carousel_item: 'true' });
      await waitReady(c.id);
      children.push(c.id);
    }
    creationId = (await graph(`${uid}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption })).id;
  }
  await waitReady(creationId);
  const published = await graph(`${uid}/media_publish`, { creation_id: creationId });
  return String(published.id);
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------
export async function publishPost(id: string): Promise<Post> {
  const post = getPostById(id);
  if (!post) throw new Error('Post not found');
  const log: PublishEntry[] = [...(post.publishLog || [])];
  let exportPath = post.exportPath;
  const now = () => new Date().toISOString();
  let failed = false;

  if (config.publishMode === 'folder' || config.publishMode === 'both') {
    try {
      exportPath = exportToFolder(post);
      log.push({ at: now(), target: 'folder', ok: true, detail: exportPath });
    } catch (e: any) {
      failed = true;
      log.push({ at: now(), target: 'folder', ok: false, detail: e.message });
    }
  }
  if (config.publishMode === 'instagram' || config.publishMode === 'both') {
    try {
      const mediaId = await publishToInstagram(post);
      log.push({ at: now(), target: 'instagram', ok: true, detail: `media id ${mediaId}` });
    } catch (e: any) {
      failed = true;
      log.push({ at: now(), target: 'instagram', ok: false, detail: e.message });
    }
  }

  const updates: Partial<Post> = { publishLog: log.slice(-20), exportPath };
  if (!failed) {
    updates.status = 'Published';
    updates.publishedAt = now();
  }
  return updatePost(id, updates)!;
}

/** Publishes due posts once a minute. A failed post stays Scheduled and is retried at most every 10 minutes. */
export function startScheduler(): void {
  const lastTry = new Map<string, number>();
  const tick = async () => {
    for (const p of getDuePosts(new Date().toISOString())) {
      if (Date.now() - (lastTry.get(p.id) || 0) < 10 * 60 * 1000) continue;
      lastTry.set(p.id, Date.now());
      try {
        const out = await publishPost(p.id);
        console.log(`[scheduler] ${out.status}: ${p.title}`);
      } catch (e) {
        console.error('[scheduler] failed:', p.id, e);
      }
    }
  };
  setInterval(tick, 60 * 1000).unref();
  void tick();
}
