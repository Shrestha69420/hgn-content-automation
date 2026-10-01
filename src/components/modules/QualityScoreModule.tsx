/**
 * ==============================================================================
 * MODULE: CONTENT QUALITY SCORE
 * Organization: Himalayan Guardian Nepal (HGN / CTG)
 * Platform: HGN Marketing Hub
 * 
 * SPECIFICATION:
 * Deterministic business logic evaluating marketing content:
 * - Deterministic, rule-based verification.
 * - Platform-specific length and hashtag calibration.
 * - Himalayan Guardian brand, keyword, and CTA enforcement.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Calendar,
  Layers,
  Wand2,
  Copy,
  Check,
  Info,
  Key,
  Target,
  Sparkles
} from 'lucide-react';
import {
  calculateTotalContentScore,
  ContentObjective,
  ScoringPlatform,
  OBJECTIVE_KEYWORD_DICTIONARIES,
  MANDATORY_CTA_PHRASES
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

  // Helper to map platform string to ScoringPlatform
  const mapPlatform = (p: string): ScoringPlatform => {
    if (p === 'Facebook') return 'Facebook';
    if (p === 'LinkedIn') return 'LinkedIn';
    if (p === 'Twitter' || p === 'X' || p === 'X/Twitter') return 'X/Twitter';
    return 'Instagram';
  };

  // State
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

  // Sync state when activePost changes
  useEffect(() => {
    if (activePost) {
      setContent(activePost.content);
      setTitle(activePost.title);
      setPlatform(mapPlatform(activePost.platform));
      if (activePost.primaryKeyword) setPrimaryKeyword(activePost.primaryKeyword);
      if (activePost.objective) setObjective(activePost.objective as ContentObjective);
    }
  }, [activePost]);

  // DETERMINISTIC CALCULATION (Calls contentScoringService.ts — 0% AI, purely deterministic)
  const scoreResult = calculateTotalContentScore({
    content,
    platform,
    primaryKeyword,
    objective,
  });

  // Example Primary Keywords
  const KEYWORD_EXAMPLES = [
    'Nepal trekking insurance',
    'trekking safety',
    'high altitude safety',
    'Nepal trekking',
    'travel safety',
  ];

  // Quick Auto-Fix Helper
  const handleApplyFix = (type: string) => {
    switch (type) {
      case 'cta':
        setContent(prev => {
          if (prev.toLowerCase().includes('learn more') || prev.toLowerCase().includes('travel prepared')) return prev;
          return `${prev.trim()}\n\n👉 Learn more and travel prepared with our expert mountain safety dispatch.`;
        });
        showToast('Appended Call to Action ("learn more" and "travel prepared").');
        break;

      case 'brand':
        setContent(prev => {
          if (prev.toLowerCase().includes('himalayan guardian nepal') || prev.toLowerCase().includes('hgn')) return prev;
          return `${prev.trim()}\n\nProtected by Himalayan Guardian Nepal (HGN).`;
        });
        showToast('Added "Himalayan Guardian Nepal (HGN)" brand mention.');
        break;

      case 'keyword':
        if (!primaryKeyword.trim()) {
          setPrimaryKeyword('high altitude safety');
        }
        setContent(prev => {
          const kw = primaryKeyword.trim() || 'high altitude safety';
          if (prev.toLowerCase().includes(kw.toLowerCase())) return prev;
          return `${prev.trim()}\n\nPrioritizing ${kw} across all high passes.`;
        });
        showToast(`Included primary keyword "${primaryKeyword || 'high altitude safety'}".`);
        break;

      case 'hashtags':
        setContent(prev => {
          const existingTags = prev.match(/#[A-Za-z0-9_]+/g) || [];
          if (platform === 'Instagram' && existingTags.length < 5) {
            return `${prev.trim()}\n\n#HimalayanGuardian #NepalTrekking #HighAltitudeSafety #EverestSafety #TrekNepal #AdventureSafety`;
          } else if (platform === 'LinkedIn' && existingTags.length < 3) {
            return `${prev.trim()}\n\n#HimalayanGuardian #TrekkingSafety #NepalTourism`;
          } else if (existingTags.length === 0) {
            return `${prev.trim()}\n\n#HimalayanGuardian #NepalTrekking`;
          }
          return prev;
        });
        showToast('Added recommended hashtags for platform.');
        break;

      case 'objective':
        const dict = OBJECTIVE_KEYWORD_DICTIONARIES[objective] || [];
        setContent(prev => {
          const add1 = dict[0] || 'safety';
          const add2 = dict[1] || 'guide';
          return `${prev.trim()}\n\nHere are vital ${add1} ${add2} insights for your journey.`;
        });
        showToast(`Appended objective keywords for ${objective}.`);
        break;

      default:
        break;
    }
  };

  const handleSaveToLibrary = () => {
    // Extract hashtags from content
    const tags = content.match(/#[A-Za-z0-9_]+/g) || ['#HimalayanGuardian'];

    if (activePost) {
      updatePost(activePost.id, {
        title,
        content,
        platform: platform as Platform,
        hashtags: tags,
        primaryKeyword,
        objective,
        deterministicScoreResult: scoreResult,
      });
      showToast('Updated post in Library with re-computed score!');
    } else {
      addPost({
        campaignId: workingDraft.campaignId || 'camp-ebc-2026',
        campaignName: workingDraft.campaignName || 'Spring 2026 Everest Safety',
        title: title || 'Himalayan Safety Content',
        content,
        category: 'Travel Safety',
        platform: platform as Platform,
        status: scoreResult.totalScore >= 75 ? 'Approved' : 'In Review',
        author: 'Content Evaluator',
        hashtags: tags,
        callToAction: 'Travel prepared with Himalayan Guardian Nepal.',
        primaryKeyword,
        objective,
        deterministicScoreResult: scoreResult,
      });
    }
  };

  const handleScheduleSubmit = () => {
    if (!scheduleDateTime) {
      showToast('Please select a date and time.');
      return;
    }
    const tags = content.match(/#[A-Za-z0-9_]+/g) || ['#HimalayanGuardian'];
    const saved = addPost({
      campaignId: workingDraft.campaignId || 'camp-ebc-2026',
      campaignName: workingDraft.campaignName || 'Spring 2026 Everest Safety',
      title: title || 'Scheduled Safety Post',
      content,
      category: 'Travel Safety',
      platform: platform as Platform,
      status: 'Scheduled',
      scheduledFor: scheduleDateTime,
      author: 'Content Evaluator',
      hashtags: tags,
      callToAction: 'Travel prepared with Himalayan Guardian Nepal.',
      primaryKeyword,
      objective,
      deterministicScoreResult: scoreResult,
    });
    schedulePost(saved.id, scheduleDateTime);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-amber-950 border border-sky-800/60 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-serif">
                Content Quality
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/40">
                Quality Scoring Standards
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
              Automated business rules evaluating caption length, CTA, HGN brand mention, primary keyword, hashtag density, readability, and content objective match.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'evaluator' ? 'algorithm-code' : 'evaluator')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-semibold border border-slate-700 transition"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>{activeTab === 'evaluator' ? 'View Scoring Guidelines' : 'Back to Evaluator'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'algorithm-code' ? (
        /* Quality Standards & Scoring Architecture Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Marketing Guidelines: Deterministic Scoring Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Internal business rule implementations from <code className="font-mono text-cyan-300">src/services/contentScoringService.ts</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                1. calculateCaptionScore(charCount, platform) — 15 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Evaluates exact character brackets per platform: Facebook (80–300 = 15; 40–79 / 301–500 = 8; else = 3); Instagram (100–400 = 15; 50–99 / 401–700 = 8; else = 3); LinkedIn (100–600 = 15; 50–99 / 601–1000 = 8; else = 3); X/Twitter (40–240 = 15; else = 5).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                2. calculateCTAScore(content) — 15 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Deterministic regex search for approved CTA phrases: &quot;learn more&quot;, &quot;discover more&quot;, &quot;read more&quot;, &quot;explore&quot;, &quot;visit&quot;, &quot;get started&quot;, &quot;know more&quot;, &quot;prepare&quot;, &quot;travel prepared&quot;, &quot;contact us&quot;. Found =&gt; 15 pts; Else =&gt; 0 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                3. calculateBrandScore(content) — 10 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Checks string presence for &quot;Himalayan Guardian Nepal&quot;, &quot;HGN&quot;, or &quot;CTG&quot; with word boundaries. Found =&gt; 10 pts; Else =&gt; 0 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                4. calculateKeywordScore(content, primaryKeyword) — 20 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Exact string containment =&gt; 20 pts. Partial word containment =&gt; 10 pts. Absent =&gt; 0 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                5. calculateHashtagScore(hashtagCount, platform) — 15 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Tokenizes hashtags with regex `/#\w+/g`. Checks platform-specific thresholds (e.g. Instagram 5–12 =&gt; 15; LinkedIn 3–5 =&gt; 15; Facebook 1–5 =&gt; 15; X 1–3 =&gt; 15).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                6. calculateReadabilityScore(content) — 10 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Initial: 10 pts. -2 if any sentence &gt; 30 words. -2 if excessive uppercase text (&gt;28% or 3 consecutive caps words). -2 if &gt;3 exclamation marks. Min: 0 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
              <span className="text-amber-400 font-bold block mb-1">
                7. calculateObjectiveScore(content, objective) — 15 pts
              </span>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Checks dictionary of selected objective (Brand Awareness, Engagement, Website Traffic, Lead Generation, Education). &gt;= 2 keywords =&gt; 15 pts; 1 keyword =&gt; 8 pts; 0 =&gt; 0 pts.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setActiveTab('evaluator')}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Return to Live Evaluator
            </button>
          </div>
        </div>
      ) : (
        /* Main Workspace: Input Controls & Live Score Output */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Input Controls (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Post Inputs & Parameters
              </h2>
              <div className="flex items-center gap-1">
                {(['Facebook', 'Instagram', 'LinkedIn', 'X/Twitter'] as ScoringPlatform[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                      platform === p
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {p === 'X/Twitter' ? 'X' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Post Title / Headline (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                placeholder="e.g. High Altitude Safety Checklist"
              />
            </div>

            {/* Content / Caption Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Marketing Content / Caption *
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {scoreResult.charCount} chars • {scoreResult.wordCount} words • {scoreResult.hashtagCount} hashtags
                </span>
              </div>
              <textarea
                rows={10}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-sans leading-relaxed focus:border-cyan-400 focus:outline-none resize-y"
                placeholder="Type or paste your post content here to calculate score in real-time..."
              />
            </div>

            {/* Primary Marketing Keyword Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Primary Marketing Keyword (20 pts) *</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Exact: 20 pts • Partial: 10 pts
                </span>
              </div>
              <input
                type="text"
                value={primaryKeyword}
                onChange={e => setPrimaryKeyword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-medium"
                placeholder="e.g. high altitude safety"
              />

              {/* Quick Picks for Keyword */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Quick examples:</span>
                {KEYWORD_EXAMPLES.map(kw => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setPrimaryKeyword(kw);
                      showToast(`Selected primary keyword: "${kw}"`);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded transition font-mono ${
                      primaryKeyword.toLowerCase() === kw.toLowerCase()
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Objective Match Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Content Marketing Objective (15 pts) *</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  ≥2 words: 15 pts • 1 word: 8 pts
                </span>
              </div>
              <select
                value={objective}
                onChange={e => setObjective(e.target.value as ContentObjective)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-medium"
              >
                <option value="Brand Awareness">Brand Awareness (Himalayan Guardian, HGN, Nepal, travel, trekking)</option>
                <option value="Engagement">Engagement (share, comment, tell us, what do you think, save this)</option>
                <option value="Website Traffic">Website Traffic (learn more, read more, visit, website, discover)</option>
                <option value="Lead Generation">Lead Generation (contact, enquire, inquire, get started, request, quote)</option>
                <option value="Education">Education (tips, guide, learn, know, safety, how, why)</option>
              </select>

              {/* Keyword Cheat-Sheet for Selected Objective */}
              <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <span className="text-slate-300 font-medium">Keywords for {objective}: </span>
                {OBJECTIVE_KEYWORD_DICTIONARIES[objective].map((k, i) => (
                  <span
                    key={i}
                    className={`font-mono mr-1.5 ${
                      content.toLowerCase().includes(k)
                        ? 'text-emerald-400 font-bold underline'
                        : 'text-slate-500'
                    }`}
                  >
                    &quot;{k}&quot;
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Content Optimization Actions */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>One-Click Rule Fixers:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyFix('cta')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition"
                >
                  + CTA
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFix('brand')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition"
                >
                  + HGN Brand
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFix('keyword')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition"
                >
                  + Primary Keyword
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFix('hashtags')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition"
                >
                  + Hashtags
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyFix('objective')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition"
                >
                  + Objective
                </button>
              </div>
            </div>

            {/* Pipeline Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  showToast('Post copied to clipboard.');
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Schedule</span>
                </button>

                <button
                  onClick={handleSaveToLibrary}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Save to Library</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Score Display & 7-Item Breakdown (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Score Hero Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 flex flex-col items-center justify-center shadow-inner shrink-0">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono leading-none">
                      {scoreResult.totalScore}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-1">/ 100</span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                      Content Quality Score
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-extrabold font-mono px-3 py-1 rounded-full border ${scoreResult.ratingColor}`}>
                        Rating: {scoreResult.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Platform Target: <strong className="text-slate-200">{platform}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div className="text-cyan-400 font-bold">100% Deterministic</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Execution: &lt; 1ms</div>
                </div>
              </div>

              {/* 7-Criteria Score Breakdown */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Score Breakdown (7 Rules)</span>
                  <span className="text-amber-400 font-normal">Score / Max</span>
                </h3>

                {Object.values(scoreResult.breakdown).map(item => {
                  const pct = Math.round((item.score / item.maxScore) * 100);
                  let barColor = 'from-emerald-500 to-emerald-400';
                  if (item.score === 0) barColor = 'from-red-600 to-red-500';
                  else if (pct < 100) barColor = 'from-amber-500 to-amber-400';

                  return (
                    <div key={item.key} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {item.status === 'passed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : item.status === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-200">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-white text-xs">
                          <span className={item.score === item.maxScore ? 'text-emerald-400' : item.score > 0 ? 'text-amber-400' : 'text-red-400'}>
                            {item.score}
                          </span>
                          <span className="text-slate-500"> / {item.maxScore}</span>
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-start justify-between gap-2">
                        <span>{item.details}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {item.ruleExplanation}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rule-Based Recommendations Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Info className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Rule-Based Recommendations ({scoreResult.recommendations.length})
                </h3>
              </div>

              {scoreResult.recommendations.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 7 deterministic quality criteria met. Ready for social media scheduling!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {scoreResult.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-300/90 flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-white text-base font-serif mb-2">
              Schedule Social Media Post
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select date and time for automated publishing to {platform}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Publication Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDateTime}
                  onChange={e => setScheduleDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Channel: <span className="font-bold text-white">{platform}</span></div>
                <div>Objective: <span className="font-bold text-white">{objective}</span></div>
                <div>Primary Keyword: <span className="font-bold text-amber-400">{primaryKeyword}</span></div>
                <div>Score: <span className="font-bold text-amber-400 font-mono">{scoreResult.totalScore}/100</span> ({scoreResult.rating})</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleSubmit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
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
