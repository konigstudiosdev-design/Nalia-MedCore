import React, { useState } from 'react';
import { ClipboardCheck, Activity, Bell, CheckCircle2, Zap, Clock, User, Filter, Search } from 'lucide-react';
import { NursingRequest } from '../../types';

interface NurseTasksViewProps {
  requests: NursingRequest[];
  onUpdateStatus: (id: string, status: string, data?: any) => void;
}

export function NurseTasksView({ requests = [], onUpdateStatus }: NurseTasksViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending') return r.status === 'requested';
    if (filter === 'active') return r.status === 'accepted' || r.status === 'in_progress';
    if (filter === 'completed') return r.status === 'completed';

    return r.status !== 'cancelled';
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                <ClipboardCheck size={24} />
             </div>
             Tareas y Procedimientos Asistenciales
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 ml-1">
             Centro de seguimiento de apoyo médico, aplicación de medicamentos y curaciones
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#121212] p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, médico o tipo de tarea..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'active', label: 'En Proceso' },
              { id: 'completed', label: 'Completadas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      {/* Requests Table / List */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
         <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
            {filteredRequests.length === 0 ? (
               <div className="p-20 text-center text-zinc-400">
                  <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20"/>
                  <p className="font-bold text-sm">No hay tareas que coincidan con el filtro</p>
               </div>
            ) : (
               filteredRequests.map(req => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${req.priority === 'urgent' ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                           {req.patientName.charAt(0)}
                        </div>
                        <div>
                           <div className="font-black text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                              {req.patientName}
                              {req.priority === 'urgent' && (
                                <span className="px-2 py-0.5 bg-rose-500 text-white text-[7px] uppercase tracking-widest rounded-full font-black">Urgente</span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : req.status === 'accepted' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                 {req.status === 'completed' ? 'Completado' : req.status === 'accepted' ? 'En Proceso' : 'Pendiente'}
                              </span>
                           </div>
                           <p className="text-xs text-zinc-500 font-medium mt-1">{req.notes || 'Sin instrucciones adicionales'}</p>
                           <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                              Tipo: {req.type} • Solicitado por: Dr. {req.doctorName}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        {req.status === 'requested' && (
                           <button
                             onClick={() => onUpdateStatus(req.id, 'accepted')}
                             className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                           >
                              Aceptar Tarea
                           </button>
                        )}
                        {(req.status === 'accepted' || req.status === 'in_progress') && (
                           <button
                             onClick={() => onUpdateStatus(req.id, 'completed')}
                             className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                           >
                              <CheckCircle2 size={16}/> Marcar Completada
                           </button>
                        )}
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}
