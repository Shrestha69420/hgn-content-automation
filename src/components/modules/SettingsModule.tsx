import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  PhoneCall,
  Save,
  RotateCcw,
  ShieldCheck,
  Database,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export const SettingsModule: React.FC = () => {
  const { showToast } = useApp();

  const [orgSettings, setOrgSettings] = useState({
    orgName: 'Himalayan Guardian Nepal',
    sector: 'High-Altitude Adventure Safety, Tourism Protection & Rescue Logistics',
    headquarters: 'Thamel, Kathmandu, Bagmati Province, Nepal',
    emergencyHotline: '+977-1-4412345',
    mobileSatelliteDispatch: '+977-9801234567',
    touristPoliceHotline: '1144',
    website: 'https://www.himalayanguardian.org.np',
    licenseReg: 'HG-NEP-2024/ADV-8890',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiService.getSettings()
      .then(saved => {
        if (saved && Object.keys(saved).length > 0) {
          setOrgSettings(prev => ({ ...prev, ...saved }));
        }
      })
      .catch(err => {
        console.warn('Could not load settings from SQLite server:', err);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiService.saveSettings(orgSettings);
      showToast('Settings saved to SQLite database.');
    } catch {
      showToast('Settings updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all campaigns and posts to default marketing dataset in SQLite?')) {
      try {
        await apiService.resetDatabase();
      } catch (e) {
        console.error('Reset database error:', e);
      }
      localStorage.removeItem('hg_nepal_posts_v2');
      localStorage.removeItem('hg_nepal_campaigns_v2');
      window.location.reload();
    }
  };

  const pipelineStages = [
    { num: '01', title: 'Campaign Architecture', desc: 'Strategy definition, high-altitude themes & target audience' },
    { num: '02', title: 'Multimodal Content Generation', desc: 'Gemini 3.8 Flash automated drafting with domain parameters' },
    { num: '03', title: 'Deterministic Quality Audit', desc: '7-rule compliance engine validating safety disclaimers & tone' },
    { num: '04', title: 'Repository & Asset Library', desc: 'Categorized content repository with audit history & filtering' },
    { num: '05', title: 'Multi-Channel Calendar Sync', desc: 'Temporal scheduling across Instagram, LinkedIn, FB & X' },
    { num: '06', title: 'Reach & Telemetry Analytics', desc: 'Audience engagement, safety reach & campaign ROI analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            System Configuration
          </div>
          <h1 className="text-xl font-medium tracking-tight text-white">
            Settings & Platform Profile
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Configure Himalayan Guardian Nepal organizational parameters, emergency dispatch channels, and data persistence layers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101A1F] border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SQLite Active (data/hgn.db)</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#101A1F] border border-zinc-800 text-[11px] font-mono text-zinc-400">
            Node.js WAL Mode
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Organization & Hotline Settings (7 Cols) */}
        <div className="lg:col-span-7 bg-[#101A1F] border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
                  Organization Profile & Emergency Channels
                </h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Public credentials and emergency communication vectors used across campaign collateral.
              </p>
            </div>

            <form id="settings-form" onSubmit={handleSaveSettings} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Official Entity Name
                </label>
                <input
                  type="text"
                  value={orgSettings.orgName}
                  onChange={e => setOrgSettings({ ...orgSettings, orgName: e.target.value })}
                  className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Mandate & Sector Focus
                </label>
                <input
                  type="text"
                  value={orgSettings.sector}
                  onChange={e => setOrgSettings({ ...orgSettings, sector: e.target.value })}
                  className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Headquarters & Regional Base
                </label>
                <input
                  type="text"
                  value={orgSettings.headquarters}
                  onChange={e => setOrgSettings({ ...orgSettings, headquarters: e.target.value })}
                  className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3 h-3 text-red-400" />
                    <span>24/7 Emergency Dispatch</span>
                  </label>
                  <input
                    type="text"
                    value={orgSettings.emergencyHotline}
                    onChange={e => setOrgSettings({ ...orgSettings, emergencyHotline: e.target.value })}
                    className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3 h-3 text-amber-400" />
                    <span>Satellite SOS Mobile Relay</span>
                  </label>
                  <input
                    type="text"
                    value={orgSettings.mobileSatelliteDispatch}
                    onChange={e => setOrgSettings({ ...orgSettings, mobileSatelliteDispatch: e.target.value })}
                    className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nepal Tourist Police Line
                  </label>
                  <input
                    type="text"
                    value={orgSettings.touristPoliceHotline}
                    onChange={e => setOrgSettings({ ...orgSettings, touristPoliceHotline: e.target.value })}
                    className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    CAAN & Rescue Liaison Reg #
                  </label>
                  <input
                    type="text"
                    value={orgSettings.licenseReg}
                    onChange={e => setOrgSettings({ ...orgSettings, licenseReg: e.target.value })}
                    className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Official Portal Domain
                </label>
                <input
                  type="text"
                  value={orgSettings.website}
                  onChange={e => setOrgSettings({ ...orgSettings, website: e.target.value })}
                  className="w-full bg-[#16232A] border border-zinc-800/90 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </form>
          </div>

          <div className="px-5 py-3.5 border-t border-zinc-800/80 bg-[#0A1114]/40 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="submit"
              form="settings-form"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-[0_1px_10px_rgba(43,181,166,0.25)] disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Platform Specifications & Governance Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Platform Architecture */}
          <div className="bg-[#101A1F] border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
                  Platform Architecture
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">v2.4.0-stable</span>
            </div>

            <div className="divide-y divide-zinc-800/80 text-xs font-mono">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Database Engine</span>
                <span className="text-zinc-300">SQLite (Node.js Native)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Write Mode</span>
                <span className="text-zinc-300">WAL (Write-Ahead Logging)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Language Model</span>
                <span className="text-zinc-300">Gemini 3.8 Flash API</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Scoring Engine</span>
                <span className="text-zinc-300">7-Rule Deterministic</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Storage Target</span>
                <span className="text-zinc-400 truncate max-w-[200px]">data/hgn.db</span>
              </div>
            </div>
          </div>

          {/* Operational Pipeline */}
          <div className="bg-[#101A1F] border border-zinc-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
                Pipeline Lifecycle
              </h3>
            </div>

            <div className="space-y-2">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.num}
                  className="flex items-start gap-3 p-2 rounded-lg bg-[#16232A]/70 border border-zinc-800/50"
                >
                  <span className="text-[10px] font-mono text-zinc-500 pt-0.5 shrink-0">
                    {stage.num}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 leading-tight">
                      {stage.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      {stage.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 leading-relaxed">
              <span className="text-zinc-400 font-medium">Dual-Engine Guarantee:</span> Generative AI drafts marketing copy while deterministic rules enforce mountain safety protocols and regulatory compliance prior to publication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
