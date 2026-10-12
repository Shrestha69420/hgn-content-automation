import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Btn, Card, Label, PageTitle, inputCls } from '../common/ui';
import type { Brand } from '../../types';

const list = (s: string, sep: RegExp) => s.split(sep).map(x => x.trim()).filter(Boolean);

export const BrandsModule: React.FC = () => {
  const { brands, activeBrand, setActiveBrandId, refreshBrands, showToast } = useApp();
  const [form, setForm] = useState<Brand | null>(activeBrand ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(activeBrand ?? null); }, [activeBrand]);
  if (!form) return null;
  const set = (u: Partial<Brand>) => setForm({ ...form, ...u });

  const save = async () => {
    setSaving(true);
    try {
      await apiService.updateBrand(form.id, form);
      await refreshBrands();
      showToast('Brand saved.');
    } catch (e: any) { showToast(e.message); } finally { setSaving(false); }
  };
  const create = async () => {
    try {
      const { id: _id, ...rest } = form;
      const b = await apiService.createBrand({ ...rest, name: 'New brand' });
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
      <PageTitle title="Brands" sub="The brand profile steers every AI result: voice, audience, colors, and what to avoid."
        actions={<><Btn onClick={create}><Plus className="w-3.5 h-3.5" />New brand</Btn><Btn variant="danger" onClick={remove} disabled={brands.length <= 1}><Trash2 className="w-3.5 h-3.5" />Delete</Btn><Btn variant="primary" busy={saving} onClick={save}><Save className="w-3.5 h-3.5" />Save</Btn></>} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Identity">
          <div className="space-y-3">
            <div><Label>Name</Label><input className={inputCls} value={form.name} onChange={e => set({ name: e.target.value })} /></div>
            <div><Label>Tagline</Label><input className={inputCls} value={form.tagline} onChange={e => set({ tagline: e.target.value })} /></div>
            <div><Label>Industry / what you do</Label><input className={inputCls} value={form.industry} onChange={e => set({ industry: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Website</Label><input className={inputCls} value={form.website} onChange={e => set({ website: e.target.value })} /></div>
              <div><Label>Handle</Label><input className={inputCls} value={form.handle} onChange={e => set({ handle: e.target.value })} placeholder="@yourbrand" /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['primary', 'accent', 'background', 'text'] as const).map(k => (
                <div key={k}><Label>{k}</Label><input type="color" className="w-full h-8 bg-transparent" value={form.colors[k]} onChange={e => set({ colors: { ...form.colors, [k]: e.target.value } })} /></div>
              ))}
            </div>
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
    </div>
  );
};
