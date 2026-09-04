import React, { useState } from 'react';
import { Activity, Bell, CheckCircle2, HeartPulse, UserCheck, Zap, Thermometer, FileSpreadsheet } from 'lucide-react';
import { NursingRequest, AgendaItem, VitalSigns } from '../../../types';
import { KPICard } from '../KPICard';
import { PatientPrep } from '../../enfermeria/PatientPrep';

interface NurseDashboardProps {
  requests: NursingRequest[];
  onUpdateStatus: (id: string, status: string, data?: any) => void;
  onSaveVitals?: (appointmentId: string, vitals: VitalSigns) => void;
  navigateTo: (moduleId: string) => void;
}

export function NurseDashboard({ requests, onUpdateStatus, onSaveVitals, navigateTo }: NurseDashboardProps) {
  const [activePrepRequest, setActivePrepRequest] = useState<NursingRequest | null>(null);

  const newRequests = requests.filter(r => r.status === 'requested');
  const inProgress = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');
  const priorityRequests = requests.filter(r => r.priority === 'urgent' || r.priority === 'priority');
  const completedToday = requests.filter(r => r.status === 'completed');

  if (activePrepRequest) {
    const mockAppointment: AgendaItem = {
      id: activePrepRequest.appointmentId || activePrepRequest.id,
      organizationId: activePrepRequest.organizationId,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 30,
      patientId: activePrepRequest.patientId,
      patientName: activePrepRequest.patientName,
      doctorId: activePrepRequest.doctorId,
      serviceId: 'prep',
      type: 'consulta',
      status: 'waiting'
    };

    return (
      <PatientPrep
        appointment={mockAppointment}
        onSaveVitals={(id, vitals) => {
          if (onSaveVitals && activePrepRequest.appointmentId) {
            onSaveVitals(activePrepRequest.appointmentId, vitals);
          }
          onUpdateStatus(activePrepRequest.id, 'completed', { resultData: vitals });
          setActivePrepRequest(null);
        }}
        onBack={() => setActivePrepRequest(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Solicitudes Nuevas" value={newRequests.length.toString()} trend="Pendientes" icon={<Bell className="text-amber-500"/>} alert={newRequests.length > 0} />
        <KPICard title="En Proceso" value={inProgress.length.toString()} trend="Activas" icon={<Activity className="text-indigo-500"/>} />
        <KPICard title="Prioritarias" value={priorityRequests.filter(r => r.status !== 'completed').length.toString()} trend="Urgencia" icon={<Zap className="text-rose-500"/>} alert={priorityRequests.length > 0} />
        <KPICard title="Completadas Hoy" value={completedToday.length.toString()} trend="Finalizadas" icon={<CheckCircle2 className="text-emerald-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Requests List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0A0A0A]">
            <h3 className="font-black text-lg flex items-center gap-2">
               <HeartPulse size={20} className="text-rose-500"/> Centro de Solicitudes
            </h3>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Panel de Apoyo Médico</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length === 0 ? (
              <div className="p-20 text-center text-zinc-400">
                 <Activity size={48} className="mx-auto mb-4 opacity-10"/>
                 <p className="font-bold text-sm">No hay solicitudes de apoyo pendientes</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(req => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                    <div className="flex items-center gap-5">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${req.priority === 'urgent' ? 'bg-rose-600 text-white animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                          {req.patientName.charAt(0)}
                       </div>
                       <div>
                          <div className="font-black text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                             {req.patientName}
                             {req.priority === 'urgent' && <span className="px-2 py-0.5 bg-rose-500 text-white text-[7px] uppercase tracking-widest rounded-full">Urgente</span>}
                          </div>
                          <div className="flex flex-col mt-1">
                             <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">{req.type}</div>
                             <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Solicitado por: Dr. {req.doctorName}</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {req.status === 'requested' ? (
                          <button
                            onClick={() => onUpdateStatus(req.id, 'accepted')}
                            className="px-6 py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                          >
                            Aceptar Solicitud
                          </button>
                       ) : (
                          <div className="flex items-center gap-2">
                             {(req.type === 'vitals' || req.type === 'preparation') && (
                                <button
                                  onClick={() => setActivePrepRequest(req)}
                                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                >
                                  <HeartPulse size={16}/> Capturar Signos
                                </button>
                             )}
                             <button
                               onClick={() => onUpdateStatus(req.id, 'completed')}
                               className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                             >
                               Marcar Completada
                             </button>
                          </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priorities and Summary */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2"><UserCheck size={20} className="text-emerald-500"/> Recientes Hoy</h3>
              <div className="space-y-4">
                 {completedToday.length === 0 ? (
                   <p className="text-center py-10 text-xs font-bold text-zinc-400 uppercase tracking-widest">Sin tareas finalizadas hoy</p>
                 ) : (
                   completedToday.slice(0, 5).map(req => (
                     <div key={req.id} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between">
                        <div>
                           <div className="font-black text-sm text-emerald-900 dark:text-emerald-400">{req.patientName}</div>
                           <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mt-0.5">{req.type} finalizado</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16}/></div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
