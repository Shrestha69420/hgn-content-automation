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
  Circle
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
    <aside className="w-56 bg-[#0E1013] border-r border-zinc-800/80 flex flex-col shrink-0 min-h-[calc(100vh-56px)] select-none">
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
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-zinc-800/90 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-zinc-200' : 'text-zinc-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subtle Telemetry Footer */}
      <div className="p-3 border-t border-zinc-850/80 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Dispatch Grid</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-600">v2.4</span>
      </div>
    </aside>
  );
};
