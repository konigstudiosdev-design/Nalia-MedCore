import React, { useState } from 'react';
import { Clock, ShieldAlert, Lock, ArrowRight, ShoppingCart, Sparkles, ExternalLink, X } from 'lucide-react';
import { TrialStatus } from '../../lib/trialService';

interface TrialBannerProps {
  trialStatus: TrialStatus | null;
}

export function TrialBanner({ trialStatus }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!trialStatus) return null;

  // SI LA PRUEBA HA EXPIRADO POR COMPLETO (BLOQUEO TOTAL)
  if (trialStatus.isExpired) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 font-sans animate-in fade-in duration-500">
        <div className="max-w-xl w-full bg-[#121212] border border-brand-500/30 rounded-[40px] p-8 md:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
            <Lock size={40} />
          </div>

          <div className="space-y-3">
             <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                Periodo de Prueba Finalizado
             </span>
             <h2 className="text-3xl font-black tracking-tight text-white">Tu Prueba Gratuita de 15 Días ha Concluido</h2>
             <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-md mx-auto">
                El acceso gratuito para tu dirección IP (<span className="font-mono text-white font-bold">{trialStatus.ip}</span>) ha expirado. Adquiere tu licencia definitiva para continuar usando Nalia MedCore.
             </p>
          </div>

          <div className="space-y-4 pt-2">
             <a
               href="/#comprar"
               className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
             >
                <ShoppingCart size={18}/> Comprar Licencia del Sistema
             </a>
             <a
               href="/#demostracion"
               className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest border border-zinc-800 transition-all flex items-center justify-center gap-2"
             >
                Ver Ventajas y Planes
             </a>
          </div>

          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Control de Seguridad de IP • Nalia Technologies 2026</p>
        </div>
      </div>
    );
  }

  // SI LA PRUEBA SIGUE ACTIVA (BANNER FLOTANTE DE CONTEO)
  if (isDismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[80] max-w-2xl w-[92%] bg-gradient-to-r from-brand-900/90 via-[#121212]/95 to-brand-950/90 backdrop-blur-xl border border-brand-500/30 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 border border-brand-500/30">
          <Clock size={16} className="animate-pulse text-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-white truncate">Prueba Gratuita Activa</span>
             <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase hidden md:inline">({trialStatus.ip})</span>
          </div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate">
             Quedan {trialStatus.daysRemaining} días y {trialStatus.hoursRemaining} horas de acceso
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/#comprar"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
        >
          <Sparkles size={12}/> Comprar Licencia
        </a>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Ocultar aviso"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
