import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search, Filter, Download, History, User, Lock, Activity, ShieldCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface AuditCenterProps {
  onBack: () => void;
}

const MOCK_LOGS = [
  { id: '1', timestamp: '2026-08-30 20:45:12', user: 'Dr. Alejandro Ruiz', action: 'Acceso a Expediente', resource: 'Paciente: Juan Pérez', category: 'operational', status: 'success' },
  { id: '2', timestamp: '2026-08-30 19:20:05', user: 'Admin Sistema', action: 'Intento de Login Fallido', resource: 'IP: 189.210.4.12', category: 'security', status: 'failure' },
  { id: '3', timestamp: '2026-08-30 18:15:30', user: 'Dra. Elena Gómez', action: 'Edición de Diagnóstico', resource: 'Consulta #8421', category: 'operational', status: 'success' },
  { id: '4', timestamp: '2026-08-30 17:05:44', user: 'Admin Sistema', action: 'Cambio de Rol', resource: 'Usuario: Marta Sosa (Enfermera -> Admin)', category: 'compliance', status: 'warning' },
  { id: '5', timestamp: '2026-08-30 16:50:11', user: 'Dr. Alejandro Ruiz', action: 'Descarga de Reporte', resource: 'Ingresos Mensuales Q2', category: 'operational', status: 'success' },
  { id: '6', timestamp: '2026-08-30 15:30:22', user: 'Dra. Elena Gómez', action: 'Acceso a Expediente', resource: 'Paciente: Carlos Slim', category: 'operational', status: 'success' },
  { id: '7', timestamp: '2026-08-30 14:12:00', user: 'Admin Sistema', action: 'Respaldo Base de Datos', resource: 'Nube Azure - East US', category: 'compliance', status: 'success' },
  { id: '8', timestamp: '2026-08-30 12:05:55', user: 'Sistema Automático', action: 'Bloqueo de Cuenta', resource: 'Usuario: Pedro Ortiz (Ataque Brute Force)', category: 'security', status: 'success' },
];

export function AuditCenter({ onBack }: AuditCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(6);
  const [isExporting, setIsExporting] = useState(false);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchesSearch =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === 'all' || log.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter]);

  const visibleLogs = filteredLogs.slice(0, limit);

  const handleExport = () => {
    setIsExporting(true);
    // Simular exportación
    setTimeout(() => {
      setIsExporting(false);
      alert('Los logs han sido exportados exitosamente en formato CSV.');
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 bg-zinc-50/50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft size={20}/>
          </button>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <History size={20} className="text-emerald-500" /> Audit Center
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div> : <Download size={18}/>}
            {isExporting ? 'Exportando...' : 'Exportar Logs'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#121212] p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'security', label: 'Seguridad' },
                { id: 'compliance', label: 'Compliance' },
                { id: 'operational', label: 'Operativo' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  {cat.label}
                </button>
              ))}
           </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Acción</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Recurso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estado</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                 {visibleLogs.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 text-xs font-bold uppercase">No se encontraron registros</td>
                   </tr>
                 ) : (
                   visibleLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-zinc-500">{log.timestamp}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><User size={12}/></div>
                              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{log.user}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                             log.category === 'security' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                             log.category === 'compliance' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                             'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                           }`}>
                             {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{log.resource}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              {log.status === 'success' ? (
                                <ShieldCheck size={16} className="text-emerald-500" />
                              ) : log.status === 'warning' ? (
                                <AlertCircle size={16} className="text-amber-500" />
                              ) : (
                                <Lock size={16} className="text-red-500" />
                              )}
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                log.status === 'success' ? 'text-emerald-600' : log.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {log.status}
                              </span>
                           </div>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>

        {limit < filteredLogs.length && (
          <div className="flex justify-center py-4">
             <button
              onClick={() => setLimit(prev => prev + 4)}
              className="px-6 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all hover:border-zinc-400 active:scale-95"
             >
               Cargar más registros...
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
