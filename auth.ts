/**
 * ==============================================================================
 * Server-side auth: password hashing, signed session cookies, rate limiting
 * Platform: HGN Marketing Hub
 * Uses only node:crypto (no extra dependencies).
 * ==============================================================================
 */

import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// -----------------------------------------------------------------------------
// Passwords (scrypt)
// -----------------------------------------------------------------------------
const SCRYPT_PREFIX = 'scrypt$';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${SCRYPT_PREFIX}${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function isHashed(stored: string | null | undefined): boolean {
  return !!stored && stored.startsWith(SCRYPT_PREFIX);
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  if (!isHashed(stored)) {
    // Legacy plaintext row (migrated to a hash on startup); compare in constant time.
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const [, saltHex, hashHex] = stored.split('$');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// -----------------------------------------------------------------------------
// Sessions (HMAC-signed token in an httpOnly cookie)
// -----------------------------------------------------------------------------
export const SESSION_COOKIE = 'hgn_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

let secretWarned = false;
const SESSION_SECRET: string =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : (() => {
        if (!secretWarned) {
          secretWarned = true;
          console.warn(
            '[auth] SESSION_SECRET is not set (min 16 chars). Using a random secret: sessions reset on every restart.'
          );
        }
        return crypto.randomBytes(32).toString('hex');
      })();

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof uid === 'string' && typeof exp === 'number' && exp > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function setSessionCookie(res: Response, userId: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${createSessionToken(userId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/** Rejects the request with 401 unless it carries a valid session cookie. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const uid = readSessionToken(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
  if (!uid) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  req.userId = uid;
  next();
}

export function getSessionUserId(req: Request): string | null {
  return readSessionToken(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
}

// -----------------------------------------------------------------------------
// Rate limiting (fixed window, in memory)
// -----------------------------------------------------------------------------
export function rateLimit(opts: { windowMs: number; max: number; key: (req: Request) => string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const k = opts.key(req);
    const entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      hits.set(k, { count: 1, resetAt: now + opts.windowMs });
      if (hits.size > 5000) for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
      return next();
    }
    entry.count += 1;
    if (entry.count > opts.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };
}
