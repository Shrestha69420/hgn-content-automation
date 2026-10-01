import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Layers,
  Award,
  Send,
  Clock,
  Target,
  Download,
  Filter,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Tag,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Platform } from '../../types';

export const AnalyticsModule: React.FC = () => {
  const { posts, campaigns, setActiveModule, showToast } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '30d' | '7d'>('all');
  const [qualityView, setQualityView] = useState<'platform' | 'campaign' | 'status'>('platform');

  // Filter posts by timeframe if needed
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

  // 1. TOP KPI METRICS (100% computed from application data)
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

  // 2. CONTENT BY STATUS
  const statusCounts = useMemo(() => {
    return {
      Draft: filteredPosts.filter(p => p.status === 'Draft').length,
      Ready: filteredPosts.filter(p => (p.status as string) === 'Ready' || p.status === 'Approved').length,
      Scheduled: filteredPosts.filter(p => p.status === 'Scheduled').length,
      Published: filteredPosts.filter(p => p.status === 'Published').length,
    };
  }, [filteredPosts]);

  // 3. CONTENT BY PLATFORM
  const platformCounts = useMemo(() => {
    return {
      Instagram: filteredPosts.filter(p => p.platform === 'Instagram').length,
      Facebook: filteredPosts.filter(p => p.platform === 'Facebook').length,
      LinkedIn: filteredPosts.filter(p => p.platform === 'LinkedIn').length,
      'X/Twitter': filteredPosts.filter(
        p => (p.platform as string) === 'Twitter' || (p.platform as string) === 'X/Twitter'
      ).length,
    };
  }, [filteredPosts]);

  // 4. CONTENT BY CAMPAIGN
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
        category: camp.category,
        total: campPosts.length,
        scheduled: campPosts.filter(p => p.status === 'Scheduled').length,
        published: campPosts.filter(p => p.status === 'Published').length,
        draft: campPosts.filter(p => p.status === 'Draft' || (p.status as string) === 'Ready').length,
        avgScore,
      };
    });
  }, [campaigns, filteredPosts]);

  // 5. CONTENT CREATION OVER TIME
  const creationTimeline = useMemo(() => {
    const timelineMap: { [key: string]: number } = {};

    filteredPosts.forEach(post => {
      try {
        const dateObj = new Date(post.createdAt);
        if (!isNaN(dateObj.getTime())) {
          // Format as "MMM DD" or "YYYY-MM-DD"
          const key = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          timelineMap[key] = (timelineMap[key] || 0) + 1;
        } else {
          timelineMap['Recent'] = (timelineMap['Recent'] || 0) + 1;
        }
      } catch {
        timelineMap['Recent'] = (timelineMap['Recent'] || 0) + 1;
      }
    });

    return Object.entries(timelineMap).map(([date, count]) => ({
      date,
      count,
    }));
  }, [filteredPosts]);

  const maxTimelineCount = useMemo(() => {
    return Math.max(1, ...creationTimeline.map(t => t.count));
  }, [creationTimeline]);

  // 6. AVERAGE QUALITY SCORE BREAKDOWNS
  const qualityByPlatform = useMemo(() => {
    const platforms: Platform[] = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter'];
    return platforms.map(plat => {
      const platPosts = filteredPosts.filter(
        p => p.platform === plat || (plat === 'Twitter' && (p.platform as string) === 'X/Twitter')
      );
      const scored = platPosts.filter(
        p => p.qualityReport?.overallScore !== undefined || p.deterministicScoreResult?.totalScore !== undefined
      );
      const avg = scored.length > 0
        ? Math.round(
            scored.reduce(
              (sum, p) =>
                sum + (p.qualityReport?.overallScore ?? p.deterministicScoreResult?.totalScore ?? 0),
              0
            ) / scored.length
          )
        : 0;

      return {
        label: plat === 'Twitter' ? 'X / Twitter' : plat,
        count: platPosts.length,
        avgScore: avg,
      };
    });
  }, [filteredPosts]);

  const qualityByStatus = useMemo(() => {
    const statuses = ['Draft', 'Ready', 'Scheduled', 'Published'] as const;
    return statuses.map(status => {
      const statusPosts = filteredPosts.filter(p => p.status === status);
      const scored = statusPosts.filter(
        p => p.qualityReport?.overallScore !== undefined || p.deterministicScoreResult?.totalScore !== undefined
      );
      const avg = scored.length > 0
        ? Math.round(
            scored.reduce(
              (sum, p) =>
                sum + (p.qualityReport?.overallScore ?? p.deterministicScoreResult?.totalScore ?? 0),
              0
            ) / scored.length
          )
        : 0;

      return {
        label: status,
        count: statusPosts.length,
        avgScore: avg,
      };
    });
  }, [filteredPosts]);

  // 7. MOST USED CONTENT CATEGORIES
  const categoryStats = useMemo(() => {
    const counts: { [category: string]: number } = {};

    filteredPosts.forEach(post => {
      const cat = post.category || 'General Safety';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: totalContentGenerated > 0 ? Math.round((count / totalContentGenerated) * 100) : 0,
    }));

    return entries.sort((a, b) => b.count - a.count);
  }, [filteredPosts, totalContentGenerated]);

  // CSV EXPORT (Real Activity Data)
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
    showToast('Exported real marketing activity CSV data.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              Marketing Activity Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Summary of all campaign creation, AI drafting, quality scoring, scheduling, and publishing activity recorded in the HGN Marketing Hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedTimeframe === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedTimeframe === '30d'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedTimeframe === '7d'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            disabled={totalContentGenerated === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export Activity CSV</span>
          </button>
        </div>
      </div>

      {/* TOP 5 KPI CARDS (Computed dynamically from real application state) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Campaigns */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Campaigns</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {totalCampaigns}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active campaigns in Hub
            </p>
          </div>
        </div>

        {/* 2. Content Generated */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Content Generated</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {totalContentGenerated}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Posts in Content Library
            </p>
          </div>
        </div>

        {/* 3. Scheduled Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Scheduled Content</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-300 font-mono">
              {scheduledCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              In publishing queue
            </p>
          </div>
        </div>

        {/* 4. Published Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Published Content</span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-300 font-mono">
              {publishedCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Distributed to channels
            </p>
          </div>
        </div>

        {/* 5. Average Quality Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Avg Quality Score</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {avgQualityScore > 0 ? `${avgQualityScore}/100` : '—'}
            </div>
            <p className="text-[11px] text-cyan-400/90 mt-1">
              {scoredPosts.length > 0 ? `Across ${scoredPosts.length} evaluated items` : 'No scored items yet'}
            </p>
          </div>
        </div>
      </div>

      {/* GLOBAL EMPTY STATE CHECK */}
      {totalContentGenerated === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-base font-bold text-white font-serif">
              No Content Activity Recorded Yet
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Generate or save content in the AI Content Generator or import campaigns to populate your marketing activity analytics.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveModule('generator')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Generate Content
            </button>
            <button
              onClick={() => setActiveModule('campaigns')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              View Campaigns
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* SECTION 1 & 2: STATUS & PLATFORM BREAKDOWNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Content by Status (7 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Content by Status
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {totalContentGenerated} Total Items
                </span>
              </div>

              {/* Status Segmented Stack Bar */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
                  {statusCounts.Draft > 0 && (
                    <div
                      style={{ width: `${(statusCounts.Draft / totalContentGenerated) * 100}%` }}
                      className="bg-slate-600 h-full"
                      title={`Draft: ${statusCounts.Draft}`}
                    />
                  )}
                  {statusCounts.Ready > 0 && (
                    <div
                      style={{ width: `${(statusCounts.Ready / totalContentGenerated) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title={`Ready: ${statusCounts.Ready}`}
                    />
                  )}
                  {statusCounts.Scheduled > 0 && (
                    <div
                      style={{ width: `${(statusCounts.Scheduled / totalContentGenerated) * 100}%` }}
                      className="bg-sky-500 h-full"
                      title={`Scheduled: ${statusCounts.Scheduled}`}
                    />
                  )}
                  {statusCounts.Published > 0 && (
                    <div
                      style={{ width: `${(statusCounts.Published / totalContentGenerated) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Published: ${statusCounts.Published}`}
                    />
                  )}
                </div>

                {/* Individual Status Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Draft</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono mt-1">
                      {statusCounts.Draft}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {Math.round((statusCounts.Draft / totalContentGenerated) * 100)}% of content
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Ready</span>
                    </div>
                    <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                      {statusCounts.Ready}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {Math.round((statusCounts.Ready / totalContentGenerated) * 100)}% of content
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-sky-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Scheduled</span>
                    </div>
                    <div className="text-lg font-bold text-sky-300 font-mono mt-1">
                      {statusCounts.Scheduled}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {Math.round((statusCounts.Scheduled / totalContentGenerated) * 100)}% of content
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Published</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-300 font-mono mt-1">
                      {statusCounts.Published}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {Math.round((statusCounts.Published / totalContentGenerated) * 100)}% of content
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Content by Platform (5 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Content by Platform
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Target Channels</span>
              </div>

              <div className="space-y-3 pt-1">
                {(
                  [
                    { name: 'Instagram', count: platformCounts.Instagram, color: 'from-pink-500 to-amber-500' },
                    { name: 'Facebook', count: platformCounts.Facebook, color: 'from-blue-600 to-indigo-500' },
                    { name: 'LinkedIn', count: platformCounts.LinkedIn, color: 'from-sky-600 to-blue-500' },
                    { name: 'X / Twitter', count: platformCounts['X/Twitter'], color: 'from-slate-400 to-slate-200' },
                  ] as const
                ).map(plat => {
                  const pct = totalContentGenerated > 0
                    ? Math.round((plat.count / totalContentGenerated) * 100)
                    : 0;

                  return (
                    <div key={plat.name} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-300">{plat.name}</span>
                        <span className="font-mono text-white font-semibold">
                          {plat.count} items ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${plat.color} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3 & 4: CONTENT CREATION OVER TIME & CONTENT BY CAMPAIGN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 3. Content Creation Over Time (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Content Creation Over Time
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  From Post Creation Timestamps
                </span>
              </div>

              {creationTimeline.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Generate or save content to view creation timeline.
                </div>
              ) : (
                <div className="pt-2">
                  <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-800">
                    {creationTimeline.map(item => {
                      const barHeightPct = Math.max(15, Math.round((item.count / maxTimelineCount) * 100));

                      return (
                        <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.count}
                          </div>
                          <div
                            style={{ height: `${barHeightPct}%` }}
                            className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 rounded-t-lg transition-all cursor-pointer relative"
                            title={`${item.date}: ${item.count} posts created`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 px-1">
                    {creationTimeline.map(item => (
                      <div key={item.date} className="text-center truncate max-w-[60px]">
                        {item.date}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Content by Campaign (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Content by Campaign
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {campaigns.length} Campaigns
                </span>
              </div>

              {campaignData.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No campaign data available yet.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {campaignData.map(camp => {
                    const pct = totalContentGenerated > 0
                      ? Math.round((camp.total / totalContentGenerated) * 100)
                      : 0;

                    return (
                      <div key={camp.id} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                            {camp.name}
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {camp.total} posts
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5 & 6: AVERAGE QUALITY SCORE BREAKDOWNS & MOST USED CATEGORIES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 5. Average Content Quality Score System (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Average Quality Score Breakdown
                  </h3>
                </div>

                {/* Sub-selector: Platform vs Campaign vs Status */}
                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setQualityView('platform')}
                    className={`px-2.5 py-1 rounded transition font-medium ${
                      qualityView === 'platform'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    By Platform
                  </button>
                  <button
                    onClick={() => setQualityView('campaign')}
                    className={`px-2.5 py-1 rounded transition font-medium ${
                      qualityView === 'campaign'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    By Campaign
                  </button>
                  <button
                    onClick={() => setQualityView('status')}
                    className={`px-2.5 py-1 rounded transition font-medium ${
                      qualityView === 'status'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    By Status
                  </button>
                </div>
              </div>

              {scoredPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
                  <p>No content has been scored through the deterministic quality engine yet.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Quality by Platform View */}
                  {qualityView === 'platform' &&
                    qualityByPlatform.map(item => (
                      <div key={item.label} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{item.label}</span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            ({item.count} items)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${item.avgScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-cyan-300 text-sm">
                            {item.avgScore > 0 ? `${item.avgScore}/100` : '—'}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Quality by Campaign View */}
                  {qualityView === 'campaign' &&
                    campaignData.map(item => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate max-w-[240px]">
                          <span className="font-bold text-white truncate block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.code} • {item.total} posts
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-28 bg-slate-900 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${item.avgScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-cyan-300 text-sm">
                            {item.avgScore > 0 ? `${item.avgScore}/100` : '—'}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Quality by Status View */}
                  {qualityView === 'status' &&
                    qualityByStatus.map(item => (
                      <div key={item.label} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{item.label}</span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            ({item.count} items)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${item.avgScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-cyan-300 text-sm">
                            {item.avgScore > 0 ? `${item.avgScore}/100` : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 6. Most Used Content Categories (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Most Used Categories
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Topic Distribution</span>
              </div>

              {categoryStats.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No categorized content items yet.
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {categoryStats.map(cat => (
                    <div
                      key={cat.name}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{cat.count} items</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 7: CAMPAIGN ACTIVITY TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Campaign Activity & Content Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual volume of content pieces created, scheduled, and published per active campaign.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {campaigns.length} Recorded Campaigns
              </span>
            </div>

            {campaignData.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No campaign data available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono">
                    <tr>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Content Created</th>
                      <th className="py-3 px-4 text-center">Scheduled</th>
                      <th className="py-3 px-4 text-center">Published</th>
                      <th className="py-3 px-4 text-right">Avg Quality Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {campaignData.map(camp => (
                      <tr key={camp.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{camp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{camp.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {camp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-amber-300">
                          {camp.total}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-sky-400">
                          {camp.scheduled}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-emerald-400">
                          {camp.published}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono font-bold ${
                            camp.avgScore >= 80
                              ? 'text-emerald-400'
                              : camp.avgScore >= 60
                              ? 'text-amber-400'
                              : camp.avgScore > 0
                              ? 'text-red-400'
                              : 'text-slate-500'
                          }`}>
                            {camp.avgScore > 0 ? `${camp.avgScore}/100` : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
