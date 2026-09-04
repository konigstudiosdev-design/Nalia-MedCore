import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueData } from '../../types';

interface RevenueChartProps {
  data: RevenueData[];
  theme: 'light' | 'dark';
}

export function RevenueChart({ data, theme }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-zinc-400 text-center">
          <p className="font-bold">Sin datos de ingresos</p>
          <p className="text-sm">Los datos aparecerán cuando realices cobros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Ingresos de la Semana</h3>
          <p className="text-sm text-zinc-500 font-medium mt-0.5">Últimos 7 días operacionales</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="99%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#005f73" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#005f73" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e4e4e7'} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
            <Tooltip
              contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderRadius: '12px', border: '1px solid ' + (theme === 'dark' ? '#27272a' : '#e4e4e7'), boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#005f73', fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="ingresos" stroke="#005f73" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
