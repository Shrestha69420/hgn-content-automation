import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Layers,
  Sparkles,
  X,
  Send
} from 'lucide-react';
import { ContentPost, Platform } from '../../types';

export const CalendarModule: React.FC = () => {
  const { posts, updatePost, schedulePost, publishPostNow, setActiveModule, showToast } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026 (local context date)
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed, 9 = October
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter posts
  const calendarPosts = posts.filter(p => {
    const matchesPlatform = platformFilter === 'All' || p.platform === platformFilter;
    return matchesPlatform && (p.scheduledFor || p.publishedAt || p.createdAt);
  });

  const getPostsForDay = (day: number) => {
    return calendarPosts.filter(p => {
      const dateStr = p.scheduledFor || p.publishedAt || p.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleRescheduleSubmit = () => {
    if (!selectedPost || !newScheduleTime) return;
    schedulePost(selectedPost.id, newScheduleTime);
    setSelectedPost(null);
    showToast('Rescheduled post successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              Social Media Publishing Calendar
            </h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/40">
              {posts.filter(p => p.status === 'Scheduled').length} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual schedule of high-altitude advisories, marketing launches, and educational campaigns across international time zones.
          </p>
        </div>

        {/* View mode toggle & Quick generate */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'agenda'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agenda Queue
            </button>
          </div>

          <button
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Draft Post</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation & Channel Filter */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white font-mono min-w-[160px]">
            {monthName}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 9, 1))}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Channel:</span>
          {['All', 'Instagram', 'LinkedIn', 'Facebook', 'Twitter'].map(ch => (
            <button
              key={ch}
              onClick={() => setPlatformFilter(ch)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                platformFilter === ch
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch === 'Twitter' ? 'X' : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Render */}
      {viewMode === 'month' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 text-center py-2.5 bg-slate-950 text-xs font-mono font-bold text-slate-400 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/40">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-slate-950/20 p-2 opacity-30" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const daysPosts = getPostsForDay(day);
              const isToday = day === 1 && month === 9; // Oct 1, 2026 local context

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition hover:bg-slate-800/30 ${
                    isToday ? 'bg-amber-950/20 ring-1 ring-amber-500/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                    {daysPosts.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {daysPosts.length} items
                      </span>
                    )}
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1 mt-1.5 flex-1">
                    {daysPosts.map(p => {
                      let tagBg = 'bg-slate-800 text-slate-300';
                      if (p.status === 'Published') tagBg = 'bg-emerald-950 text-emerald-300 border border-emerald-800/40';
                      else if (p.status === 'Scheduled') tagBg = 'bg-indigo-950 text-indigo-300 border border-indigo-800/40';

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPost(p)}
                          className={`p-1.5 rounded-md text-[10px] cursor-pointer hover:scale-[1.02] transition truncate ${tagBg}`}
                          title={`${p.platform}: ${p.title}`}
                        >
                          <div className="flex items-center justify-between font-mono font-bold mb-0.5">
                            <span className="text-amber-400">{p.platform}</span>
                            <span>{p.qualityReport?.overallScore || 0}</span>
                          </div>
                          <p className="truncate font-sans font-medium">{p.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Queue View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">
            Chronological Publishing Timeline
          </h3>

          <div className="space-y-3">
            {calendarPosts.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">
                        {post.platform}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {post.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleString()
                          : 'Draft created: ' + new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{post.title}</h4>
                    <p className="text-slate-400 line-clamp-1 mt-0.5">{post.campaignName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 font-mono text-xs text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                    <Award className="w-3.5 h-3.5" />
                    <span>{post.qualityReport?.overallScore || 0}/100</span>
                  </div>

                  {post.status !== 'Published' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        publishPostNow(post.id);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publish</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule / Event Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Post Calendar Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Platform & Campaign:</span>
                <div className="text-white font-bold text-sm mt-0.5">
                  {selectedPost.platform} • {selectedPost.campaignName}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Title:</span>
                <p className="text-white font-semibold mt-0.5">{selectedPost.title}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                {selectedPost.content}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Change Scheduled Time:
                </label>
                <input
                  type="datetime-local"
                  value={newScheduleTime}
                  onChange={e => setNewScheduleTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {selectedPost.status !== 'Published' && (
                  <button
                    onClick={() => {
                      publishPostNow(selectedPost.id);
                      setSelectedPost(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Immediately</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRescheduleSubmit}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                  >
                    Save Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
