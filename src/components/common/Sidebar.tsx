import React from 'react';
import { LayoutDashboard, PenTool, Layers, Palette } from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

export const NAV_ITEMS: { id: ActiveModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'studio', label: 'Studio', icon: PenTool },
  { id: 'library', label: 'Library', icon: Layers },
  { id: 'brands', label: 'Brands', icon: Palette },
];

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, brandPosts } = useApp();
  const badge = (id: ActiveModule) =>
    id === 'library' ? brandPosts.length || undefined : undefined;

  return (
    <aside className="w-52 bg-surface border-r border-zinc-800/80 flex flex-col shrink-0 min-h-[calc(100vh-56px)] select-none">
      <nav className="px-2 pt-4 space-y-0.5 flex-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <button key={item.id} onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition cursor-pointer ${active ? 'bg-indigo-500/10 text-indigo-100 border-l-2 border-indigo-500 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'}`}>
              <span className="flex items-center gap-2.5"><Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />{item.label}</span>
              {badge(item.id) !== undefined && <span className="text-[10px] font-mono text-zinc-500">{badge(item.id)}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
