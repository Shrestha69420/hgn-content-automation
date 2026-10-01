import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Plus,
  Target,
  Calendar,
  Sparkles,
  Layers,
  Search,
  X
} from 'lucide-react';
import { Campaign, ContentCategory, Platform } from '../../types';

export const CampaignModule: React.FC = () => {
  const { campaigns, addCampaign, posts, setActiveModule, setWorkingDraft } = useApp();
  const [filterSeason, setFilterSeason] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for new campaign
  const [newCampaign, setNewCampaign] = useState<{
    name: string;
    code: string;
    description: string;
    category: ContentCategory;
    season: 'Autumn Peak' | 'Spring Everest' | 'Monsoon Safety' | 'Winter High-Pass';
    startDate: string;
    endDate: string;
    targetAudience: string;
    targetChannels: Platform[];
    budgetNPR: number;
    safetyFocus: string;
    targetReach: number;
    targetEngagement: number;
  }>({
    name: '',
    code: 'HG-CAM-',
    description: '',
    category: 'Travel Safety',
    season: 'Autumn Peak',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    targetAudience: 'International Trekkers, High-Altitude Expedition Teams, Guides',
    targetChannels: ['Instagram', 'LinkedIn'],
    budgetNPR: 300000,
    safetyFocus: 'Altitude Acclimatization, Emergency Satellite SOS Dispatch, Heli Rescue Verification',
    targetReach: 150000,
    targetEngagement: 12000,
  });

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSeason = filterSeason === 'All' || c.season === filterSeason;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeason && matchesSearch;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;

    addCampaign({
      name: newCampaign.name,
      code: newCampaign.code || `HG-CAMP-${Date.now().toString().slice(-4)}`,
      description: newCampaign.description,
      category: newCampaign.category,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      season: newCampaign.season,
      targetAudience: newCampaign.targetAudience,
      targetChannels: newCampaign.targetChannels,
      budgetNPR: Number(newCampaign.budgetNPR) || 200000,
      status: 'Active',
      safetyFocus: newCampaign.safetyFocus,
      kpis: {
        targetReach: Number(newCampaign.targetReach) || 100000,
        currentReach: 0,
        targetEngagement: Number(newCampaign.targetEngagement) || 8000,
        postsPlanned: 12,
        postsPublished: 0,
      },
    });

    setShowCreateModal(false);
  };

  const handleLaunchGeneratorForCampaign = (camp: Campaign) => {
    setWorkingDraft((prev: any) => ({
      ...prev,
      campaignId: camp.id,
      campaignName: camp.name,
      title: `${camp.name} - Safety Advisory`,
      content: `Planning your trek with Himalayan Guardian Nepal? For ${camp.name}, safety comes first:\n\n• Adhere strictly to ${camp.safetyFocus}\n• Always trek with licensed guide\n• Verified 24/7 SOS hotline: +977-1-4412345`,
    }));
    setActiveModule('generator');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              Campaign Management & Safety Objectives
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize seasonal trekking safety initiatives, emergency helicopter insurance drives, and eco-tourism campaigns for Himalayan Guardian Nepal.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by name, code (e.g. HG-EBC-SP26), or safety focus..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Season:</span>
          {['All', 'Autumn Peak', 'Spring Everest', 'Monsoon Safety', 'Winter High-Pass'].map(season => (
            <button
              key={season}
              onClick={() => setFilterSeason(season)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterSeason === season
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.map(camp => {
          const linkedPosts = posts.filter(p => p.campaignId === camp.id);
          const reachPct = Math.min(
            100,
            Math.round((camp.kpis.currentReach / Math.max(1, camp.kpis.targetReach)) * 100)
          );

          return (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/40">
                        {camp.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {camp.season}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {camp.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-2 font-serif">
                      {camp.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      camp.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {camp.description}
                </p>

                {/* Safety Pillar Badge */}
                <div className="mt-3 p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-xs text-red-200 flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-300">Safety Pillar: </span>
                    <span>{camp.safetyFocus}</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{camp.startDate} → {camp.endDate}</span>
                  </div>
                  <div className="text-right">
                    Budget: NPR {camp.budgetNPR.toLocaleString()}
                  </div>
                </div>

                {/* Target channels */}
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Channels:</span>
                  {camp.targetChannels.map(ch => (
                    <span
                      key={ch}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Reach Goal Progress</span>
                    <span className="text-amber-400 font-bold">
                      {camp.kpis.currentReach.toLocaleString()} / {camp.kpis.targetReach.toLocaleString()} ({reachPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full"
                      style={{ width: `${reachPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{linkedPosts.length} posts created</span>
                  </div>

                  <button
                    onClick={() => handleLaunchGeneratorForCampaign(camp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs border border-amber-500/30 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Content</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base font-serif">
                  Create Himalayan Marketing & Safety Campaign
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Langtang Valley Monsoon Preparedness & Landslide Safety"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Campaign Code
                  </label>
                  <input
                    type="text"
                    value={newCampaign.code}
                    onChange={e => setNewCampaign({ ...newCampaign, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Season Window
                  </label>
                  <select
                    value={newCampaign.season}
                    onChange={e =>
                      setNewCampaign({ ...newCampaign, season: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Autumn Peak">Autumn Peak (Sep - Nov)</option>
                    <option value="Spring Everest">Spring Everest (Mar - May)</option>
                    <option value="Monsoon Safety">Monsoon Safety (Jun - Aug)</option>
                    <option value="Winter High-Pass">Winter High-Pass (Dec - Feb)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description & Strategic Intent
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of objectives, regulatory announcements, or safety advisory..."
                  value={newCampaign.description}
                  onChange={e =>
                    setNewCampaign({ ...newCampaign, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Primary Mountain Safety Pillar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypothermia prevention, emergency pulse oximetry, avalanche warning"
                  value={newCampaign.safetyFocus}
                  onChange={e =>
                    setNewCampaign({ ...newCampaign, safetyFocus: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Target Reach Goal
                  </label>
                  <input
                    type="number"
                    value={newCampaign.targetReach}
                    onChange={e =>
                      setNewCampaign({ ...newCampaign, targetReach: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Budget (NPR)
                  </label>
                  <input
                    type="number"
                    value={newCampaign.budgetNPR}
                    onChange={e =>
                      setNewCampaign({ ...newCampaign, budgetNPR: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
