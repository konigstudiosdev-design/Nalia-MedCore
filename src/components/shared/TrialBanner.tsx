import React, { useState } from 'react';
import { Clock, Lock, ShoppingCart, Sparkles, X, ShieldCheck, CreditCard } from 'lucide-react';
import { SubscriptionStatus } from '../../lib/trialService';

interface TrialBannerProps {
  subscriptionStatus: SubscriptionStatus | null;
}

export function TrialBanner({ subscriptionStatus }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!subscriptionStatus) return null;

  // Si la organización ya cuenta con Licencia Activa / Paga
  if (subscriptionStatus.status === 'active') {
    return null;
  }

  // SI LA PRUEBA DE LA ORGANIZACIÓN HA EXPIRADO (BLOQUEO)
  if (subscriptionStatus.isExpired) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 font-sans animate-in fade-in duration-500">
        <div className="max-w-xl w-full bg-[#121212] border border-indigo-500/30 rounded-[40px] p-8 md:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
            <Lock size={40} />
          </div>

          <div className="space-y-3">
             <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                Periodo de Prueba Finalizado
             </span>
             <h2 className="text-3xl font-black tracking-tight text-white">Prueba Gratuita de 15 Días Concluida</h2>
             <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-md mx-auto">
                El acceso para la organización <span className="font-bold text-white">[{subscriptionStatus.organizationId}]</span> ha vencido. Adquiere una suscripción activa para desbloquear el expediente clínico y las funciones médicas.
             </p>
          </div>

          <div className="space-y-4 pt-2">
             <a
               href="#settings"
               onClick={(e) => {
                 e.preventDefault();
                 window.location.reload();
               }}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
             >
                <CreditCard size={18}/> Contratar Plan MedCore Pro
             </a>
          </div>

          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Aislamiento de Suscripción Multi-Tenant • Nalia MedCore 2026</p>
        </div>
      </div>
    );
  }

  // SI LA PRUEBA SIGUE ACTIVA (BANNER DE ALERTA DE DÍAS RESTANTES)
  if (isDismissed) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[80] max-w-2xl w-[92%] bg-gradient-to-r from-indigo-950/90 via-[#121212]/95 to-zinc-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
          <Clock size={16} className="animate-pulse text-emerald-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-white truncate">Prueba Gratuita - Plan {subscriptionStatus.plan.toUpperCase()}</span>
             <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Activo</span>
          </div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest truncate">
             Quedan {subscriptionStatus.daysRemaining} días y {subscriptionStatus.hoursRemaining} horas de prueba para tu clínica
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
