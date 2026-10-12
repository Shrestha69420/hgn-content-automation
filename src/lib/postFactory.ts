import { SLIDE_W, type Brand, type GeneratedPost, type Platform, type Post, type PostType, type Slide, type TextLayer } from '../types';
import { hasImages } from './postTypes';

const uid = () => Math.random().toString(36).slice(2, 10);
const PAD = 90;
const W = SLIDE_W - PAD * 2;

const layer = (text: string, y: number, size: number, weight: 400 | 700, color: string, over: Partial<TextLayer> = {}): TextLayer => ({
  id: `l-${uid()}`, text, x: PAD, y, width: W, size, weight, color, align: 'left', font: 'sans', shadow: false, ...over,
});

/** Slide layouts per post type. Colors are brand tokens so slides follow the brand palette. */
export function emptySlide(type: PostType | undefined, headline = '', body = '', imagePrompt = '', first = false): Slide {
  let layers: TextLayer[];
  if (type === 'quote') {
    layers = [
      layer(headline, 420, 76, 700, 'brand:text', { font: 'serif', align: 'center' }),
      layer(body, 960, 36, 400, 'brand:accent', { align: 'center' }),
    ];
  } else if (type === 'announcement') {
    layers = [
      layer(headline, 430, 112, 700, 'brand:accent', { align: 'center' }),
      layer(body, 900, 44, 400, 'brand:text', { align: 'center' }),
    ];
  } else {
    layers = [
      layer(headline, first ? 560 : 620, first ? 96 : 84, 700, 'brand:text'),
      layer(body, first ? 960 : 920, 40, 400, 'brand:text'),
    ];
  }
  return { id: `s-${uid()}`, background: '', bgColor: 'brand:background', overlay: 0, imagePrompt, layers };
}

export const newPostId = () => `post-${crypto.randomUUID()}`;

export function blankPost(brand: Brand, platform: Platform = 'Instagram', postType: PostType = 'carousel'): Post {
  return {
    id: newPostId(),
    brandId: brand.id,
    title: 'Untitled post',
    caption: '',
    hashtags: [...brand.hashtags],
    callToAction: brand.cta,
    platform,
    postType,
    linkUrl: '',
    status: 'Draft',
    topic: '',
    designConcept: '',
    slides: hasImages(postType) ? [emptySlide(postType, postType === 'quote' ? 'Your quote here' : '', '')] : [],
    sources: [],
    author: '',
    createdAt: new Date().toISOString(),
  };
}

export function postFromGenerated(brand: Brand, g: GeneratedPost, platform: Platform, postType: PostType, topic: string, linkUrl: string, author: string): Post {
  const slides = hasImages(postType) ? g.slides.map((s, i) => emptySlide(postType, s.headline, s.body, s.imagePrompt, postType === 'carousel' && i === 0)) : [];
  const tags = Array.from(new Set([...(g.hashtags || []), ...brand.hashtags]));
  const limit = platform === 'Twitter' ? 3 : platform === 'Facebook' ? 4 : platform === 'LinkedIn' ? 6 : 30;
  return {
    ...blankPost(brand, platform, postType),
    title: g.title,
    caption: g.caption,
    hashtags: tags.slice(0, limit),
    callToAction: g.callToAction || brand.cta,
    linkUrl,
    topic,
    designConcept: g.designConcept,
    bestTime: g.bestTime,
    slides: hasImages(postType) && !slides.length ? [emptySlide(postType)] : slides,
    author,
  };
}

/** Keys that make up a post's editable content (everything else is managed by the server). */
export const CONTENT_KEYS = ['title', 'caption', 'hashtags', 'callToAction', 'platform', 'postType', 'linkUrl', 'topic', 'designConcept', 'slides', 'sources', 'bestTime'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];
export const contentSnapshot = (p: Post): Record<ContentKey, string> =>
  Object.fromEntries(CONTENT_KEYS.map(k => [k, JSON.stringify((p as any)[k] ?? null)])) as Record<ContentKey, string>;
