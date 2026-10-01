import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Search,
  Award,
  Sparkles,
  Calendar,
  Send,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  History
} from 'lucide-react';
import { ContentPost, ContentStatus, Platform } from '../../types';

export const ContentLibraryModule: React.FC = () => {
  const {
    posts,
    deletePost,
    publishPostNow,
    setActivePost,
    transferToQualityScorer,
    setActiveModule,
    showToast
  } = useApp();

  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPost, setPreviewPost] = useState<ContentPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPosts = posts.filter(p => {
    const matchesPlatform = platformFilter === 'All' || p.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const handleCopyPost = (post: ContentPost) => {
    const text = `${post.title}\n\n${post.content}\n\n${post.callToAction}\n\n${post.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied content to clipboard!');
  };

  const handleEditAndEvaluate = (post: ContentPost) => {
    setActivePost(post);
    transferToQualityScorer({
      title: post.title,
      content: post.content,
      platform: post.platform,
      hashtags: post.hashtags,
      callToAction: post.callToAction,
      campaignId: post.campaignId,
      campaignName: post.campaignName,
      visualPrompt: post.visualPrompt,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              Content Library & Asset Archive
            </h1>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
              {posts.length} Total Posts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Central repository of all Himalayan Guardian safety advisories, marketing campaigns, and scheduled social media releases.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('generator')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Content</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search content by keyword, topic, campaign, or #hashtag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Platform:</span>
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">Twitter / X</option>
              <option value="Blog">Blog</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Approved">Approved</option>
              <option value="In Review">In Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No content matches the selected filters.
          </div>
        ) : (
          filteredPosts.map(post => {
            const score = post.qualityReport?.overallScore || 70;
            const letterGrade = post.qualityReport?.letterGrade || 'B';

            let statusColor = 'bg-slate-800 text-slate-400';
            if (post.status === 'Published') statusColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            else if (post.status === 'Scheduled') statusColor = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
            else if (post.status === 'Approved') statusColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
            else if (post.status === 'In Review') statusColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

            return (
              <div
                key={post.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {post.platform}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded truncate max-w-[130px]">
                        {post.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor}`}>
                      {post.status}
                    </span>
                  </div>

                  {/* Title & Campaign */}
                  <h3 className="font-bold text-white text-sm line-clamp-2 mt-2 group-hover:text-amber-300 transition">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {post.campaignName}
                  </p>

                  {/* Content Preview */}
                  <p className="text-xs text-slate-300 line-clamp-3 mt-2.5 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] text-sky-400 font-mono bg-sky-950/40 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        +{post.hashtags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Deterministic Score + Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {score}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({letterGrade})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewPost(post)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyPost(post)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Copy Content"
                    >
                      {copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleEditAndEvaluate(post)}
                      className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/40 text-cyan-300 text-[11px] font-semibold transition"
                      title="Inspect in Quality Engine"
                    >
                      Score
                    </button>

                    {post.status !== 'Published' && (
                      <button
                        onClick={() => publishPostNow(post.id)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950 transition"
                        title="Publish Live"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">
                  {previewPost.platform}
                </span>
                <span className="text-xs text-slate-400">
                  {previewPost.campaignName}
                </span>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <h2 className="text-base font-bold text-white font-serif">
                {previewPost.title}
              </h2>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {previewPost.content}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">CTA: </span>
                <span className="text-amber-300 font-semibold">{previewPost.callToAction}</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {previewPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version History Audit Trail */}
              {previewPost.versionHistory && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-2">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editorial Revision & Quality Audit History:</span>
                  </div>
                  <div className="space-y-1.5">
                    {previewPost.versionHistory.map((h, i) => (
                      <div key={i} className="text-[11px] flex justify-between text-slate-300 border-l-2 border-amber-500/40 pl-2">
                        <span>{h.summary} ({h.editor})</span>
                        <span className="font-mono text-amber-400 font-bold">{h.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    handleCopyPost(previewPost);
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const p = previewPost;
                      setPreviewPost(null);
                      handleEditAndEvaluate(p);
                    }}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition"
                  >
                    Open in Quality Scorer
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
