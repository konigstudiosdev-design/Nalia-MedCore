import React, { useState } from 'react';
import { Shield, Eye, Lock, FileCheck, UserCheck, AlertTriangle, History, CheckCircle2, ChevronRight, Activity, Search, X } from 'lucide-react';
import { AuditCenter } from './AuditCenter';
import { PrivacyCenter } from './PrivacyCenter';

const INITIAL_MATRIX = [
  { id: 1, title: 'Expediente Clínico Electrónico', control: 'NOM-024-SSA3-2012', status: 'Implementado', color: 'emerald' },
  { id: 2, title: 'Protección de Datos Personales', control: 'LFPDPPP', status: 'En validación', color: 'amber' },
  { id: 3, title: 'Seguridad de la Información', control: 'ISO/IEC 27001 (Ref)', status: 'Diseñado', color: 'zinc' },
  { id: 4, title: 'Consentimientos Informados', control: 'NOM-004-SSA3-2012', status: 'Implementado', color: 'emerald' },
];

export function ComplianceCenter() {
  const [activeSubModule, setActiveSubModule] = useState<'dashboard' | 'audit' | 'privacy'>('dashboard');
  const [matrix, setMatrix] = useState(INITIAL_MATRIX);
  const [isLegalHoldActive, setIsLegalHoldActive] = useState(false);
  const [showLegalHoldModal, setShowLegalHoldModal] = useState(false);

  const toggleControlStatus = (id: number) => {
    setMatrix(prev => prev.map(item => {
      if (item.id === id) {
        const statuses: any = {
          'Diseñado': { status: 'En validación', color: 'amber' },
          'En validación': { status: 'Implementado', color: 'emerald' },
          'Implementado': { status: 'Diseñado', color: 'zinc' },
        };
        return { ...item, ...statuses[item.status] };
      }
      return item;
    }));
  };

  if (activeSubModule === 'audit') return <AuditCenter onBack={() => setActiveSubModule('dashboard')} />;
  if (activeSubModule === 'privacy') return <PrivacyCenter onBack={() => setActiveSubModule('dashboard')} />;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 bg-zinc-50/50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="p-6 md:p-8 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Trust & Compliance</h1>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Capa de Seguridad, Privacidad y Cumplimiento Legal</p>
            </div>
          </div>
          <div className="flex bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2 rounded-xl items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isLegalHoldActive ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
             <span className={`text-xs font-black uppercase tracking-widest ${isLegalHoldActive ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {isLegalHoldActive ? 'Legal Hold Activo' : 'Sistema Auditado'}
             </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Score de Cumplimiento', value: '94%', icon: <FileCheck className="text-emerald-500"/>, trend: '+2% este mes' },
             { label: 'Solicitudes ARCO', value: '2', icon: <UserCheck className="text-indigo-500"/>, trend: 'En revisión' },
             { label: 'Eventos de Seguridad', value: '0', icon: <AlertTriangle className="text-amber-500"/>, trend: 'Sin incidentes' },
             { label: 'Logs de Auditoría', value: '1,248', icon: <History className="text-zinc-500"/>, trend: 'Sincronizado' },
           ].map((kpi, i) => (
             <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between mb-4">
                   <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">{kpi.icon}</div>
                </div>
                <div className="text-3xl font-black mb-1">{kpi.value}</div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{kpi.label}</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase">{kpi.trend}</div>
             </div>
           ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Privacy Center Card */}
           <button
             onClick={() => setActiveSubModule('privacy')}
             className="group text-left bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm hover:border-indigo-500/50 transition-all active:scale-[0.99]"
           >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                  <Eye size={24}/>
                </div>
                <ChevronRight className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-black mb-2">Privacy Center</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">Gestión de avisos de privacidad, solicitudes de derechos ARCO y ciclo de vida de datos sensibles.</p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-[9px] font-bold text-zinc-500 uppercase">GDPR/LFPDPPP</span>
                 <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-[9px] font-bold text-zinc-500 uppercase">ARCO</span>
              </div>
           </button>

           {/* Audit Center Card */}
           <button
             onClick={() => setActiveSubModule('audit')}
             className="group text-left bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm hover:border-emerald-500/50 transition-all active:scale-[0.99]"
           >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                  <Activity size={24}/>
                </div>
                <ChevronRight className="text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-black mb-2">Audit Center</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">Trazabilidad completa de acciones operativas y de seguridad. Logs inmutables para auditoría técnica.</p>
              <div className="flex gap-2">
                 <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-[9px] font-bold text-zinc-500 uppercase">Logs inmutables</span>
                 <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-[9px] font-bold text-zinc-500 uppercase">Trazabilidad</span>
              </div>
           </button>
        </div>

        {/* Compliance Checklist */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black">Matriz de Cumplimiento</h3>
             <button className="text-xs font-bold text-indigo-600 hover:underline">Exportar Reporte</button>
           </div>
           <div className="space-y-4">
              {matrix.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleControlStatus(item.id)}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl group hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.color === 'emerald' ? 'bg-emerald-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-zinc-400'}`}></div>
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.control}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'amber' ? 'text-amber-600' : 'text-zinc-500'}`}>
                        {item.status}
                      </span>
                      <ChevronRight size={16} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                </div>
              ))}
           </div>
           <p className="mt-4 text-[9px] text-zinc-400 font-bold uppercase text-center">* Haz clic en un item para cambiar su estado de cumplimiento.</p>
        </div>

        <div className={`p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group transition-all duration-500 ${isLegalHoldActive ? 'bg-red-600 text-white shadow-red-600/20 shadow-2xl' : 'bg-zinc-900 text-white'}`}>
           <div className="relative z-10">
              <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                {isLegalHoldActive ? <Lock size={20} className="text-white animate-pulse"/> : <Lock size={20} className="text-emerald-400"/>}
                Legal Hold
              </h4>
              <p className={`text-sm max-w-md font-medium ${isLegalHoldActive ? 'text-white/80' : 'text-zinc-400'}`}>
                {isLegalHoldActive
                  ? 'Bloqueo activo: Se ha suspendido la purga automática de datos sensibles para esta organización.'
                  : 'Activa el bloqueo de eliminación de datos para investigaciones legales o auditorías externas en curso.'}
              </p>
           </div>
           <button
             onClick={() => setShowLegalHoldModal(true)}
             className={`relative z-10 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all ${isLegalHoldActive ? 'bg-white text-red-600' : 'bg-white text-zinc-900'}`}
           >
              {isLegalHoldActive ? 'Desactivar Bloqueo' : 'Activar Bloqueo Legal'}
           </button>
           <Shield size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>

      {/* Modal Confirmación Legal Hold */}
      {showLegalHoldModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isLegalHoldActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                 <Lock size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2">{isLegalHoldActive ? '¿Desactivar Legal Hold?' : '¿Activar Legal Hold?'}</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                {isLegalHoldActive
                  ? 'Al desactivar, el sistema retomará las políticas de purga automática de datos según el ciclo de vida configurado.'
                  : 'Esta acción suspenderá inmediatamente cualquier proceso de eliminación o archivado automático de datos clínicos y operativos.'}
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setShowLegalHoldModal(false)} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button>
                 <button
                  onClick={() => {
                    setIsLegalHoldActive(!isLegalHoldActive);
                    setShowLegalHoldModal(false);
                  }}
                  className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg ${isLegalHoldActive ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'}`}
                 >
                   Confirmar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
