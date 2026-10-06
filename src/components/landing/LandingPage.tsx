import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Layers,
  Calendar,
  BarChart3,
  Lock,
  Mail,
  X,
  Target,
  Share2,
  PhoneCall,
  Terminal,
  Activity
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, login, currentUser } = useAuth();
  const { setActiveModule, showToast } = useApp();

  // Auth modal state for unauthenticated visitors
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('marketing@himalayanguardian.org.np');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Interactive Live Scoring Simulator State
  const [activeSimulation, setActiveSimulation] = useState<'unverified' | 'certified'>('certified');

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      setActiveModule('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setShowAuthModal(false);
        setActiveModule('dashboard');
        showToast('Welcome to Campaign Flow.');
      } else {
        setAuthError(res.error || 'Authentication failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await login('marketing@himalayanguardian.org.np', 'password123');
      if (res.success) {
        setShowAuthModal(false);
        setActiveModule('dashboard');
        showToast('Logged in as Himalayan Guardian Content Strategist.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 antialiased overflow-x-hidden relative">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.22),rgba(255,255,255,0))] pointer-events-none" />

      {/* Frosted Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#090A0C]/85 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0" />
                <path d="M4 9c2.5-4 5.5-4 8 0s5.5 4 8 0" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                Campaign Flow
              </span>
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                Himalayan Guardian Nepal
              </span>
            </div>
          </div>

          {/* Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <a href="#pipeline" className="hover:text-zinc-100 transition-colors">
              Pipeline
            </a>
            <a href="#simulator" className="hover:text-zinc-100 transition-colors">
              Quality Engine
            </a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              Capabilities
            </a>
            <a href="#metrics" className="hover:text-zinc-100 transition-colors">
              Telemetry
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setActiveModule('dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_0_14px_rgba(99,102,241,0.3)] cursor-pointer"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1.5 cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={handleLaunchApp}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_0_14px_rgba(99,102,241,0.3)] cursor-pointer"
                >
                  <span>Launch Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-5 sm:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>Campaign Flow 2.0 • Autonomous Content & Compliance Pipeline</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          From Strategic Intent to Multi-Channel Distribution.{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-white bg-clip-text text-transparent">
            In Flow.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Engineered for mission-critical mountaineering safety and high-altitude tourism protection for Himalayan Guardian Nepal. Integrates Gemini 3.8 Flash intelligence with a 7-rule deterministic compliance engine.
        </p>

        {/* Hero CTA cluster */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>{isAuthenticated ? 'Enter Workspace' : 'Launch Workspace Demo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#pipeline"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0E1013] hover:bg-[#121316] border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <span>Explore Architecture</span>
          </a>
        </div>

        {/* Live Architecture Micro-Telemetry */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SQLite Native WAL Persistence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Gemini 3.8 Flash Ingestion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Deterministic 7-Rule Scoring</span>
          </div>
        </div>

        {/* High-Fidelity UI Window Preview Mockup */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-xl border border-zinc-800/80 bg-[#0E1013] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.15)] overflow-hidden text-left">
          {/* Window Title Bar */}
          <div className="px-4 py-3 border-b border-zinc-800/80 bg-[#090A0C]/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              <span className="ml-2 text-xs font-mono text-zinc-400">
                Campaign Flow — Spring 2026 Everest Safety & Acclimatization Drive
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Score: 96/100 (A+)
              </span>
            </div>
          </div>

          {/* Window Body Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80 text-xs">
            {/* Left Drawer: Strategy & Targeting */}
            <div className="md:col-span-5 p-5 space-y-4 bg-[#0B0C0E]/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                  Campaign Parameters
                </span>
                <span className="text-[10px] font-mono text-zinc-500">camp-ebc-2026</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#121316] border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">
                    Target Channel
                  </span>
                  <span className="text-zinc-200 font-medium">Instagram & Social Grid</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#121316] border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">
                    Mandate Focus
                  </span>
                  <span className="text-zinc-200 font-medium">Acute Mountain Sickness (AMS) Protocol</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#121316] border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">
                    Altitude Threshold
                  </span>
                  <span className="text-zinc-200 font-medium font-mono">3,440m+ (Namche to EBC)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Emergency Line</span>
                  <span className="font-mono text-zinc-200">+977-1-4412345</span>
                </div>
              </div>
            </div>

            {/* Right Document: Live Evaluated Copy */}
            <div className="md:col-span-7 p-5 space-y-4 bg-[#0E1013]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Live Document Output
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Deterministic Audit Passed
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#121316] border border-zinc-800/80 font-sans text-zinc-200 leading-relaxed text-xs">
                <p className="font-semibold text-white mb-2">
                  Heading above Namche Bazaar (3,440m)?
                </p>
                <p className="text-zinc-300 mb-2">
                  Golden Rule: Never ascend if exhibiting symptoms of Acute Mountain Sickness (AMS). Acclimatize at Dingboche before Lobuche. Maintain 4L daily hydration and monitor SpO2 saturation.
                </p>
                <p className="font-mono text-[11px] text-indigo-300">
                  24/7 Himalayan SOS: +977-1-4412345 | Tourist Police: 1144
                </p>
              </div>

              {/* 7-Rule Diagnostic Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono pt-1">
                <div className="p-2 rounded bg-[#121316]/70 border border-zinc-800/60 text-zinc-300">
                  <span className="text-zinc-500 block">Safety Hotline</span>
                  <span className="text-emerald-400 font-bold">Passed (100%)</span>
                </div>
                <div className="p-2 rounded bg-[#121316]/70 border border-zinc-800/60 text-zinc-300">
                  <span className="text-zinc-500 block">AMS Advisory</span>
                  <span className="text-emerald-400 font-bold">Passed (100%)</span>
                </div>
                <div className="p-2 rounded bg-[#121316]/70 border border-zinc-800/60 text-zinc-300">
                  <span className="text-zinc-500 block">Length & Format</span>
                  <span className="text-emerald-400 font-bold">Optimal (92%)</span>
                </div>
                <div className="p-2 rounded bg-[#121316]/70 border border-zinc-800/60 text-zinc-300">
                  <span className="text-zinc-500 block">Actionable CTA</span>
                  <span className="text-emerald-400 font-bold">Present (95%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Autonomous Pipeline Section */}
      <section id="pipeline" className="py-20 px-5 sm:px-8 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
            End-To-End Automation
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
            The 4-Stage Campaign Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            How Campaign Flow turns organizational safety policies into compliant, multi-channel social distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-indigo-400 group-hover:border-indigo-500/40 mb-4">
              01
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Strategic Ingestion
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Define target audience, seasonal constraints (Everest, Annapurna), regional altitude thresholds, and safety objectives.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-indigo-400 group-hover:border-indigo-500/40 mb-4">
              02
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Generative Drafting
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gemini 3.8 Flash synthesizes multichannel draft copy tailored for Instagram captions, LinkedIn briefs, and emergency notices.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-[#0E1013] border border-indigo-500/40 bg-gradient-to-b from-indigo-950/10 to-transparent group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.5)] mb-4">
              03
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Deterministic Audit
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hardcoded 7-rule engine evaluates mountain safety disclaimers, hotline accuracy, word limits, and SEO before release.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-indigo-400 group-hover:border-indigo-500/40 mb-4">
              04
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Schedule & Dispatch
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synchronize approved assets into the editorial calendar with automatic telemetry tracking and audience reach analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Quality Scoring Simulator Section */}
      <section id="simulator" className="py-20 px-5 sm:px-8 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1">
              Interactive Engine Inspection
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Try The 7-Rule Deterministic Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Toggle between a compliant advisory and an unverified promotional draft to see how the mathematical scoring rules execute in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-lg bg-[#0E1013] border border-zinc-800">
            <button
              onClick={() => setActiveSimulation('certified')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeSimulation === 'certified'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Certified Advisory (96/100)
            </button>
            <button
              onClick={() => setActiveSimulation('unverified')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                activeSimulation === 'unverified'
                  ? 'bg-red-950/60 text-red-200 border border-red-800/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Unverified Copy (48/100)
            </button>
          </div>
        </div>

        {/* Simulator Display Card */}
        <div className="rounded-xl bg-[#0E1013] border border-zinc-800/80 overflow-hidden">
          <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                  activeSimulation === 'certified'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {activeSimulation === 'certified' ? 'A+' : 'F'}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {activeSimulation === 'certified'
                    ? 'Spring Acclimatization Advisory — Everest Region'
                    : 'Unregulated Mountain Trekking Post'}
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">
                  {activeSimulation === 'certified'
                    ? 'Quality Score: 96 / 100 • 7 of 7 Rules Passed'
                    : 'Quality Score: 48 / 100 • 4 Rules Failed or Warned'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                  activeSimulation === 'certified'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {activeSimulation === 'certified' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Eligible for Social Dispatch</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected by Safety Guardrail</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
            {/* Post Content */}
            <div className="md:col-span-6 p-5 space-y-3 bg-[#0B0C0E]/50">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Evaluated Text Body
              </span>
              <div className="p-4 rounded-lg bg-[#121316] border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
                {activeSimulation === 'certified' ? (
                  <>
                    <p className="font-semibold text-white mb-2">
                      Acclimatization Warning: Namche to Lobuche Corridor (3,440m - 4,940m)
                    </p>
                    <p className="mb-2">
                      Before continuing beyond Dingboche, take a mandatory acclimatization rest day. AMS symptoms such as persistent throbbing headache, loss of appetite, or dizziness mean you must halt ascent immediately. Maintain at least 4 litres of warm fluids daily.
                    </p>
                    <p className="text-indigo-300 font-mono text-[11px] pt-1">
                      24/7 Kathmandu Dispatch: +977-1-4412345 | Tourist Police Hotline: 1144. Save and share this safety brief.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white mb-2">
                      Come see the Himalayas this spring season!
                    </p>
                    <p className="mb-2">
                      Best trekking views guaranteed in Nepal. Pack your hiking boots and book your tickets today for maximum fun and discounts.
                    </p>
                    <p className="text-zinc-500 italic text-[11px]">
                      [Notice: No emergency numbers, no AMS altitude warning, no accreditation number included]
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Rule Verification Table */}
            <div className="md:col-span-6 p-5 space-y-2 bg-[#0E1013]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                7-Rule Verification Breakdown
              </span>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R1: 24/7 Emergency SOS Hotline Included</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+25 pts</span>
                  ) : (
                    <span className="text-red-400 font-bold">0 pts (Failed)</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R2: Altitude Safety & AMS Advisory Verified</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+20 pts</span>
                  ) : (
                    <span className="text-red-400 font-bold">0 pts (Failed)</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R3: Actionable Call To Action Detected</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+15 pts</span>
                  ) : (
                    <span className="text-amber-400 font-bold">+8 pts (Vague)</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R4: Character Count Within Platform Optimum</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+15 pts</span>
                  ) : (
                    <span className="text-amber-400 font-bold">+10 pts</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R5: Tourist Police Hotline (1144) Present</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+10 pts</span>
                  ) : (
                    <span className="text-red-400 font-bold">0 pts (Failed)</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R6: High-Altitude Hydration Protocol</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+6 pts</span>
                  ) : (
                    <span className="text-red-400 font-bold">0 pts (Missing)</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121316] border border-zinc-800/70">
                  <span className="text-zinc-300">R7: Hashtags & SEO Indexing Optimization</span>
                  {activeSimulation === 'certified' ? (
                    <span className="text-emerald-400 font-bold">+5 pts</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">+5 pts</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Capabilities Section */}
      <section id="features" className="py-20 px-5 sm:px-8 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
            Built For Precision
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
            Core Architectural Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Every layer designed for data sovereignty, continuous reliability, and mountain safety integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <Cpu className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Dual-Engine Governance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gemini 3.8 Flash handles multimodal speed while deterministic TypeScript rules enforce regulatory criteria without hallucinations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <Database className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Native SQLite Persistence
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-millisecond local queries powered by Node.js native DatabaseSync with Write-Ahead Logging (WAL) in data/hgn.db.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <ShieldCheck className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              High-Altitude Safety Guardrails
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatic validation of AMS symptoms, pulse oximeter recommendations, hydration metrics, and satellite dispatch coordinates.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <Calendar className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Editorial Calendar Grid
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synchronize publication slots across Instagram, LinkedIn, Facebook, and Twitter with drag-free date-time rescheduling.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <Layers className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Historical Audit Trail
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every content revision logs the editor name, timestamp, quality delta, and rationale for full governance transparency.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80 hover:border-indigo-500/30 transition-colors">
            <BarChart3 className="w-5 h-5 text-indigo-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Safety Reach Telemetry
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Measure campaign impressions, high-altitude engagement rates, and emergency hotline click-through distributions.
            </p>
          </div>
        </div>
      </section>

      {/* Operational Metrics Strip */}
      <section id="metrics" className="py-16 px-5 sm:px-8 max-w-6xl mx-auto border-t border-zinc-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-1">
              94.2%
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Avg Quality Score
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-indigo-400 mb-1">
              &lt; 35ms
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Rule Audit Latency
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mb-1">
              100%
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Hotline Enforcement
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0E1013] border border-zinc-800/80">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mb-1">
              4 Channels
            </div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
              Synchronized Grid
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Call To Action */}
      <section id="architecture" className="py-20 px-5 sm:px-8 max-w-4xl mx-auto text-center border-t border-zinc-800/80">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#0E1013] to-[#0B0C0E] border border-indigo-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-white mb-3">
            Streamline your campaign pipeline today.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-8">
            Experience the unified marketing automation and deterministic quality assurance environment built for Himalayan Guardian Nepal.
          </p>

          <button
            onClick={handleLaunchApp}
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition shadow-[0_0_24px_rgba(99,102,241,0.4)] inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{isAuthenticated ? 'Return to Workspace' : 'Launch Campaign Flow Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] font-mono text-zinc-500 mt-4">
            Zero setup required • Instant browser access • SQLite backed
          </p>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-5 sm:px-8 max-w-6xl mx-auto text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            CF
          </div>
          <span className="text-zinc-400 font-medium">Campaign Flow</span>
          <span>•</span>
          <span>Himalayan Guardian Nepal Operations</span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>SQLite Engine</span>
          <span>Gemini 3.8 Flash</span>
          <span>v2.4.0 Production</span>
        </div>
      </footer>

      {/* Auth Modal (For Unauthenticated Visitors) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0E1013] border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 15c2.5-4 5.5-4 8 0s5.5 4 8 0" />
                  <path d="M4 9c2.5-4 5.5-4 8 0s5.5 4 8 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Campaign Flow</h3>
                <p className="text-[11px] text-zinc-500">Sign in to authorized workspace</p>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs mb-3">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="marketing@himalayanguardian.org.np"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-lg pl-8.5 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-[0_0_12px_rgba(99,102,241,0.3)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{isLoggingIn ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-4 mt-4 border-t border-zinc-800 text-center space-y-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-1.5 px-3 rounded-lg bg-[#121316] hover:bg-zinc-800 border border-zinc-700/60 text-xs font-mono text-zinc-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>1-Click Demo Login</span>
              </button>
              <p className="text-[10px] font-mono text-zinc-500">
                Pre-filled: marketing@himalayanguardian.org.np
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
