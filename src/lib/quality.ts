/** Deterministic, brand-aware quality score (no AI call, free and repeatable). */
import type { Brand, Post, QualityCheck, QualityReport } from '../types';

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function scorePost(post: Post, brand: Brand | undefined): QualityReport {
  const checks: QualityCheck[] = [];
  const add = (id: string, label: string, max: number, ratio: number, detail: string) => {
    const status = ratio >= 1 ? 'pass' : ratio > 0 ? 'warn' : 'fail';
    checks.push({ id, label, status, detail, max, points: Math.round(max * ratio) });
  };

  const caption = post.caption.trim();
  const firstLine = caption.split('\n')[0] || '';
  const ig = post.platform === 'Instagram';

  add('hook', 'Strong opening line', 15, firstLine.length > 0 && firstLine.length <= 125 ? 1 : firstLine ? 0.5 : 0,
    firstLine ? `${firstLine.length} characters before the first line break (aim for 125 or fewer, Instagram cuts the rest).` : 'Caption is empty.');

  const limits = ig ? [80, 1500] : post.platform === 'Twitter' ? [20, 270] : [80, 3000];
  const len = caption.length;
  add('length', 'Caption length', 15, len >= limits[0] && len <= limits[1] ? 1 : len > 0 ? 0.4 : 0,
    `${len} characters (good range ${limits[0]}-${limits[1]} for ${post.platform}).`);

  const tags = post.hashtags.length;
  const [lo, hi] = ig ? [5, 15] : [1, 6];
  add('hashtags', 'Hashtags', 10, tags >= lo && tags <= hi ? 1 : tags > 0 ? 0.5 : 0, `${tags} hashtags (aim for ${lo}-${hi}).`);

  const cta = (post.callToAction || '').trim();
  add('cta', 'Call to action', 10, cta ? 1 : 0, cta ? 'Present.' : 'Add a clear next step (follow, save, share, visit).');

  const avoid = (brand?.avoid || []).filter(w => w.trim());
  const text = [caption, ...post.slides.flatMap(s => s.layers.map(l => l.text))].join(' ').toLowerCase();
  const hits = avoid.filter(w => text.includes(w.toLowerCase()));
  add('avoid', 'Brand rules respected', 15, hits.length === 0 ? 1 : 0,
    hits.length ? `Contains words the brand avoids: ${hits.join(', ')}.` : avoid.length ? 'No avoided words found.' : 'No avoid-list set for this brand.');

  const sentences = caption.split(/[.!?\n]+/).map(s => words(s)).filter(Boolean);
  const avg = sentences.length ? sentences.reduce((a, b) => a + b, 0) / sentences.length : 0;
  add('readability', 'Easy to read', 10, avg > 0 && avg <= 18 ? 1 : avg > 0 && avg <= 26 ? 0.5 : 0,
    avg ? `Average sentence is ${avg.toFixed(1)} words (aim for 18 or fewer).` : 'No sentences found.');

  const n = post.slides.length;
  const wantsCarousel = ig;
  add('slides', 'Slide count', 5, !wantsCarousel || (n >= 3 && n <= 10) ? 1 : n > 0 ? 0.6 : 0,
    `${n} slide${n === 1 ? '' : 's'}${wantsCarousel ? ' (carousels of 3-10 perform best on Instagram)' : ''}.`);

  const dense = post.slides.filter(s => words(s.layers.map(l => l.text).join(' ')) > 45).length;
  add('density', 'Slide text is short', 10, dense === 0 ? 1 : dense <= 1 ? 0.5 : 0,
    dense ? `${dense} slide(s) have more than 45 words; trim them.` : 'Text on every slide is short enough to read at a glance.');

  const unreadable = post.slides.filter(s => s.background && s.overlay < 0.2 && s.layers.some(l => l.color.toLowerCase() === '#ffffff')).length;
  add('contrast', 'Text readable on images', 10, unreadable === 0 ? 1 : 0.5,
    unreadable ? `${unreadable} slide(s) have light text on an image with almost no dark overlay.` : 'Overlay keeps text readable.');

  const score = checks.reduce((a, c) => a + c.points, 0);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  return { score, grade, checks };
}
