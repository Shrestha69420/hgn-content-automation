import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Calendar,
  Copy,
  Check,
  X
} from 'lucide-react';
import {
  calculateTotalContentScore,
  ContentObjective,
  ScoringPlatform
} from '../../services/contentScoringService';
import { Platform } from '../../types';

export const QualityScoreModule: React.FC = () => {
  const {
    workingDraft,
    addPost,
    updatePost,
    activePost,
    schedulePost,
    showToast
  } = useApp();

  const mapPlatform = (p: string): ScoringPlatform => {
    if (p === 'Facebook') return 'Facebook';
    if (p === 'LinkedIn') return 'LinkedIn';
    if (p === 'Twitter' || p === 'X' || p === 'X/Twitter') return 'X/Twitter';
    return 'Instagram';
  };

  const [content, setContent] = useState<string>(() => {
    return activePost ? activePost.content : workingDraft.content;
  });
  const [title, setTitle] = useState<string>(() => {
    return activePost ? activePost.title : workingDraft.title;
  });
  const [platform, setPlatform] = useState<ScoringPlatform>(() => {
    return mapPlatform(activePost ? activePost.platform : workingDraft.platform);
  });
  const [primaryKeyword, setPrimaryKeyword] = useState<string>(() => {
    return activePost?.primaryKeyword || workingDraft.primaryKeyword || 'high altitude safety';
  });
  const [objective, setObjective] = useState<ContentObjective>(() => {
    return (activePost?.objective as ContentObjective) || (workingDraft.objective as ContentObjective) || 'Education';
  });

  const [copied, setCopied] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'evaluator' | 'algorithm-code'>('evaluator');

  useEffect(() => {
    if (activePost) {
      setContent(activePost.content);
      setTitle(activePost.title);
      setPlatform(mapPlatform(activePost.platform));
      if (activePost.primaryKeyword) setPrimaryKeyword(activePost.primaryKeyword);
      if (activePost.objective) setObjective(activePost.objective as ContentObjective);
    }
  }, [activePost]);

  const scoreResult = calculateTotalContentScore({
    content,
    platform,
    primaryKeyword,
    objective,
  });

  const KEYWORD_EXAMPLES = [
    'Nepal trekking insurance',
    'trekking safety',
    'high altitude safety',
    'Nepal trekking',
    'travel safety',
  ];

  const handleApplyFix = (type: string) => {
    switch (type) {
      case 'cta':
        setContent(prev => {
          if (prev.toLowerCase().includes('learn more') || prev.toLowerCase().includes('travel prepared')) return prev;
          return `${prev.trim()}\n\n👉 Learn more and travel prepared with Himalayan Guardian Nepal.`;
        });
        showToast('Appended Call to Action.');
        break;

      case 'brand':
        setContent(prev => {
          if (prev.toLowerCase().includes('himalayan guardian nepal') || prev.toLowerCase().includes('hgn')) return prev;
          return `${prev.trim()}\n\nProtected by Himalayan Guardian Nepal (HGN).`;
        });
        showToast('Added brand mention.');
        break;

      case 'keyword':
        setContent(prev => {
          const kw = primaryKeyword.trim() || 'high altitude safety';
          if (prev.toLowerCase().includes(kw.toLowerCase())) return prev;
          return `${prev.trim()}\n\nPrioritizing ${kw} across all high passes.`;
        });
        showToast(`Appended primary keyword.`);
        break;

      case 'hashtags':
        setContent(prev => {
          const existingTags = prev.match(/#[A-Za-z0-9_]+/g) || [];
          if (platform === 'Instagram' && existingTags.length < 5) {
            return `${prev.trim()}\n\n#HimalayanGuardian #NepalTrekking #HighAltitudeSafety #EverestSafety #TrekNepal`;
          } else if (platform === 'LinkedIn' && existingTags.length < 3) {
            return `${prev.trim()}\n\n#HimalayanGuardian #TrekkingSafety #NepalTourism`;
          } else if (existingTags.length === 0) {
            return `${prev.trim()}\n\n#HimalayanGuardian #NepalTrekking`;
          }
          return prev;
        });
        showToast('Updated hashtag density.');
        break;
    }
  };

  const handleCopy = () => {
    const fullText = title ? `${title}\n\n${content}` : content;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied content to clipboard.');
  };

  const handleSaveDraft = () => {
    const tags = content.match(/#[A-Za-z0-9_]+/g) || [];
    const appPlatform: Platform = platform === 'X/Twitter' ? 'Twitter' : (platform as Platform);

    if (activePost) {
      updatePost(activePost.id, {
        title,
        content,
        platform: appPlatform,
        primaryKeyword,
        objective,
        hashtags: tags,
        status: scoreResult.totalScore >= 75 ? 'Approved' : 'Draft',
        deterministicScoreResult: scoreResult,
      });
      showToast('Updated existing post with verified score.');
    } else {
      addPost({
        campaignId: workingDraft.campaignId || 'camp-ebc-2026',
        campaignName: workingDraft.campaignName || 'General Himalayan Safety',
        title: title || 'Himalayan Safety Notice',
        content,
        category: 'Trekking Safety',
        platform: appPlatform,
        status: scoreResult.totalScore >= 75 ? 'Approved' : 'Draft',
        author: 'Quality Inspector',
        hashtags: tags,
        callToAction: scoreResult.breakdown.cta.score === 15 ? 'Included' : '',
        primaryKeyword,
        objective,
        deterministicScoreResult: scoreResult,
      });
    }
  };

  const handleConfirmSchedule = () => {
    if (!scheduleDateTime) {
      showToast('Please select a scheduled date and time.');
      return;
    }

    const tags = content.match(/#[A-Za-z0-9_]+/g) || [];
    const appPlatform: Platform = platform === 'X/Twitter' ? 'Twitter' : (platform as Platform);

    if (activePost) {
      schedulePost(activePost.id, scheduleDateTime);
    } else {
      const newP = addPost({
        campaignId: workingDraft.campaignId || 'camp-ebc-2026',
        campaignName: workingDraft.campaignName || 'General Himalayan Safety',
        title: title || 'Himalayan Safety Notice',
        content,
        category: 'Trekking Safety',
        platform: appPlatform,
        status: 'Scheduled',
        author: 'Quality Inspector',
        hashtags: tags,
        callToAction: 'Included',
        scheduledFor: scheduleDateTime,
        primaryKeyword,
        objective,
        deterministicScoreResult: scoreResult,
      });
      schedulePost(newP.id, scheduleDateTime);
    }

    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Deterministic Quality Evaluator
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rule-based mathematical evaluation across 7 Himalayan publishing standards (100% deterministic, 0% LLM).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'evaluator' ? 'algorithm-code' : 'evaluator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-850 text-xs text-zinc-300 transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>{activeTab === 'evaluator' ? 'Rule Specifications' : 'Back to Evaluator'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'algorithm-code' ? (
        /* Rule Specifications View */
        <div className="border border-zinc-800/80 rounded-lg bg-[#0E1013] p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-850">
            <h2 className="text-sm font-semibold text-white">
              Deterministic Scoring Logic Specifications
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Source file: <code className="font-mono text-zinc-300">src/services/contentScoringService.ts</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                1. Caption Length (15 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Bracket evaluation per platform: Facebook (80–300 chars = 15; 40–79/301–500 = 8; else 3); Instagram (100–400 chars = 15; else 8 or 3); LinkedIn (100–600 = 15); X/Twitter (40–240 = 15; else 5).
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                2. Call to Action (15 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Boundary regex matching: &quot;learn more&quot;, &quot;travel prepared&quot;, &quot;explore&quot;, &quot;contact us&quot;, &quot;visit&quot;. Matched = 15 pts; Missing = 0 pts.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                3. HGN Brand Presence (10 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Matches &quot;Himalayan Guardian Nepal&quot;, &quot;HGN&quot;, or &quot;CTG&quot;. Present = 10 pts; Absent = 0 pts.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                4. Primary Keyword (20 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Exact string containment = 20 pts; Partial word containment = 10 pts; Absent = 0 pts.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                5. Hashtag Density (15 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Tokenized hashtag count checked against platform sweet spot (Instagram 5–12, LinkedIn 3–5, Facebook 1–5, X 1–3).
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800">
              <span className="text-zinc-200 font-semibold block mb-1">
                6. Readability & Formatting (10 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Base 10 pts. Deducts 2 pts for sentence &gt;30 words; 2 pts for excessive caps; 2 pts for &gt;3 exclamation marks.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-[#121316] border border-zinc-800 md:col-span-2">
              <span className="text-zinc-200 font-semibold block mb-1">
                7. Content Objective Match (15 pts)
              </span>
              <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                Matches semantic dictionary for selected campaign objective. ≥2 terms = 15 pts; 1 term = 8 pts; 0 terms = 0 pts.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Live Evaluator Workspace */
        <div className="space-y-6">
          {/* Integrated Top Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-y border-zinc-800 py-3 text-left">
            <div className="px-4 py-1">
              <p className="text-[11px] font-medium text-zinc-400">Total Quality Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-semibold text-indigo-400 font-mono tabular-nums">
                  {scoreResult.totalScore}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                <span className="text-xs font-medium ml-1 text-zinc-300">
                  ({scoreResult.rating})
                </span>
              </div>
            </div>

            <div className="px-4 py-1">
              <p className="text-[11px] font-medium text-zinc-400">Character & Word Count</p>
              <div className="flex items-baseline gap-2 mt-1 font-mono text-sm">
                <span className="text-zinc-200 font-semibold tabular-nums">{scoreResult.charCount}</span>
                <span className="text-zinc-500 text-xs">chars • {scoreResult.wordCount} words</span>
              </div>
            </div>

            <div className="px-4 py-1">
              <p className="text-[11px] font-medium text-zinc-400">Hashtag Density</p>
              <div className="flex items-baseline gap-2 mt-1 font-mono text-sm">
                <span className="text-zinc-200 font-semibold tabular-nums">{scoreResult.hashtagCount}</span>
                <span className="text-zinc-500 text-xs">tags ({platform})</span>
              </div>
            </div>

            <div className="px-4 py-1">
              <p className="text-[11px] font-medium text-zinc-400">Primary Keyword</p>
              <p className="text-xs text-zinc-300 mt-1 truncate font-mono">
                {primaryKeyword || 'None specified'}
              </p>
            </div>
          </div>

          {/* Two-Column Editor & Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Pane: Interactive Editor (6 Cols) */}
            <div className="lg:col-span-6 space-y-4 border border-zinc-800/80 rounded-lg bg-[#0E1013] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  Post Content & Channel
                </h2>

                <div className="flex items-center gap-1">
                  {(['Facebook', 'Instagram', 'LinkedIn', 'X/Twitter'] as ScoringPlatform[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-2 py-0.5 rounded text-xs transition cursor-pointer ${
                        platform === p
                          ? 'bg-indigo-600 text-white font-medium shadow-[0_0_10px_rgba(99,102,241,0.35)]'
                          : 'text-zinc-400 hover:text-zinc-200 bg-[#121316] border border-zinc-800'
                      }`}
                    >
                      {p === 'X/Twitter' ? 'X' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Catchy headline or advisory title..."
                  className="w-full bg-[#121316] border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Post Body & Copy
                </label>
                <textarea
                  rows={9}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-md p-3 text-xs text-zinc-200 leading-relaxed font-sans focus:outline-none focus:border-zinc-500 resize-y"
                  placeholder="Write or edit marketing copy here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Primary Keyword (20 pts)
                  </label>
                  <input
                    type="text"
                    value={primaryKeyword}
                    onChange={e => setPrimaryKeyword(e.target.value)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Campaign Objective
                  </label>
                  <select
                    value={objective}
                    onChange={e => setObjective(e.target.value as ContentObjective)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Education">Education</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Website Traffic">Website Traffic</option>
                    <option value="Lead Generation">Lead Generation</option>
                  </select>
                </div>
              </div>

              {/* Minimalist Auto-Fix Shortcuts */}
              <div className="pt-2 border-t border-zinc-850">
                <span className="text-[11px] text-zinc-500 block mb-1.5 font-mono">
                  Quick Standards Insertion:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleApplyFix('cta')}
                    className="px-2 py-1 rounded bg-[#121316] border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition"
                  >
                    + Append CTA
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyFix('brand')}
                    className="px-2 py-1 rounded bg-[#121316] border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition"
                  >
                    + Brand Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyFix('keyword')}
                    className="px-2 py-1 rounded bg-[#121316] border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition"
                  >
                    + Keyword
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyFix('hashtags')}
                    className="px-2 py-1 rounded bg-[#121316] border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition"
                  >
                    + Standard Hashtags
                  </button>
                </div>
              </div>
            </div>

            {/* Right Pane: 7-Rule Inspection Breakdown (6 Cols) */}
            <div className="lg:col-span-6 space-y-4 border border-zinc-800/80 rounded-lg bg-[#0E1013] p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-850 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Deterministic Compliance Checklist
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Max: 100 points
                  </span>
                </div>

                <div className="divide-y divide-zinc-850">
                  {Object.values(scoreResult.breakdown).map(item => (
                    <div key={item.key} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          item.status === 'passed' ? 'bg-emerald-400' : item.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <div className="font-medium text-zinc-200">
                            {item.name}
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                            {item.details}
                          </p>
                        </div>
                      </div>

                      <div className="font-mono text-xs tabular-nums text-zinc-300 shrink-0">
                        <span className={item.score === item.maxScore ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}>
                          {item.score}
                        </span>
                        <span className="text-zinc-600">/{item.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations List */}
                {scoreResult.recommendations.length > 0 && (
                  <div className="pt-3 border-t border-zinc-850 space-y-1.5 text-xs text-zinc-400">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Recommended Refinements:
                    </span>
                    {scoreResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-zinc-400">
                        <span className="text-zinc-600">•</span>
                        <span className="leading-snug">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-zinc-850 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 bg-[#121316] border border-zinc-800 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-[0_1px_10px_rgba(99,102,241,0.25)] cursor-pointer"
                  >
                    Save to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-semibold text-white">
                Schedule Publication
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-zinc-300 font-medium">
                Dispatch Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={e => setScheduleDateTime(e.target.value)}
                className="w-full bg-[#0E1013] border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-850">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_1px_10px_rgba(99,102,241,0.25)] cursor-pointer"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
