/**
 * Single source of truth for environment configuration and Gemini model IDs.
 * Import this module first: it loads .env.local (then .env) before anything reads process.env.
 * Variables are documented in .env.example.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: [path.join(root, '.env.local'), path.join(root, '.env')], quiet: true });

const env = (k: string, d = '') => (process.env[k] ?? '').trim() || d;

export const config = {
  root,
  port: Number(env('PORT')) || 3000,
  appUrl: env('APP_URL').replace(/\/$/, ''),
  isProd: process.env.NODE_ENV === 'production',
  geminiKey: env('GEMINI_API_KEY'),
  models: {
    text: env('GEMINI_MODEL_TEXT', 'gemini-3.8-flash'),
    research: env('GEMINI_MODEL_RESEARCH', 'gemini-3.8-flash'),
    image: env('GEMINI_MODEL_IMAGE', 'gemini-3.1-flash-lite-image'),
  },
  publishMode: (['folder', 'instagram', 'both'].includes(env('PUBLISH_MODE')) ? env('PUBLISH_MODE') : 'folder') as
    | 'folder'
    | 'instagram'
    | 'both',
  exportDir: path.resolve(root, env('EXPORT_DIR', './exports')),
  mediaDir: path.join(root, 'data', 'media'),
  instagram: {
    userId: env('IG_USER_ID'),
    token: env('IG_ACCESS_TOKEN'),
    // Token from "Instagram API with Instagram Login" -> graph.instagram.com (default). Facebook Login tokens -> https://graph.facebook.com
    host: env('IG_API_HOST', 'https://graph.instagram.com').replace(/\/$/, ''),
  },
};

export const instagramConfigured = () => !!(config.instagram.userId && config.instagram.token && config.appUrl);
