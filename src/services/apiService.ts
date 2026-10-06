/**
 * ==============================================================================
 * Centralized API Service for Backend Communication
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 * ==============================================================================
 */

import { Campaign, ContentPost, UserProfile } from '../types';
import { UNAUTHORIZED_EVENT } from './authService';

/** fetch wrapper: a 401 anywhere signs the user out (see AuthContext). */
export async function api(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  return res;
}

export const apiService = {
  // ---------------------------------------------------------------------------
  // CAMPAIGNS API
  // ---------------------------------------------------------------------------
  async getCampaigns(): Promise<Campaign[]> {
    const res = await api('/api/campaigns');
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    const data = await res.json();
    return data.data;
  },

  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    const res = await api('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    const data = await res.json();
    return data.data;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const res = await api(`/api/campaigns/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update campaign');
    const data = await res.json();
    return data.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    const res = await api(`/api/campaigns/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete campaign');
  },

  // ---------------------------------------------------------------------------
  // POSTS / CONTENT API
  // ---------------------------------------------------------------------------
  async getPosts(): Promise<ContentPost[]> {
    const res = await api('/api/posts');
    if (!res.ok) throw new Error('Failed to fetch posts');
    const data = await res.json();
    return data.data;
  },

  async createPost(post: any): Promise<ContentPost> {
    const res = await api('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to create post');
    const data = await res.json();
    return data.data;
  },

  async updatePost(id: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    const res = await api(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update post');
    const data = await res.json();
    return data.data;
  },

  async deletePost(id: string): Promise<void> {
    const res = await api(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  async schedulePost(id: string, scheduledFor: string): Promise<ContentPost> {
    const res = await api(`/api/posts/${encodeURIComponent(id)}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor }),
    });
    if (!res.ok) throw new Error('Failed to schedule post');
    const data = await res.json();
    return data.data;
  },

  async publishPost(id: string): Promise<ContentPost> {
    const res = await api(`/api/posts/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to publish post');
    const data = await res.json();
    return data.data;
  },

  // ---------------------------------------------------------------------------
  // USERS & AUTH API
  // ---------------------------------------------------------------------------
  async getUsers(): Promise<UserProfile[]> {
    const res = await api('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.data;
  },

  async registerUser(name: string, email: string, password: string, confirmPassword?: string): Promise<any> {
    const res = await api('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    return data.user;
  },

  async loginUser(email: string, password: string): Promise<any> {
    const res = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid credentials');
    }
    return data.user;
  },

  // ---------------------------------------------------------------------------
  // SETTINGS & RESET API
  // ---------------------------------------------------------------------------
  async getSettings(): Promise<Record<string, string>> {
    const res = await api('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data = await res.json();
    return data.data;
  },

  async saveSettings(settings: Record<string, string>): Promise<void> {
    const res = await api('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
  },

  async resetDatabase(): Promise<void> {
    const res = await api('/api/settings/reset', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset database');
  },
};
