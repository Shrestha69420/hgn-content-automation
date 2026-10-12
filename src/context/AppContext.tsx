import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Brand, Post, ServerInfo } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

export type ActiveModule = 'landing' | 'overview' | 'studio' | 'library' | 'brands';

interface AppState {
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  brands: Brand[];
  activeBrand: Brand | undefined;
  setActiveBrandId: (id: string) => void;
  refreshBrands: () => Promise<void>;
  posts: Post[];
  brandPosts: Post[];
  upsertPost: (p: Post) => void;
  removePost: (id: string) => void;
  refreshPosts: () => Promise<void>;
  info: ServerInfo | null;
  loading: boolean;
  /** Post currently open in Studio (null = start fresh). */
  draft: Post | null;
  openInStudio: (p: Post | null) => void;
  toastMessage: string | null;
  showToast: (m: string) => void;
}

const Ctx = createContext<AppState | null>(null);
const BRAND_KEY = 'cf_active_brand';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('landing');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string>(() => {
    try { return localStorage.getItem(BRAND_KEY) || ''; } catch { return ''; }
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Post | null>(null);
  const [toastMessage, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((m: string) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const refreshBrands = useCallback(async () => {
    setBrands(await apiService.getBrands());
  }, []);
  const refreshPosts = useCallback(async () => {
    setPosts(await apiService.getPosts());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setBrands([]);
      setPosts([]);
      setActiveModule('landing');
      return;
    }
    setLoading(true);
    Promise.all([refreshBrands(), refreshPosts(), apiService.info().then(setInfo)])
      .catch(e => showToast(e.message || 'Could not load data'))
      .finally(() => setLoading(false));
    setActiveModule(m => (m === 'landing' ? 'overview' : m));
  }, [isAuthenticated, refreshBrands, refreshPosts, showToast]);

  const activeBrand = useMemo(
    () => brands.find(b => b.id === activeBrandId) || brands[0],
    [brands, activeBrandId]
  );
  const setActiveBrandId = useCallback((id: string) => {
    setActiveBrandIdState(id);
    try { localStorage.setItem(BRAND_KEY, id); } catch { /* ignore */ }
  }, []);

  const brandPosts = useMemo(() => posts.filter(p => p.brandId === activeBrand?.id), [posts, activeBrand]);

  const upsertPost = useCallback((p: Post) => {
    setPosts(prev => (prev.some(x => x.id === p.id) ? prev.map(x => (x.id === p.id ? p : x)) : [p, ...prev]));
  }, []);
  const removePost = useCallback((id: string) => setPosts(prev => prev.filter(p => p.id !== id)), []);

  const openInStudio = useCallback((p: Post | null) => {
    setDraft(p);
    setActiveModule('studio');
  }, []);

  const value: AppState = {
    activeModule, setActiveModule, brands, activeBrand, setActiveBrandId, refreshBrands,
    posts, brandPosts, upsertPost, removePost, refreshPosts, info, loading, draft, openInStudio, toastMessage, showToast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
