import React, { useMemo, useState } from 'react';
import { Download, FolderOutput, Pencil, Send, Trash2, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Btn, PageTitle, StatusPill, inputCls } from '../common/ui';
import { SlideThumb } from '../studio/SlideCanvas';
import { downloadBlob, renderSlideToBlob } from '../../lib/slideRenderer';
import type { ContentStatus, Post } from '../../types';

const STATUSES: ('All' | ContentStatus)[] = ['All', 'Draft', 'Approved', 'Scheduled', 'Published'];
const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const LibraryModule: React.FC = () => {
  const { brandPosts, activeBrand, openInStudio, upsertPost, removePost, showToast } = useApp();
  const [status, setStatus] = useState<'All' | ContentStatus>('All');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [busy, setBusy] = useState<string | null>(null);

  const posts = useMemo(
    () => brandPosts.filter(p => (status === 'All' || p.status === status) && `${p.title} ${p.caption} ${p.hashtags.join(' ')}`.toLowerCase().includes(q.toLowerCase())),
    [brandPosts, status, q]
  );

  const act = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try { await fn(); } catch (e: any) { showToast(e.message || 'Failed'); } finally { setBusy(null); }
  };

  const publish = (p: Post) => act(p.id, async () => {
    try {
      const out = await apiService.publishPost(p.id);
      upsertPost(out);
      showToast(out.exportPath ? `Published. Files: ${out.exportPath}` : 'Published.');
    } finally {
      const fresh = (await apiService.getPosts()).find(x => x.id === p.id);
      if (fresh) upsertPost(fresh);
    }
  });
  const exportFolder = (p: Post) => act(p.id, async () => showToast(`Saved to ${await apiService.exportPost(p.id)}`));
  const download = (p: Post) => act(p.id, async () => {
    for (let i = 0; i < p.slides.length; i++) {
      downloadBlob(await renderSlideToBlob(p.slides[i]), `${p.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${String(i + 1).padStart(2, '0')}.png`);
      await new Promise(r => setTimeout(r, 250));
    }
  });
  const remove = (p: Post) => act(p.id, async () => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await apiService.deletePost(p.id);
    removePost(p.id);
  });

  // ---- calendar ----
  const days = useMemo(() => {
    const first = new Date(month);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [month]);
  const byDay = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of posts) {
      const when = p.scheduledFor || p.publishedAt;
      if (!when) continue;
      const k = dayKey(new Date(when));
      m.set(k, [...(m.get(k) || []), p]);
    }
    return m;
  }, [posts]);

  return (
    <div>
      <PageTitle
        title="Library"
        sub={`Everything for ${activeBrand?.name}. Scheduled posts publish automatically at their time.`}
        actions={
          <div className="flex rounded-md border border-zinc-800 overflow-hidden">
            <button onClick={() => setView('list')} className={`px-2.5 py-1.5 cursor-pointer ${view === 'list' ? 'bg-indigo-500/15 text-indigo-200' : 'text-zinc-400'}`}><List className="w-3.5 h-3.5" /></button>
            <button onClick={() => setView('calendar')} className={`px-2.5 py-1.5 cursor-pointer ${view === 'calendar' ? 'bg-indigo-500/15 text-indigo-200' : 'text-zinc-400'}`}><CalendarDays className="w-3.5 h-3.5" /></button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer ${status === s ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-100' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>{s}</button>
        ))}
        <input className={`${inputCls} max-w-xs ml-auto`} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {view === 'list' && (
        posts.length === 0 ? (
          <div className="text-center py-16 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No posts yet. <button className="text-indigo-300 hover:underline cursor-pointer" onClick={() => openInStudio(null)}>Create one in Studio</button>.
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className="flex gap-3 bg-surface border border-zinc-800/80 rounded-xl p-3">
                <SlideThumb slide={p.slides[0]} width={72} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-medium text-zinc-100 truncate">{p.title}</h3><StatusPill status={p.status} /></div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{p.caption}</p>
                  <p className="text-[11px] text-zinc-600 mt-1 font-mono">
                    {p.platform} · {p.slides.length} slide{p.slides.length === 1 ? '' : 's'}
                    {p.scheduledFor && p.status === 'Scheduled' && ` · scheduled ${fmt(p.scheduledFor)}`}
                    {p.publishedAt && ` · published ${fmt(p.publishedAt)}`}
                  </p>
                  {p.exportPath && <p className="text-[10px] text-zinc-600 font-mono truncate">{p.exportPath}</p>}
                  {p.publishLog?.slice(-1).map(l => !l.ok && p.status !== 'Published' && <p key={l.at} className="text-[11px] text-red-300 mt-0.5">Last attempt failed ({l.target}): {l.detail}</p>)}
                </div>
                <div className="flex flex-wrap items-start gap-1.5 justify-end content-start max-w-[260px]">
                  <Btn onClick={() => openInStudio(p)} title="Edit"><Pencil className="w-3.5 h-3.5" /></Btn>
                  <Btn busy={busy === p.id} onClick={() => download(p)} title="Download PNGs"><Download className="w-3.5 h-3.5" /></Btn>
                  <Btn busy={busy === p.id} onClick={() => exportFolder(p)} title="Save to export folder"><FolderOutput className="w-3.5 h-3.5" /></Btn>
                  {p.status !== 'Published' && <Btn busy={busy === p.id} onClick={() => publish(p)} title="Publish now"><Send className="w-3.5 h-3.5" /></Btn>}
                  <Btn variant="danger" onClick={() => remove(p)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Btn>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {view === 'calendar' && (
        <div className="bg-surface border border-zinc-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <Btn onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="w-3.5 h-3.5" /></Btn>
            <span className="text-sm font-medium text-zinc-100">{month.toLocaleString([], { month: 'long', year: 'numeric' })}</span>
            <Btn onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="w-3.5 h-3.5" /></Btn>
          </div>
          <div className="grid grid-cols-7 gap-px bg-zinc-800/60 rounded-lg overflow-hidden text-[11px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="bg-raised px-2 py-1 text-zinc-500 font-mono">{d}</div>)}
            {days.map(d => {
              const items = byDay.get(dayKey(d)) || [];
              const inMonth = d.getMonth() === month.getMonth();
              return (
                <div key={d.toISOString()} className={`bg-surface min-h-[84px] p-1.5 ${inMonth ? '' : 'opacity-40'}`}>
                  <div className="text-zinc-500 font-mono mb-1">{d.getDate()}</div>
                  {items.map(p => (
                    <button key={p.id} onClick={() => openInStudio(p)} className={`block w-full text-left truncate rounded px-1 py-0.5 mb-0.5 cursor-pointer ${p.status === 'Published' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-cyan-500/15 text-cyan-200'}`} title={p.title}>
                      {new Date(p.scheduledFor || p.publishedAt!).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} {p.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
