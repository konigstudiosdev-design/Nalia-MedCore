import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  alert?: boolean;
}

export function KPICard({ title, value, trend, trendUp, icon, alert }: KPICardProps) {
  return (
    <div className={`bg-white dark:bg-[#121212] border rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-shadow hover:shadow-md ${alert ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10 dark:bg-amber-900/5' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl border ${alert ? 'bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800'}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{title}</span>
      </div>
      <div>
        <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono mb-1">{value}</div>
        <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-600 dark:text-emerald-500' : alert ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-500'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}
