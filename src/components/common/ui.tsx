import React from 'react';

export const inputCls =
  'w-full bg-deep border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; busy?: boolean };

export const Btn: React.FC<BtnProps> = ({ variant = 'ghost', busy, className = '', children, disabled, ...rest }) => {
  const styles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30',
    ghost: 'bg-raised hover:bg-zinc-850 text-zinc-200 border-zinc-800',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30',
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {busy && <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ title?: React.ReactNode; actions?: React.ReactNode; className?: string; children: React.ReactNode }> = ({
  title, actions, className = '', children,
}) => (
  <section className={`bg-surface border border-zinc-800/80 rounded-xl ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
        <h3 className="text-xs font-semibold text-zinc-200 tracking-wide">{title}</h3>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </section>
);

export const Label: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <label className="block">
    <span className="block text-[11px] font-medium text-zinc-400 mb-1">{children}</span>
    {hint && <span className="block text-[10px] text-zinc-600 -mt-0.5 mb-1">{hint}</span>}
  </label>
);

export const PageTitle: React.FC<{ title: string; sub?: string; actions?: React.ReactNode }> = ({ title, sub, actions }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-xl font-semibold text-zinc-50 tracking-tight">{title}</h1>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
    <div className="flex items-center gap-2 shrink-0">{actions}</div>
  </div>
);

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const c =
    status === 'Published' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
    : status === 'Scheduled' ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
    : status === 'Approved' ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'
    : 'text-zinc-400 bg-zinc-850 border-zinc-800';
  return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${c}`}>{status}</span>;
};

export const toLocalInput = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date(Date.now() + 3600_000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
