import { SLIDE_W, type Brand, type GeneratedPost, type Platform, type Post, type Slide } from '../types';

const uid = () => Math.random().toString(36).slice(2, 10);

export function emptySlide(brand: Brand, headline = '', body = '', imagePrompt = ''): Slide {
  const pad = 90;
  const w = SLIDE_W - pad * 2;
  const mk = (text: string, y: number, size: number, weight: 400 | 700 | 900, color: string) => ({
    id: `l-${uid()}`,
    text,
    x: pad,
    y,
    width: w,
    size,
    weight,
    color,
    align: 'left' as const,
    font: 'sans' as const,
    shadow: false,
  });
  return {
    id: `s-${uid()}`,
    background: '',
    bgColor: 'brand:background',
    overlay: 0,
    imagePrompt,
    layers: [mk(headline, 620, 84, 900, 'brand:text'), mk(body, 920, 40, 400, 'brand:text')],
  };
}

export function newPostId() {
  return `post-${crypto.randomUUID()}`;
}

export function blankPost(brand: Brand, platform: Platform = 'Instagram'): Post {
  return {
    id: newPostId(),
    brandId: brand.id,
    title: 'Untitled post',
    caption: '',
    hashtags: [...brand.hashtags],
    callToAction: brand.cta,
    platform,
    status: 'Draft',
    topic: '',
    designConcept: '',
    slides: [emptySlide(brand)],
    sources: [],
    author: '',
    createdAt: new Date().toISOString(),
  };
}

export function postFromGenerated(brand: Brand, g: GeneratedPost, platform: Platform, topic: string, author: string): Post {
  const slides = g.slides.map((s, i) => {
    const slide = emptySlide(brand, s.headline, s.body, s.imagePrompt);
    if (i === 0) {
      slide.layers[0].size = 96;
      slide.layers[0].y = 560;
      slide.layers[1].y = 960;
    }
    return slide;
  });
  const tags = Array.from(new Set([...(g.hashtags || []), ...brand.hashtags]));
  return {
    ...blankPost(brand, platform),
    title: g.title,
    caption: g.caption,
    hashtags: tags,
    callToAction: g.callToAction || brand.cta,
    topic,
    designConcept: g.designConcept,
    bestTime: g.bestTime,
    slides: slides.length ? slides : [emptySlide(brand)],
    author,
  };
}
