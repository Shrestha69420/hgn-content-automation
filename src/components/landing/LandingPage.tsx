import React, { useState } from 'react';
import { FileText, Search, Image as ImageIcon, CalendarClock, FolderOutput, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { Logo } from '../common/Logo';
import { Watermark } from '../common/Watermark';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LoginPage } from '../auth/LoginPage';

const STEPS = [
  { icon: Search, title: 'Know what to post', text: 'Gemini searches the live web for current news and trends, and tells you what to avoid right now.' },
  { icon: FileText, title: 'Concept and caption', text: 'A design concept, caption, hashtags and slide copy written in your brand voice.' },
  { icon: ImageIcon, title: 'Editable carousels', text: 'AI backgrounds with real, editable text layers. Move, restyle and export every slide as PNG.' },
  { icon: CalendarClock, title: 'Approve and schedule', text: 'Pick a time. Approved posts publish themselves.' },
  { icon: FolderOutput, title: 'Always a fallback', text: 'Each post is saved to a dated folder with its images and caption, ready to upload by hand.' },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setActiveModule } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin && !isAuthenticated) return <LoginPage onSuccess={() => setActiveModule('overview')} />;

  return (
    <div className="relative overflow-hidden min-h-screen bg-page text-zinc-100 font-sans">
      <Watermark className="absolute -right-40 top-10 w-[46rem] text-indigo-400 opacity-[0.07]" />
      <header className="relative max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Logo size={30} />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => (isAuthenticated ? setActiveModule('overview') : setShowLogin(true))}
            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer">
            {isAuthenticated ? 'Open app' : 'Sign in'}
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 pt-16 pb-20">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-50 max-w-3xl leading-tight">
          Social content for any brand, researched, designed and scheduled by AI.
        </h1>
        <p className="mt-5 text-zinc-400 max-w-2xl">
          Set up a brand once. Campaign Flow finds what is worth posting today, builds the carousel and caption, lets you edit every detail, and publishes it on schedule.
        </p>
        <button onClick={() => (isAuthenticated ? setActiveModule('overview') : setShowLogin(true))}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium cursor-pointer">
          Get started <ArrowRight className="w-4 h-4" />
        </button>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {STEPS.map(s => (
            <div key={s.title} className="bg-surface border border-zinc-800/80 rounded-xl p-5">
              <s.icon className="w-5 h-5 text-indigo-400" />
              <h3 className="mt-3 text-sm font-semibold text-zinc-100">{s.title}</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
