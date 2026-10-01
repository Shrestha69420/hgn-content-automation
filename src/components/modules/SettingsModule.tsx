import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  PhoneCall,
  Save,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_CAMPAIGNS, INITIAL_POSTS } from '../../lib/initialData';

export const SettingsModule: React.FC = () => {
  const { showToast } = useApp();

  const [orgSettings, setOrgSettings] = useState({
    orgName: 'Himalayan Guardian Nepal',
    sector: 'Travel, Trekking, Adventure Safety, Tourism Protection & Emergency Support',
    headquarters: 'Thamel, Kathmandu, Bagmati Province, Nepal',
    emergencyHotline: '+977-1-4412345',
    mobileSatelliteDispatch: '+977-9801234567',
    touristPoliceHotline: '1144',
    website: 'https://www.himalayanguardian.org.np',
    licenseReg: 'HG-NEP-2024/ADV-8890',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Organization settings updated successfully.');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all campaigns and content posts to default marketing data?')) {
      localStorage.removeItem('hg_nepal_posts_v2');
      localStorage.removeItem('hg_nepal_campaigns_v2');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              System Settings & Platform Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure Himalayan Guardian Nepal organizational parameters, emergency contact channels, and system defaults.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            HGN Marketing Hub • Production System
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Organization & Hotline Settings (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Himalayan Guardian Nepal Organization Profile
            </h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Official Entity Name
              </label>
              <input
                type="text"
                value={orgSettings.orgName}
                onChange={e => setOrgSettings({ ...orgSettings, orgName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Mandate & Sector Focus
              </label>
              <input
                type="text"
                value={orgSettings.sector}
                onChange={e => setOrgSettings({ ...orgSettings, sector: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-red-400" />
                  <span>24/7 Kathmandu Dispatch Hotline</span>
                </label>
                <input
                  type="text"
                  value={orgSettings.emergencyHotline}
                  onChange={e => setOrgSettings({ ...orgSettings, emergencyHotline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-amber-400" />
                  <span>Satellite SOS Mobile Hotline</span>
                </label>
                <input
                  type="text"
                  value={orgSettings.mobileSatelliteDispatch}
                  onChange={e => setOrgSettings({ ...orgSettings, mobileSatelliteDispatch: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nepal Tourist Police Line
                </label>
                <input
                  type="text"
                  value={orgSettings.touristPoliceHotline}
                  onChange={e => setOrgSettings({ ...orgSettings, touristPoliceHotline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  CAAN & Rescue Liaison Reg #
                </label>
                <input
                  type="text"
                  value={orgSettings.licenseReg}
                  onChange={e => setOrgSettings({ ...orgSettings, licenseReg: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Official Portal Domain
              </label>
              <input
                type="text"
                value={orgSettings.website}
                onChange={e => setOrgSettings({ ...orgSettings, website: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Marketing Data</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Platform Operations & Marketing Pipeline (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Platform Operations & Marketing Pipeline
            </h2>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase block">
                Platform Name:
              </span>
              <p className="font-bold text-white font-serif mt-0.5 leading-snug">
                Marketing Content Automation and Social Media Management System for Himalayan Guardian Nepal
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 font-mono text-[10px] uppercase block">
                Partner Organization:
              </span>
              <p className="text-slate-200 font-medium">
                Himalayan Guardian Nepal (High-Altitude Adventure Safety, Rescue & Tourism Protection)
              </p>
            </div>
          </div>

          {/* Operational Marketing Workflow Checklist */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider font-mono text-[11px] block">
              Operational Marketing Workflow Pipeline:
            </span>

            <div className="space-y-1.5 font-sans">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <span>Campaign Planning (Everest, Annapurna, Rescue)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <span>AI-Assisted Content Generation (Gemini 3.8 Flash)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
                <span className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <span className="font-semibold">Deterministic Content Quality Score (Rule-Based Engine)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                <span>Content Library (Archive, Filter, Audit Log)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">5</span>
                <span>Social Media Calendar & Schedule Rescheduling</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">6</span>
                <span>Marketing & Safety Reach Analytics</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
            <span className="font-bold block mb-1">Quality & Safety Governance Guarantee:</span>
            Himalayan Guardian Nepal enforces rigorous content guidelines. Generative AI accelerates content drafting, while deterministic quality scoring guarantees brand integrity, safety protocols, and SEO optimization before any post reaches public distribution.
          </div>
        </div>
      </div>
    </div>
  );
};
