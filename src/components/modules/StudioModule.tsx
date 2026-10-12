import React, { useMemo, useState } from 'react';
import { Search, Image as ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight, Download, FolderOutput, Send, CalendarClock, CheckCircle2, Globe, AlertTriangle, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { Btn, Card, ColorField, Label, PageTitle, ResultLoader, StatusPill, inputCls, toLocalInput, useElapsed } from '../common/ui';
import { SlideCanvas, SlideThumb } from '../studio/SlideCanvas';
import { blankPost, emptySlide, postFromGenerated } from '../../lib/postFactory';
import { POST_TYPES, hasImages, typeFromIdeaFormat, typeInfo, typesFor } from '../../lib/postTypes';
import { scorePost } from '../../lib/quality';
import { downloadBlob, renderSlideToBlob } from '../../lib/slideRenderer';
import { useAutosave, type SaveState } from '../../lib/useAutosave';
import type { IdeasResult, Platform, Post, PostType, Slide, TextLayer } from '../../types';

const PLATFORMS: Platform[] = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'post';
const SAVE_LABEL: Record<SaveState, string> = { idle: '', unsaved: 'Unsaved changes…', saving: 'Saving…', saved: 'All changes saved', error: 'Save failed, edits kept in this browser' };

export const StudioModule: React.FC = () => {
  const { activeBrand, brands, studioPost: post, setStudioPost: setPost, upsertPost, showToast, info, setActiveModule } = useApp();
  const { currentUser } = useAuth();

  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [postType, setPostType] = useState<PostType>('carousel');
  const [linkUrl, setLinkUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('');
  const [notes, setNotes] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [focus, setFocus] = useState('');
  const [ideas, setIdeas] = useState<IdeasResult | null>(null);

  const [idx, setIdx] = useState(0);
  const [layerId, setLayerId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [when, setWhen] = useState(toLocalInput());

  // A post keeps following the brand it belongs to, even if another brand is selected in the header.
  const brand = (post && brands.find(b => b.id === post.brandId)) || activeBrand;
  const { saveState, saveNow, mergeServer } = useAutosave(post, setPost, brand?.colors);
  const ideasElapsed = useElapsed(busy === 'ideas');
  const genElapsed = useElapsed(busy === 'generate');
  const score = useMemo(() => (post ? scorePost(post, brand) : null), [post, brand]);
  if (!brand) return <p className="text-xs text-zinc-500">Create a brand first.</p>;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try { await fn(); } catch (e: any) { showToast(e.message || 'Something went wrong'); } finally { setBusy(null); }
  };

  const chooseType = (t: PostType) => setPostType(t);
  const choosePlatform = (p: Platform) => {
    setPlatform(p);
    if (!typesFor(p).some(t => t.id === postType)) setPostType(typesFor(p)[0].id);
  };

  // ---- AI steps -----------------------------------------------------------
  const findIdeas = () => run('ideas', async () => setIdeas(await apiService.ideas(brand.id, platform, focus)));

  const generate = () =>
    run('generate', async () => {
      if (!topic.trim()) throw new Error('Pick an idea or type a topic first.');
      if (postType === 'link' && !/^https?:\/\//i.test(linkUrl.trim())) throw new Error('Enter the link to share (starting with http:// or https://).');
      const info = typeInfo(postType);
      const { data } = await apiService.generatePost({ brandId: brand.id, topic, angle, platform, postType, linkUrl: linkUrl.trim(), notes, slides: info.slides === 'choose' ? slideCount : info.slides });
      const p = postFromGenerated(brand, data, platform, postType, topic, linkUrl.trim(), currentUser?.name || '');
      if (ideas?.sources.length) p.sources = ideas.sources;
      setPost(p);
      setIdx(0);
      setLayerId(null);
      showToast(hasImages(postType) ? 'Draft ready. It saves automatically as you edit.' : 'Draft ready. Edit the caption below.');
    });

  // ---- Editing helpers ----------------------------------------------------
  const patch = (u: Partial<Post>) => setPost(p => (p ? { ...p, ...u } : p));
  const patchSlide = (i: number, u: Partial<Slide>) =>
    setPost(p => p && { ...p, slides: p.slides.map((s, k) => (k === i ? { ...s, ...u } : s)) });
  const patchLayer = (i: number, id: string, u: Partial<TextLayer>) =>
    setPost(p => p && { ...p, slides: p.slides.map((s, k) => (k === i ? { ...s, layers: s.layers.map(l => (l.id === id ? { ...l, ...u } : l)) } : s)) });

  const slide = post?.slides[idx];
  const layer = slide?.layers.find(l => l.id === layerId) || null;
  const curType = post?.postType || 'carousel';
  const multi = curType === 'carousel';
  const imageful = !!post && hasImages(curType);

  const addSlide = () => {
    if (!post || post.slides.length >= 10) return;
    setPost({ ...post, slides: [...post.slides, emptySlide(curType, 'New slide', 'Add your text here.')] });
    setIdx(post.slides.length);
  };
  const duplicateSlide = () => {
    if (!post || !slide || post.slides.length >= 10) return;
    const copy: Slide = { ...slide, id: `s-${Math.random().toString(36).slice(2, 10)}`, layers: slide.layers.map(l => ({ ...l, id: `l-${Math.random().toString(36).slice(2, 8)}` })) };
    const s = [...post.slides];
    s.splice(idx + 1, 0, copy);
    setPost({ ...post, slides: s });
    setIdx(idx + 1);
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
    const l: TextLayer = { id: `l-${Math.random().toString(36).slice(2, 8)}`, text: 'New text', x: 90, y: 200, width: 900, size: 48, weight: 700, color: 'brand:text', align: 'left', font: 'sans' };
    patchSlide(idx, { layers: [...slide.layers, l] });
    setLayerId(l.id);
  };
  const removeLayer = () => {
    if (!slide || !layerId) return;
    patchSlide(idx, { layers: slide.layers.filter(l => l.id !== layerId) });
    setLayerId(null);
  };
  /** Arrow keys nudge the selected text (Shift = 20px); Delete removes it. */
  const onCanvasKey = (e: React.KeyboardEvent) => {
    if (!layer) return;
    const step = e.shiftKey ? 20 : 2;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (d[e.key]) { e.preventDefault(); patchLayer(idx, layer.id, { x: layer.x + d[e.key][0], y: layer.y + d[e.key][1] }); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeLayer(); }
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

  // ---- Explicit actions (autosave handles everything else) ----------------
  const save = () => run('save', async () => { await saveNow(true); showToast('Saved.'); });
  const withSaved = async (fn: (id: string) => Promise<Post>) => {
    await saveNow(true);
    mergeServer(await fn(post!.id));
  };
  const approve = () => run('approve', async () => { await withSaved(id => apiService.updatePost(id, { status: 'Approved' })); showToast('Approved.'); });
  const schedule = () => run('schedule', async () => {
    await withSaved(id => apiService.schedulePost(id, new Date(when).toISOString()));
    showToast(`Scheduled for ${new Date(when).toLocaleString()}.`);
  });
  const publishNow = () => run('publish', async () => {
    await saveNow(true);
    try {
      const out = await apiService.publishPost(post!.id);
      mergeServer(out);
      showToast(out.exportPath ? `Published. Files: ${out.exportPath}` : 'Published.');
    } finally {
      const fresh = (await apiService.getPosts()).find(p => p.id === post!.id);
      if (fresh) mergeServer(fresh);
    }
  });
  const exportFolder = () => run('export', async () => {
    await saveNow(true);
    const dir = await apiService.exportPost(post!.id);
    mergeServer({ ...post!, exportPath: dir });
    showToast(`Saved to ${dir}`);
  });
  const downloadPngs = () => post && run('download', async () => {
    for (let i = 0; i < post.slides.length; i++) {
      downloadBlob(await renderSlideToBlob(post.slides[i], brand.colors), `${slug(post.title)}-${String(i + 1).padStart(2, '0')}.png`);
      await new Promise(r => setTimeout(r, 250));
    }
  });
  const copyCaption = async () => {
    if (!post) return;
    const text = [post.caption.trim(), post.linkUrl?.trim(), post.hashtags.join(' ')].filter(Boolean).join('\n\n');
    try { await navigator.clipboard.writeText(text); showToast('Caption copied.'); } catch { showToast('Could not copy. Select the text manually.'); }
  };

  const allowedTypes = typesFor(platform);

  return (
    <div>
      <PageTitle
        title="Studio"
        sub={`Research what to post, generate it, edit it, then approve or schedule. Brand: ${brand.name}`}
        actions={
          <>
            {post && SAVE_LABEL[saveState] && (
              <span className={`text-[11px] font-mono ${saveState === 'error' ? 'text-red-300' : 'text-zinc-500'}`} aria-live="polite">{SAVE_LABEL[saveState]}</span>
            )}
            {post && <Btn onClick={() => { setPost(null); setIdeas(null); }}>New post</Btn>}
          </>
        }
      />

      {info && !info.aiConfigured && (
        <div className="mb-4 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>No <code className="font-mono">GEMINI_API_KEY</code> in <code className="font-mono">.env.local</code>. Research and images are off; you can still write and design posts by hand.</span>
        </div>
      )}

      {/* ---------------- Brief ---------------- */}
      {!post && (
        <div className="space-y-4">
          {busy === 'generate' && (
            <Card><ResultLoader title={`Creating your ${typeInfo(postType).label.toLowerCase()}`} elapsed={genElapsed} steps={['Writing the caption in your brand voice…', hasImages(postType) ? 'Designing the layout and slide text…' : 'Polishing the wording…', 'Choosing hashtags and the best time to post…', 'Almost there…']} /></Card>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="1. What should we post right now?" actions={<Btn variant="primary" spinner={false} busy={busy === 'ideas'} onClick={findIdeas}><Search className="w-3.5 h-3.5" />Search the web</Btn>}>
              <div className="space-y-3">
                <div><Label>Focus (optional)</Label><input className={inputCls} value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. festival season, a product launch" /></div>
                {busy === 'ideas' ? (
                  <ResultLoader title="Searching the web" elapsed={ideasElapsed} steps={['Searching for current news and trends in your space…', 'Checking what is sensitive or best avoided right now…', 'Shaping post ideas for your brand…', 'Almost there…']} />
                ) : !ideas ? (
                  <p className="text-xs text-zinc-500">Gemini searches the live web for current news and trends in your brand's space, and flags what to avoid right now.</p>
                ) : (
                  <div className="space-y-2">
                    {ideas.ideas.map((i, k) => (
                      <button key={k} onClick={() => { setTopic(i.topic); setAngle(i.angle); const t = typeFromIdeaFormat(i.format); if (typesFor(platform).some(x => x.id === t)) setPostType(t); }}
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
                    {ideas.searches && ideas.searches.length > 0 && <p className="text-[10px] text-zinc-500">Searched: {ideas.searches.join(' · ')}</p>}
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

            <Card title="2. Choose the post and generate" actions={<Btn variant="primary" spinner={false} busy={busy === 'generate'} onClick={generate}>Generate post</Btn>}>
              <div className="space-y-3">
                <div>
                  <Label>Platform</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => choosePlatform(p)} className={`px-2.5 py-1 rounded-md text-xs border cursor-pointer ${platform === p ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-100' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>{p === 'Twitter' ? 'X / Twitter' : p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Post type</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POST_TYPES.map(t => {
                      const ok = allowedTypes.some(x => x.id === t.id);
                      return (
                        <button key={t.id} disabled={!ok} onClick={() => chooseType(t.id)} title={ok ? t.desc : `Not available on ${platform}`}
                          className={`text-left p-2 rounded-lg border transition ${!ok ? 'opacity-35 cursor-not-allowed border-zinc-800' : postType === t.id ? 'border-indigo-500/60 bg-indigo-500/10 cursor-pointer' : 'border-zinc-800 hover:border-zinc-700 bg-raised cursor-pointer'}`}>
                          <span className="block text-xs font-medium text-zinc-100">{t.label}</span>
                          <span className="block text-[10px] text-zinc-500 leading-snug mt-0.5">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {postType === 'carousel' && (
                  <div><Label>Slides: {slideCount}</Label><input type="range" min={2} max={10} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} className="w-full accent-indigo-500" /></div>
                )}
                {postType === 'link' && (
                  <div><Label>Link to share</Label><input className={inputCls} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…" /></div>
                )}
                <div><Label>Topic</Label><input className={inputCls} value={topic} onChange={e => setTopic(e.target.value)} placeholder="What is the post about?" /></div>
                <div><Label>Angle / hook</Label><textarea rows={2} className={inputCls} value={angle} onChange={e => setAngle(e.target.value)} /></div>
                <div><Label>Extra notes</Label><textarea rows={2} className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Offers, dates, must-include facts…" /></div>
                <div className="flex justify-end"><Btn onClick={() => { setPost(blankPost(brand, platform, postType)); setIdx(0); }}>Start blank</Btn></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ---------------- Editor ---------------- */}
      {post && (
        <div className="space-y-4">
          {post.designConcept && (
            <Card title="Design concept">
              <p className="text-xs text-zinc-300 leading-relaxed">{post.designConcept}</p>
              {post.bestTime && <p className="text-[11px] text-indigo-300/80 mt-2">Suggested time: {post.bestTime}</p>}
            </Card>
          )}
          {!post.designConcept && post.bestTime && <p className="text-[11px] text-indigo-300/80">Suggested time: {post.bestTime}</p>}

          {imageful && slide && (
            <div className="grid lg:grid-cols-[auto_1fr] gap-4">
              <Card title={`Slide ${idx + 1} of ${post.slides.length}`}
                actions={multi ? <>
                  <Btn onClick={() => moveSlide(-1)} disabled={idx === 0} title="Move earlier"><ChevronLeft className="w-3.5 h-3.5" /></Btn>
                  <Btn onClick={() => moveSlide(1)} disabled={idx === post.slides.length - 1} title="Move later"><ChevronRight className="w-3.5 h-3.5" /></Btn>
                  <Btn onClick={addSlide} disabled={post.slides.length >= 10}><Plus className="w-3.5 h-3.5" />Slide</Btn>
                  <Btn onClick={duplicateSlide} disabled={post.slides.length >= 10} title="Duplicate slide"><Copy className="w-3.5 h-3.5" /></Btn>
                  <Btn variant="danger" onClick={removeSlide} disabled={post.slides.length <= 1} title="Delete slide"><Trash2 className="w-3.5 h-3.5" /></Btn>
                </> : undefined}>
                <SlideCanvas slide={slide} colors={brand.colors} selectedId={layerId} onSelect={setLayerId} onMove={(id, x, y) => patchLayer(idx, id, { x, y })} onKey={onCanvasKey} />
                {multi && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {post.slides.map((s, k) => (
                      <button key={s.id} onClick={() => { setIdx(k); setLayerId(null); }} className={`rounded p-0.5 border cursor-pointer ${k === idx ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                        <SlideThumb slide={s} colors={brand.colors} width={56} />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-zinc-600 mt-2">Click text to select, drag to move. Arrow keys nudge (Shift = bigger steps), Delete removes. Everything saves automatically.</p>
              </Card>

              <div className="space-y-4">
                <Card title="Background image" actions={
                  <>
                    <Btn busy={busy === 'image'} onClick={genImage}><ImageIcon className="w-3.5 h-3.5" />{slide.background ? 'Regenerate' : 'Generate'}</Btn>
                    {multi && <Btn busy={busy === 'images'} onClick={genAllImages}>All missing</Btn>}
                  </>}>
                  <div className="space-y-2.5">
                    <textarea rows={3} className={inputCls} value={slide.imagePrompt} onChange={e => patchSlide(idx, { imagePrompt: e.target.value })} placeholder="Describe a text-free background image…" />
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div><Label>Darken image: {Math.round(slide.overlay * 100)}%</Label><input type="range" min={0} max={0.85} step={0.05} value={slide.overlay} onChange={e => patchSlide(idx, { overlay: Number(e.target.value) })} className="w-full accent-indigo-500" /></div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><Label>Background color</Label><ColorField value={slide.bgColor} colors={brand.colors} onChange={v => patchSlide(idx, { bgColor: v })} /></div>
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
                        <div><Label>Size</Label><input type="number" className={inputCls} value={layer.size} min={12} max={300} onChange={e => patchLayer(idx, layer.id, { size: Math.min(300, Math.max(12, Number(e.target.value) || 12)) })} /></div>
                        <div><Label>Width</Label><input type="number" className={inputCls} value={layer.width} min={100} max={1080} onChange={e => patchLayer(idx, layer.id, { width: Math.min(1080, Math.max(100, Number(e.target.value) || 100)) })} /></div>
                        <div><Label>X</Label><input type="number" className={inputCls} value={layer.x} onChange={e => patchLayer(idx, layer.id, { x: Number(e.target.value) || 0 })} /></div>
                        <div><Label>Y</Label><input type="number" className={inputCls} value={layer.y} onChange={e => patchLayer(idx, layer.id, { y: Number(e.target.value) || 0 })} /></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                        <div><Label>Weight</Label><select className={inputCls} value={layer.weight >= 700 ? 700 : 400} onChange={e => patchLayer(idx, layer.id, { weight: Number(e.target.value) as TextLayer['weight'] })}><option value={400}>Regular</option><option value={700}>Bold</option></select></div>
                        <div><Label>Font</Label><select className={inputCls} value={layer.font} onChange={e => patchLayer(idx, layer.id, { font: e.target.value as TextLayer['font'] })}><option value="sans">Sans</option><option value="serif">Serif</option></select></div>
                        <div><Label>Align</Label><select className={inputCls} value={layer.align} onChange={e => patchLayer(idx, layer.id, { align: e.target.value as TextLayer['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                        <div className="flex items-center gap-2"><ColorField value={layer.color} colors={brand.colors} onChange={v => patchLayer(idx, layer.id, { color: v })} /><label className="text-[11px] text-zinc-400 flex items-center gap-1"><input type="checkbox" checked={!!layer.shadow} onChange={e => patchLayer(idx, layer.id, { shadow: e.target.checked })} />Shadow</label></div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <Card title={`${typeInfo(curType).label} · ${post.platform === 'Twitter' ? 'X / Twitter' : post.platform}`} actions={<StatusPill status={post.status} />}>
              <div className="space-y-3">
                <div><Label>Title (also the export folder name)</Label><input className={inputCls} value={post.title} onChange={e => patch({ title: e.target.value })} /></div>
                <div>
                  <div className="flex items-center justify-between"><Label>Caption</Label><button onClick={copyCaption} className="text-[11px] text-indigo-300 hover:underline cursor-pointer mb-1">Copy with hashtags</button></div>
                  <textarea rows={8} className={inputCls} value={post.caption} onChange={e => patch({ caption: e.target.value })} />
                  <p className="text-[10px] text-zinc-600 mt-1">{post.caption.length} characters{post.platform === 'Twitter' && ` (limit 280, link and hashtags count too)`}</p>
                </div>
                {curType === 'link' && <div><Label>Link</Label><input className={inputCls} value={post.linkUrl || ''} onChange={e => patch({ linkUrl: e.target.value })} placeholder="https://…" /></div>}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Call to action</Label><input className={inputCls} value={post.callToAction} onChange={e => patch({ callToAction: e.target.value })} /></div>
                  <div><Label>Hashtags (space separated)</Label><input className={inputCls} value={post.hashtags.join(' ')} onChange={e => patch({ hashtags: e.target.value.split(/\s+/).filter(Boolean).map(t => (t.startsWith('#') ? t : `#${t}`)) })} /></div>
                </div>
                <div className="sm:w-1/2"><Label>Platform</Label>
                  <select className={inputCls} value={post.platform} onChange={e => patch({ platform: e.target.value as Platform })}>
                    {PLATFORMS.filter(p => typeInfo(curType).platforms.includes(p)).map(p => <option key={p} value={p}>{p === 'Twitter' ? 'X / Twitter' : p}</option>)}
                  </select>
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
              <Btn busy={busy === 'save'} onClick={save}>Save now</Btn>
              <Btn busy={busy === 'approve'} onClick={approve}><CheckCircle2 className="w-3.5 h-3.5" />Approve</Btn>
              {imageful && <Btn busy={busy === 'download'} onClick={downloadPngs}><Download className="w-3.5 h-3.5" />Download PNGs</Btn>}
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
