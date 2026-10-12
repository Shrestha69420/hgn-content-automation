/**
 * When a brand profile changes, unpublished posts follow it:
 *  - colors: slides use 'brand:*' tokens, so they follow automatically (finals are re-rendered by the caller)
 *  - default call to action, brand hashtags, brand name and handle are swapped where they appear
 */
import type { Brand, Post } from '../types';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const swap = (text: string, from: string, to: string) =>
  from.trim() && from !== to ? text.replace(new RegExp(esc(from.trim()), 'g'), to) : text;

export function syncPostWithBrand(post: Post, oldB: Brand, newB: Brand): Post | null {
  let changed = false;
  const apply = (t: string) => {
    let out = t;
    out = swap(out, oldB.cta, newB.cta);
    out = swap(out, oldB.name, newB.name);
    if (oldB.handle && newB.handle) out = swap(out, oldB.handle, newB.handle);
    if (out !== t) changed = true;
    return out;
  };

  const caption = apply(post.caption);
  const callToAction = apply(post.callToAction);
  const slides = post.slides.map(s => ({ ...s, layers: s.layers.map(l => ({ ...l, text: apply(l.text) })) }));

  const oldTags = new Set(oldB.hashtags.map(h => h.toLowerCase()));
  const kept = post.hashtags.filter(h => !oldTags.has(h.toLowerCase()) || newB.hashtags.some(n => n.toLowerCase() === h.toLowerCase()));
  const have = new Set(kept.map(h => h.toLowerCase()));
  const hashtags = [...kept, ...newB.hashtags.filter(h => !have.has(h.toLowerCase()))];
  if (hashtags.join(' ') !== post.hashtags.join(' ')) changed = true;

  return changed ? { ...post, caption, callToAction, slides, hashtags } : null;
}
