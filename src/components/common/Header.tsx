import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Sparkles,
  PhoneCall,
  LogOut,
  Radio
} from 'lucide-react';

export const Header: React.FC = () => {
  const { setActiveModule, showToast } = useApp();
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Urgent Emergency Alert Bar */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-red-900/30">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-semibold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Live Trail Dispatch:
          </span>
          <span className="text-slate-300 hidden md:inline">
            Khumbu: High Season Fair • Thorong La Pass: Sub-zero advisory (-14°C) • Heli Evacuation: On Standby
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>24/7 SOS: +977-1-4412345</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Operations: Online</span>
          </div>
        </div>
      </div>

      {/* Main App Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Organization Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-sky-700 flex items-center justify-center shadow-lg shadow-amber-900/20 ring-2 ring-amber-500/30">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Himalayan peak & safety shield icon */}
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M7 14l3.5-4.5L13 12l4-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-serif">
                HIMALAYAN GUARDIAN
              </span>
              <span className="bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                NEPAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              Marketing Automation Platform • HGN Marketing Hub
            </p>
          </div>
        </div>

        {/* Action Controls & User Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick AI Generator Launch */}
          <button
            onClick={() => setActiveModule('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>AI Content Generator</span>
          </button>

          {/* User Profile / Logout Action */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                {(currentUser?.name || 'H')[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <div className="font-semibold text-xs text-slate-200 truncate max-w-[140px]">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                showToast('Logged out of HGN Marketing Hub.');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 border border-slate-700 hover:border-red-800/60 text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
