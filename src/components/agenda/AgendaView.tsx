import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Grid3X3, Clock,
  User, MoreHorizontal, CheckCircle2, AlertCircle, Stethoscope, Search, X, Edit, Trash2, XCircle,
  Globe, RefreshCw, Check
} from 'lucide-react';
import { AgendaItem, Patient, AppointmentStatus, Role } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';
import { Modal } from '../shared/Modal';

interface AgendaViewProps {
  agenda: AgendaItem[];
  patients: Patient[];
  doctors?: User[];
  onAddAppointment: (data: Partial<AgendaItem>) => void;
  onUpdateAppointment: (id: string, status: AppointmentStatus, extra?: any) => void;
  onDeleteAppointment: (id: string) => void;
  onStartConsultation: (id: string) => void;
  googleEvents?: any[];
  isGoogleConnected?: boolean;
  onConnectGoogle?: () => Promise<void>;
  onDisconnectGoogle?: () => Promise<void>;
  userRole?: Role;
}

const HOUR_HEIGHT = 80; // Reducimos un poco la altura para que quepan más horas en pantalla
const START_HOUR = 0;
const END_HOUR = 23;

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES_15 = ['00', '15', '30', '45'];

export function AgendaView({
  agenda, patients, doctors = [], onAddAppointment, onUpdateAppointment, onDeleteAppointment, onStartConsultation,
  googleEvents = [], isGoogleConnected = false, onConnectGoogle, onDisconnectGoogle, userRole
}: AgendaViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'google'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaItem | null>(null);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleConnError, setGoogleConnError] = useState<string | null>(null);

  const hours = useMemo(() =>
    Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i),
  []);

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const getTopPosition = (timeStr: string) => {
    const minutes = timeToMinutes(timeStr);
    return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  };

  const getHeight = (duration: number) => (duration / 60) * HOUR_HEIGHT;

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const filteredAgenda = useMemo(() => {
    const targetDate = formatDate(selectedDate);
    return agenda.filter(item => item.date === targetDate);
  }, [agenda, selectedDate]);

  const navigateDate = (direction: number) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const filteredPatients = useMemo(() => {
    if (!searchPatient || !Array.isArray(patients)) return [];
    const term = searchPatient.toLowerCase();
    return patients.filter(p =>
      (p.name?.toLowerCase() || '').includes(term) ||
      (p.id_number?.toLowerCase() || '').includes(term)
    ).slice(0, 5);
  }, [patients, searchPatient]);

  const [newAppointment, setNewAppointment] = useState<Partial<AgendaItem>>({
    time: '09:00', duration: 30, type: 'consulta', status: 'confirmed'
  });

  const handleCreateAppointment = async () => {
    const finalPatientName = newAppointment.patientName || searchPatient;
    if (!finalPatientName || !newAppointment.time) return;

    try {
      setIsSaving(true);
      const selectedDoc = doctors?.find(d => d.id === newAppointment.doctorId) || (doctors && doctors.length > 0 ? doctors[0] : null);
      const doctorName = selectedDoc ? `${selectedDoc.name}${selectedDoc.lastName ? ' ' + selectedDoc.lastName : ''}` : 'Médico';
      const doctorId = selectedDoc?.id || newAppointment.doctorId || 'owner';

      await onAddAppointment({
        ...newAppointment,
        date: formatDate(selectedDate),
        patientName: finalPatientName,
        patientId: newAppointment.patientId || 'unregistered',
        doctorId: doctorId,
        doctorId_name: doctorName,
        serviceId: 'general',
        status: newAppointment.status || 'confirmed',
        duration: newAppointment.duration || 30
      });

      setIsAddModalOpen(false);
      setNewAppointment({ time: '09:00', duration: 30, type: 'consulta', status: 'confirmed', doctorId: doctors && doctors.length > 0 ? doctors[0].id : '' });
      setSearchPatient('');
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (!onConnectGoogle) return;
    setGoogleConnError(null);
    try {
      setIsConnectingGoogle(true);
      await onConnectGoogle();
      // Forzamos un pequeño retraso para asegurar que el estado de googleEvents se propague
      setTimeout(() => {
        if (viewMode !== 'google') setViewMode('google');
      }, 500);
    } catch (error: any) {
      console.error("[AGENDA] Error al conectar Google:", error);
      setGoogleConnError(error.message || "No se pudo establecer conexión con Google.");
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleUpdateStatus = async (status: AppointmentStatus) => {
    if (!selectedAppointment) return;
    try {
      setIsSaving(true);
      await onUpdateAppointment(selectedAppointment.id, status);
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStyles = (status: AppointmentStatus) => {
    switch (status) {
      case 'waiting': return 'bg-amber-500/90 text-white border-amber-400';
      case 'finished': return 'bg-emerald-500/90 text-white border-emerald-400';
      case 'cancelled':
      case 'no_show': return 'bg-rose-500/40 text-rose-100 border-rose-400/30 line-through';
      case 'in_consultation': return 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-white/20';
      default: return 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 shadow-sm';
    }
  };

  // --- VIEW RENDERS ---

  const renderDayView = () => (
    <div className="flex-1 overflow-y-auto relative bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto flex min-h-full">
        <div className="w-20 shrink-0 border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-transparent z-20">
          {hours.map(hour => (
            <div key={hour} style={{ height: HOUR_HEIGHT }} className="relative">
              <span className="absolute -top-3 right-4 text-[10px] font-black text-zinc-400 font-mono">
                {hour < 10 ? `0${hour}` : hour}:00
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1 relative" style={{ height: hours.length * HOUR_HEIGHT }}>
          {hours.map(hour => (
            <div key={hour} style={{ height: HOUR_HEIGHT }} className="border-b border-zinc-100 dark:border-zinc-800/50 group relative"
              onClick={() => {
                const timeStr = `${hour < 10 ? '0' + hour : hour}:00`;
                setNewAppointment(prev => ({ ...prev, time: timeStr }));
                setIsAddModalOpen(true);
              }}>
              <div className="absolute top-1/2 left-0 right-0 border-b border-zinc-50 dark:border-zinc-900/30 border-dashed w-full h-px pointer-events-none"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-indigo-50/30 dark:bg-indigo-900/5 flex items-center justify-center pointer-events-none">
                <Plus size={20} className="text-indigo-400 opacity-40"/>
              </div>
            </div>
          ))}
          {filteredAgenda.map(apt => (
            <div key={apt.id} onClick={() => { setSelectedAppointment(apt); setIsEditModalOpen(true); }}
              style={{ top: `${getTopPosition(apt.time)}px`, height: `${getHeight(apt.duration || 30)}px`, left: '4px', right: '12px' }}
              className={`absolute rounded-2xl border-l-4 p-3 flex flex-col justify-between transition-all hover:brightness-110 shadow-lg overflow-hidden ${getStatusStyles(apt.status)}`}>
              <div className="flex justify-between items-start">
                <div className="font-black text-sm truncate leading-tight uppercase">{apt.patientName}</div>
                <span className="text-[9px] font-black font-mono bg-black/10 px-1.5 py-0.5 rounded">{apt.time}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold uppercase opacity-80">{apt.type}</span>
                <span className="text-[8px] font-black opacity-40">{apt.duration} MIN</span>
              </div>
            </div>
          ))}
          <CurrentTimeIndicator />
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="flex-1 overflow-auto bg-white dark:bg-[#0A0A0A]">
        <div className="min-w-[800px] flex flex-col">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#121212] z-30">
            <div className="w-16 shrink-0 border-r border-zinc-100 dark:border-zinc-800"></div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="flex-1 p-4 text-center border-r border-zinc-100 dark:border-zinc-800 last:border-0">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{day.toLocaleDateString('es-MX', { weekday: 'short' })}</p>
                <p className={`text-xl font-black mt-1 ${day.toDateString() === new Date().toDateString() ? 'text-indigo-600' : ''}`}>{day.getDate()}</p>
              </div>
            ))}
          </div>
          <div className="flex relative" style={{ height: hours.length * 60 }}>
            <div className="w-16 shrink-0 border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-transparent">
              {hours.map(hour => (
                <div key={hour} style={{ height: 60 }} className="relative">
                  <span className="absolute -top-2 right-2 text-[9px] font-bold text-zinc-400">
                    {hour < 10 ? `0${hour}` : hour}:00
                  </span>
                </div>
              ))}
            </div>
            {weekDays.map(day => {
              const dayStr = formatDate(day);
              const dayAppointments = agenda.filter(a => a.date === dayStr);
              return (
                <div key={day.toISOString()} className="flex-1 border-r border-zinc-100 dark:border-zinc-800 relative last:border-0">
                  {hours.map(h => <div key={h} style={{ height: 60 }} className="border-b border-zinc-50 dark:border-zinc-900/50"></div>)}
                  {dayAppointments.map(apt => (
                     <div key={apt.id} onClick={() => { setSelectedAppointment(apt); setIsEditModalOpen(true); }}
                      style={{ top: `${((timeToMinutes(apt.time) - START_HOUR * 60) * (60/60))}px`, height: `${(apt.duration * (60/60))}px` }}
                      className={`absolute inset-x-1 rounded-lg border-l-2 p-1 text-[9px] font-bold overflow-hidden cursor-pointer ${getStatusStyles(apt.status)}`}>
                      {apt.patientName}
                     </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startDay = firstDay.getDay();
    const days = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(firstDay);
      d.setDate(i - startDay + 1);
      return d;
    });

    return (
      <div className="flex-1 bg-white dark:bg-[#0A0A0A] grid grid-cols-7 border-t border-zinc-200 dark:border-zinc-800">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="p-3 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">{d}</div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const dayStr = formatDate(day);
          const dayAppointments = agenda.filter(a => a.date === dayStr);

          return (
            <div key={i} className={`min-h-[120px] p-2 border-b border-r border-zinc-100 dark:border-zinc-800 last:border-r-0 ${isCurrentMonth ? '' : 'opacity-30 bg-zinc-50/50 dark:bg-white/5'}`}>
              <p className={`text-xs font-black mb-2 ${day.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-zinc-400'}`}>{day.getDate()}</p>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className={`px-2 py-0.5 rounded text-[8px] font-bold truncate ${getStatusStyles(apt.status)}`}>{apt.patientName}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGoogleView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0A0A0A]">
       {isGoogleConnected ? (
         <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-3xl font-black tracking-tight">Eventos de Google</h3>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1 text-emerald-500 flex items-center gap-2">
                     <Check size={12}/> Cuenta vinculada correctamente
                  </p>
               </div>
               <div className="flex gap-3">
                  <button onClick={handleConnectGoogle} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-all">
                     <RefreshCw size={20} className={isConnectingGoogle ? 'animate-spin' : ''}/>
                  </button>
                  <button
                    onClick={async () => {
                      if (onDisconnectGoogle && confirm('¿Estás seguro de que deseas desvincular tu cuenta de Google?')) {
                        await onDisconnectGoogle();
                        setViewMode('day'); // Regresamos a la vista de día
                      }
                    }}
                    className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                    title="Desvincular cuenta"
                  >
                     <Trash2 size={20}/>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {googleEvents.length === 0 ? (
                 <div className="p-20 text-center bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[32px]">
                    <CalendarIcon size={48} className="mx-auto mb-4 text-zinc-300 opacity-20"/>
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No hay eventos programados en Google Calendar</p>
                 </div>
               ) : (
                 googleEvents.map((event: any) => (
                   <div key={event.id} className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#181818] flex items-center justify-center shadow-sm">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-8 h-8" alt="Google Calendar"/>
                         </div>
                         <div>
                            <p className="font-black text-lg text-zinc-900 dark:text-zinc-50">{event.summary}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                                  {new Date(event.start.dateTime || event.start.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Google Calendar Event</span>
                            </div>
                         </div>
                      </div>
                      <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500">Externo</div>
                   </div>
                 ))
               )}
            </div>
         </div>
       ) : (
         <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/30">
               <Globe size={48} className="text-white"/>
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tight">Google Calendar Sync</h3>
            <p className="text-zinc-500 max-w-md mb-6 font-medium leading-relaxed">Centraliza tu vida profesional y personal. Al conectar tu cuenta, tus eventos externos se sincronizarán con Nalia MedCore en tiempo real.</p>

            {googleConnError && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in shake-in duration-300">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest text-left">{googleConnError}</p>
              </div>
            )}

            <button
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="px-10 py-5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:border-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
               {isConnectingGoogle ? (
                 <RefreshCw size={20} className="animate-spin text-indigo-600"/>
               ) : (
                 <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-6 h-6" alt="Google Calendar"/>
               )}
               {isConnectingGoogle ? 'Conectando...' : 'Conectar con Google'}
            </button>
         </div>
       )}
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 bg-zinc-50 dark:bg-[#080808]">
      {/* Header Compacto y Profesional */}
      <div className="p-3 md:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex flex-1 items-center gap-4 min-w-0">
          {/* Controles de Navegación */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shrink-0">
             <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-indigo-600 active:scale-90"><ChevronLeft size={16}/></button>
             <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors">Hoy</button>
             <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-indigo-600 active:scale-90"><ChevronRight size={16}/></button>
          </div>

          {/* Título de Fecha Ajustado */}
          <div className="min-w-[180px] md:min-w-[240px] flex items-center overflow-hidden">
            <h2 className="text-base md:text-lg font-black tracking-tighter text-zinc-900 dark:text-zinc-50 first-letter:uppercase truncate whitespace-nowrap leading-none">
              {selectedDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric', ...(viewMode === 'day' && { day: 'numeric', weekday: 'long' }) })}
            </h2>
          </div>

          {/* Selector de Vista Compacto */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0">
            {[
              { id: 'day', label: 'Día' },
              { id: 'week', label: 'Sem' },
              { id: 'month', label: 'Mes' },
              { id: 'google', label: 'G', icon: <Globe size={12}/> }
            ].map((v) => (
              <button key={v.id} onClick={() => setViewMode(v.id as any)}
                className={`px-3 md:px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center min-w-[50px] md:min-w-[70px] ${viewMode === v.id ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
              >
                {v.icon && <span className="mr-1">{v.icon}</span>}{v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Acción Principal Compacta */}
        <button onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
        >
          <Plus size={16} strokeWidth={3}/> Agendar Cita
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'google' && renderGoogleView()}

        {/* Sidebar Summary */}
        <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-8 hidden xl:flex flex-col gap-8 shrink-0 overflow-y-auto">
           <div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Grid3X3 size={18} className="text-indigo-500"/> Operación Hoy
              </h3>
              <div className="space-y-4">
                <SummaryItem label="Completadas" value={agenda.filter(a => (a.status === 'finished' || a.status === 'paid') && a.date === formatDate(new Date())).length} icon={<CheckCircle2 className="text-emerald-500"/>} color="emerald" />
                <SummaryItem label="Pendientes" value={agenda.filter(a => (a.status === 'confirmed' || a.status === 'waiting' || a.status === 'in_consultation') && a.date === formatDate(new Date())).length} icon={<Clock className="text-amber-500"/>} color="amber" />
              </div>
           </div>
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Sincronización Cloud</p>
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 p-2 rounded-xl justify-center">
                 <RefreshCw size={10} className="animate-spin"/> Conectado a Firebase
              </div>
           </div>
        </div>
      </div>

      {/* MODAL: Add Appointment */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nueva Cita en Agenda">
         <div className="space-y-6">
            <div>
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Nombre del Paciente</label>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
                  <input type="text" value={searchPatient} onChange={e => setSearchPatient(e.target.value)}
                    placeholder="Escriba el nombre..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div className="mt-2 space-y-1">
                 {filteredPatients.map(p => (
                   <button key={p.id} onClick={() => { setNewAppointment({...newAppointment, patientId: p.id, patientName: p.name}); setSearchPatient(p.name); }}
                     className="w-full px-5 py-3 flex items-center justify-between hover:bg-indigo-600 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors text-left"
                   >
                     <span className="text-sm font-black text-white">{p.name}</span>
                     <Plus size={16} className="text-zinc-500"/>
                   </button>
                 ))}
               </div>
            </div>

            {doctors && doctors.length > 0 && (
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Médico de Atención *</label>
                <select
                  value={newAppointment.doctorId || (doctors.length > 0 ? doctors[0].id : '')}
                  onChange={e => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr(a). {d.name} {d.lastName || ''} ({d.specialty || 'Médico de Staff'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
               <div>
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Hora (24h) *</label>
                 <select
                   value={selectedHour}
                   onChange={e => {
                     const h = e.target.value;
                     setSelectedHour(h);
                     setNewAppointment(prev => ({ ...prev, time: `${h}:${selectedMinute}` }));
                   }}
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3.5 text-white font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                 >
                   {HOURS_24.map(h => (
                     <option key={h} value={h} className="bg-[#121212] text-white">{h} hrs</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Minuto *</label>
                 <select
                   value={selectedMinute}
                   onChange={e => {
                     const m = e.target.value;
                     setSelectedMinute(m);
                     setNewAppointment(prev => ({ ...prev, time: `${selectedHour}:${m}` }));
                   }}
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3.5 text-white font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                 >
                   {MINUTES_15.map(m => (
                     <option key={m} value={m} className="bg-[#121212] text-white">:{m} min</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Duración *</label>
                 <select
                   value={newAppointment.duration || 30}
                   onChange={e => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-3.5 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/50"
                 >
                   <option value={15} className="bg-[#121212] text-white">15 min</option>
                   <option value={30} className="bg-[#121212] text-white">30 min</option>
                   <option value={45} className="bg-[#121212] text-white">45 min</option>
                   <option value={60} className="bg-[#121212] text-white">60 min</option>
                 </select>
               </div>
            </div>
            <button onClick={handleCreateAppointment} disabled={isSaving || !searchPatient}
              className="w-full py-4 bg-indigo-600 disabled:bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
               {isSaving ? "Guardando..." : "Confirmar Cita"}
            </button>
         </div>
      </Modal>

      {/* MODAL: Edit Status */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Gestionar Cita">
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <h4 className="font-black text-lg">{selectedAppointment.patientName}</h4>
               <p className="text-[10px] font-bold text-zinc-400 uppercase">{selectedAppointment.time} • {selectedAppointment.type}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { s: 'waiting', l: 'En Sala', c: 'amber', i: <Clock size={16}/> },
                { s: 'finished', l: 'Ya Visto', c: 'emerald', i: <CheckCircle2 size={16}/> },
                { s: 'cancelled', l: 'Canceló', c: 'rose', i: <XCircle size={16}/> },
                { s: 'in_consultation', l: 'En Consulta', c: 'indigo', i: <Stethoscope size={16}/> },
              ].map(opt => (
                <button key={opt.s} onClick={() => {
                   if (opt.s === 'in_consultation' && userRole !== 'reception') {
                     onStartConsultation(selectedAppointment.id);
                     setIsEditModalOpen(false);
                   } else {
                     handleUpdateStatus(opt.s as any);
                   }
                }}
                  className={`flex items-center gap-2 p-3 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${selectedAppointment.status === opt.s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                >
                  {opt.i} {opt.l}
                </button>
              ))}
            </div>
            <button onClick={() => { if(confirm('¿Eliminar?')) onDeleteAppointment(selectedAppointment.id); setIsEditModalOpen(false); }} className="w-full py-3 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
               <Trash2 size={14}/> Eliminar Cita
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CurrentTimeIndicator() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const h = now.getHours(); const m = now.getMinutes();
  const top = ((h - START_HOUR) * 60 + m) * (HOUR_HEIGHT / 60);
  return (
    <div style={{ top: `${top}px` }} className="absolute left-0 right-0 z-10 pointer-events-none">
      <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-rose-500"></div>
      <div className="border-t-2 border-rose-500 w-full"></div>
    </div>
  );
}

function SummaryItem({ label, value, icon, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600',
    amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600',
    rose: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600',
  };
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border border-transparent transition-all ${colorMap[color]}`}>
       <div className="flex items-center gap-3">
         <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">{icon}</div>
         <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
       </div>
       <span className="text-xl font-black font-mono">{value}</span>
    </div>
  );
}
