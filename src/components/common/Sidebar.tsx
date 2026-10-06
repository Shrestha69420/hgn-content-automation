import React from 'react';
import { useApp, ActiveModule } from '../../context/AppContext';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  Award,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  Globe
} from 'lucide-react';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, posts, campaigns } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Target,
      badge: campaigns.filter(c => c.status === 'Active').length || undefined,
    },
    {
      id: 'generator',
      label: 'AI Generator',
      icon: Sparkles,
    },
    {
      id: 'quality-score',
      label: 'Quality Scorer',
      icon: Award,
    },
    {
      id: 'library',
      label: 'Content Library',
      icon: Layers,
      badge: posts.length || undefined,
    },
    {
      id: 'calendar',
      label: 'Editorial Calendar',
      icon: Calendar,
      badge: posts.filter(p => p.status === 'Scheduled').length || undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-56 bg-surface border-r border-zinc-800/80 flex flex-col shrink-0 min-h-[calc(100vh-56px)] select-none">
      <div className="px-3 pt-4 pb-2">
        <p className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          Workspace
        </p>
      </div>

      <nav className="px-2 space-y-0.5 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-100 border-l-2 border-indigo-500 font-medium shadow-[inset_0_0_12px_rgba(43,181,166,0.06)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-zinc-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'text-indigo-300 bg-indigo-500/20'
                      : 'text-zinc-500 bg-zinc-850'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-zinc-850/80">
          <p className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider font-mono">
            Public View
          </p>
          <button
            onClick={() => setActiveModule('landing')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              activeModule === 'landing'
                ? 'bg-indigo-500/10 text-indigo-100 border-l-2 border-indigo-500 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Globe
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeModule === 'landing' ? 'text-indigo-400' : 'text-zinc-500'
                }`}
              />
              <span className="truncate">Product Landing</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">Preview</span>
          </button>
        </div>
      </nav>

      {/* Subtle Telemetry Footer */}
      <div className="p-3 border-t border-zinc-850/80 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(43,181,166,0.6)]" />
          <span className="font-mono text-xs text-zinc-400">Campaign Flow</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-600">v2.4</span>
      </div>
    </aside>
  );
};
