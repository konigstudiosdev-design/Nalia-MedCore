import React from 'react';
import {
  Users, Stethoscope, Clock, FileSearch, Sparkles, Play, CheckCircle2,
  ChevronRight, Activity, Zap, History, UserPlus, TrendingUp
} from 'lucide-react';
import { AgendaItem, Patient, NursingRequest } from '../../../types';
import { KPICard } from '../KPICard';

interface DoctorDashboardProps {
  agenda: AgendaItem[];
  patients: Patient[];
  nursingRequests: NursingRequest[];
  onStartConsultation: (id: string) => void;
  navigateTo: (moduleId: string) => void;
}

export function DoctorDashboard({ agenda, patients, nursingRequests, onStartConsultation, navigateTo }: DoctorDashboardProps) {
  const readyForConsultation = agenda.filter(a => a.status === 'waiting');
  const inConsultation = agenda.filter(a => a.status === 'in_consultation');
  const activeRequests = nursingRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const finishedToday = agenda.filter(a => a.status === 'finished' || a.status === 'pending_payment' || a.status === 'paid');

  const getWaitTime = (arrivalIso?: string) => {
    if (!arrivalIso) return 0;
    return Math.floor((new Date().getTime() - new Date(arrivalIso).getTime()) / 60000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* KPI Section with Advanced Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Sala de Espera"
          value={readyForConsultation.length.toString()}
          trend={`${readyForConsultation.length > 2 ? 'Alta Demanda' : 'Estable'}`}
          icon={<Activity className="text-emerald-500"/>}
          alert={readyForConsultation.length > 3}
        />
        <KPICard
          title="Consultas de Hoy"
          value={agenda.length.toString()}
          trend="En agenda"
          icon={<Users className="text-indigo-500"/>}
        />
        <KPICard
          title="Apoyo Activo"
          value={activeRequests.length.toString()}
          trend="Tareas pendientes"
          icon={<Zap className="text-amber-500"/>}
          alert={activeRequests.some(r => r.priority === 'urgent')}
        />
        <KPICard
          title="Efectividad"
          value={agenda.length > 0 ? `${Math.round((finishedToday.length / agenda.length) * 100)}%` : '0%'}
          trend="Pacientes atendidos"
          icon={<CheckCircle2 className="text-zinc-500"/>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Work Area: Waiting Room & Active Cases */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[40px] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-[#0A0A0A]">
              <div>
                 <h3 className="font-black text-2xl flex items-center gap-3">
                    <Users size={28} className="text-indigo-600"/> Gestión de Pacientes
                 </h3>
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Sala de espera y atención en curso</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => navigateTo('agenda')} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Ver Agenda Full</button>
              </div>
            </div>

            <div className="flex-1 p-6 md:p-8">
              {readyForConsultation.length === 0 && inConsultation.length === 0 ? (
                <div className="py-24 text-center">
                   <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Clock size={40} className="text-zinc-300" />
                   </div>
                   <h4 className="text-xl font-black mb-2 text-zinc-900 dark:text-zinc-100">Sin pacientes en espera</h4>
                   <p className="text-sm text-zinc-500 max-w-sm mx-auto font-medium">Todo está bajo control. Recepción notificará aquí cuando un paciente confirme su llegada.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* ACTIVE CONSULTATION - HERO CARD */}
                  {inConsultation.map(apt => (
                    <div key={apt.id} className="p-10 bg-indigo-600 rounded-[40px] text-white shadow-2xl shadow-indigo-600/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group border border-indigo-400/20">
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-2">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Paciente en Consultorio</span>
                             </div>
                          </div>
                          <h4 className="text-4xl font-black tracking-tight mb-2">{apt.patientName}</h4>
                          <p className="text-indigo-100 text-lg font-medium opacity-90">{apt.type} • Dr. Propietario</p>
                       </div>
                       <button
                         onClick={() => onStartConsultation(apt.id)}
                         className="relative z-10 px-10 py-5 bg-white text-indigo-600 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                       >
                         <Play size={20} fill="currentColor"/> Abrir Expediente
                       </button>
                       <Stethoscope size={200} className="absolute -bottom-16 -right-16 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"/>
                    </div>
                  ))}

                  {/* WAITING QUEUE */}
                  {readyForConsultation.length > 0 && (
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Siguientes en la fila</h5>
                       {readyForConsultation.map(apt => {
                         const wait = getWaitTime(apt.arrivalTimestamp);
                         return (
                           <div key={apt.id} className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="w-16 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-xl text-indigo-600 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                    {apt.patientName.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-black text-xl text-zinc-900 dark:text-zinc-50">{apt.patientName}</div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                       <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${wait > 15 ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                          <Clock size={14}/>
                                          <span className="text-[10px] font-black uppercase tracking-widest">Espera: {wait} min</span>
                                       </div>
                                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{apt.time} • {apt.type}</span>
                                       {apt.hasNursingRequest && (
                                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">Signos Listos</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <button
                                onClick={() => onStartConsultation(apt.id)}
                                className="px-8 py-4 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                <Play size={16}/> Iniciar Atención
                              </button>
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RECENT PATIENTS / HISTORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-lg flex items-center gap-2"><History size={20} className="text-zinc-400"/> Atenciones Recientes</h3>
                   <button onClick={() => navigateTo('pacientes')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Todos</button>
                </div>
                <div className="space-y-4">
                   {finishedToday.length === 0 ? (
                      <p className="text-xs font-bold text-zinc-400 text-center py-6 italic">No has finalizado consultas hoy</p>
                   ) : (
                      finishedToday.slice(0, 3).map(apt => (
                         <div
                           key={apt.id}
                           onClick={() => navigateTo('pacientes')}
                           className="flex items-center justify-between group cursor-pointer p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition-colors"
                         >
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-400">{apt.patientName.charAt(0)}</div>
                               <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{apt.patientName}</span>
                            </div>
                            <ChevronRight size={14} className="text-zinc-300 group-hover:translate-x-1 transition-transform"/>
                         </div>
                      ))
                   )}
                </div>
             </div>

             <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-lg flex items-center gap-2"><TrendingUp size={20} className="text-emerald-500"/> Meta de Hoy</h3>
                   <span className="text-[10px] font-black text-emerald-600">{finishedToday.length}/10</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min((finishedToday.length / 10) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">Estás a {Math.max(10 - finishedToday.length, 0)} consultas de alcanzar tu meta diaria de productividad clínica.</p>
             </div>
          </div>
        </div>

        {/* Sidebar: Nursing & AI Alerts */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-xl flex items-center gap-3">
                    <Zap size={24} className="text-amber-500"/> Soporte Vivo
                 </h3>
                 <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest">{activeRequests.length} ACTIVAS</span>
              </div>

              <div className="space-y-5">
                 {activeRequests.length === 0 ? (
                   <div className="text-center py-10">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-200">
                         <Zap size={20}/>
                      </div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sin solicitudes en curso</p>
                   </div>
                 ) : (
                   activeRequests.map(req => (
                     <div key={req.id} className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-[28px] border border-zinc-100 dark:border-zinc-800 hover:border-amber-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                           <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${req.status === 'requested' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600 animate-pulse'}`}>
                              {req.status === 'requested' ? 'Solicitada' : 'En Proceso'}
                           </span>
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{req.type}</span>
                        </div>
                        <div className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1">{req.patientName}</div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{req.notes || 'Sin instrucciones adicionales'}</p>
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black">E</div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{req.nurseName || 'Por asignar'}</span>
                           </div>
                           <span className="text-[9px] font-black text-indigo-600 uppercase">
                              {req.status === 'completed' ? 'Completado' : 'En proceso'}
                           </span>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* AI INSIGHT CARD - Rediseñada */}
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                      <Sparkles size={20} className="text-indigo-200"/>
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-100">MedCore Intelligence</span>
                </div>
                <h4 className="text-2xl font-black mb-4 leading-tight">Insight de Operación Clínica</h4>
                <p className="text-sm text-indigo-100 leading-relaxed opacity-90 font-medium">Hoy has atendido un 20% más rápido de lo habitual. La rinitis alérgica sigue siendo la tendencia principal del día.</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                      <div className="text-[9px] font-black text-indigo-200 uppercase mb-1">Diagnóstico Top</div>
                      <div className="text-xs font-black">Rinitis Alérgica</div>
                   </div>
                   <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
                      <div className="text-[9px] font-black text-indigo-200 uppercase mb-1">Tiempo Prom.</div>
                      <div className="text-xs font-black">18 min / pac</div>
                   </div>
                </div>
                <button className="mt-8 w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-50 active:scale-95 shadow-xl">Análisis Predictivo Completo</button>
              </div>
              <Sparkles size={240} className="absolute -bottom-20 -right-20 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-[2000ms]"/>
           </div>
        </div>
      </div>
    </div>
  );
}
