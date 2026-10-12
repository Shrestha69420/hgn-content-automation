import type { Platform, PostType } from '../types';

export interface PostTypeInfo {
  id: PostType;
  label: string;
  desc: string;
  /** number of slides the AI creates; 'choose' lets the user pick (carousel) */
  slides: number | 'choose';
  platforms: Platform[];
}

const ALL: Platform[] = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'];

export const POST_TYPES: PostTypeInfo[] = [
  { id: 'carousel', label: 'Carousel', desc: 'Swipeable slides with a hook, points and a call to action', slides: 'choose', platforms: ['Instagram', 'Facebook', 'LinkedIn'] },
  { id: 'single', label: 'Single image', desc: 'One image with a headline and short text', slides: 1, platforms: ALL },
  { id: 'quote', label: 'Quote card', desc: 'One bold quote or statement with attribution', slides: 1, platforms: ALL },
  { id: 'announcement', label: 'Announcement', desc: 'Offer, launch or news with a big headline', slides: 1, platforms: ALL },
  { id: 'text', label: 'Text post', desc: 'Caption only, no image', slides: 0, platforms: ['Facebook', 'LinkedIn', 'Twitter'] },
  { id: 'link', label: 'Link share', desc: 'Caption that introduces a link, no image', slides: 0, platforms: ['Facebook', 'LinkedIn', 'Twitter'] },
];

export const typeInfo = (t: PostType | undefined) => POST_TYPES.find(x => x.id === (t || 'carousel'))!;
export const typesFor = (p: Platform) => POST_TYPES.filter(t => t.platforms.includes(p));
export const hasImages = (t: PostType | undefined) => typeInfo(t).slides !== 0;

/** Map the researcher's suggested format to a post type. */
export const typeFromIdeaFormat = (f: string): PostType =>
  f === 'quote' ? 'quote' : f === 'single' ? 'single' : f === 'news' ? 'announcement' : 'carousel';
