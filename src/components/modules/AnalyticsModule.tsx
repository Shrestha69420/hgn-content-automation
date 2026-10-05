import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { Platform } from '../../types';

export const AnalyticsModule: React.FC = () => {
  const { posts, campaigns, showToast } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '30d' | '7d'>('all');

  const filteredPosts = useMemo(() => {
    if (selectedTimeframe === 'all') return posts;
    const now = new Date().getTime();
    const days = selectedTimeframe === '7d' ? 7 : 30;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    return posts.filter(p => {
      const postDate = new Date(p.createdAt).getTime();
      return isNaN(postDate) || postDate >= threshold;
    });
  }, [posts, selectedTimeframe]);

  const totalCampaigns = campaigns.length;
  const totalContentGenerated = filteredPosts.length;
  const scheduledCount = filteredPosts.filter(p => p.status === 'Scheduled').length;
  const publishedCount = filteredPosts.filter(p => p.status === 'Published').length;

  const scoredPosts = filteredPosts.filter(
    p => p.qualityReport?.overallScore !== undefined || p.deterministicScoreResult?.totalScore !== undefined
  );

  const avgQualityScore = scoredPosts.length > 0
    ? Math.round(
        scoredPosts.reduce(
          (acc, p) =>
            acc + (p.qualityReport?.overallScore ?? p.deterministicScoreResult?.totalScore ?? 0),
          0
        ) / scoredPosts.length
      )
    : 0;

  const statusCounts = useMemo(() => {
    return {
      Draft: filteredPosts.filter(p => p.status === 'Draft').length,
      Approved: filteredPosts.filter(p => (p.status as string) === 'Ready' || p.status === 'Approved').length,
      Scheduled: filteredPosts.filter(p => p.status === 'Scheduled').length,
      Published: filteredPosts.filter(p => p.status === 'Published').length,
    };
  }, [filteredPosts]);

  const platformCounts = useMemo(() => {
    return {
      Instagram: filteredPosts.filter(p => p.platform === 'Instagram').length,
      LinkedIn: filteredPosts.filter(p => p.platform === 'LinkedIn').length,
      Facebook: filteredPosts.filter(p => p.platform === 'Facebook').length,
      'X / Twitter': filteredPosts.filter(
        p => (p.platform as string) === 'Twitter' || (p.platform as string) === 'X/Twitter'
      ).length,
    };
  }, [filteredPosts]);

  const campaignData = useMemo(() => {
    return campaigns.map(camp => {
      const campPosts = filteredPosts.filter(
        p => p.campaignId === camp.id || p.campaignName === camp.name
      );

      const scoredCampPosts = campPosts.filter(
        p => p.qualityReport?.overallScore !== undefined || p.deterministicScoreResult?.totalScore !== undefined
      );

      const avgScore = scoredCampPosts.length > 0
        ? Math.round(
            scoredCampPosts.reduce(
              (sum, p) =>
                sum + (p.qualityReport?.overallScore ?? p.deterministicScoreResult?.totalScore ?? 0),
              0
            ) / scoredCampPosts.length
          )
        : 0;

      return {
        id: camp.id,
        name: camp.name,
        code: camp.code,
        postsCount: campPosts.length,
        avgScore,
        targetReach: camp.kpis.targetReach,
        currentReach: camp.kpis.currentReach,
      };
    });
  }, [campaigns, filteredPosts]);

  const handleExportCSV = () => {
    const headers = 'Post_ID,Title,Campaign,Platform,Status,Quality_Score,Created_Date,Scheduled_Date\n';
    const rows = filteredPosts
      .map(p => {
        const titleSafe = (p.title || '').replace(/"/g, '""');
        const campSafe = (p.campaignName || '').replace(/"/g, '""');
        const score = p.qualityReport?.overallScore ?? p.deterministicScoreResult?.totalScore ?? 'N/A';
        const created = p.createdAt || '';
        const scheduled = p.scheduledFor || 'Not Scheduled';
        return `"${p.id}","${titleSafe}","${campSafe}","${p.platform}","${p.status}",${score},"${created}","${scheduled}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `HGN_Marketing_Activity_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported activity report to CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Performance & Reach Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operational telemetry and publication velocity metrics across Himalayan channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#121316] p-0.5 rounded-md border border-zinc-800 text-xs">
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedTimeframe === 'all'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedTimeframe === '30d'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedTimeframe === '7d'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              7 Days
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850 text-xs text-zinc-300 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric Strip (NO CARD SOUP) */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-y border-zinc-800 py-3.5 text-left">
        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Total Items</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {totalContentGenerated}
            </span>
            <span className="text-xs text-zinc-500 font-mono">items</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Published to Channel</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {publishedCount}
            </span>
            <span className="text-xs text-zinc-500 font-mono">live releases</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Avg Quality Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {avgQualityScore}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-[11px] font-medium text-zinc-400">Scheduled in Pipeline</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold text-white font-mono tabular-nums">
              {scheduledCount}
            </span>
            <span className="text-xs text-zinc-500 font-mono">in queue</span>
          </div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Channel Volume Breakdown */}
        <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] p-5 space-y-4">
          <div className="pb-3 border-b border-zinc-850">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Channel Volume Distribution
            </h2>
          </div>

          <div className="space-y-3">
            {Object.entries(platformCounts).map(([platform, count]) => {
              const pct = totalContentGenerated > 0 ? Math.round((count / totalContentGenerated) * 100) : 0;

              return (
                <div key={platform} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{platform}</span>
                    <span className="font-mono text-zinc-400 tabular-nums">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-300 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Publishing Status Lifecycle */}
        <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] p-5 space-y-4">
          <div className="pb-3 border-b border-zinc-850">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Publishing Lifecycle Status
            </h2>
          </div>

          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalContentGenerated > 0 ? Math.round((count / totalContentGenerated) * 100) : 0;

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        status === 'Published'
                          ? 'bg-emerald-400'
                          : status === 'Scheduled'
                          ? 'bg-amber-400'
                          : 'bg-zinc-500'
                      }`} />
                      <span className="text-zinc-300 font-medium">{status}</span>
                    </div>
                    <span className="font-mono text-zinc-400 tabular-nums">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-400 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] overflow-hidden">
        <div className="p-4 border-b border-zinc-850">
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            Campaign Reach & Quality Overview
          </h2>
        </div>

        <div className="divide-y divide-zinc-850">
          {campaignData.map(camp => {
            const reachPct = Math.min(
              100,
              Math.round((camp.currentReach / Math.max(1, camp.targetReach)) * 100)
            );

            return (
              <div
                key={camp.id}
                className="p-4 hover:bg-zinc-850/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-zinc-500">{camp.code}</span>
                  <h3 className="text-sm font-medium text-white">{camp.name}</h3>
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
                    <span>{camp.postsCount} posts created</span>
                    <span>•</span>
                    <span>Avg Score: <strong className="text-zinc-200 font-medium">{camp.avgScore}/100</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:w-56 shrink-0">
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-300 h-1.5 rounded-full"
                      style={{ width: `${reachPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-300 tabular-nums shrink-0">
                    {reachPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
