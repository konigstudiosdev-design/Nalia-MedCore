import React, { useState, useMemo, useEffect } from 'react';
import {
  CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Filter, Search,
  User, Calendar, Wallet, CheckCircle2, X, Clock, Receipt, TrendingUp,
  Download, MoreHorizontal, FileText, Ban, BarChart3, Calculator
} from 'lucide-react';
import { Transaction, AgendaItem, Role } from '../../types';
import { Modal } from '../shared/Modal';

interface FinanceViewProps {
  transactions: Transaction[];
  agenda: AgendaItem[];
  userRole: Role;
  onAddTransaction: (t: Partial<Transaction>) => void;
  onUpdateAppointment: (id: string, status: any) => void;
}

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

export function FinanceView({ transactions = [], agenda = [], userRole, onAddTransaction, onUpdateAppointment }: FinanceViewProps) {
  const isReception = userRole === 'reception';
  const isAdmin = userRole === 'organization_admin';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<AgendaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: 'ingreso',
    method: 'cash',
    category: 'Consulta'
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash'
  });

  // Lógica de filtrado por fecha
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - (7 * 86400000);
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(t => {
      const tDate = new Date(t.date).getTime();
      if (dateFilter === 'today') return tDate >= today;
      if (dateFilter === 'yesterday') return tDate >= yesterday && tDate < today;
      if (dateFilter === 'week') return tDate >= lastWeek;
      if (dateFilter === 'month') return tDate >= firstOfMonth;
      return true;
    });
  }, [transactions, dateFilter]);

  // Filtrado por búsqueda
  const finalFilteredTransactions = useMemo(() => {
    return filteredByDate
      .filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredByDate, searchTerm]);

  // KPIs dinámicos basados en el filtro actual
  const kpis = useMemo(() => {
    const ingresos = filteredByDate.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
    const egresos = filteredByDate.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
    return { total: ingresos - egresos, ingresos, egresos };
  }, [filteredByDate]);

  const pendienteCobro = useMemo(() => {
    return agenda.filter(a => a.status === 'pending_payment');
  }, [agenda]);

  const handleAdd = () => {
    if (newTransaction.description && (newTransaction.amount || 0) > 0) {
      onAddTransaction({
        ...newTransaction,
        date: new Date().toISOString()
      });
      setIsAddModalOpen(false);
      setNewTransaction({ description: '', amount: 0, type: 'ingreso', method: 'cash', category: 'Insumos' });
    }
  };

  const handleProcessPayment = () => {
    if (!selectedApt) return;
    onAddTransaction({
      description: `Consulta: ${selectedApt.patientName}`,
      amount: paymentData.amount,
      type: 'ingreso',
      method: paymentData.method as any,
      patientId: selectedApt.patientId,
      category: 'Consulta',
      date: new Date().toISOString()
    });
    onUpdateAppointment(selectedApt.id, 'paid');
    setIsPayModalOpen(false);
    setSelectedApt(null);
  };

  useEffect(() => {
    if (selectedApt) {
      setPaymentData({
        amount: (selectedApt as any).chargeAmount || 0,
        method: 'cash'
      });
    }
  }, [selectedApt]);

  // Desglose para Corte de Caja
  const corteData = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const txHoy = transactions.filter(t => t.date.startsWith(hoy));
    const byMethod = {
      cash: txHoy.filter(t => t.method === 'cash' && t.type === 'ingreso').reduce((a, b) => a + b.amount, 0),
      card: txHoy.filter(t => t.method === 'card' && t.type === 'ingreso').reduce((a, b) => a + b.amount, 0),
      transfer: txHoy.filter(t => t.method === 'transfer' && t.type === 'ingreso').reduce((a, b) => a + b.amount, 0),
      insurance: txHoy.filter(t => t.method === 'insurance' && t.type === 'ingreso').reduce((a, b) => a + b.amount, 0),
    };
    const totalEgresos = txHoy.filter(t => t.type === 'egreso').reduce((a, b) => a + b.amount, 0);
    return { ...byMethod, totalEgresos, neto: (byMethod.cash + byMethod.card + byMethod.transfer + byMethod.insurance) - totalEgresos };
  }, [transactions]);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Administrativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Caja y Finanzas</h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Gestión integral de ingresos, gastos y conciliación</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {(isReception || isAdmin) && (
            <>
              <button
                onClick={() => setIsCorteModalOpen(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                <Calculator size={16}/> Corte de Caja
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Plus size={18} strokeWidth={3}/> Registrar Movimiento
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm flex items-center justify-between overflow-hidden relative group">
           <div>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Balance del Período</p>
              <div className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter font-mono">${kpis.total.toLocaleString()}</div>
           </div>
           <div className="flex gap-2">
              <div className="text-right">
                <p className="text-[8px] font-black text-emerald-500 uppercase">Ingresos</p>
                <p className="text-sm font-black text-emerald-600">+${kpis.ingresos.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800 mx-2"></div>
              <div className="text-right">
                <p className="text-[8px] font-black text-rose-500 uppercase">Egresos</p>
                <p className="text-sm font-black text-rose-600">-${kpis.egresos.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Por Cobrar</p>
          <div className="text-4xl font-black text-amber-600 tracking-tighter font-mono">{pendienteCobro.length}</div>
          <p className="text-[9px] text-amber-500/60 font-bold mt-1 uppercase tracking-tighter">Pacientes saliendo de consulta</p>
        </div>

        <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Periodo Vista</p>
          <div className="text-2xl font-black capitalize relative z-10">{dateFilter === 'all' ? 'Historial Completo' : dateFilter === 'week' ? 'Últimos 7 días' : dateFilter === 'month' ? 'Este Mes' : dateFilter}</div>
          <BarChart3 size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monitor de Cuentas por Cobrar */}
        {isReception && (
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-black text-lg flex items-center gap-2">
                      <Receipt size={20} className="text-indigo-600"/> Monitor de Cobro
                   </h3>
                   <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[8px] font-black">{pendienteCobro.length} PEND.</span>
                </div>

                <div className="space-y-3">
                   {pendienteCobro.length === 0 ? (
                     <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-zinc-200 dark:text-zinc-800">
                           <CheckCircle2 size={24}/>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Caja al día</p>
                     </div>
                   ) : (
                     pendienteCobro.map(apt => (
                       <div key={apt.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 truncate pr-2 uppercase">{apt.patientName}</span>
                             <span className="text-[10px] font-black text-indigo-600 font-mono">${(apt as any).chargeAmount || '0'}</span>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="text-[9px] font-bold text-zinc-400 uppercase">{apt.time} • {apt.type}</div>
                             <button
                               onClick={() => { setSelectedApt(apt); setIsPayModalOpen(true); }}
                               className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                             >
                                Cobrar
                             </button>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Historial con Filtros Avanzados */}
        <div className={isReception ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col xl:flex-row justify-between items-center gap-4 bg-zinc-50/30 dark:bg-[#0A0A0A]">
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-100 dark:border-zinc-800">
                 {(['today', 'yesterday', 'week', 'month', 'all'] as const).map(f => (
                   <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${dateFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                   >
                     {f === 'today' ? 'Hoy' : f === 'yesterday' ? 'Ayer' : f === 'week' ? '7D' : f === 'month' ? 'Mes' : 'Todo'}
                   </button>
                 ))}
              </div>
              <div className="relative w-full xl:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Concepto o Paciente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-400 text-[9px] font-black uppercase tracking-widest border-b border-zinc-50 dark:border-zinc-900">
                    <th className="px-6 py-4">Fecha/Hora</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Método</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                  {finalFilteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest italic">Sin movimientos para este filtro</td>
                    </tr>
                  ) : (
                    finalFilteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all group">
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-bold text-zinc-500 leading-tight">
                            {new Date(t.date).toLocaleDateString('es-MX', {day:'2-digit', month:'short'})}<br/>
                            <span className="text-[8px] opacity-60">{new Date(t.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className={`text-xs font-black uppercase tracking-tight ${t.type === 'egreso' ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>{t.description}</div>
                           <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{t.category}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${t.method === 'insurance' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent'}`}>
                             {t.method === 'cash' ? 'Efectivo' : t.method === 'card' ? 'Tarjeta' : t.method === 'insurance' ? 'Seguro' : 'Transf.'}
                           </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-black text-right font-mono ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: CORTE DE CAJA */}
      <Modal isOpen={isCorteModalOpen} onClose={() => setIsCorteModalOpen(false)} title="Corte de Caja Diario">
         <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <CorteItem label="Efectivo" value={corteData.cash} icon={<Wallet size={16}/>} color="emerald" />
               <CorteItem label="Tarjeta / Terminal" value={corteData.card} icon={<CreditCard size={16}/>} color="indigo" />
               <CorteItem label="Transferencias" value={corteData.transfer} icon={<ArrowUpRight size={16}/>} color="blue" />
               <CorteItem label="Aseguradoras" value={corteData.insurance} icon={<ShieldCheck size={16}/>} color="amber" />
            </div>

            <div className="p-6 bg-zinc-900 text-white rounded-[32px] shadow-2xl relative overflow-hidden">
               <BarChart3 size={120} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Total Neto Hoy</p>
                    <h4 className="text-4xl font-black font-mono tracking-tighter">${corteData.neto.toLocaleString()}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-rose-400 uppercase">Egresos Totales</p>
                    <p className="text-base font-black font-mono text-rose-300">-${corteData.totalEgresos.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button className="flex-1 py-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 <Download size={18}/> Exportar PDF
               </button>
               <button onClick={() => setIsCorteModalOpen(false)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                 Confirmar Corte
               </button>
            </div>
         </div>
      </Modal>

      {/* MODAL: PROCESAR COBRO (PACIENTE) */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Cobro">
        {selectedApt && (
          <div className="space-y-6">
            <div className="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Paciente en Caja</p>
               <h4 className="text-2xl font-black tracking-tight uppercase">{selectedApt.patientName}</h4>
               <p className="text-xs mt-2 opacity-90">{selectedApt.type} • Dr. Daniel</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Monto de la Consulta ($)</label>
                  <input
                    type="number"
                    value={paymentData.amount || ''}
                    onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] px-6 py-5 text-4xl font-black font-mono text-white outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Método de Pago</label>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { id: 'cash', label: 'Efectivo', i: <Wallet size={16}/> },
                       { id: 'card', label: 'Tarjeta / TPv', i: <CreditCard size={16}/> },
                       { id: 'transfer', label: 'Transferencia', i: <ArrowUpRight size={16}/> },
                       { id: 'insurance', label: 'Aseguradora', i: <ShieldCheck size={16}/> }
                     ].map(m => (
                       <button
                         key={m.id}
                         onClick={() => setPaymentData({...paymentData, method: m.id})}
                         className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${paymentData.method === m.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                       >
                         {m.i} <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={!paymentData.amount}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={20}/> Registrar y Finalizar
            </button>
          </div>
        )}
      </Modal>

      {/* MODAL: NUEVO MOVIMIENTO (EGRESOS / INGRESOS MANUALES) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nuevo Movimiento">
        <div className="space-y-6">
           <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'ingreso', category: 'Otros Ingresos'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTransaction.type === 'ingreso' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Ingreso
              </button>
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'egreso', category: 'Insumos / Gasto'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newTransaction.type === 'egreso' ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                Egreso / Gasto
              </button>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descripción del Movimiento</label>
                <input
                  type="text"
                  placeholder="Ej. Compra de guantes de látex"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount || ''}
                    onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-black font-mono text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Método</label>
                  <select
                    value={newTransaction.method}
                    onChange={e => setNewTransaction({...newTransaction, method: e.target.value as any})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </div>
              </div>
           </div>

           <button onClick={handleAdd} className={`w-full py-5 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all ${newTransaction.type === 'ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
              Confirmar Registro de {newTransaction.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
           </button>
        </div>
      </Modal>
    </div>
  );
}

function CorteItem({ label, value, icon, color }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className={`p-4 rounded-[24px] border ${colorMap[color]} bg-zinc-50 dark:bg-zinc-900/50`}>
       <div className="flex items-center gap-2 mb-2 opacity-80">
          {icon} <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
       </div>
       <div className="text-xl font-black font-mono tracking-tighter">${value.toLocaleString()}</div>
    </div>
  );
}

import { ShieldCheck } from 'lucide-react';
