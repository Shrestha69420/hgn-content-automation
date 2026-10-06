import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Award,
  Layers,
  Calendar,
  ArrowRight,
  Clock,
  Compass
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    currentUser,
    campaigns,
    posts,
    setActiveModule,
    setActivePost,
    transferToQualityScorer
  } = useApp();

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const scheduledPosts = posts.filter(p => p.status === 'Scheduled');
  const publishedPosts = posts.filter(p => p.status === 'Published');

  const avgQualityScore = Math.round(
    posts.reduce((acc, p) => acc + (p.qualityReport?.overallScore || 70), 0) /
      Math.max(1, posts.length)
  );

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Safety Operations & Publishing Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Content scheduling, campaign management, and deterministic quality verification for Himalayan corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModule('quality-score')}
            className="px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850 text-xs font-medium text-zinc-300 transition cursor-pointer"
          >
            Quality Standards
          </button>
          <button
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_12px_rgba(99,102,241,0.25)] border border-indigo-400/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Draft</span>
          </button>
        </div>
      </div>

      {/* Seamless Integrated Metric Strip (Zero Card Clutter) */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-y border-zinc-800 py-3.5 text-left">
        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Total Published</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {publishedPosts.length}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ {posts.length} items</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Active Campaigns</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {activeCampaigns.length}
            </span>
            <span className="text-xs text-zinc-400 font-mono">of {campaigns.length}</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Avg Quality Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {avgQualityScore}
            </span>
            <span className="text-xs text-zinc-400 font-mono">/ 100</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Scheduled Queue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {scheduledPosts.length}
            </span>
            <span className="text-xs text-zinc-400 font-mono">awaiting dispatch</span>
          </div>
        </div>
      </div>

      {/* Unified Main Layout: Left = Campaigns, Right = Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold text-zinc-200">
              Active Campaigns
            </h2>
            <button
              onClick={() => setActiveModule('campaigns')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
            >
              <span>View all ({campaigns.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg bg-[#0E1013] overflow-hidden">
            {campaigns.slice(0, 3).map(camp => {
              const reachPercent = Math.min(
                100,
                Math.round((camp.kpis.currentReach / Math.max(1, camp.kpis.targetReach)) * 100)
              );

              return (
                <div
                  key={camp.id}
                  className="p-4 hover:bg-zinc-850/40 transition flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-400 font-medium">
                          {camp.code}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400">
                          {camp.season}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-400">
                          {camp.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-100 mt-1">
                        {camp.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {camp.targetChannels.map(ch => (
                        <span
                          key={ch}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/70 text-zinc-400 border border-zinc-700/40"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reach Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-850/60 flex items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${reachPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] shrink-0">
                      <span className="text-indigo-400 font-semibold">{reachPercent}%</span>
                      <span>({camp.kpis.currentReach.toLocaleString()} reached)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Content Feed (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold text-zinc-200">
              Upcoming Queue
            </h2>
            <button
              onClick={() => setActiveModule('calendar')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
            >
              <span>Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-lg bg-[#0E1013] overflow-hidden">
            {posts.slice(0, 4).map(post => {
              const score = post.qualityReport?.overallScore ?? post.deterministicScoreResult?.totalScore ?? 85;

              return (
                <div
                  key={post.id}
                  className="p-3.5 hover:bg-zinc-850/40 transition cursor-pointer"
                  onClick={() => {
                    setActivePost(post);
                    transferToQualityScorer({
                      title: post.title,
                      content: post.content,
                      platform: post.platform,
                      hashtags: post.hashtags,
                      callToAction: post.callToAction,
                      campaignId: post.campaignId,
                      campaignName: post.campaignName,
                      primaryKeyword: post.primaryKeyword,
                      objective: post.objective,
                    });
                  }}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400 mb-1">
                    <span className="font-medium text-zinc-300">{post.platform}</span>
                    <span className="font-mono text-zinc-400 text-[10px]">
                      {score}/100
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-zinc-200 line-clamp-1">
                    {post.title}
                  </h4>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3" />
                      {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : 'Draft'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {post.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
