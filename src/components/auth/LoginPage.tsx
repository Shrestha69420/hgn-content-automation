import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Lock, Mail, User, Shield } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSuccess }) => {
  const { login, createAccount } = useAuth();
  const handleRedirect = onLoginSuccess || onSuccess;

  // Mode: 'login' or 'create-account'
  const [mode, setMode] = useState<'login' | 'create-account'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Create Account form state
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch between Login and Create Account
  const switchMode = (newMode: 'login' | 'create-account') => {
    setErrorMessage(null);
    setMode(newMode);
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = login(loginEmail, loginPassword);
    if (res.success) {
      if (handleRedirect) handleRedirect();
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  // Handle Create Account submission
  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = createAccount(fullName, registerEmail, registerPassword, confirmPassword);
    if (res.success) {
      if (handleRedirect) handleRedirect();
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Mountain Ambience Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-900/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-amber-600/10 blur-[130px]" />
      </div>

      {/* Top Header Branding */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-slate-900 bg-slate-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-sky-700 flex items-center justify-center shadow-md shadow-amber-950/30">
            <svg
              className="w-5 h-5 text-white"
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
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-serif">
                HIMALAYAN GUARDIAN
              </span>
              <span className="bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                NEPAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              HGN Marketing Hub
            </p>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center mx-auto shadow-lg mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {mode === 'login'
                ? 'Sign in to access your HGN Marketing Hub'
                : 'Register for Himalayan Guardian Nepal Marketing Hub'}
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer"
                >
                  Login
                </button>
              </div>

              <div className="text-center pt-3 border-t border-slate-800/80">
                <p className="text-slate-400 text-xs">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('create-account')}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* CREATE ACCOUNT FORM */}
          {mode === 'create-account' && (
            <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={e => setRegisterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer"
                >
                  Create Account
                </button>
              </div>

              <div className="text-center pt-3 border-t border-slate-800/80">
                <p className="text-slate-400 text-xs">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full py-4 text-center text-slate-500 text-[11px] font-mono border-t border-slate-900">
        Himalayan Guardian Nepal • Marketing Content Automation & Social Media Management
      </footer>
    </div>
  );
};
