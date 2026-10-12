import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Save, Globe, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Btn, Card, Label, PageTitle, inputCls } from '../common/ui';
import { syncPostWithBrand } from '../../lib/brandSync';
import { renderSlideToBlob } from '../../lib/slideRenderer';
import type { Brand } from '../../types';

const list = (s: string, sep: RegExp) => s.split(sep).map(x => x.trim()).filter(Boolean);
const FIELD_LABELS: Record<string, string> = {
  name: 'name', tagline: 'tagline', industry: 'industry', voice: 'voice', audience: 'audience', region: 'region', handle: 'handle',
  cta: 'call to action', keywords: 'keywords', hashtags: 'hashtags', topics: 'pillars', avoid: 'avoid list', extra: 'extra info', colors: 'colors',
};

export const BrandsModule: React.FC = () => {
  const { brands, activeBrand, setActiveBrandId, refreshBrands, posts, upsertPost, showToast } = useApp();
  const [form, setForm] = useState<Brand | null>(activeBrand ?? null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [stream, setStream] = useState<{ status: string; text: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!fetching) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed(n => n + 1), 1000);
    return () => clearInterval(t);
  }, [fetching]);
  const waiting = elapsed < 4 ? 'Opening the page…' : elapsed < 14 ? 'Reading the site and pulling out its voice, colors and key facts…' : 'Still working. Bigger sites take a little longer…';
  const streamRef = useRef<HTMLPreElement>(null);
  useEffect(() => { streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight }); }, [stream?.text]);

  useEffect(() => { setForm(activeBrand ?? null); }, [activeBrand]);
  if (!form || !activeBrand) return null;
  const set = (u: Partial<Brand>) => setForm({ ...form, ...u });
  const extra = form.extra || [];

  const fetchWebsite = async () => {
    if (!form.website.trim()) return showToast('Enter the website URL first.');
    const url = /^https?:\/\//i.test(form.website.trim()) ? form.website.trim() : `https://${form.website.trim()}`;
    setFetching(true);
    setStream({ status: 'Connecting…', text: '' });
    try {
      const found = await apiService.extractBrand(url, e =>
        setStream(s => ({ status: e.type === 'status' ? e.text : 'Reading and analyzing the site…', text: (s?.text || '') + (e.type === 'chunk' ? e.text : '') }))
      );
      const keys = Object.keys(found);
      if (!keys.length) return showToast('Gemini could not read anything useful from that page.');
      setForm({ ...form, ...found, website: url });
      setStream(s => ({ status: `Done. Filled: ${keys.map(k => FIELD_LABELS[k] || k).join(', ')}. Review the fields below, then Save.`, text: s?.text || '' }));
    } catch (e: any) {
      setStream(null);
      showToast(e.message);
    } finally { setFetching(false); }
  };

  /** Saves the brand, then brings every unpublished post of this brand in line with it. */
  const save = async () => {
    setSaving(true);
    try {
      const old = activeBrand;
      await apiService.updateBrand(form.id, form);
      await refreshBrands();
      const colorsChanged = JSON.stringify(old.colors) !== JSON.stringify(form.colors);
      let updated = 0;
      for (const p of posts.filter(x => x.brandId === form.id && x.status !== 'Published')) {
        const synced = syncPostWithBrand(p, old, form);
        if (!synced && !colorsChanged) continue;
        let current = p;
        if (synced) {
          current = await apiService.updatePost(p.id, { caption: synced.caption, callToAction: synced.callToAction, hashtags: synced.hashtags, slides: synced.slides });
        }
        // Rendered PNGs are what gets published, so refresh them with the new brand look.
        for (let i = 0; i < current.slides.length; i++) {
          await apiService.uploadRendered(current.id, i, await renderSlideToBlob(current.slides[i], form.colors));
        }
        upsertPost({ ...current, rendered: true });
        updated++;
      }
      showToast(updated ? `Brand saved. Updated ${updated} unpublished post${updated === 1 ? '' : 's'} to match.` : 'Brand saved.');
    } catch (e: any) { showToast(e.message); } finally { setSaving(false); }
  };
  const create = async () => {
    try {
      const { id: _id, ...rest } = form;
      const b = await apiService.createBrand({ ...rest, name: 'New brand', website: '' });
      await refreshBrands();
      setActiveBrandId(b.id);
    } catch (e: any) { showToast(e.message); }
  };
  const remove = async () => {
    if (!window.confirm(`Delete brand "${form.name}"?`)) return;
    try {
      await apiService.deleteBrand(form.id);
      await refreshBrands();
      setActiveBrandId(brands.find(b => b.id !== form.id)?.id || '');
    } catch (e: any) { showToast(e.message); }
  };

  return (
    <div>
      <PageTitle title="Brands" sub="Everything the AI knows about the brand. Saving also updates its unpublished posts (colors, call to action, hashtags, name)."
        actions={<><Btn onClick={create}><Plus className="w-3.5 h-3.5" />New brand</Btn><Btn variant="danger" onClick={remove} disabled={brands.length <= 1}><Trash2 className="w-3.5 h-3.5" />Delete</Btn><Btn variant="primary" busy={saving} onClick={save}><Save className="w-3.5 h-3.5" />Save</Btn></>} />

      <Card title="Start from the website" className="mb-4"
        actions={<Btn variant="primary" busy={fetching} onClick={fetchWebsite}><Globe className="w-3.5 h-3.5" />Fetch brand details</Btn>}>
        <input className={inputCls} value={form.website} onChange={e => set({ website: e.target.value })} placeholder="https://yourcompany.com" />
        {stream && (
          <div className="mt-3 rounded-lg border border-zinc-800 bg-deep">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 text-[11px] text-zinc-300">
              {fetching ? <span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              <span>{stream.status}</span>
              {fetching && <span className="ml-auto font-mono text-zinc-500">{elapsed}s</span>}
              {!fetching && <button onClick={() => setStream(null)} className="ml-auto text-zinc-500 hover:text-zinc-300 cursor-pointer"><X className="w-3 h-3" /></button>}
            </div>
            <pre ref={streamRef} className="max-h-44 overflow-auto px-3 py-2 text-[11px] leading-relaxed text-zinc-400 font-mono whitespace-pre-wrap break-words">{stream.text || waiting}{fetching && <span className="inline-block w-1.5 h-3 bg-indigo-400 align-middle ml-0.5 animate-pulse" />}</pre>
          </div>
        )}
        <p className="text-[11px] text-zinc-600 mt-2">Gemini reads the page and fills the fields below (voice, audience, colors, topics, facts). Nothing is saved until you press Save, so you can review and edit first.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Identity">
          <div className="space-y-3">
            <div><Label>Name</Label><input className={inputCls} value={form.name} onChange={e => set({ name: e.target.value })} /></div>
            <div><Label>Tagline</Label><input className={inputCls} value={form.tagline} onChange={e => set({ tagline: e.target.value })} /></div>
            <div><Label>Industry / what you do</Label><input className={inputCls} value={form.industry} onChange={e => set({ industry: e.target.value })} /></div>
            <div><Label>Handle</Label><input className={inputCls} value={form.handle} onChange={e => set({ handle: e.target.value })} placeholder="@yourbrand" /></div>
            <div className="grid grid-cols-4 gap-2">
              {(['primary', 'accent', 'background', 'text'] as const).map(k => (
                <div key={k}><Label>{k}</Label><input type="color" className="w-full h-8 bg-transparent" value={form.colors[k]} onChange={e => set({ colors: { ...form.colors, [k]: e.target.value } })} /></div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600">Slides use these colors by reference, so changing them restyles existing posts.</p>
          </div>
        </Card>
        <Card title="Voice and rules">
          <div className="space-y-3">
            <div><Label>Voice</Label><textarea rows={3} className={inputCls} value={form.voice} onChange={e => set({ voice: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label hint="Scopes news, seasons and holidays">Region / market</Label><input className={inputCls} value={form.region || ''} onChange={e => set({ region: e.target.value })} placeholder="e.g. Nepal, or Global" /></div>
              <div><Label hint="Used for web research">Research keywords</Label><input className={inputCls} value={(form.keywords || []).join(', ')} onChange={e => set({ keywords: list(e.target.value, /,/) })} /></div>
            </div>
            <div><Label>Audience</Label><textarea rows={2} className={inputCls} value={form.audience} onChange={e => set({ audience: e.target.value })} /></div>
            <div><Label>Content pillars (comma separated)</Label><input className={inputCls} value={form.topics.join(', ')} onChange={e => set({ topics: list(e.target.value, /,/) })} /></div>
            <div><Label>Never say (comma separated)</Label><input className={inputCls} value={form.avoid.join(', ')} onChange={e => set({ avoid: list(e.target.value, /,/) })} /></div>
            <div><Label>Always-on hashtags (space separated)</Label><input className={inputCls} value={form.hashtags.join(' ')} onChange={e => set({ hashtags: list(e.target.value, /\s+/) })} /></div>
            <div><Label>Default call to action</Label><input className={inputCls} value={form.cta} onChange={e => set({ cta: e.target.value })} /></div>
          </div>
        </Card>
      </div>

      <Card title="More information" className="mt-4" actions={<Btn onClick={() => set({ extra: [...extra, { label: '', value: '' }] })}><Plus className="w-3.5 h-3.5" />Add</Btn>}>
        <p className="text-[11px] text-zinc-500 mb-3">Facts the AI can use in posts and research: phone numbers, offers, locations, product names, opening hours, certifications. Add as many as you need.</p>
        {extra.length === 0 && <p className="text-xs text-zinc-600">Nothing added yet.</p>}
        <div className="space-y-2">
          {extra.map((e, i) => (
            <div key={i} className="grid grid-cols-[180px_1fr_auto] gap-2">
              <input className={inputCls} placeholder="Label (e.g. Phone)" value={e.label} onChange={ev => set({ extra: extra.map((x, k) => (k === i ? { ...x, label: ev.target.value } : x)) })} />
              <input className={inputCls} placeholder="Value" value={e.value} onChange={ev => set({ extra: extra.map((x, k) => (k === i ? { ...x, value: ev.target.value } : x)) })} />
              <Btn variant="danger" onClick={() => set({ extra: extra.filter((_, k) => k !== i) })}><X className="w-3.5 h-3.5" /></Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
