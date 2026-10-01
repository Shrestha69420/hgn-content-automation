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
  Radio
} from 'lucide-react';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, posts, campaigns } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: Target,
      badge: `${campaigns.filter(c => c.status === 'Active').length} Active`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'generator',
      label: 'AI Content Generator',
      icon: Sparkles,
      badge: 'Assisted',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'quality-score',
      label: 'Content Quality',
      icon: Award,
      badge: 'Standards',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      highlight: true,
    },
    {
      id: 'library',
      label: 'Content Library',
      icon: Layers,
      badge: `${posts.length}`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'calendar',
      label: 'Content Calendar',
      icon: Calendar,
      badge: `${posts.filter(p => p.status === 'Scheduled').length} Queue`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-68px)]">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-800/80">
        <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-mono">
          Marketing Modules
        </p>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
              } ${item.highlight && !isActive ? 'ring-1 ring-cyan-500/20 bg-cyan-950/20 text-cyan-200' : ''}`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-amber-400'
                      : item.highlight
                      ? 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operations Status in Sidebar Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 m-2 rounded-xl">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-emerald-300">
              Operations Center
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Kathmandu Dispatch & Social Media Telemetry Active.
            </p>
          </div>
        </div>
      </div>

      {/* Organization Footer Tag */}
      <div className="p-3 text-[10px] text-slate-500 font-mono text-center border-t border-slate-800/60">
        Himalayan Guardian Nepal • HGN Marketing Hub
      </div>
    </aside>
  );
};
