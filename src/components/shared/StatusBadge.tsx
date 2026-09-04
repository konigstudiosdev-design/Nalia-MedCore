import React from 'react';
import { CheckCircle2, Clock, Activity, CreditCard, ShieldCheck, XCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'finished':
    case 'paid':
      return (
        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
          <CheckCircle2 size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">{status === 'paid' ? 'Pagado' : 'Finalizada'}</span>
        </div>
      );
    case 'ready':
      return (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg animate-pulse">
          <ShieldCheck size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">Listo</span>
        </div>
      );
    case 'in_consultation':
    case 'in_assessment':
      return (
        <div className="flex items-center gap-1 text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
          <Activity size={12} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{status === 'in_consultation' ? 'En Consulta' : 'En Valoración'}</span>
        </div>
      );
    case 'waiting':
    case 'arrived':
      return (
        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
          <Clock size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">{status === 'arrived' ? 'Llegó' : 'En Espera'}</span>
        </div>
      );
    case 'pending_payment':
      return (
        <div className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg">
          <CreditCard size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">Cobrar</span>
        </div>
      );
    case 'cancelled':
    case 'no_show':
      return (
        <div className="flex items-center gap-1 text-rose-600 bg-rose-600/10 px-2 py-0.5 rounded-lg">
          <XCircle size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">{status === 'no_show' ? 'No asistió' : 'Cancelada'}</span>
        </div>
      );
    case 'confirmed':
      return (
        <div className="flex items-center gap-1 text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Confirmada</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      );
  }
}
