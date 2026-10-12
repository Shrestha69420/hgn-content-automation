import type { BrandColors, Post } from '../types';
import { apiService } from '../services/apiService';
import { renderSlideToBlob } from './slideRenderer';

/** Renders every slide in the browser and uploads the PNGs the server publishes/exports. */
export async function uploadFinals(post: Post, colors: BrandColors): Promise<void> {
  for (let i = 0; i < post.slides.length; i++) {
    await apiService.uploadRendered(post.id, i, await renderSlideToBlob(post.slides[i], colors));
  }
}

/** Makes sure the server has up-to-date PNGs for this post. Returns true if it had to render. */
export async function ensureFinals(post: Post, colors: BrandColors): Promise<boolean> {
  if (post.rendered || post.slides.length === 0) return false;
  await uploadFinals(post, colors);
  return true;
}
