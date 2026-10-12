import type { Brand, GeneratedPost, IdeasResult, Platform, Post, ServerInfo } from '../types';
import { UNAUTHORIZED_EVENT } from './authService';

/** fetch wrapper: a 401 anywhere signs the user out (see AuthContext). */
export async function api(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  return res;
}

async function call<T = any>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await api(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export const apiService = {
  info: async (): Promise<ServerInfo> => (await call('/api/info')).data,

  getBrands: async (): Promise<Brand[]> => (await call('/api/brands')).data,
  createBrand: async (b: Omit<Brand, 'id'>): Promise<Brand> => (await call('/api/brands', 'POST', b)).data,
  updateBrand: async (id: string, b: Partial<Brand>): Promise<Brand> => (await call(`/api/brands/${id}`, 'PUT', b)).data,
  extractBrand: async (url: string): Promise<Partial<Brand>> => (await call('/api/brands/extract', 'POST', { url })).data,
  deleteBrand: async (id: string) => void (await call(`/api/brands/${id}`, 'DELETE')),

  getPosts: async (): Promise<Post[]> => (await call('/api/posts')).data,
  createPost: async (p: Post): Promise<Post> => (await call('/api/posts', 'POST', p)).data,
  updatePost: async (id: string, p: Partial<Post>): Promise<Post> => (await call(`/api/posts/${id}`, 'PUT', p)).data,
  deletePost: async (id: string) => void (await call(`/api/posts/${id}`, 'DELETE')),
  schedulePost: async (id: string, scheduledFor: string): Promise<Post> =>
    (await call(`/api/posts/${id}/schedule`, 'POST', { scheduledFor })).data,
  publishPost: async (id: string): Promise<Post> => (await call(`/api/posts/${id}/publish`, 'POST')).data,
  exportPost: async (id: string): Promise<string> => (await call(`/api/posts/${id}/export`, 'POST')).path,
  uploadRendered: async (id: string, index: number, png: Blob) => {
    const res = await api(`/api/posts/${id}/rendered/${index}`, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: png });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Could not upload rendered slide');
  },

  ideas: async (brandId: string, platform: Platform, focus: string): Promise<IdeasResult> =>
    (await call('/api/ai/ideas', 'POST', { brandId, platform, focus })).data,
  generatePost: async (req: {
    brandId: string; topic: string; angle: string; platform: Platform; slides: number; notes: string;
  }): Promise<{ data: GeneratedPost; source: string }> => {
    const j = await call('/api/ai/post', 'POST', req);
    return { data: j.data, source: j.source };
  },
  generateImage: async (brandId: string, postId: string, prompt: string): Promise<string> =>
    (await call('/api/ai/image', 'POST', { brandId, postId, prompt })).url,
};
