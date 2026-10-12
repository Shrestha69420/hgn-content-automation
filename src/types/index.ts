/** Shared types (used by both the Express server and the React client). */

export type Platform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'Twitter';
export type ContentStatus = 'Draft' | 'Approved' | 'Scheduled' | 'Published';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  department?: string;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  voice: string; // tone description
  audience: string;
  region?: string; // where the audience is; scopes news, seasons and holidays
  keywords?: string[]; // search terms for trend research
  website: string;
  handle: string; // social handle
  colors: { primary: string; accent: string; background: string; text: string };
  hashtags: string[]; // always-on brand hashtags
  cta: string; // default call to action
  avoid: string[]; // words / topics the AI must not use
  topics: string[]; // content pillars
}

/** A text layer on a slide. Coordinates are in slide units (1080 x 1350). */
export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  size: number;
  weight: 400 | 700 | 900;
  color: string;
  align: 'left' | 'center' | 'right';
  font: 'sans' | 'serif';
  shadow?: boolean;
}

export interface Slide {
  id: string;
  background: string; // URL of generated image, '' = solid color
  bgColor: string;
  overlay: number; // 0..0.85 black scrim over the image to keep text readable
  imagePrompt: string;
  layers: TextLayer[];
}

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

export interface QualityCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  points: number;
  max: number;
}

export interface QualityReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  checks: QualityCheck[];
}

export interface PublishEntry {
  at: string;
  target: 'folder' | 'instagram';
  ok: boolean;
  detail: string;
}

export interface Post {
  id: string;
  brandId: string;
  title: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  platform: Platform;
  status: ContentStatus;
  topic: string;
  designConcept: string;
  slides: Slide[];
  sources: { title: string; url: string }[];
  bestTime?: string;
  author: string;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  exportPath?: string;
  rendered?: boolean; // final PNGs have been uploaded for scheduled publishing
  publishLog?: PublishEntry[];
}

export interface Idea {
  topic: string;
  angle: string;
  whyNow: string;
  format: 'carousel' | 'single' | 'quote' | 'tips' | 'news';
  avoid?: string;
}

export interface IdeasResult {
  ideas: Idea[];
  avoidNow: string[];
  sources: { title: string; url: string }[];
  searches?: string[]; // web queries Gemini actually ran
  source: string;
}

export interface GeneratedPost {
  title: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  designConcept: string;
  bestTime: string;
  slides: { headline: string; body: string; imagePrompt: string }[];
}

export interface ServerInfo {
  aiConfigured: boolean;
  models: { text: string; research: string; image: string };
  publishMode: 'folder' | 'instagram' | 'both';
  instagramConfigured: boolean;
  exportDir: string;
}
