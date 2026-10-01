import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Send,
  Copy,
  Check,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Key,
  Target,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  Briefcase
} from 'lucide-react';
import { ContentCategory, HGNProductService, Platform, TargetAudience } from '../../types';
import {
  calculateTotalContentScore,
  ContentObjective,
  ContentScoreResult,
  ScoringPlatform
} from '../../services/contentScoringService';

export const GeneratorModule: React.FC = () => {
  const {
    campaigns,
    transferToQualityScorer,
    addPost,
    showToast
  } = useApp();

  // 1. Product / Service Option
  const [productService, setProductService] = useState<HGNProductService>(
    'CTG — Comprehensive Tourism Guard'
  );

  // 2. Campaign Objective
  const [objective, setObjective] = useState<ContentObjective>('Education');

  // 3. Target Audience
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    'International Trekkers'
  );

  // 4. Content Category
  const [category, setCategory] = useState<ContentCategory>('Trekking Safety');

  // 5. Primary SEO Keyword
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('Nepal trekking safety');

  // Channel, Campaign, Tone & Topic
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [tone, setTone] = useState<string>('Authoritative & Inspiring');
  const [topic, setTopic] = useState<string>(
    'High Altitude Safety & SOS Evacuation Protocol'
  );
  const [keyRequirements, setKeyRequirements] = useState<string>(
    'Emphasize acclimatization days, licensed guide verification, emergency dispatch +977-1-4412345, and CTG membership.'
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    title: string;
    content: string;
    hashtags: string[];
    callToAction: string;
    visualPrompt: string;
    platformTips?: string;
    source?: string;
  } | null>(null);

  // Editable Generated Fields
  const [editableContent, setEditableContent] = useState<string>('');
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableHashtags, setEditableHashtags] = useState<string>('');
  const [editableCta, setEditableCta] = useState<string>('');

  // Local Deterministic Scoring State (0% AI / 100% Deterministic Service)
  const [contentScoreResult, setContentScoreResult] = useState<ContentScoreResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Map app platform to scoring service platform
  const getScoringPlatform = (p: Platform): ScoringPlatform => {
    if (p === 'Facebook') return 'Facebook';
    if (p === 'LinkedIn') return 'LinkedIn';
    if (p === 'Twitter') return 'X/Twitter';
    return 'Instagram';
  };

  // Primary SEO Keyword Examples
  const SEO_KEYWORD_EXAMPLES = [
    'Nepal trekking insurance',
    'Nepal trekking safety',
    'high altitude safety',
    'trekking insurance Nepal',
    'travel safety Nepal',
  ];

  // Product / Service Options
  const PRODUCT_SERVICES: HGNProductService[] = [
    'CTG — Comprehensive Tourism Guard',
    'Trekking Safety Awareness',
    'High Altitude Safety',
    'Nepal Travel Safety',
    'Emergency Coordination',
    'General HGN Brand Awareness',
  ];

  // Campaign Objectives
  const OBJECTIVES: ContentObjective[] = [
    'Brand Awareness',
    'Engagement',
    'Website Traffic',
    'Lead Generation',
    'Education',
  ];

  // Target Audiences
  const TARGET_AUDIENCES: TargetAudience[] = [
    'International Trekkers',
    'Adventure Travellers',
    'Nepal Visitors',
    'Trekking Agencies',
    'Travel Agencies',
    'High Altitude Travellers',
    'Southeast Asian Travellers',
    'European Travellers',
  ];

  // Content Categories
  const CATEGORIES: ContentCategory[] = [
    'Trekking Safety',
    'Altitude Awareness',
    'Travel Preparation',
    'Nepal Tourism',
    'Emergency Support',
    'Product Awareness',
    'Educational Content',
    'Seasonal Campaign',
  ];

  // Quick Himalayan Marketing Presets
  const PRESETS = [
    {
      title: 'CTG — Tourism Guard Launch',
      productService: 'CTG — Comprehensive Tourism Guard' as HGNProductService,
      category: 'Product Awareness' as ContentCategory,
      objective: 'Brand Awareness' as ContentObjective,
      targetAudience: 'International Trekkers' as TargetAudience,
      primaryKeyword: 'Nepal trekking insurance',
      platform: 'Instagram' as Platform,
      topic: 'Comprehensive Tourism Guard (CTG) Mountain Protection Membership',
      tone: 'Authoritative & Inspiring',
      requirements: 'Highlight CTG coverage up to 6,000m, satellite telemetry, direct CAAN helicopter liaison, and emergency hotline +977-1-4412345.',
    },
    {
      title: 'Altitude Sickness & AMS Guide',
      productService: 'High Altitude Safety' as HGNProductService,
      category: 'Altitude Awareness' as ContentCategory,
      objective: 'Education' as ContentObjective,
      targetAudience: 'High Altitude Travellers' as TargetAudience,
      primaryKeyword: 'high altitude safety',
      platform: 'Instagram' as Platform,
      topic: 'Acute Mountain Sickness (AMS) Protocol & Pacing above Namche Bazaar',
      tone: 'Educational & Practical',
      requirements: 'Include rest days at Namche Bazaar (3440m) & Dingboche (4410m), SOS hotline +977-1-4412345, Diamox precautions, and pulse oximetry.',
    },
    {
      title: 'Agency B2B Risk Partnership',
      productService: 'Emergency Coordination' as HGNProductService,
      category: 'Trekking Safety' as ContentCategory,
      objective: 'Lead Generation' as ContentObjective,
      targetAudience: 'Trekking Agencies' as TargetAudience,
      primaryKeyword: 'Nepal trekking safety',
      platform: 'LinkedIn' as Platform,
      topic: 'Standardized Pre-Ascent Safety Architecture & Guide Compliance for Outfitters',
      tone: 'Corporate Risk Governance',
      requirements: 'Invite certified trek operators to integrate with Himalayan Guardian dispatch to eliminate rescue delays and fraudulent insurance claims.',
    },
    {
      title: 'Pass Crossing Emergency Alert',
      productService: 'Nepal Travel Safety' as HGNProductService,
      category: 'Emergency Support' as ContentCategory,
      objective: 'Education' as ContentObjective,
      targetAudience: 'Adventure Travellers' as TargetAudience,
      primaryKeyword: 'travel safety Nepal',
      platform: 'Twitter' as Platform,
      topic: 'Thorong La Pass Winter Weather Notice & Police Checkpoint Verification',
      tone: 'Urgent Safety Advisory',
      requirements: 'Warn against solo crossings, highlight windchill -18C, mandate check-in with Tourist Police (1144) and Himalayan SOS +977-1-4412345.',
    },
  ];

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setProductService(p.productService);
    setCategory(p.category);
    setObjective(p.objective);
    setTargetAudience(p.targetAudience);
    setPrimaryKeyword(p.primaryKeyword);
    setPlatform(p.platform);
    setTopic(p.topic);
    setTone(p.tone);
    setKeyRequirements(p.requirements);
    showToast(`Loaded preset: ${p.title}`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setContentScoreResult(null);
    setHasAnalyzed(false);

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productService,
          category,
          objective,
          targetAudience,
          primaryKeyword,
          topic,
          platform,
          tone,
          campaignName: selectedCampaign?.name || 'Himalayan Adventure Safety',
          keyRequirements: `${keyRequirements} • Product/Service: ${productService} • Primary Keyword: ${primaryKeyword} • Objective: ${objective} • Target Audience: ${targetAudience}`,
          prompt: customPrompt,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const titleText = data.data.title || topic;
        const bodyContent = data.data.content || '';
        const tags = Array.isArray(data.data.hashtags)
          ? data.data.hashtags
          : ['#HimalayanGuardian', '#NepalSafety', '#TrekSafe'];
        const ctaText = data.data.callToAction || 'Learn more and travel prepared with Himalayan Guardian Nepal.';

        setGeneratedResult({
          title: titleText,
          content: bodyContent,
          hashtags: tags,
          callToAction: ctaText,
          visualPrompt: data.data.visualPrompt || 'Trekker in the Himalayas overlooking snowcapped peaks with official safety gear.',
          platformTips: data.data.platformTips || 'Best published during European and American trek preparation hours.',
          source: data.source || 'gemini',
        });

        // Initialize editable fields
        setEditableTitle(titleText);
        setEditableContent(bodyContent);
        setEditableCta(ctaText);
        setEditableHashtags(tags.join(' '));

        showToast('Marketing content generated with Gemini! Click "Analyze Content" to evaluate.');
      } else {
        throw new Error('Failed to generate');
      }
    } catch (err) {
      console.error(err);
      showToast('Generation issue, falling back to local engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  // DETERMINISTIC EVALUATION (0% AI / 100% Hardcoded Business Rules)
  const handleAnalyzeContent = () => {
    // Formulate complete text to analyze
    const combinedContent = `${editableTitle}\n\n${editableContent}\n\n${editableCta}\n\n${editableHashtags}`.trim();

    // Call hardcoded scoring service with primaryKeyword and objective
    const result = calculateTotalContentScore({
      content: combinedContent,
      platform: getScoringPlatform(platform),
      primaryKeyword,
      objective,
    });

    setContentScoreResult(result);
    setHasAnalyzed(true);
    showToast(`Content Quality evaluated: ${result.totalScore}/100 (${result.rating})`);
  };

  const handleCopyContent = () => {
    const text = `${editableTitle}\n\n${editableContent}\n\n${editableCta}\n\n${editableHashtags}`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied text to clipboard!');
  };

  const handleSendToEvaluator = () => {
    if (!generatedResult) return;
    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const tags = editableHashtags.split(/\s+/).filter(t => t.length > 0);

    transferToQualityScorer({
      title: editableTitle,
      content: `${editableTitle}\n\n${editableContent}\n\n${editableCta}\n\n${editableHashtags}`.trim(),
      platform,
      hashtags: tags,
      callToAction: editableCta,
      campaignId: selectedCampaignId,
      campaignName: selectedCampaign?.name || 'Himalayan Safety Protocol',
      visualPrompt: generatedResult.visualPrompt,
      primaryKeyword,
      objective,
    });
  };

  const handleSaveToLibrary = () => {
    if (!generatedResult) return;
    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const tags = editableHashtags.split(/\s+/).filter(t => t.length > 0);

    addPost({
      campaignId: selectedCampaignId,
      campaignName: selectedCampaign?.name || 'Himalayan Safety Protocol',
      title: editableTitle,
      content: `${editableContent}\n\n${editableCta}\n\n${editableHashtags}`.trim(),
      category,
      platform,
      status: contentScoreResult && contentScoreResult.totalScore >= 75 ? 'Approved' : 'Draft',
      author: 'AI Generator & Evaluator',
      hashtags: tags,
      callToAction: editableCta,
      visualPrompt: generatedResult.visualPrompt,
      primaryKeyword,
      objective,
      deterministicScoreResult: contentScoreResult,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white font-serif">
              Himalayan Guardian Marketing Content Generator
            </h1>
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
              CTG & Safety Edition
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated marketing generator tailored for Himalayan Guardian Nepal (HGN / CTG). Generates copy via Gemini, then evaluates using deterministic scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            Pipeline:
          </span>
          <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
            Gemini Ideation
          </span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            Deterministic Scorer
          </span>
        </div>
      </div>

      {/* Preset Quick-Buttons */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
          Himalayan Guardian Marketing Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 transition flex items-center gap-1.5 active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            HGN Marketing Parameters
          </h2>

          {/* 1. Product / Service Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Product / Service *</span>
            </label>
            <select
              value={productService}
              onChange={e => setProductService(e.target.value as HGNProductService)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-medium focus:border-amber-400 focus:outline-none"
            >
              {PRODUCT_SERVICES.map(ps => (
                <option key={ps} value={ps}>
                  {ps}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Content Category & Campaign Objective */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Content Category *</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ContentCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Campaign Objective *</span>
              </label>
              <select
                value={objective}
                onChange={e => setObjective(e.target.value as ContentObjective)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                {OBJECTIVES.map(obj => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Audience *</span>
            </label>
            <select
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200"
            >
              {TARGET_AUDIENCES.map(aud => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Primary SEO Keyword (With User Request Examples) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary SEO Keyword *</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                Passed to Quality Scorer (20 pts)
              </span>
            </div>
            <input
              type="text"
              value={primaryKeyword}
              onChange={e => setPrimaryKeyword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-medium focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Nepal trekking safety"
            />

            {/* Quick SEO Keyword Examples */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Examples:</span>
              {SEO_KEYWORD_EXAMPLES.map(kw => (
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

          {/* 5. Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Social Channel
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['Instagram', 'LinkedIn', 'Facebook', 'Twitter', 'Blog'] as Platform[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition ${
                    platform === p
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {p === 'Twitter' ? 'X' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Topic & Campaign Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Topic / Headline Focus
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Comprehensive Tourism Guard (CTG) Coverage"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Safety Requirements & Emergency SOP
            </label>
            <textarea
              rows={2}
              value={keyRequirements}
              onChange={e => setKeyRequirements(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Generate Button (Gemini) */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Generating with Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-slate-950" />
                <span>Generate Content with Gemini</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Preview & Content Quality Score (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {isGenerating ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[460px]">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
              <h3 className="font-bold text-white text-base">
                Synthesizing Content with Gemini 3.8 Flash...
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Infusing &quot;{productService}&quot;, keyword &quot;{primaryKeyword}&quot;, and &quot;{objective}&quot; alignment for {targetAudience}.
              </p>
            </div>
          ) : !generatedResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-base font-serif">
                Ready to Generate Himalayan Marketing Content
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                Configure your product/service, content category, target audience, and primary SEO keyword on the left, then click generate.
              </p>
              <button
                onClick={() => handleApplyPreset(PRESETS[0])}
                className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Load CTG — Comprehensive Tourism Guard Preset
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Generated Content Card (Editable) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-xs text-amber-400 font-mono bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/40">
                      {platform} Draft
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {category}
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                      {productService}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyContent}
                      className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleGenerate}
                      className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1 transition"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editable Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={e => setEditableTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Editable Caption Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Editable Caption Body
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {editableContent.length} chars • Target Keyword: <strong className="text-amber-400">{primaryKeyword}</strong>
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={editableContent}
                    onChange={e => setEditableContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-sans leading-relaxed focus:border-cyan-400 focus:outline-none resize-y"
                  />
                </div>

                {/* Editable CTA & Hashtags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Call to Action (CTA)
                    </label>
                    <input
                      type="text"
                      value={editableCta}
                      onChange={e => setEditableCta(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-amber-300 focus:border-cyan-400 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      value={editableHashtags}
                      onChange={e => setEditableHashtags(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-sky-400 focus:border-cyan-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Visual Art Direction Prompt */}
                {generatedResult.visualPrompt && (
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-0.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Art Direction Prompt:</span>
                    </div>
                    <p className="text-slate-300 italic text-[11px]">
                      &quot;{generatedResult.visualPrompt}&quot;
                    </p>
                  </div>
                )}

                {/* PROMINENT ANALYZE BUTTON (User Request) */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Keyword passed to scorer: <strong className="text-amber-400">{primaryKeyword}</strong>
                  </div>

                  <button
                    onClick={handleAnalyzeContent}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition"
                  >
                    <FileSearch className="w-4 h-4 text-slate-950" />
                    <span>{hasAnalyzed ? 'Analyze Again' : 'Analyze Content'}</span>
                  </button>
                </div>
              </div>

              {/* DETERMINISTIC QUALITY SCORE DISPLAY (Displayed Next to / Below Content) */}
              {contentScoreResult && (
                <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Score & Rating Display */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-amber-500/50 flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <span className="text-3xl font-extrabold text-amber-400 font-mono leading-none">
                          {contentScoreResult.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">/ 100</span>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-mono text-cyan-400 font-bold">
                          CONTENT QUALITY
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-base font-extrabold font-mono px-3 py-0.5 rounded-full border ${contentScoreResult.ratingColor}`}>
                            {contentScoreResult.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Evaluated by deterministic rules (0% AI / 100% hardcoded logic)
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono text-slate-400">
                      <div>Platform: <strong className="text-white">{platform}</strong></div>
                      <div>Primary Keyword: <strong className="text-amber-400">{primaryKeyword}</strong></div>
                      <div>Objective: <strong className="text-cyan-400">{objective}</strong></div>
                    </div>
                  </div>

                  {/* Exact Breakdown Requested */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span>Breakdown:</span>
                      <span className="text-slate-400 font-normal">Score / Max</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {Object.values(contentScoreResult.breakdown).map(item => (
                        <div
                          key={item.key}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {item.status === 'passed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : item.status === 'warning' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            )}
                            <span className="font-sans text-slate-200">{item.name}</span>
                          </div>
                          <span className="font-bold text-white">
                            <span className={item.score === item.maxScore ? 'text-emerald-400' : item.score > 0 ? 'text-amber-400' : 'text-red-400'}>
                              {item.score}
                            </span>
                            <span className="text-slate-500">/{item.maxScore}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Recommendations:
                    </h4>

                    {contentScoreResult.recommendations.length === 0 ? (
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All 7 deterministic quality criteria met. Ready for scheduling!</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {contentScoreResult.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-slate-950 text-xs text-amber-300/90 flex items-start gap-2 border border-slate-800/80"
                          >
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pipeline Actions */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleAnalyzeContent}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Analyze Again (After Editing)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveToLibrary}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        Save Post with Score
                      </button>

                      <button
                        onClick={handleSendToEvaluator}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <span>Open in Quality Module</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
