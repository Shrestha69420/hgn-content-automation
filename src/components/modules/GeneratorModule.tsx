import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { toScoringPlatform } from '../../lib/qualityScoringEngine';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileSearch
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

  const [productService, setProductService] = useState<HGNProductService>(
    'CTG — Comprehensive Tourism Guard'
  );
  const [objective, setObjective] = useState<ContentObjective>('Education');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    'International Trekkers'
  );
  const [category, setCategory] = useState<ContentCategory>('Trekking Safety');
  const [primaryKeyword, setPrimaryKeyword] = useState<string>('Nepal trekking safety');
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

  const [editableContent, setEditableContent] = useState<string>('');
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableHashtags, setEditableHashtags] = useState<string>('');
  const [editableCta, setEditableCta] = useState<string>('');

  const [contentScoreResult, setContentScoreResult] = useState<ContentScoreResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  const getScoringPlatform = toScoringPlatform;

  const SEO_KEYWORD_EXAMPLES = [
    'Nepal trekking insurance',
    'Nepal trekking safety',
    'high altitude safety',
    'trekking insurance Nepal',
    'travel safety Nepal',
  ];

  const PRODUCT_SERVICES: HGNProductService[] = [
    'CTG — Comprehensive Tourism Guard',
    'Trekking Safety Awareness',
    'High Altitude Safety',
    'Nepal Travel Safety',
    'Emergency Coordination',
    'General HGN Brand Awareness',
  ];

  const OBJECTIVES: ContentObjective[] = [
    'Brand Awareness',
    'Engagement',
    'Website Traffic',
    'Lead Generation',
    'Education',
  ];

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
      const response = await api('/api/generate-content', {
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
          : ['#HimalayanGuardian', '#NepalSafety', '#TrekNepal'];
        const ctaText = data.data.callToAction || 'Learn more and travel prepared with Himalayan Guardian Nepal.';

        setGeneratedResult({
          title: titleText,
          content: bodyContent,
          hashtags: tags,
          callToAction: ctaText,
          visualPrompt: data.data.visualPrompt || '',
          platformTips: data.data.platformTips || '',
          source: data.source,
        });

        setEditableTitle(titleText);
        setEditableContent(bodyContent);
        setEditableHashtags(tags.join(' '));
        setEditableCta(ctaText);

        const scoreRes = calculateTotalContentScore({
          content: `${titleText}\n\n${bodyContent}\n\n${ctaText}\n\n${tags.join(' ')}`.trim(),
          platform: getScoringPlatform(platform),
          primaryKeyword,
          objective,
        });
        setContentScoreResult(scoreRes);
        setHasAnalyzed(true);

        showToast(`Draft generated • Score: ${scoreRes.totalScore}/100`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating content. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeContent = () => {
    const combinedContent = `${editableTitle}\n\n${editableContent}\n\n${editableCta}\n\n${editableHashtags}`.trim();
    const result = calculateTotalContentScore({
      content: combinedContent,
      platform: getScoringPlatform(platform),
      primaryKeyword,
      objective,
    });

    setContentScoreResult(result);
    setHasAnalyzed(true);
    showToast(`Content evaluated: ${result.totalScore}/100 (${result.rating})`);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50 tracking-tight">
            Marketing Content Generator
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gemini-assisted draft synthesis calibrated to Himalayan safety protocols and deterministic verification.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span>Gemini 3.8 Flash</span>
          <span className="text-zinc-600">→</span>
          <span>Deterministic Verification</span>
        </div>
      </div>

      {/* Clean Presets Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-mono text-[11px] shrink-0">Presets:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyPreset(p)}
            className="px-2.5 py-1 rounded-md bg-raised hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs whitespace-nowrap transition cursor-pointer"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 border border-zinc-800/80 rounded-lg bg-surface p-5">
          <div className="pb-2 border-b border-zinc-850">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Configuration Parameters
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Product / Service
            </label>
            <select
              value={productService}
              onChange={e => setProductService(e.target.value as HGNProductService)}
              className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              {PRODUCT_SERVICES.map(ps => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ContentCategory)}
                className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Objective
              </label>
              <select
                value={objective}
                onChange={e => setObjective(e.target.value as ContentObjective)}
                className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                {OBJECTIVES.map(obj => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
            >
              {TARGET_AUDIENCES.map(aud => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-300">
                Primary Keyword
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                Evaluator weight: 20 pts
              </span>
            </div>
            <input
              type="text"
              value={primaryKeyword}
              onChange={e => setPrimaryKeyword(e.target.value)}
              className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
            />
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {SEO_KEYWORD_EXAMPLES.map(kw => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setPrimaryKeyword(kw)}
                  className={`text-[10px] px-1.5 py-0.5 rounded transition font-mono ${
                    primaryKeyword.toLowerCase() === kw.toLowerCase()
                      ? 'bg-zinc-700 text-zinc-50 font-medium'
                      : 'bg-raised text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Channel
            </label>
            <div className="grid grid-cols-5 gap-1">
              {(['Instagram', 'LinkedIn', 'Facebook', 'Twitter', 'Blog'] as Platform[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-1.5 text-center rounded-md text-xs transition cursor-pointer ${
                    platform === p
                      ? 'bg-indigo-600 text-white font-medium shadow-[0_0_10px_rgba(43,181,166,0.35)]'
                      : 'bg-raised text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {p === 'Twitter' ? 'X' : p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Topic & Headline Focus
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Safety Requirements
            </label>
            <textarea
              rows={2}
              value={keyRequirements}
              onChange={e => setKeyRequirements(e.target.value)}
              className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-[0_2px_14px_rgba(43,181,166,0.3)] border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>

        {/* Right Pane: Document Preview & Diagnostic Scorer (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {isGenerating ? (
            <div className="border border-zinc-800/80 rounded-lg bg-surface p-12 flex flex-col items-center justify-center text-center min-h-[460px]">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mb-3" />
              <p className="text-xs font-medium text-zinc-200">
                Generating post draft via Gemini 3.8 Flash...
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                Targeting &quot;{primaryKeyword}&quot; for {targetAudience}.
              </p>
            </div>
          ) : !generatedResult ? (
            <div className="border border-zinc-800/80 rounded-lg bg-surface p-12 flex flex-col items-center justify-center text-center min-h-[460px]">
              <Sparkles className="w-6 h-6 text-zinc-600 mb-3" />
              <h3 className="text-sm font-medium text-zinc-200">
                Workspace Ready
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                Choose a preset or adjust the configuration parameters on the left to begin drafting marketing copy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Editor */}
              <div className="border border-zinc-800/80 rounded-lg bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-300 font-medium">
                      {platform} Draft
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyContent}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-800 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={e => setEditableTitle(e.target.value)}
                    className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-sm font-semibold text-zinc-50 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-zinc-400">
                      Caption Body
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {editableContent.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={editableContent}
                    onChange={e => setEditableContent(e.target.value)}
                    className="w-full bg-raised border border-zinc-800 rounded-md p-3 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-zinc-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[11px]">
                      Call to Action (CTA)
                    </label>
                    <input
                      type="text"
                      value={editableCta}
                      onChange={e => setEditableCta(e.target.value)}
                      className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[11px]">
                      Hashtags
                    </label>
                    <input
                      type="text"
                      value={editableHashtags}
                      onChange={e => setEditableHashtags(e.target.value)}
                      className="w-full bg-raised border border-zinc-800 rounded-md p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                {generatedResult.visualPrompt && (
                  <div className="p-3 bg-raised rounded-md border border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-0.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Art Direction Prompt:</span>
                    </div>
                    <p className="text-zinc-300 italic text-[11px] leading-relaxed">
                      &quot;{generatedResult.visualPrompt}&quot;
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">
                    Primary keyword: <strong className="text-zinc-300 font-normal">{primaryKeyword}</strong>
                  </span>

                  <button
                    onClick={handleAnalyzeContent}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition cursor-pointer"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Evaluate Quality</span>
                  </button>
                </div>
              </div>

              {/* Deterministic Quality Diagnostic Strip */}
              {contentScoreResult && (
                <div className="border border-zinc-800/80 rounded-lg bg-surface p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                    <div className="flex items-baseline gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono text-zinc-50 tabular-nums">
                          {contentScoreResult.totalScore}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">/ 100</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/60">
                        {contentScoreResult.rating}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      Deterministic Engine • 0% LLM
                    </span>
                  </div>

                  {/* 7 Rules List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.values(contentScoreResult.breakdown).map(item => (
                      <div
                        key={item.key}
                        className="p-2 rounded bg-raised border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.status === 'passed' ? 'bg-emerald-400' : item.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          <span className="font-sans text-zinc-300">{item.name}</span>
                        </div>
                        <span className="tabular-nums text-zinc-400">
                          {item.score}/{item.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {contentScoreResult.recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850 text-xs">
                      {contentScoreResult.recommendations.map((rec, i) => (
                        <div key={i} className="text-zinc-400 flex items-start gap-2">
                          <span className="text-zinc-500">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-zinc-850 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={handleSaveToLibrary}
                      className="px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-zinc-50 transition"
                    >
                      Save to Library
                    </button>
                    <button
                      onClick={handleSendToEvaluator}
                      className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-[0_1px_10px_rgba(43,181,166,0.25)] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Detailed Scorer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
