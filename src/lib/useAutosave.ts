/**
 * Client-first autosave for the post open in Studio.
 *  1. Every change is mirrored to localStorage within ~300 ms (survives reloads and crashes).
 *  2. The server is synced 2.5 s after the last change, sending ONLY the fields that changed.
 *  3. Final PNGs are rendered/uploaded only when needed (approved or scheduled posts, or an explicit action),
 *     so editing a draft never triggers image uploads.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BrandColors, Post } from '../types';
import { apiService } from '../services/apiService';
import { useApp } from '../context/AppContext';
import { CONTENT_KEYS, contentSnapshot, type ContentKey } from './postFactory';
import { uploadFinals } from './finals';

export type SaveState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
const LS = 'cf_unsaved_';
const SERVER_DELAY = 2500;
const NEW_POST_DELAY = 600;

const pick = (p: Post, keys: readonly ContentKey[]) => Object.fromEntries(keys.map(k => [k, (p as any)[k]])) as Partial<Post>;
const lsGet = (id: string): Post | null => { try { const r = localStorage.getItem(LS + id); return r ? JSON.parse(r) : null; } catch { return null; } };
const lsSet = (p: Post) => { try { localStorage.setItem(LS + p.id, JSON.stringify(p)); } catch { /* storage full or blocked */ } };
const lsDel = (id: string) => { try { localStorage.removeItem(LS + id); } catch { /* ignore */ } };

export function useAutosave(post: Post | null, setPost: React.Dispatch<React.SetStateAction<Post | null>>, colors: BrandColors | undefined) {
  const { posts, studioKey, upsertPost, showToast } = useApp();
  const [state, setState] = useState<SaveState>('idle');

  const postRef = useRef(post); postRef.current = post;
  const postsRef = useRef(posts); postsRef.current = posts;
  const colorsRef = useRef(colors); colorsRef.current = colors;
  const baseline = useRef<Record<ContentKey, string> | null>(null); // snapshot last confirmed by the server; null = not on server yet
  const baselineId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inflight = useRef<Promise<void> | null>(null);

  const isDirty = (p: Post) => {
    const snap = contentSnapshot(p);
    return !baseline.current || CONTENT_KEYS.some(k => snap[k] !== baseline.current![k]);
  };

  const flush = useCallback(async (opts: { render?: boolean } = {}): Promise<void> => {
    clearTimeout(timer.current);
    while (inflight.current) await inflight.current.catch(() => undefined);
    const p = postRef.current;
    if (!p) return;
    const snap = contentSnapshot(p);
    const base = baseline.current;
    const changed = base ? CONTENT_KEYS.filter(k => snap[k] !== base[k]) : [...CONTENT_KEYS];
    const live = p.status === 'Approved' || p.status === 'Scheduled';
    const needRender = p.slides.length > 0 && (!!opts.render || (live && changed.includes('slides')));
    if (!changed.length && !needRender) { setState(s => (s === 'saving' || s === 'unsaved' ? 'saved' : s)); return; }

    const run = (async () => {
      setState('saving');
      try {
        let saved: Post;
        if (!base) {
          const { rendered: _r, publishLog: _l, exportPath: _e, ...body } = p;
          saved = await apiService.createPost(body as Post);
        } else if (changed.length) {
          saved = await apiService.updatePost(p.id, pick(p, changed));
        } else {
          saved = postsRef.current.find(x => x.id === p.id) ?? p;
        }
        baselineId.current = p.id;
        baseline.current = snap;
        if (needRender && colorsRef.current) {
          await uploadFinals({ ...p, id: saved.id }, colorsRef.current);
          saved = { ...saved, rendered: true };
        }
        upsertPost(saved);
        lsDel(p.id);
        // Edits that arrived while saving stay queued.
        const now = postRef.current;
        if (now && now.id === p.id && isDirty(now)) { setState('unsaved'); timer.current = setTimeout(() => void flush(), SERVER_DELAY); }
        else setState('saved');
      } catch (e: any) {
        setState('error');
        showToast(`Could not save: ${e.message || 'network error'}. Your edits are kept in this browser.`);
        throw e;
      }
    })();
    inflight.current = run.finally(() => { inflight.current = null; });
    await inflight.current;
  }, [upsertPost, showToast]);

  // Load the save baseline whenever a different post is opened (or Studio asks for a reload).
  useEffect(() => {
    clearTimeout(timer.current);
    const p = postRef.current;
    if (!p) { baseline.current = null; baselineId.current = null; setState('idle'); return; }
    const server = postsRef.current.find(x => x.id === p.id);
    baseline.current = server ? contentSnapshot(server) : null;
    baselineId.current = p.id;
    setState('idle');
    const local = lsGet(p.id);
    if (local) {
      const a = contentSnapshot(local); const b = contentSnapshot(p);
      if (CONTENT_KEYS.some(k => a[k] !== b[k])) {
        setPost({ ...p, ...pick(local, CONTENT_KEYS) });
        showToast('Restored edits that were not saved to the server yet.');
      } else lsDel(p.id);
    }
  }, [post?.id, studioKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // On every change: local copy fast, server later.
  useEffect(() => {
    if (!post || baselineId.current !== post.id || !isDirty(post)) return;
    setState('unsaved');
    clearTimeout(lsTimer.current);
    lsTimer.current = setTimeout(() => lsSet(post), 300);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush().catch(() => undefined), baseline.current ? SERVER_DELAY : NEW_POST_DELAY);
  }, [post]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flush when leaving Studio, hiding the tab or closing the page.
  useEffect(() => {
    const out = () => { const p = postRef.current; if (p) { lsSet(p); if (isDirty(p)) void flush().catch(() => undefined); } };
    const vis = () => { if (document.visibilityState === 'hidden') out(); };
    window.addEventListener('pagehide', out);
    document.addEventListener('visibilitychange', vis);
    return () => { window.removeEventListener('pagehide', out); document.removeEventListener('visibilitychange', vis); out(); };
  }, [flush]);

  /** Applies server-managed fields (status, dates, export info) without touching local edits. */
  const mergeServer = useCallback((out: Post) => {
    setPost(cur => (cur && cur.id === out.id ? { ...cur, status: out.status, scheduledFor: out.scheduledFor, publishedAt: out.publishedAt, exportPath: out.exportPath, publishLog: out.publishLog, rendered: out.rendered } : cur));
    upsertPost(out);
  }, [setPost, upsertPost]);

  return { saveState: state, saveNow: (render = true) => flush({ render }), mergeServer };
}
