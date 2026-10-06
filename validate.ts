/**
 * Request-body validation for the REST API (no external dependencies).
 * Each validator returns an error string, or null when the body is acceptable.
 */

const STATUSES_POST = ['Draft', 'Ready', 'In Review', 'Approved', 'Scheduled', 'Published'];
const STATUSES_CAMPAIGN = ['Planning', 'Active', 'Completed', 'Archived'];
const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Blog'];

const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;

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

const strArray = (max: number, itemMax: number) => (v: any) =>
  Array.isArray(v) && v.length <= max && v.every(x => isStr(x, itemMax));
const dateLike = (v: any) => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));

export function validateCampaign(body: unknown, partial = false): string | null {
  return check(
    body,
    {
      id: v => isStr(v, 80),
      name: v => isStr(v, 200),
      code: v => isStr(v, 80),
      description: v => isStr(v, 5000),
      category: v => isStr(v, 80),
      startDate: dateLike,
      endDate: dateLike,
      season: v => isStr(v, 80),
      targetAudience: v => isStr(v, 300),
      targetChannels: v => strArray(10, 40)(v) && v.every((x: string) => PLATFORMS.includes(x)),
      budgetNPR: v => typeof v === 'number' && Number.isFinite(v) && v >= 0,
      status: v => STATUSES_CAMPAIGN.includes(v),
      kpis: isObj,
      safetyFocus: v => isStr(v, 1000),
    },
    partial ? [] : ['name']
  );
}

export function validatePost(body: unknown, partial = false): string | null {
  return check(
    body,
    {
      id: v => isStr(v, 80),
      campaignId: v => isStr(v, 80),
      campaignName: v => isStr(v, 200),
      title: v => isStr(v, 300),
      content: v => isStr(v, 20000),
      category: v => isStr(v, 80),
      platform: v => PLATFORMS.includes(v),
      status: v => STATUSES_POST.includes(v),
      author: v => isStr(v, 200),
      scheduledFor: dateLike,
      publishedAt: dateLike,
      hashtags: strArray(60, 100),
      callToAction: v => isStr(v, 1000),
      visualPrompt: v => isStr(v, 3000),
      primaryKeyword: v => isStr(v, 200),
      objective: v => isStr(v, 100),
      qualityReport: isObj,
      deterministicScoreResult: v => v === null || isObj(v),
      analytics: isObj,
      versionHistory: v => Array.isArray(v) && v.length <= 500,
    },
    partial ? [] : ['title', 'content', 'platform']
  );
}

export function validateSchedule(body: unknown): string | null {
  return check(body, { scheduledFor: dateLike }, ['scheduledFor']);
}

export function validateSettings(body: unknown): string | null {
  if (!isObj(body)) return 'Request body must be a JSON object';
  const entries = Object.entries(body);
  if (entries.length > 100) return 'Too many settings';
  for (const [k, v] of entries) {
    if (!isStr(k, 100) || !(typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') || String(v).length > 2000) {
      return `Setting "${k.slice(0, 40)}" is invalid`;
    }
  }
  return null;
}

/** Clamp and strip control characters from user text that is interpolated into the AI prompt. */
export function cleanPromptField(v: unknown, fallback: string, max = 500): string {
  if (typeof v !== 'string') return fallback;
  const cleaned = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
  return cleaned || fallback;
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
