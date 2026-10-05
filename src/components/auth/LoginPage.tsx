import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSuccess }) => {
  const { login, createAccount } = useAuth();
  const handleRedirect = onLoginSuccess || onSuccess;

  const [mode, setMode] = useState<'login' | 'create-account'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('marketing@himalayanguardian.org.np');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (newMode: 'login' | 'create-account') => {
    setErrorMessage(null);
    setMode(newMode);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        if (handleRedirect) handleRedirect();
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await createAccount(fullName, registerEmail, registerPassword, confirmPassword);
      if (res.success) {
        if (handleRedirect) handleRedirect();
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0C] text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-zinc-100 antialiased font-sans">
      {/* Top Subtle Nav */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
            <svg
              className="w-3.5 h-3.5 text-zinc-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M7 14l3.5-4.5L13 12l4-5" />
            </svg>
          </div>
          <span className="font-medium text-xs tracking-tight text-white">
            Himalayan Guardian Nepal
          </span>
        </div>

        <span className="text-[11px] font-mono text-zinc-500">
          Internal Operations
        </span>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {mode === 'login' ? 'Sign in to workspace' : 'Create authorized account'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'login'
                ? 'Marketing content automation & high-altitude dispatch'
                : 'Enter your credentials to access the safety publishing grid'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="name@himalayanguardian.org.np"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign in'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccountSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="Tenzing Sherpa"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="tenzing@himalayanguardian.org.np"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="Create password"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#121316] border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            {mode === 'login' ? (
              <button
                onClick={() => switchMode('create-account')}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                Need an account? <span className="underline underline-offset-4 text-zinc-300">Register</span>
              </button>
            ) : (
              <button
                onClick={() => switchMode('login')}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                Already registered? <span className="underline underline-offset-4 text-zinc-300">Sign in</span>
              </button>
            )}
          </div>

          {/* Preloaded Demo Credentials Hint */}
          <div className="pt-4 border-t border-zinc-850 text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              Demo: marketing@himalayanguardian.org.np / password123
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-zinc-850 text-center text-[11px] text-zinc-600 font-mono">
        © 2026 Himalayan Guardian Nepal • Safety Telemetry System
      </footer>
    </div>
  );
};
