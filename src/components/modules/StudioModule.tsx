import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Search, Image as ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight, Download, FolderOutput, Send, CalendarClock, CheckCircle2, Save, Globe, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { Btn, Card, Label, PageTitle, StatusPill, inputCls, toLocalInput } from '../common/ui';
import { SlideCanvas, SlideThumb } from '../studio/SlideCanvas';
import { blankPost, emptySlide, postFromGenerated } from '../../lib/postFactory';
import { scorePost } from '../../lib/quality';
import { downloadBlob, renderSlideToBlob } from '../../lib/slideRenderer';
import type { IdeasResult, Platform, Post, Slide, TextLayer } from '../../types';

const PLATFORMS: Platform[] = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'post';

export const StudioModule: React.FC = () => {
  const { activeBrand: brand, draft, posts, upsertPost, showToast, info, setActiveModule } = useApp();
  const { currentUser } = useAuth();

  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('');
  const [notes, setNotes] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [focus, setFocus] = useState('');
  const [ideas, setIdeas] = useState<IdeasResult | null>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [idx, setIdx] = useState(0);
  const [layerId, setLayerId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [when, setWhen] = useState(toLocalInput());

  useEffect(() => {
    if (draft) {
      setPost(draft);
      setIdx(0);
      setLayerId(null);
      setPlatform(draft.platform);
      if (draft.scheduledFor) setWhen(toLocalInput(draft.scheduledFor));
    }
  }, [draft]);

  const score = useMemo(() => (post ? scorePost(post, brand) : null), [post, brand]);
  if (!brand) return <p className="text-xs text-zinc-500">Create a brand first.</p>;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try { await fn(); } catch (e: any) { showToast(e.message || 'Something went wrong'); } finally { setBusy(null); }
  };

  // ---- AI steps -----------------------------------------------------------
  const findIdeas = () => run('ideas', async () => setIdeas(await apiService.ideas(brand.id, platform, focus)));

  const generate = () =>
    run('generate', async () => {
      if (!topic.trim()) throw new Error('Pick an idea or type a topic first.');
      const { data } = await apiService.generatePost({ brandId: brand.id, topic, angle, platform, slides: platform === 'Instagram' ? slideCount : 1, notes });
      const p = postFromGenerated(brand, data, platform, topic, currentUser?.name || '');
      if (ideas?.sources.length) p.sources = ideas.sources;
      setPost(p);
      setIdx(0);
      setLayerId(null);
      showToast('Draft ready. Generate images, edit, then approve.');
    });

  // ---- Editing helpers ----------------------------------------------------
  const patch = (u: Partial<Post>) => setPost(p => (p ? { ...p, ...u } : p));
  const patchSlide = (i: number, u: Partial<Slide>) =>
    setPost(p => p && { ...p, slides: p.slides.map((s, k) => (k === i ? { ...s, ...u } : s)) });
  const patchLayer = (i: number, id: string, u: Partial<TextLayer>) =>
    setPost(p => p && { ...p, slides: p.slides.map((s, k) => (k === i ? { ...s, layers: s.layers.map(l => (l.id === id ? { ...l, ...u } : l)) } : s)) });

  const slide = post?.slides[idx];
  const layer = slide?.layers.find(l => l.id === layerId) || null;

  const addSlide = () => {
    if (!post || post.slides.length >= 10) return;
    setPost({ ...post, slides: [...post.slides, emptySlide(brand, 'New slide', 'Add your text here.')] });
    setIdx(post.slides.length);
  };
  const removeSlide = () => {
    if (!post || post.slides.length <= 1) return;
    setPost({ ...post, slides: post.slides.filter((_, k) => k !== idx) });
    setIdx(Math.max(0, idx - 1));
    setLayerId(null);
  };
  const moveSlide = (d: -1 | 1) => {
    if (!post) return;
    const j = idx + d;
    if (j < 0 || j >= post.slides.length) return;
    const s = [...post.slides];
    [s[idx], s[j]] = [s[j], s[idx]];
    setPost({ ...post, slides: s });
    setIdx(j);
  };
  const addLayer = () => {
    if (!slide) return;
    const l: TextLayer = { id: `l-${Math.random().toString(36).slice(2, 8)}`, text: 'New text', x: 90, y: 200, width: 900, size: 48, weight: 700, color: brand.colors.text, align: 'left', font: 'sans' };
    patchSlide(idx, { layers: [...slide.layers, l] });
    setLayerId(l.id);
  };
  const removeLayer = () => {
    if (!slide || !layerId) return;
    patchSlide(idx, { layers: slide.layers.filter(l => l.id !== layerId) });
    setLayerId(null);
  };

  // ---- Images -------------------------------------------------------------
  const imageFor = async (i: number, p: Post) => {
    const s = p.slides[i];
    if (!s.imagePrompt.trim()) throw new Error('Write an image prompt for this slide first.');
    const url = await apiService.generateImage(brand.id, p.id, s.imagePrompt);
    patchSlide(i, { background: url, overlay: s.overlay || 0.35 });
  };
  const genImage = () => post && run('image', async () => { await imageFor(idx, post); });
  const genAllImages = () =>
    post && run('images', async () => {
      for (let i = 0; i < post.slides.length; i++) {
        if (post.slides[i].background) continue;
        showToast(`Generating image ${i + 1} of ${post.slides.length}…`);
        await imageFor(i, post);
      }
      showToast('Images ready.');
    });

  // ---- Save / render / publish -------------------------------------------
  /** Saves the post and uploads freshly rendered PNGs so scheduled publishing always uses what you see. */
  const persist = async (extra: Partial<Post> = {}): Promise<Post> => {
    if (!post) throw new Error('Nothing to save');
    const { rendered: _r, publishLog: _l, exportPath: _e, ...body } = { ...post, ...extra, author: post.author || currentUser?.name || '' };
    const exists = posts.some(p => p.id === post.id);
    const saved = exists ? await apiService.updatePost(post.id, body) : await apiService.createPost(body as Post);
    for (let i = 0; i < saved.slides.length; i++) await apiService.uploadRendered(saved.id, i, await renderSlideToBlob(saved.slides[i]));
    const final = { ...saved, rendered: true };
    upsertPost(final);
    setPost(final);
    return final;
  };

  const save = () => run('save', async () => { await persist(); showToast('Saved.'); });
  const approve = () => run('approve', async () => {
    const saved = await persist();
    const out = await apiService.updatePost(saved.id, { status: 'Approved' });
    upsertPost(out); setPost(out); showToast('Approved.');
  });
  const schedule = () => run('schedule', async () => {
    const saved = await persist();
    const out = await apiService.schedulePost(saved.id, new Date(when).toISOString());
    upsertPost(out); setPost(out);
    showToast(`Scheduled for ${new Date(out.scheduledFor!).toLocaleString()}.`);
  });
  const publishNow = () => run('publish', async () => {
    const saved = await persist();
    try {
      const out = await apiService.publishPost(saved.id);
      upsertPost(out); setPost(out);
      showToast(out.exportPath ? `Published. Files: ${out.exportPath}` : 'Published.');
    } finally {
      const fresh = (await apiService.getPosts()).find(p => p.id === saved.id);
      if (fresh) { upsertPost(fresh); setPost(fresh); }
    }
  });
  const exportFolder = () => run('export', async () => {
    const saved = await persist();
    const dir = await apiService.exportPost(saved.id);
    showToast(`Saved to ${dir}`);
  });
  const downloadPngs = () => post && run('download', async () => {
    for (let i = 0; i < post.slides.length; i++) {
      downloadBlob(await renderSlideToBlob(post.slides[i]), `${slug(post.title)}-${String(i + 1).padStart(2, '0')}.png`);
      await new Promise(r => setTimeout(r, 250));
    }
  });

  return (
    <div>
      <PageTitle
        title="Studio"
        sub={`Research what to post, generate the design and caption, edit the slides, then approve or schedule. Brand: ${brand.name}`}
        actions={post && <Btn onClick={() => { setPost(null); setIdeas(null); }}>New post</Btn>}
      />

      {info && !info.aiConfigured && (
        <div className="mb-4 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>No <code className="font-mono">GEMINI_API_KEY</code> in <code className="font-mono">.env.local</code>. Research and images are off; you can still write and design posts by hand.</span>
        </div>
      )}

      {/* ---------------- Brief ---------------- */}
      {!post && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="1. What should we post right now?" actions={<Btn variant="primary" busy={busy === 'ideas'} onClick={findIdeas}><Search className="w-3.5 h-3.5" />Search the web</Btn>}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Platform</Label>
                  <select className={inputCls} value={platform} onChange={e => setPlatform(e.target.value as Platform)}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Focus (optional)</Label>
                  <input className={inputCls} value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. festival season" />
                </div>
              </div>
              {!ideas && <p className="text-xs text-zinc-500">Gemini searches the live web for current news and trends in your brand's space, and flags what to avoid right now.</p>}
              {ideas && (
                <div className="space-y-2">
                  {ideas.ideas.map((i, k) => (
                    <button key={k} onClick={() => { setTopic(i.topic); setAngle(i.angle); }}
                      className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer ${topic === i.topic ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-raised'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-100">{i.topic}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{i.format}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{i.angle}</p>
                      <p className="text-[11px] text-indigo-300/80 mt-1">Why now: {i.whyNow}</p>
                    </button>
                  ))}
                  {ideas.avoidNow.length > 0 && (
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                      <p className="font-medium mb-1">Avoid right now</p>
                      <ul className="list-disc pl-4 space-y-0.5">{ideas.avoidNow.map((a, k) => <li key={k}>{a}</li>)}</ul>
                    </div>
                  )}
                  {ideas.sources.length > 0 && (
                    <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-3 gap-y-1">
                      <Globe className="w-3 h-3" />
                      {ideas.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="hover:text-zinc-300 underline decoration-zinc-700 truncate max-w-[200px]">{s.title}</a>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="2. Brief and generate" actions={<Btn variant="primary" busy={busy === 'generate'} onClick={generate}><Sparkles className="w-3.5 h-3.5" />Generate post</Btn>}>
            <div className="space-y-3">
              <div><Label>Topic</Label><input className={inputCls} value={topic} onChange={e => setTopic(e.target.value)} placeholder="What is the post about?" /></div>
              <div><Label>Angle / hook</Label><textarea rows={2} className={inputCls} value={angle} onChange={e => setAngle(e.target.value)} /></div>
              <div><Label>Extra notes</Label><textarea rows={2} className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Offers, dates, must-include facts…" /></div>
              {platform === 'Instagram' && (
                <div><Label>Carousel slides: {slideCount}</Label><input type="range" min={1} max={10} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} className="w-full accent-indigo-500" /></div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-600">AI writes the design concept, caption and slide text. Images come next.</span>
                <Btn onClick={() => { setPost(blankPost(brand, platform)); setIdx(0); }}>Start blank</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- Editor ---------------- */}
      {post && slide && (
        <div className="space-y-4">
          {post.designConcept && (
            <Card title="Design concept">
              <p className="text-xs text-zinc-300 leading-relaxed">{post.designConcept}</p>
              {post.bestTime && <p className="text-[11px] text-indigo-300/80 mt-2">Suggested time: {post.bestTime}</p>}
            </Card>
          )}

          <div className="grid lg:grid-cols-[auto_1fr] gap-4">
            <Card title={<span className="flex items-center gap-2">Slide {idx + 1} of {post.slides.length}</span>}
              actions={<>
                <Btn onClick={() => moveSlide(-1)} disabled={idx === 0} title="Move earlier"><ChevronLeft className="w-3.5 h-3.5" /></Btn>
                <Btn onClick={() => moveSlide(1)} disabled={idx === post.slides.length - 1} title="Move later"><ChevronRight className="w-3.5 h-3.5" /></Btn>
                <Btn onClick={addSlide} disabled={post.slides.length >= 10}><Plus className="w-3.5 h-3.5" />Slide</Btn>
                <Btn variant="danger" onClick={removeSlide} disabled={post.slides.length <= 1} title="Delete slide"><Trash2 className="w-3.5 h-3.5" /></Btn>
              </>}>
              <SlideCanvas slide={slide} selectedId={layerId} onSelect={setLayerId} onMove={(id, x, y) => patchLayer(idx, id, { x, y })} />
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {post.slides.map((s, k) => (
                  <button key={s.id} onClick={() => { setIdx(k); setLayerId(null); }} className={`rounded p-0.5 border cursor-pointer ${k === idx ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <SlideThumb slide={s} width={56} />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Click text to select it, drag to move. Exports at 1080 × 1350.</p>
            </Card>

            <div className="space-y-4">
              <Card title="Background image" actions={
                <>
                  <Btn busy={busy === 'image'} onClick={genImage}><ImageIcon className="w-3.5 h-3.5" />{slide.background ? 'Regenerate' : 'Generate'}</Btn>
                  <Btn busy={busy === 'images'} onClick={genAllImages}>All missing</Btn>
                </>}>
                <div className="space-y-2.5">
                  <textarea rows={3} className={inputCls} value={slide.imagePrompt} onChange={e => patchSlide(idx, { imagePrompt: e.target.value })} placeholder="Describe a text-free background image…" />
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div><Label>Darken image: {Math.round(slide.overlay * 100)}%</Label><input type="range" min={0} max={0.85} step={0.05} value={slide.overlay} onChange={e => patchSlide(idx, { overlay: Number(e.target.value) })} className="w-full accent-indigo-500" /></div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1"><Label>Solid color</Label><input type="color" value={slide.bgColor} onChange={e => patchSlide(idx, { bgColor: e.target.value })} className="w-full h-7 bg-transparent" /></div>
                      {slide.background && <Btn onClick={() => patchSlide(idx, { background: '' })}>Remove image</Btn>}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Text" actions={<><Btn onClick={addLayer}><Plus className="w-3.5 h-3.5" />Text</Btn>{layer && <Btn variant="danger" onClick={removeLayer}><Trash2 className="w-3.5 h-3.5" /></Btn>}</>}>
                {!layer ? <p className="text-xs text-zinc-500">Select a text block on the slide to edit it.</p> : (
                  <div className="space-y-2.5">
                    <textarea rows={3} className={inputCls} value={layer.text} onChange={e => patchLayer(idx, layer.id, { text: e.target.value })} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div><Label>Size</Label><input type="number" className={inputCls} value={layer.size} min={12} max={300} onChange={e => patchLayer(idx, layer.id, { size: Number(e.target.value) || 12 })} /></div>
                      <div><Label>Width</Label><input type="number" className={inputCls} value={layer.width} min={100} max={1080} onChange={e => patchLayer(idx, layer.id, { width: Number(e.target.value) || 100 })} /></div>
                      <div><Label>X</Label><input type="number" className={inputCls} value={layer.x} onChange={e => patchLayer(idx, layer.id, { x: Number(e.target.value) })} /></div>
                      <div><Label>Y</Label><input type="number" className={inputCls} value={layer.y} onChange={e => patchLayer(idx, layer.id, { y: Number(e.target.value) })} /></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                      <div><Label>Weight</Label><select className={inputCls} value={layer.weight} onChange={e => patchLayer(idx, layer.id, { weight: Number(e.target.value) as TextLayer['weight'] })}><option value={400}>Regular</option><option value={700}>Bold</option><option value={900}>Black</option></select></div>
                      <div><Label>Font</Label><select className={inputCls} value={layer.font} onChange={e => patchLayer(idx, layer.id, { font: e.target.value as TextLayer['font'] })}><option value="sans">Sans</option><option value="serif">Serif</option></select></div>
                      <div><Label>Align</Label><select className={inputCls} value={layer.align} onChange={e => patchLayer(idx, layer.id, { align: e.target.value as TextLayer['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                      <div className="flex items-center gap-2"><input type="color" value={layer.color} onChange={e => patchLayer(idx, layer.id, { color: e.target.value })} className="h-7 w-10 bg-transparent" /><label className="text-[11px] text-zinc-400 flex items-center gap-1"><input type="checkbox" checked={!!layer.shadow} onChange={e => patchLayer(idx, layer.id, { shadow: e.target.checked })} />Shadow</label></div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <Card title="Caption" actions={<StatusPill status={post.status} />}>
              <div className="space-y-3">
                <div><Label>Title (also the export folder name)</Label><input className={inputCls} value={post.title} onChange={e => patch({ title: e.target.value })} /></div>
                <div><Label>Caption</Label><textarea rows={8} className={inputCls} value={post.caption} onChange={e => patch({ caption: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Call to action</Label><input className={inputCls} value={post.callToAction} onChange={e => patch({ callToAction: e.target.value })} /></div>
                  <div><Label>Hashtags (space separated)</Label><input className={inputCls} value={post.hashtags.join(' ')} onChange={e => patch({ hashtags: e.target.value.split(/\s+/).filter(Boolean).map(t => (t.startsWith('#') ? t : `#${t}`)) })} /></div>
                </div>
                {post.sources.length > 0 && (
                  <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-3 gap-y-1"><Globe className="w-3 h-3" />{post.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="hover:text-zinc-300 underline decoration-zinc-700">{s.title}</a>)}</div>
                )}
              </div>
            </Card>

            <Card title={score ? `Quality ${score.score}/100 · ${score.grade}` : 'Quality'}>
              <ul className="space-y-1.5">
                {score?.checks.map(c => (
                  <li key={c.id} className="text-[11px]" title={c.detail}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-300"><span className={`w-1.5 h-1.5 rounded-full ${c.status === 'pass' ? 'bg-emerald-400' : c.status === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`} />{c.label}</span>
                      <span className="font-mono text-zinc-500">{c.points}/{c.max}</span>
                    </div>
                    {c.status !== 'pass' && <p className="text-zinc-500 pl-3">{c.detail}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card title="Finish">
            <div className="flex flex-wrap items-end gap-2">
              <Btn busy={busy === 'save'} onClick={save}><Save className="w-3.5 h-3.5" />Save draft</Btn>
              <Btn busy={busy === 'approve'} onClick={approve}><CheckCircle2 className="w-3.5 h-3.5" />Approve</Btn>
              <Btn busy={busy === 'download'} onClick={downloadPngs}><Download className="w-3.5 h-3.5" />Download PNGs</Btn>
              <Btn busy={busy === 'export'} onClick={exportFolder}><FolderOutput className="w-3.5 h-3.5" />Save to folder</Btn>
              <div className="flex items-end gap-2 ml-auto">
                <input type="datetime-local" className={`${inputCls} w-auto`} value={when} onChange={e => setWhen(e.target.value)} />
                <Btn variant="primary" busy={busy === 'schedule'} onClick={schedule}><CalendarClock className="w-3.5 h-3.5" />Schedule</Btn>
                <Btn busy={busy === 'publish'} onClick={publishNow}><Send className="w-3.5 h-3.5" />Publish now</Btn>
              </div>
            </div>
            <p className="text-[11px] text-zinc-600 mt-3">
              Publishing mode: <span className="font-mono text-zinc-400">{info?.publishMode ?? 'folder'}</span>
              {info?.publishMode !== 'instagram' && <> · folder: <span className="font-mono text-zinc-400">{info?.exportDir}</span></>}
              {post.exportPath && <> · last export: <span className="font-mono text-zinc-400">{post.exportPath}</span></>}
              {post.publishLog?.slice(-1).map(l => !l.ok && <span key={l.at} className="text-red-300"> · last error ({l.target}): {l.detail}</span>)}
            </p>
            <button onClick={() => setActiveModule('library')} className="text-[11px] text-indigo-300 hover:underline mt-1 cursor-pointer">Open Library</button>
          </Card>
        </div>
      )}
    </div>
  );
};
