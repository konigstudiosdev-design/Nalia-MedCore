import React, { useState } from 'react';
import { HeartPulse, Clock, CheckCircle2, User, Search, Activity, Scale, ChevronRight } from 'lucide-react';
import { AgendaItem, Patient, VitalSigns, NursingRequest } from '../../types';
import { PatientPrep } from './PatientPrep';

interface NurseVitalsViewProps {
  agenda: AgendaItem[];
  patients: Patient[];
  nursingRequests: NursingRequest[];
  onSaveVitals: (appointmentId: string, vitals: VitalSigns) => void;
  onUpdateNursingRequest: (id: string, status: string, data?: any) => void;
}

export function NurseVitalsView({
  agenda = [],
  patients = [],
  nursingRequests = [],
  onSaveVitals,
  onUpdateNursingRequest
}: NurseVitalsViewProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'Hoy';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d} ${months[m - 1]} ${y}`;
    } catch {
      return dateStr;
    }
  };

  // Pacientes en sala de espera o con solicitud de signos vitales
  const waitingPatients = agenda.filter(a =>
    a.status === 'waiting' ||
    a.status === 'confirmed' ||
    nursingRequests.some(r => r.appointmentId === a.id && r.type === 'vitals' && r.status !== 'completed')
  );

  const filteredAgenda = React.useMemo(() => {
    if (!searchTerm.trim()) return waitingPatients;

    // Buscar primero en los de sala de espera
    const matchAgenda = waitingPatients.filter(a =>
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matchAgenda.length > 0) return matchAgenda;

    // Si no está en la agenda de hoy, buscar en todo el directorio de pacientes
    const matchPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchPatients.map(p => ({
      id: `prep_${p.id}`,
      organizationId: p.organizationId,
      date: new Date().toISOString().split('T')[0],
      time: 'Ahora',
      duration: 30,
      patientId: p.id,
      patientName: p.name,
      doctorId: 'owner',
      serviceId: 'prep',
      type: 'consulta',
      status: 'waiting'
    } as AgendaItem));
  }, [searchTerm, waitingPatients, patients]);

  // Vitals capturados hoy
  const completedVitalsRequests = nursingRequests.filter(r => r.type === 'vitals' && r.status === 'completed');

  if (selectedAppointment) {
    return (
      <PatientPrep
        appointment={selectedAppointment}
        onSaveVitals={(id, vitals) => {
          onSaveVitals(id, vitals);
          // Buscar si hay solicitud de enfermería asociada y completarla
          const assocReq = nursingRequests.find(r => r.appointmentId === id && r.type === 'vitals');
          if (assocReq) {
            onUpdateNursingRequest(assocReq.id, 'completed', { resultData: vitals });
          }
          setSelectedAppointment(null);
        }}
        onBack={() => setSelectedAppointment(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
             <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                <HeartPulse size={24} />
             </div>
             Toma de Signos Vitales y Somatometría
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 ml-1">
             Captura de Tensión Arterial, Frecuencia, Temperatura e IMC para envío al médico
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Waiting Queue / Patient Selection */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/50 dark:bg-[#0A0A0A]">
              <div>
                 <h3 className="font-black text-lg">Pacientes Listos para Preparación</h3>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Seleccione un paciente para registrar signos</p>
              </div>
              <div className="relative w-full md:w-64">
                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input
                   type="text"
                   placeholder="Buscar paciente..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                 />
              </div>
            </div>

            <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
              {filteredAgenda.length === 0 ? (
                <div className="p-16 text-center text-zinc-400">
                   <Clock size={40} className="mx-auto mb-3 opacity-20"/>
                   <p className="font-bold text-sm">No hay pacientes esperando toma de signos</p>
                </div>
              ) : (
                filteredAgenda.map(apt => (
                  <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-all group">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center font-black text-rose-600 text-lg shadow-inner">
                           {apt.patientName.charAt(0)}
                        </div>
                        <div>
                           <div className="font-black text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                              {apt.patientName}
                              {apt.vitalSigns && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                   Signos Capturados
                                </span>
                              )}
                           </div>
                           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                              Fecha Cita: {formatDateDisplay(apt.date)} • Hora Cita: {apt.time} • Tipo: {apt.type}
                           </div>
                        </div>
                     </div>
                     <button
                       onClick={() => setSelectedAppointment(apt)}
                       className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        <HeartPulse size={16}/> Capturar Signos Vitales
                     </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vitals Summary History */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                 <CheckCircle2 size={20} className="text-emerald-500"/> Capturados Hoy
              </h3>
              <div className="space-y-4">
                 {completedVitalsRequests.length === 0 ? (
                   <p className="text-center py-10 text-xs font-bold text-zinc-400 uppercase tracking-widest">Sin registros enviados aún</p>
                 ) : (
                   completedVitalsRequests.map(req => (
                     <div key={req.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                        <div className="font-black text-sm text-zinc-900 dark:text-zinc-100 mb-1">{req.patientName}</div>
                        {req.resultData && (
                           <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <div>TA: <span className="font-bold text-zinc-800 dark:text-zinc-200">{req.resultData.bloodPressure || '--/--'}</span></div>
                              <div>FC: <span className="font-bold text-zinc-800 dark:text-zinc-200">{req.resultData.heartRate || '--'} bpm</span></div>
                              <div>Temp: <span className="font-bold text-zinc-800 dark:text-zinc-200">{req.resultData.temp || '--'} °C</span></div>
                              <div>Peso: <span className="font-bold text-zinc-800 dark:text-zinc-200">{req.resultData.weight || '--'} kg</span></div>
                           </div>
                        )}
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
