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
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.safetyFocus.toLowerCase().includes(searchQuery.toLowerCase());
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Safety Campaigns & Objectives
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Seasonal trekking advisories, emergency insurance awareness, and regional trail initiatives.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, codes, or safety focus..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        {/* Segmented Season Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Autumn Peak', 'Spring Everest', 'Monsoon Safety', 'Winter High-Pass'].map(season => (
            <button
              key={season}
              onClick={() => setFilterSeason(season)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
                filterSeason === season
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List (Card-less Unified Table Surface) */}
      <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] divide-y divide-zinc-850/80 overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No matching campaigns found.
          </div>
        ) : (
          filteredCampaigns.map(camp => {
            const linkedPosts = posts.filter(p => p.campaignId === camp.id);
            const reachPct = Math.min(
              100,
              Math.round((camp.kpis.currentReach / Math.max(1, camp.kpis.targetReach)) * 100)
            );

            return (
              <div
                key={camp.id}
                className="p-5 hover:bg-zinc-850/30 transition flex flex-col gap-3.5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-zinc-300 font-medium">
                        {camp.code}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{camp.season}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{camp.category}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'Active' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                        {camp.status}
                      </span>
                    </div>

                    <h2 className="text-base font-medium text-white tracking-tight">
                      {camp.name}
                    </h2>

                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                      {camp.description}
                    </p>

                    <p className="text-xs text-zinc-500 pt-1">
                      <span className="text-zinc-400 font-medium">Safety Focus: </span>
                      {camp.safetyFocus}
                    </p>
                  </div>

                  {/* Actions & Channels */}
                  <div className="flex flex-col md:items-end gap-2.5 shrink-0">
                    <button
                      onClick={() => handleLaunchGeneratorForCampaign(camp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-medium transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Draft Post</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {camp.targetChannels.map(ch => (
                        <span
                          key={ch}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400 border border-zinc-700/40"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metric Summary Bar */}
                <div className="pt-3 border-t border-zinc-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span>Timeline: {camp.startDate} → {camp.endDate}</span>
                    <span>Budget: NPR {camp.budgetNPR.toLocaleString()}</span>
                    <span>Posts: {linkedPosts.length} created</span>
                  </div>

                  {/* Reach Progress */}
                  <div className="flex items-center gap-3 sm:w-64">
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-zinc-300 h-1.5 rounded-full"
                        style={{ width: `${reachPct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-zinc-300 shrink-0">
                      {reachPct}% reach
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Minimal Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">
                Create Safety Marketing Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter High-Pass Safety & Microspikes Drive"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Campaign Code
                  </label>
                  <input
                    type="text"
                    value={newCampaign.code}
                    onChange={e => setNewCampaign({ ...newCampaign, code: e.target.value })}
                    className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Season
                  </label>
                  <select
                    value={newCampaign.season}
                    onChange={e => setNewCampaign({ ...newCampaign, season: e.target.value as any })}
                    className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Autumn Peak">Autumn Peak</option>
                    <option value="Spring Everest">Spring Everest</option>
                    <option value="Monsoon Safety">Monsoon Safety</option>
                    <option value="Winter High-Pass">Winter High-Pass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCampaign.description}
                  onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Operational mandate, safety guidelines, target routes..."
                  className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Safety Protocol Focus
                </label>
                <input
                  type="text"
                  value={newCampaign.safetyFocus}
                  onChange={e => setNewCampaign({ ...newCampaign, safetyFocus: e.target.value })}
                  placeholder="e.g. AMS symptoms, helicopter evacuation coverage, guide permits..."
                  className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Budget (NPR)
                  </label>
                  <input
                    type="number"
                    value={newCampaign.budgetNPR}
                    onChange={e => setNewCampaign({ ...newCampaign, budgetNPR: Number(e.target.value) })}
                    className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Target Reach
                  </label>
                  <input
                    type="number"
                    value={newCampaign.targetReach}
                    onChange={e => setNewCampaign({ ...newCampaign, targetReach: Number(e.target.value) })}
                    className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition shadow-sm"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
