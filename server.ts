import './config.js'; // must stay first: loads .env.local before any other module reads process.env
import express from 'express';
import path from 'path';
import crypto from 'node:crypto';
import fs from 'fs';
import { config, instagramConfigured } from './config.js';
import {
  initDb,
  getAllBrands,
  getBrandById,
  insertBrand,
  updateBrand,
  deleteBrand,
  getAllPosts,
  getPostById,
  insertPost,
  updatePost,
  deletePost,
  getUserByEmail,
  getUserById,
  createUser,
} from './db.js';
import {
  requireAuth,
  rateLimit,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getSessionUserId,
  publicMediaToken,
} from './auth.js';
import {
  validateBrand,
  validatePost,
  validateSchedule,
  validateIdeasRequest,
  validateCopyRequest,
  validateImageRequest,
  validateRegistration,
  validateExtractRequest,
} from './validate.js';
import { aiConfigured, researchIdeas, generatePostCopy, generateImage, extractBrandFromWebsite } from './ai.js';
import { mediaFile, saveMedia, deleteMedia, finalName, publishPost, exportToFolder, startScheduler } from './publish.js';
import type { Platform, ServerInfo } from './src/types/index.js';

const publicUser = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
  avatar: u.avatar,
});

/** Log the real error server-side, send a generic message to the client. */
function fail(res: express.Response, e: unknown, label: string) {
  console.error(`[api] ${label}:`, e);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

/** AI errors are safe to show (quota, bad key, blocked image) but never include the key. */
function aiFail(res: express.Response, e: any, label: string) {
  console.error(`[ai] ${label}:`, e?.message || e);
  const msg = String(e?.message || 'AI request failed').replace(/key=[^&\s]+/gi, 'key=***').slice(0, 300);
  res.status(502).json({ success: false, error: msg });
}

async function startServer() {
  const app = express();

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  initDb();

  // ---------------------------------------------------------------------------
  // PUBLIC routes
  // ---------------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'operational', timestamp: new Date().toISOString() });
  });

  // Instagram fetches slide images from here; the path carries an unguessable per-post token.
  app.get('/public-media/:postId/:token/:file', (req, res) => {
    const { postId, token, file } = req.params;
    const a = Buffer.from(token);
    const b = Buffer.from(publicMediaToken(postId));
    const f = a.length === b.length && crypto.timingSafeEqual(a, b) && /^final-\d+\.png$/.test(file) ? mediaFile(postId, file) : null;
    if (!f) return res.status(404).end();
    res.sendFile(f);
  });

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: req => `auth:${req.ip}` });

  app.post('/api/auth/register', authLimiter, (req, res) => {
    try {
      if (process.env.ALLOW_REGISTRATION === 'false') {
        return res.status(403).json({ success: false, error: 'Registration is disabled' });
      }
      const invalid = validateRegistration(req.body);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const { name, email, password, confirmPassword } = req.body;
      if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
      }
      if (getUserByEmail(email.trim())) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }
      const created = createUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
      setSessionCookie(res, created.id);
      res.status(201).json({ success: true, user: created });
    } catch (e) {
      fail(res, e, 'register');
    }
  });

  app.post('/api/auth/login', authLimiter, (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }
      const user = getUserByEmail(email.trim());
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      setSessionCookie(res, user.id);
      res.json({ success: true, user: publicUser(user) });
    } catch (e) {
      fail(res, e, 'login');
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const uid = getSessionUserId(req);
    const user = uid ? getUserById(uid) : null;
    if (!user) return res.status(401).json({ success: false, error: 'Not signed in' });
    res.json({ success: true, user: publicUser(user) });
  });

  // ---------------------------------------------------------------------------
  // Everything below requires a valid session
  // ---------------------------------------------------------------------------
  app.use('/api', requireAuth, (req, res, next) => {
    if (!req.userId || !getUserById(req.userId)) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    next();
  });

  app.get('/api/info', (_req, res) => {
    const info: ServerInfo = {
      aiConfigured: aiConfigured(),
      models: config.models,
      publishMode: config.publishMode,
      instagramConfigured: instagramConfigured(),
      exportDir: config.exportDir,
    };
    res.json({ success: true, data: info });
  });

  // ---- AI -------------------------------------------------------------------
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, key: req => `ai:${req.userId}` });

  app.post('/api/ai/ideas', aiLimiter, async (req, res) => {
    const invalid = validateIdeasRequest(req.body);
    if (invalid) return res.status(400).json({ success: false, error: invalid });
    const brand = getBrandById(req.body.brandId);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    try {
      const data = await researchIdeas(brand, req.body.focus || '', (req.body.platform as Platform) || 'Instagram');
      res.json({ success: true, data });
    } catch (e) {
      aiFail(res, e, 'ideas');
    }
  });

  app.post('/api/ai/post', aiLimiter, async (req, res) => {
    const invalid = validateCopyRequest(req.body);
    if (invalid) return res.status(400).json({ success: false, error: invalid });
    const brand = getBrandById(req.body.brandId);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    try {
      const { data, source } = await generatePostCopy(brand, {
        topic: req.body.topic,
        angle: req.body.angle || '',
        platform: req.body.platform || 'Instagram',
        slides: req.body.slides || 5,
        notes: req.body.notes || '',
      });
      res.json({ success: true, data, source });
    } catch (e) {
      aiFail(res, e, 'post copy');
    }
  });

  app.post('/api/ai/image', rateLimit({ windowMs: 60 * 1000, max: 12, key: req => `img:${req.userId}` }), async (req, res) => {
    const invalid = validateImageRequest(req.body);
    if (invalid) return res.status(400).json({ success: false, error: invalid });
    const brand = getBrandById(req.body.brandId);
    if (!brand) return res.status(404).json({ success: false, error: 'Brand not found' });
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(req.body.postId)) return res.status(400).json({ success: false, error: '"postId" is invalid' });
    try {
      const img = await generateImage(req.body.prompt, brand);
      const ext = img.mime.includes('jpeg') ? 'jpg' : img.mime.includes('webp') ? 'webp' : 'png';
      const file = `bg-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      saveMedia(req.body.postId, file, img.data);
      res.json({ success: true, url: `/api/media/${req.body.postId}/${file}` });
    } catch (e) {
      aiFail(res, e, 'image');
    }
  });

  app.post('/api/brands/extract', aiLimiter, async (req, res) => {
    const invalid = validateExtractRequest(req.body);
    if (invalid) return res.status(400).json({ success: false, error: invalid });
    // Newline-delimited JSON stream: status, chunk (raw model text as it arrives), done | error.
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    const send = (o: object) => res.write(JSON.stringify(o) + '\n');
    try {
      send({ type: 'status', text: 'Gemini is reading the website…' });
      const data = await extractBrandFromWebsite(req.body.url.trim(), text => send({ type: 'chunk', text }));
      send({ type: 'done', data });
    } catch (e: any) {
      console.error('[ai] brand extract:', e?.message || e);
      send({ type: 'error', error: String(e?.message || 'AI request failed').replace(/key=[^&\s]+/gi, 'key=***').slice(0, 300) });
    }
    res.end();
  });

  // ---- Media (session-protected) ---------------------------------------------
  app.get('/api/media/:postId/:file', (req, res) => {
    const f = mediaFile(req.params.postId, req.params.file);
    if (!f) return res.status(404).json({ success: false, error: 'Not found' });
    res.sendFile(f);
  });

  // Final rendered slide, raw PNG body: PUT /api/posts/:id/rendered/:index
  app.put('/api/posts/:id/rendered/:index', express.raw({ type: 'image/png', limit: '15mb' }), (req, res) => {
    try {
      const post = getPostById(req.params.id);
      const i = Number(req.params.index);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      if (!Number.isInteger(i) || i < 0 || i >= post.slides.length) return res.status(400).json({ success: false, error: 'Bad slide index' });
      const body = req.body as Buffer;
      if (!Buffer.isBuffer(body) || body.length < 8 || body.readUInt32BE(0) !== 0x89504e47) {
        return res.status(400).json({ success: false, error: 'Body must be a PNG' });
      }
      saveMedia(post.id, finalName(i), body);
      if (i === post.slides.length - 1) updatePost(post.id, { rendered: true });
      res.json({ success: true });
    } catch (e) {
      fail(res, e, 'save rendered slide');
    }
  });

  // ---- Brands ----------------------------------------------------------------
  app.get('/api/brands', (_req, res) => {
    try {
      res.json({ success: true, data: getAllBrands() });
    } catch (e) {
      fail(res, e, 'list brands');
    }
  });

  app.post('/api/brands', (req, res) => {
    try {
      const invalid = validateBrand(req.body);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const b = { ...req.body, id: `brand-${crypto.randomUUID()}` };
      res.status(201).json({ success: true, data: insertBrand(b) });
    } catch (e) {
      fail(res, e, 'create brand');
    }
  });

  app.put('/api/brands/:id', (req, res) => {
    try {
      const invalid = validateBrand(req.body, true);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const updated = updateBrand(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Brand not found' });
      res.json({ success: true, data: updated });
    } catch (e) {
      fail(res, e, 'update brand');
    }
  });

  app.delete('/api/brands/:id', (req, res) => {
    try {
      if (getAllBrands().length <= 1) return res.status(400).json({ success: false, error: 'At least one brand is required' });
      if (!deleteBrand(req.params.id)) return res.status(409).json({ success: false, error: 'Delete or move this brand\'s posts first' });
      res.json({ success: true });
    } catch (e) {
      fail(res, e, 'delete brand');
    }
  });

  // ---- Posts -----------------------------------------------------------------
  app.get('/api/posts', (_req, res) => {
    try {
      res.json({ success: true, data: getAllPosts() });
    } catch (e) {
      fail(res, e, 'list posts');
    }
  });

  app.post('/api/posts', (req, res) => {
    try {
      const invalid = validatePost(req.body);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const p = req.body;
      if (!getBrandById(p.brandId)) return res.status(400).json({ success: false, error: 'Unknown brand' });
      if (!p.id) p.id = `post-${crypto.randomUUID()}`;
      if (!/^[A-Za-z0-9_-]{1,100}$/.test(p.id)) return res.status(400).json({ success: false, error: '"id" is invalid' });
      if (getPostById(p.id)) return res.status(409).json({ success: false, error: 'Post id already exists' });
      const post = {
        caption: '',
        hashtags: [],
        callToAction: '',
        topic: '',
        designConcept: '',
        sources: [],
        author: '',
        status: 'Draft',
        createdAt: new Date().toISOString(),
        ...p,
      };
      res.status(201).json({ success: true, data: insertPost(post) });
    } catch (e) {
      fail(res, e, 'create post');
    }
  });

  app.put('/api/posts/:id', (req, res) => {
    try {
      const invalid = validatePost(req.body, true);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const { id: _ignore, ...updates } = req.body;
      // Editing content invalidates previously rendered images.
      if (updates.slides && !('rendered' in updates)) (updates as any).rendered = false;
      const updated = updatePost(req.params.id, updates);
      if (!updated) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: updated });
    } catch (e) {
      fail(res, e, 'update post');
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    try {
      deletePost(req.params.id);
      deleteMedia(req.params.id);
      res.json({ success: true });
    } catch (e) {
      fail(res, e, 'delete post');
    }
  });

  app.post('/api/posts/:id/schedule', (req, res) => {
    try {
      const invalid = validateSchedule(req.body);
      if (invalid) return res.status(400).json({ success: false, error: invalid });
      const post = getPostById(req.params.id);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      if (!post.rendered) return res.status(409).json({ success: false, error: 'Render the slides first (save the post from Studio).' });
      const when = new Date(req.body.scheduledFor).toISOString();
      res.json({ success: true, data: updatePost(post.id, { status: 'Scheduled', scheduledFor: when }) });
    } catch (e) {
      fail(res, e, 'schedule post');
    }
  });

  // Publish now: folder export and/or Instagram, according to PUBLISH_MODE.
  app.post('/api/posts/:id/publish', async (req, res) => {
    try {
      if (!getPostById(req.params.id)) return res.status(404).json({ success: false, error: 'Post not found' });
      const out = await publishPost(req.params.id);
      const last = out.publishLog?.slice(-2) ?? [];
      const err = out.status !== 'Published' ? last.find(l => !l.ok)?.detail : undefined;
      res.status(err ? 502 : 200).json({ success: !err, data: out, error: err });
    } catch (e) {
      fail(res, e, 'publish post');
    }
  });

  // Folder export only (regardless of PUBLISH_MODE), does not change status.
  app.post('/api/posts/:id/export', (req, res) => {
    try {
      const post = getPostById(req.params.id);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      const dir = exportToFolder(post);
      updatePost(post.id, { exportPath: dir });
      res.json({ success: true, path: dir });
    } catch (e: any) {
      res.status(409).json({ success: false, error: e.message });
    }
  });

  app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Not found' }));

  if (!config.isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(config.root, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(config.root, 'dist', 'index.html')));
  }

  fs.mkdirSync(config.mediaDir, { recursive: true });
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[Campaign Flow] http://localhost:${config.port}  AI: ${aiConfigured() ? 'on' : 'off (no GEMINI_API_KEY)'}  publish: ${config.publishMode}`);
  });
  startScheduler();
}

startServer();
