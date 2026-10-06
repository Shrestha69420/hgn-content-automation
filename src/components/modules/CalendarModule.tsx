import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { ContentPost } from '../../types';

export const CalendarModule: React.FC = () => {
  const { posts, schedulePost, publishPostNow, setActiveModule, showToast } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [newScheduleTime, setNewScheduleTime] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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
    showToast('Post rescheduled successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Editorial & Publishing Calendar
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cross-platform distribution schedule and time-slot planning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#121316] p-0.5 rounded-md border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white font-medium shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-indigo-600 text-white font-medium shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_12px_rgba(99,102,241,0.25)] border border-indigo-400/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Draft Post</span>
          </button>
        </div>
      </div>

      {/* Month Navigator and Channel Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-sm text-zinc-100 px-2 min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Instagram', 'LinkedIn', 'Facebook', 'Twitter'].map(plat => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
                platformFilter === plat
                  ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              {plat === 'Twitter' ? 'X' : plat}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Minimalist Month Grid */
        <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-[#121316] text-center text-[11px] font-mono text-zinc-400 py-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-zinc-850">
            {/* Empty Offset Days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] bg-zinc-950/40 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = day === 5 && month === 9 && year === 2026;

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition hover:bg-zinc-850/30 ${
                    isToday ? 'bg-zinc-900/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono text-xs ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-zinc-200 text-zinc-950 font-bold flex items-center justify-center'
                          : 'text-zinc-400'
                      }`}
                    >
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayPosts.slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPost(p)}
                        className="p-1 rounded bg-[#121316] hover:bg-zinc-800 border border-zinc-800/80 text-[10px] text-zinc-300 truncate cursor-pointer transition"
                        title={p.title}
                      >
                        <span className="text-zinc-500 mr-1">{p.platform.slice(0, 2)}</span>
                        <span>{p.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-zinc-500 block text-right font-mono">
                        +{dayPosts.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] divide-y divide-zinc-850/80 overflow-hidden">
          {calendarPosts.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              No scheduled posts for this timeframe.
            </div>
          ) : (
            calendarPosts.map(post => {
              const dateStr = post.scheduledFor || post.publishedAt || post.createdAt;
              const formattedDate = dateStr ? new Date(dateStr).toLocaleString() : 'Unscheduled';

              return (
                <div
                  key={post.id}
                  className="p-4 hover:bg-zinc-850/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-medium text-zinc-300">{post.platform}</span>
                      <span>•</span>
                      <span className="font-mono">{formattedDate}</span>
                      <span>•</span>
                      <span className="text-zinc-400">{post.status}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white">{post.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">{post.content}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="px-2.5 py-1 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition"
                    >
                      Reschedule
                    </button>
                    {post.status !== 'Published' && (
                      <button
                        onClick={() => publishPostNow(post.id)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white transition"
                      >
                        Publish Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-semibold text-white">
                Reschedule Publication
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400">{selectedPost.platform}</span>
              <p className="text-xs font-medium text-white line-clamp-2">{selectedPost.title}</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-zinc-300 font-medium">
                New Publication Time
              </label>
              <input
                type="datetime-local"
                value={newScheduleTime}
                onChange={e => setNewScheduleTime(e.target.value)}
                className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-850">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-sm"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
