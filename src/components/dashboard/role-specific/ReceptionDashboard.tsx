import React, { useState, useMemo } from 'react';
import { Users, Clock, CreditCard, Calendar, UserPlus, LogIn, CheckCircle2, AlertCircle, Search, Stethoscope } from 'lucide-react';
import { AgendaItem, Patient, Transaction, User } from '../../../types';
import { KPICard } from '../KPICard';
import { Modal } from '../../shared/Modal';
import { formatLocalDate } from '../../../lib/db';

interface ReceptionDashboardProps {
  agenda: AgendaItem[];
  patients: Patient[];
  transactions?: Transaction[];
  doctors?: User[];
  onRegisterArrival: (id: string, doctorId?: string, doctorName?: string) => void;
  navigateTo: (moduleId: string) => void;
}

export function ReceptionDashboard({ agenda = [], patients = [], transactions = [], doctors = [], onRegisterArrival, navigateTo }: ReceptionDashboardProps) {
  const hoy = useMemo(() => formatLocalDate(), []);
  const pendingArrival = agenda.filter(a => (a.status === 'confirmed' || a.status === 'pending') && (!a.date || a.date === hoy));
  const waiting = agenda.filter(a => (a.status === 'waiting' || a.status === 'in_consultation') && (!a.date || a.date === hoy));
  const pendingPayment = agenda.filter(a => a.status === 'pending_payment');

  const [assigningApt, setAssigningApt] = useState<AgendaItem | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const handleArrivalClick = (apt: AgendaItem) => {
    // Si solo hay 1 médico en el staff (o ninguno), confirmar directamente sin modal
    if (!doctors || doctors.length <= 1) {
      const doc = doctors && doctors.length > 0 ? doctors[0] : null;
      onRegisterArrival(
        apt.id,
        doc?.id || 'owner',
        doc ? `${doc.name}${doc.lastName ? ' ' + doc.lastName : ''}` : 'Médico'
      );
      return;
    }

    // Si hay múltiples médicos, abrir modal para que recepción seleccione a quién va
    setAssigningApt(apt);
    setSelectedDoctorId(apt.doctorId || (doctors.length > 0 ? doctors[0].id : ''));
  };

  const handleConfirmAssignment = () => {
    if (!assigningApt || !selectedDoctorId) return;
    const doc = doctors?.find(d => d.id === selectedDoctorId);
    const doctorName = doc ? `${doc.name}${doc.lastName ? ' ' + doc.lastName : ''}` : 'Médico';

    onRegisterArrival(assigningApt.id, selectedDoctorId, doctorName);
    setAssigningApt(null);
  };

  // Cálculo en vivo del total cobrado hoy en caja
  const cajaHoy = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(hoy) && t.type === 'ingreso')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions, hoy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Citas Hoy" value={agenda.length.toString()} trend="Total" icon={<Calendar className="text-indigo-500"/>} />
        <KPICard title="Por Llegar" value={pendingArrival.length.toString()} trend="Pacientes" icon={<Clock className="text-amber-500"/>} alert={pendingArrival.length > 0} />
        <KPICard title="En Espera" value={agenda.filter(a => a.status === 'waiting').length.toString()} trend="Sala Médica" icon={<Users className="text-emerald-500"/>} />
        <KPICard title="Por Cobrar" value={pendingPayment.length.toString()} trend="Caja" icon={<CreditCard className="text-rose-500"/>} alert={pendingPayment.length > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Check-in List */}
        <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0A0A0A]">
            <div>
               <h3 className="font-black text-lg">Validación y Recepción</h3>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Control de llegada de pacientes</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {pendingArrival.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                 <LogIn size={40} className="mx-auto mb-4 opacity-10"/>
                 <p className="font-bold text-sm">No hay pacientes por llegar</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                {pendingArrival.map(apt => (
                  <div key={apt.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xs">{apt.time}</div>
                       <div>
                          <div className="font-black text-sm">{apt.patientName}</div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{apt.type} • Dr. {apt.doctorId}</div>
                       </div>
                    </div>
                    <button
                      onClick={() => handleArrivalClick(apt)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Confirmar Llegada
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Search */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="font-black text-lg mb-6">Operaciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => navigateTo('pacientes')} className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/50 transition-all group">
                    <UserPlus size={24} className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Nuevo Paciente</span>
                 </button>
                 <button onClick={() => navigateTo('agenda')} className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/50 transition-all group">
                    <Calendar size={24} className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Nueva Cita</span>
                 </button>
                 <button onClick={() => navigateTo('finanzas')} className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-rose-500/50 transition-all group">
                    <CreditCard size={24} className="text-rose-600 mb-3 group-hover:scale-110 transition-transform"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Registrar Pago</span>
                 </button>
                 <button onClick={() => navigateTo('pacientes')} className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/50 transition-all group">
                    <Search size={24} className="text-zinc-400 mb-3 group-hover:scale-110 transition-transform"/>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Buscar</span>
                 </button>
              </div>
           </div>

           <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-1">Caja del Día</h4>
                <p className="text-emerald-100 text-sm font-medium mb-4">Ingresos cobrados hoy</p>
                <div className="text-3xl font-black font-mono">${cajaHoy.toLocaleString()}</div>
              </div>
              <CheckCircle2 size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700"/>
           </div>
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
           <h3 className="font-black text-lg flex items-center gap-2">
             <AlertCircle size={20} className="text-rose-500"/> Pendientes de Pago
           </h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Paciente</th>
                  <th className="px-8 py-4">Servicio</th>
                  <th className="px-8 py-4">Médico</th>
                  <th className="px-8 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                 {pendingPayment.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-8 py-10 text-center text-zinc-400 text-xs font-bold">Sin cobros pendientes</td>
                   </tr>
                 ) : (
                   pendingPayment.map(apt => (
                     <tr key={apt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-8 py-5 font-black text-sm">{apt.patientName}</td>
                        <td className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase">{apt.type}</td>
                        <td className="px-8 py-5 text-xs font-bold text-zinc-500">{apt.doctorId}</td>
                        <td className="px-8 py-5 text-right">
                           <button
                             onClick={() => navigateTo('finanzas')}
                             className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                           >
                             Cobrar
                           </button>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Modal para Selección de Médico al Confirmar Llegada */}
      {assigningApt && (
        <Modal
          isOpen={true}
          onClose={() => setAssigningApt(null)}
          title="Asignar Médico de Atención"
        >
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Paciente en Recepción</span>
              <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">{assigningApt.patientName}</p>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{assigningApt.time} • {assigningApt.type}</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">
                Seleccione el Médico disponible para la atención:
              </label>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {doctors?.map(doc => {
                  const docName = `${doc.name}${doc.lastName ? ' ' + doc.lastName : ''}`;
                  const isSelected = selectedDoctorId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-black'
                          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-zinc-900 dark:text-zinc-50">Dr(a). {docName}</div>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{doc.specialty || 'Médico de Staff'}</div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {isSelected && <CheckCircle2 size={12}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setAssigningApt(null)}
                className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={16}/> Confirmar y Enviar a Sala
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
