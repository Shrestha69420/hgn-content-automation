/**
 * Request-body validation for the REST API (no external dependencies).
 * Each validator returns an error string, or null when the body is acceptable.
 */

const STATUSES = ['Draft', 'Approved', 'Scheduled', 'Published'];
const POST_TYPES = ['carousel', 'single', 'quote', 'announcement', 'text', 'link'];
const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'];
const HEX = /^#[0-9a-fA-F]{6}$/;

const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;
const strArray = (max: number, itemMax: number) => (v: any) =>
  Array.isArray(v) && v.length <= max && v.every(x => isStr(x, itemMax));
const dateLike = (v: any) => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));
const num = (min: number, max: number) => (v: any) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

function check(body: unknown, rules: Record<string, (v: any) => boolean>, required: string[]): string | null {
  if (!isObj(body)) return 'Request body must be a JSON object';
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === '') return `"${key}" is required`;
  }
  for (const [key, ok] of Object.entries(rules)) {
    if (body[key] !== undefined && !ok(body[key])) return `"${key}" is invalid`;
  }
  return null;
}

const layer = (l: any) =>
  isObj(l) &&
  isStr(l.id, 80) &&
  isStr(l.text, 1000) &&
  num(-2000, 4000)(l.x) &&
  num(-2000, 4000)(l.y) &&
  num(10, 4000)(l.width) &&
  num(8, 400)(l.size) &&
  [400, 700, 900].includes(l.weight) &&
  isStr(l.color, 20) &&
  ['left', 'center', 'right'].includes(l.align) &&
  ['sans', 'serif'].includes(l.font);

const slide = (s: any) =>
  isObj(s) &&
  isStr(s.id, 80) &&
  isStr(s.background, 500) &&
  isStr(s.bgColor, 20) &&
  num(0, 1)(s.overlay) &&
  isStr(s.imagePrompt, 2000) &&
  Array.isArray(s.layers) &&
  s.layers.length <= 12 &&
  s.layers.every(layer);

export function validateBrand(body: unknown, partial = false): string | null {
  return check(
    body,
    {
      id: v => isStr(v, 80),
      name: v => isStr(v, 120),
      tagline: v => isStr(v, 300),
      industry: v => isStr(v, 200),
      voice: v => isStr(v, 1000),
      audience: v => isStr(v, 500),
      region: v => isStr(v, 200),
      keywords: strArray(30, 80),
      website: v => isStr(v, 300),
      handle: v => isStr(v, 100),
      colors: v => isObj(v) && ['primary', 'accent', 'background', 'text'].every(k => HEX.test(v[k])),
      hashtags: strArray(40, 60),
      cta: v => isStr(v, 300),
      avoid: strArray(40, 100),
      topics: strArray(20, 100),
      extra: v => Array.isArray(v) && v.length <= 30 && v.every((x: any) => isObj(x) && isStr(x.label, 80) && isStr(x.value, 600)),
    },
    partial ? [] : ['name']
  );
}

export function validatePost(body: unknown, partial = false): string | null {
  return check(
    body,
    {
      id: v => isStr(v, 80),
      brandId: v => isStr(v, 80),
      title: v => isStr(v, 300),
      caption: v => isStr(v, 5000),
      hashtags: strArray(40, 100),
      callToAction: v => isStr(v, 500),
      platform: v => PLATFORMS.includes(v),
      postType: v => POST_TYPES.includes(v),
      linkUrl: v => v === '' || (isStr(v, 500) && /^https?:\/\//i.test(v)),
      status: v => STATUSES.includes(v),
      topic: v => isStr(v, 400),
      designConcept: v => isStr(v, 3000),
      slides: v => Array.isArray(v) && v.length <= 10 && v.every(slide),
      sources: v => Array.isArray(v) && v.length <= 20,
      bestTime: v => isStr(v, 300),
      author: v => isStr(v, 200),
      createdAt: dateLike,
      scheduledFor: dateLike,
    },
    partial ? [] : ['brandId', 'title', 'platform', 'slides']
  );
}

export function validateSchedule(body: unknown): string | null {
  return check(body, { scheduledFor: dateLike }, ['scheduledFor']);
}

export function validateIdeasRequest(body: unknown): string | null {
  return check(body, { brandId: v => isStr(v, 80), focus: v => isStr(v, 300), platform: v => PLATFORMS.includes(v) }, ['brandId']);
}

export function validateCopyRequest(body: unknown): string | null {
  return check(
    body,
    {
      brandId: v => isStr(v, 80),
      topic: v => isStr(v, 300),
      angle: v => isStr(v, 400),
      notes: v => isStr(v, 800),
      platform: v => PLATFORMS.includes(v),
      postType: v => POST_TYPES.includes(v),
      linkUrl: v => v === '' || (isStr(v, 500) && /^https?:\/\//i.test(v)),
      slides: num(0, 10),
    },
    ['brandId', 'topic']
  );
}

export function validateImageRequest(body: unknown): string | null {
  return check(body, { brandId: v => isStr(v, 80), postId: v => isStr(v, 80), prompt: v => isStr(v, 1200) }, ['brandId', 'postId', 'prompt']);
}

export function validateExtractRequest(body: unknown): string | null {
  const err = check(body, { url: v => isStr(v, 500) }, ['url']);
  if (err) return err;
  try {
    const u = new URL((body as any).url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? null : 'URL must start with http:// or https://';
  } catch {
    return '"url" is not a valid URL';
  }
}

export function validateRegistration(body: unknown): string | null {
  if (!isObj(body)) return 'Request body must be a JSON object';
  const { name, email, password } = body;
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return 'A valid name is required';
  if (typeof email !== 'string' || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'A valid email is required';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    return 'Password must be at least 8 characters';
  }
  return null;
}
