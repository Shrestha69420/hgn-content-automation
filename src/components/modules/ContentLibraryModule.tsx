import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Search,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  Clock
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
    showToast('Copied content to clipboard.');
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
      primaryKeyword: post.primaryKeyword,
      objective: post.objective,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Content Library & Repository
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Archived and scheduled advisories, campaign releases, and safety broadcasts.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('generator')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_12px_rgba(99,102,241,0.25)] border border-indigo-400/30 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Content Draft</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, body, campaign, or hashtags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Draft', 'Approved', 'Scheduled', 'Published'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List Surface (Zero Card Soup) */}
      <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] divide-y divide-zinc-850/80 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No matching posts found in library.
          </div>
        ) : (
          filteredPosts.map(post => {
            const score = post.qualityReport?.overallScore ?? post.deterministicScoreResult?.totalScore ?? 85;

            return (
              <div
                key={post.id}
                className="p-4 hover:bg-zinc-850/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Content Info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-medium text-zinc-300">
                      {post.platform}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 truncate max-w-xs">
                      {post.campaignName}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 font-medium text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        post.status === 'Published'
                          ? 'bg-emerald-400'
                          : post.status === 'Scheduled'
                          ? 'bg-amber-400'
                          : 'bg-zinc-500'
                      }`} />
                      {post.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-white truncate">
                    {post.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 font-mono">
                    <span>Score: <strong className="text-zinc-300 font-medium">{score}/100</strong></span>
                    <span>•</span>
                    <span>Author: {post.author || 'Staff'}</span>
                    {post.scheduledFor && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {new Date(post.scheduledFor).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewPost(post)}
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                    title="View Full Post"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyPost(post)}
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                    title="Copy Text"
                  >
                    {copiedId === post.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleEditAndEvaluate(post)}
                    className="px-2.5 py-1 text-xs rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 transition"
                  >
                    Inspect
                  </button>

                  {post.status !== 'Published' && (
                    <button
                      onClick={() => publishPostNow(post.id)}
                      className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white transition"
                    >
                      Publish
                    </button>
                  )}

                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clean Modal for Preview */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <div>
                <span className="text-xs font-mono text-zinc-400">{previewPost.platform}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">{previewPost.title}</h3>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 text-xs leading-relaxed text-zinc-300 whitespace-pre-line font-sans">
              <p>{previewPost.content}</p>
              {previewPost.callToAction && (
                <p className="text-zinc-400 font-medium">{previewPost.callToAction}</p>
              )}
              {previewPost.hashtags && previewPost.hashtags.length > 0 && (
                <p className="font-mono text-zinc-400">{previewPost.hashtags.join(' ')}</p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">Status: {previewPost.status}</span>
              <button
                onClick={() => setPreviewPost(null)}
                className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
