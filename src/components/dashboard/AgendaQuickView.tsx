import React from 'react';
import { AgendaItem } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface AgendaQuickViewProps {
  agenda: AgendaItem[];
}

export function AgendaQuickView({ agenda }: AgendaQuickViewProps) {
  return (
    <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center justify-between">
        Próximas Citas
        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Ver todas</button>
      </h3>
      <div className="space-y-4 flex-1">
        {agenda.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-8">
            <p className="text-sm font-medium">No hay citas para hoy</p>
          </div>
        ) : agenda.map(apt => (
          <div key={apt.id} className="flex gap-4 group cursor-pointer">
            <div className="w-12 text-center pt-1">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{apt.time}</span>
            </div>
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors active:scale-[0.98]">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{apt.patientName}</div>
              <div className="text-xs text-zinc-500 font-medium mt-0.5 flex justify-between">
                {apt.type}
                <StatusBadge status={apt.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
