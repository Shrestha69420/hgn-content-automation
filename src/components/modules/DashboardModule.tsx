import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Award,
  Layers,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Radio,
  ArrowRight,
  PlusCircle,
  Clock,
  Compass,
  FileCheck
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
    <div className="space-y-6">
      {/* Mountain Safety Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none flex items-center pr-6">
          <svg className="w-80 h-80 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Himalayan Tourism Protection & Adventure Safety Command</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
            Namaste, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Centralized marketing automation and multi-channel safety distribution for Himalayan Guardian Nepal. Streamlining content planning from AI drafting to rule-based verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setActiveModule('generator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Draft New Marketing Content</span>
            </button>

            <button
              onClick={() => setActiveModule('quality-score')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Content Quality Standards</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Content Items</span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {posts.length}
            </span>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{publishedPosts.length} published across channels</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Campaigns</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {activeCampaigns.length}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Everest, Annapurna & Heli-Rescue
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg Quality Score</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {avgQualityScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/100</span>
            </div>
            <p className="text-[11px] text-cyan-400 mt-0.5 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Rule-based evaluation</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scheduled in Queue</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {scheduledPosts.length}
            </span>
            <p className="text-[11px] text-indigo-300 mt-0.5">
              Across Instagram, X, LinkedIn
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Active Campaigns & Scheduled Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Himalayan Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white font-serif">
                Active Adventure & Safety Campaigns
              </h2>
            </div>
            <button
              onClick={() => setActiveModule('campaigns')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              <span>View All ({campaigns.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.slice(0, 3).map(camp => {
              const reachPercent = Math.min(
                100,
                Math.round((camp.kpis.currentReach / Math.max(1, camp.kpis.targetReach)) * 100)
              );

              return (
                <div
                  key={camp.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {camp.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {camp.season}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {camp.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm sm:text-base mt-1.5">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {camp.targetChannels.map(ch => (
                        <span
                          key={ch}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 font-mono"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                    {camp.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex justify-between text-[11px] mb-1 font-mono">
                        <span className="text-slate-400">Reach Progress</span>
                        <span className="text-amber-400 font-bold">
                          {camp.kpis.currentReach.toLocaleString()} / {camp.kpis.targetReach.toLocaleString()} ({reachPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${reachPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveModule('generator');
                        }}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3 text-amber-400" />
                        <span>Add Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quality Score & Upcoming Publishing Queue */}
        <div className="space-y-6">
          {/* Quality Distribution Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Content Quality Health</h3>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                Standards
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Marketing copy is evaluated against HGN editorial, brand, and safety guidelines prior to scheduling.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Grade A+ / A (Score ≥ 85)
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {posts.filter(p => (p.qualityReport?.overallScore || 0) >= 85).length} posts
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Grade B+ / B (Score 70-84)
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {posts.filter(p => {
                    const s = p.qualityReport?.overallScore || 0;
                    return s >= 70 && s < 85;
                  }).length} posts
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Grade C / Needs Revision (&lt; 70)
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {posts.filter(p => (p.qualityReport?.overallScore || 0) < 70).length} posts
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveModule('quality-score')}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg transition text-center"
            >
              Open Content Quality Standards
            </button>
          </div>

          {/* Scheduled Social Media Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Upcoming Queue</h3>
              </div>
              <button
                onClick={() => setActiveModule('calendar')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {scheduledPosts.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No posts currently scheduled.
                </p>
              ) : (
                scheduledPosts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePost(p);
                      transferToQualityScorer({
                        title: p.title,
                        content: p.content,
                        platform: p.platform,
                        hashtags: p.hashtags,
                        callToAction: p.callToAction,
                        campaignId: p.campaignId,
                        campaignName: p.campaignName,
                        visualPrompt: p.visualPrompt,
                      });
                    }}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-indigo-300">{p.platform}</span>
                      <span className="font-mono text-slate-400">
                        {p.scheduledFor
                          ? new Date(p.scheduledFor).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                            })
                          : 'Pending'}
                      </span>
                    </div>
                    <p className="text-white font-medium line-clamp-1">{p.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{p.campaignName}</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {p.qualityReport?.overallScore || 0}/100
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
