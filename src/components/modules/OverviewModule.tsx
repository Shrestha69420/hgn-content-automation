import React from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Btn, Card, PageTitle, StatusPill } from '../common/ui';
import { PostThumb } from '../studio/SlideCanvas';

export const OverviewModule: React.FC = () => {
  const { activeBrand, brandPosts, info, openInStudio, setActiveModule } = useApp();
  const count = (s: string) => brandPosts.filter(p => p.status === s).length;
  const upcoming = brandPosts.filter(p => p.status === 'Scheduled' && p.scheduledFor).sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!)).slice(0, 5);
  const recent = brandPosts.slice(0, 4);

  const Check: React.FC<{ ok: boolean; label: string; hint: string }> = ({ ok, label, hint }) => (
    <li className="flex items-start gap-2 text-xs">
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />}
      <span><span className="text-zinc-200">{label}</span> <span className="text-zinc-500">{hint}</span></span>
    </li>
  );

  return (
    <div>
      <PageTitle title="Overview" sub={`${activeBrand?.name} · what is queued and what is connected`}
        actions={<Btn variant="primary" onClick={() => openInStudio(null)}><Plus className="w-3.5 h-3.5" />New post</Btn>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {['Draft', 'Approved', 'Scheduled', 'Published'].map(s => (
          <button key={s} onClick={() => setActiveModule('library')} className="text-left bg-surface border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 cursor-pointer">
            <p className="text-2xl font-semibold text-zinc-50 tabular-nums">{count(s)}</p>
            <p className="text-xs text-zinc-500 mt-1">{s}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Upcoming" className="lg:col-span-2">
          {upcoming.length === 0 ? <p className="text-xs text-zinc-500">Nothing scheduled. Approve a post in Studio and pick a time.</p> : (
            <ul className="space-y-2.5">
              {upcoming.map(p => (
                <li key={p.id} className="flex items-center gap-3">
                  <PostThumb post={p} colors={activeBrand!.colors} width={40} />
                  <button onClick={() => openInStudio(p)} className="flex-1 text-left text-xs text-zinc-200 hover:underline truncate cursor-pointer">{p.title}</button>
                  <span className="text-[11px] font-mono text-zinc-500">{new Date(p.scheduledFor!).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
          {recent.length > 0 && (
            <>
              <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-5 mb-2">Recent</h4>
              <ul className="space-y-2">
                {recent.map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
                    <button onClick={() => openInStudio(p)} className="text-zinc-300 hover:underline truncate cursor-pointer">{p.title}</button>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Connections">
          <ul className="space-y-3">
            <Check ok={!!info?.aiConfigured} label="Gemini AI" hint={info?.aiConfigured ? `text ${info.models.text}, images ${info.models.image}` : 'Set GEMINI_API_KEY in .env.local'} />
            <Check ok label="Local folder export" hint={info?.exportDir ?? ''} />
            <Check ok={!!info?.instagramConfigured} label="Instagram auto-post" hint={info?.instagramConfigured ? 'Credentials set' : 'Needs IG_USER_ID, IG_ACCESS_TOKEN, APP_URL'} />
          </ul>
          <p className="text-[11px] text-zinc-600 mt-4">Publish mode: <span className="font-mono text-zinc-400">{info?.publishMode}</span> (set PUBLISH_MODE in .env.local)</p>
        </Card>
      </div>
    </div>
  );
};
