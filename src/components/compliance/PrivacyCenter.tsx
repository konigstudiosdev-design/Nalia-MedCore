import React, { useState } from 'react';
import { ChevronLeft, Eye, Shield, UserCheck, FileText, Database, Scale, Trash2, Clock, AlertTriangle, CheckCircle2, Plus, X } from 'lucide-react';

interface PrivacyCenterProps {
  onBack: () => void;
}

const INITIAL_ARCO = [
  { id: '1', patient: 'Juan Pérez', type: 'Acceso', date: '2026-08-25', status: 'pending', description: 'Solicita copia de su expediente clínico completo.' },
  { id: '2', patient: 'María García', type: 'Rectificación', date: '2026-08-20', status: 'completed', description: 'Corrección de fecha de nacimiento en perfil.' },
];

export function PrivacyCenter({ onBack }: PrivacyCenterProps) {
  const [activeTab, setActiveTab] = useState<'arco' | 'lifecycle' | 'notices'>('arco');
  const [arcoRequests, setArcoRequests] = useState(INITIAL_ARCO);
  const [isAddingArco, setIsAddingArco] = useState(false);
  const [newArco, setNewArco] = useState({ patient: '', type: 'Acceso', description: '' });

  const handleAddArco = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArco.patient) return;

    const request = {
      id: Math.random().toString(36).substr(2, 9),
      ...newArco,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setArcoRequests([request, ...arcoRequests]);
    setIsAddingArco(false);
    setNewArco({ patient: '', type: 'Acceso', description: '' });
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-left-4 duration-300 bg-zinc-50/50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft size={20}/>
          </button>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Eye size={20} className="text-indigo-500" /> Privacy Center
          </h2>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6 pt-4 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex gap-8 max-w-6xl mx-auto w-full">
          {[
            { id: 'arco', label: 'Solicitudes ARCO', icon: <UserCheck size={16}/> },
            { id: 'lifecycle', label: 'Ciclo de Vida de Datos', icon: <Database size={16}/> },
            { id: 'notices', label: 'Avisos de Privacidad', icon: <Scale size={16}/> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">

        {activeTab === 'arco' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black mb-1">Derechos ARCO</h3>
                   <p className="text-sm text-zinc-500 font-medium">Gestión de solicitudes de Acceso, Rectificación, Cancelación y Oposición.</p>
                </div>
                <button
                  onClick={() => setIsAddingArco(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={16}/> Nueva Solicitud
                </button>
             </div>

             {isAddingArco && (
               <div className="bg-white dark:bg-zinc-900 border border-indigo-500/30 rounded-3xl p-6 animate-in zoom-in-95 duration-300">
                  <form onSubmit={handleAddArco} className="space-y-4">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-sm uppercase tracking-widest text-indigo-600">Registrar Solicitud</h4>
                        <button type="button" onClick={() => setIsAddingArco(false)}><X size={18} className="text-zinc-400"/></button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nombre del Paciente"
                          required
                          value={newArco.patient}
                          onChange={e => setNewArco({...newArco, patient: e.target.value})}
                          className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <select
                          value={newArco.type}
                          onChange={e => setNewArco({...newArco, type: e.target.value})}
                          className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                           <option>Acceso</option>
                           <option>Rectificación</option>
                           <option>Cancelación</option>
                           <option>Oposición</option>
                        </select>
                     </div>
                     <textarea
                        placeholder="Descripción detallada de la solicitud..."
                        required
                        value={newArco.description}
                        onChange={e => setNewArco({...newArco, description: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                     ></textarea>
                     <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Guardar Solicitud</button>
                  </form>
               </div>
             )}

             <div className="space-y-4">
                {arcoRequests.length === 0 ? (
                  <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-12 text-center">
                       <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[28px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6">
                          <UserCheck size={32} className="text-zinc-300" />
                       </div>
                       <h4 className="text-lg font-black mb-2">No hay solicitudes pendientes</h4>
                    </div>
                  </div>
                ) : (
                  arcoRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600"><UserCheck size={20}/></div>
                             <div>
                                <h4 className="font-black text-sm">{req.patient}</h4>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{req.date}</span>
                             </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {req.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                       </div>
                       <div className="flex gap-4 items-center">
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-black uppercase text-zinc-500">{req.type}</span>
                          <p className="text-xs text-zinc-500 font-medium">{req.description}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div>
                <h3 className="text-xl font-black mb-1">Data Lifecycle Management</h3>
                <p className="text-sm text-zinc-500 font-medium">Políticas de retención, archivo y eliminación segura de información clínica.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { type: 'Expedientes Clínicos', period: '5 años', event: 'Última consulta', status: 'Activo', icon: <FileText className="text-indigo-500"/> },
                  { type: 'Recetas Médicas', period: '3 años', event: 'Fecha de emisión', status: 'Activo', icon: <FileText className="text-emerald-500"/> },
                  { type: 'Logs de Auditoría', period: '1 año', event: 'Creación del log', status: 'Inmutable', icon: <Clock className="text-amber-500"/> },
                  { type: 'Archivos de Imagen', period: '10 años', event: 'Fecha de estudio', status: 'Archivado', icon: <Database className="text-indigo-500"/> },
                ].map((policy, i) => (
                  <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/30 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                           {policy.icon}
                        </div>
                        <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                           {policy.status}
                        </div>
                     </div>
                     <h4 className="font-black text-lg mb-4">{policy.type}</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-zinc-400 font-medium">Periodo:</span>
                           <span className="font-bold text-zinc-900 dark:text-zinc-100">{policy.period}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-zinc-400 font-medium">Evento Inicial:</span>
                           <span className="font-bold text-zinc-900 dark:text-zinc-100">{policy.event}</span>
                        </div>
                     </div>
                     <button className="w-full mt-6 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Configurar Política</button>
                  </div>
                ))}
             </div>

             <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-[32px] flex items-start gap-5">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                   <Trash2 size={24}/>
                </div>
                <div>
                   <h4 className="font-black text-red-700 dark:text-red-400 mb-1">Eliminación Segura (Data Shredding)</h4>
                   <p className="text-xs text-red-600/80 dark:text-red-400/60 font-medium leading-relaxed max-w-2xl">Al vencer el periodo de retención, los datos son eliminados mediante un proceso de sobreescritura irreversible cumpliendo con estándares internacionales de seguridad de la información.</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black mb-1">Avisos de Privacidad</h3>
                   <p className="text-sm text-zinc-500 font-medium">Control de versiones y publicación de términos legales y avisos de privacidad.</p>
                </div>
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">Gestionar Plantillas</button>
             </div>

             <div className="space-y-4">
                {[
                  { title: 'Aviso de Privacidad Integral', version: 'v2.4', date: '15 Ago 2026', status: 'Vigente' },
                  { title: 'Aviso de Privacidad Simplificado', version: 'v1.8', date: '01 Ene 2026', status: 'Vigente' },
                  { title: 'Términos y Condiciones de Uso (SaaS)', version: 'v3.1', date: '20 May 2026', status: 'Vigente' },
                ].map((notice, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl group hover:shadow-md transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                           <FileText size={20}/>
                        </div>
                        <div>
                           <div className="font-black text-zinc-900 dark:text-zinc-100">{notice.title}</div>
                           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Publicado: {notice.date} • Versión: {notice.version}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600">
                           {notice.status}
                        </span>
                        <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"><Eye size={20}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
