import React, { useState } from 'react';
import {
  User, Phone, MapPin, Briefcase, Calendar, Info, Clock, HeartPulse,
  Pill, FileText, Edit, Trash2, Save, X, ChevronRight, History as HistoryIcon,
  Search, ExternalLink, Download
} from 'lucide-react';
import { Patient, Consultation, Prescription, Role } from '../../types';
import { Avatar } from '../shared/Avatar';
import { Modal } from '../shared/Modal';

interface PatientDetailProps {
  patient: Patient | null;
  consultations: Consultation[];
  prescriptions: Prescription[];
  onUpdatePatient: (data: Partial<Patient>) => void;
  onDeletePatient: (id: string) => void;
  onStartPatientConsultation: (patient: Patient) => void;
  userRole?: Role;
  navigateTo: (moduleId: string) => void;
}

export function PatientDetail({
  patient, consultations = [], prescriptions = [], onUpdatePatient, onDeletePatient, onStartPatientConsultation, userRole, navigateTo
}: PatientDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [editData, setEditData] = useState<Partial<Patient>>({});

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 bg-zinc-50/30 dark:bg-[#0A0A0A]">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <User size={32} className="text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">No hay paciente seleccionado</h3>
        <p className="max-w-xs mt-1 font-medium">Selecciona un paciente de la lista para ver su ficha de información.</p>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditData({ ...patient });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    onUpdatePatient(editData);
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el expediente de ${patient.name}? Esta acción no se puede deshacer.`)) {
      onDeletePatient(patient.id);
    }
  };

  const DataRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: any }) => {
    const displayValue = typeof value === 'object' ? (value.street || JSON.stringify(value)) : value;
    return (
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#151515] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayValue || 'No registrado'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-zinc-50/30 dark:bg-[#0A0A0A] overflow-y-auto flex flex-col">
      {/* Header con Acciones de Gestión */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar src={patient.avatar} name={patient.name} gender={patient.gender} size="lg" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">{patient.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/10">Expediente Activo</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID: {patient.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => setIsHistoryModalOpen(true)}
               className="px-5 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
             >
                <HistoryIcon size={18}/> Historial
             </button>
             <button
               onClick={handleEditClick}
               className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
               title="Editar Información"
             >
                <Edit size={20}/>
             </button>
             <button
               onClick={handleDeleteClick}
               className="p-3 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
               title="Eliminar Expediente"
             >
                <Trash2 size={20}/>
             </button>
             {(userRole === 'doctor' || userRole === 'organization_admin' || !userRole) && (
               <>
                 <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block"></div>
                 <button
                   onClick={() => onStartPatientConsultation(patient)}
                   className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                 >
                   Iniciar Consulta
                 </button>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8">
        {/* Ficha de Identificación */}
        <div>
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Info size={16} className="text-indigo-500"/> Ficha de Identificación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataRow icon={Calendar} label="Fecha de Nacimiento" value={patient.birthDate} />
            <DataRow icon={User} label="Edad" value={`${patient.age} años`} />
            <DataRow icon={User} label="Género" value={patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'} />
            <DataRow icon={Phone} label="Teléfono" value={patient.phone} />
            <DataRow icon={Briefcase} label="Ocupación" value={patient.occupation} />
            <DataRow icon={MapPin} label="Domicilio" value={patient.address} />
          </div>
        </div>

        {/* Resumen Clínico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HeartPulse size={14} className="text-rose-500"/> Signos Recientes
            </h4>
            <p className="text-xs font-bold text-zinc-500 italic">No hay registros recientes</p>
          </div>
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Pill size={14} className="text-indigo-500"/> Medicación
            </h4>
            <p className="text-xs font-bold text-zinc-500 italic">Sin medicamentos activos</p>
          </div>
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={14} className="text-amber-500"/> Antecedentes
            </h4>
            <p className="text-xs font-bold text-zinc-500 italic">Expediente nuevo</p>
          </div>
        </div>

        {/* CTA: Iniciar Consulta */}
        {(userRole === 'doctor' || userRole === 'organization_admin' || !userRole) ? (
          <div className="p-8 bg-indigo-600 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-black mb-1 tracking-tight">Atención Clínica</h4>
              <p className="text-indigo-100 text-sm font-medium opacity-80">Para editar el historial completo o registrar diagnósticos, inicie una consulta.</p>
            </div>
            <button
              onClick={() => onStartPatientConsultation(patient)}
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              Abrir en Consulta
            </button>
          </div>
        ) : null}
      </div>

      {/* MODAL: Historial Clínico (Lista de Consultas) */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Historial Clínico Completo">
         <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {consultations.length === 0 ? (
               <div className="text-center py-20">
                  <HistoryIcon size={48} className="mx-auto text-zinc-200 mb-4 opacity-20"/>
                  <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Sin consultas previas registradas</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {consultations.map(c => (
                     <div key={c.id} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.date}</p>
                              <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">{c.reason || 'Sin motivo especificado'}</h4>
                           </div>
                           <button
                             onClick={() => setSelectedConsultation(c)}
                             className="p-2 bg-white dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-indigo-600 transition-colors shadow-sm"
                           >
                              <ExternalLink size={18}/>
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                              <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Diagnóstico</p>
                              <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1">{c.soap?.analysis || 'No registrado'}</p>
                           </div>
                           <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                              <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Plan</p>
                              <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1">{c.soap?.plan || 'No registrado'}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </Modal>

      {/* MODAL: Detalle de Consulta Individual */}
      <Modal isOpen={!!selectedConsultation} onClose={() => setSelectedConsultation(null)} title="Detalle de Consulta">
         {selectedConsultation && (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
               <div className="p-6 bg-indigo-600 rounded-[32px] text-white flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{selectedConsultation.date}</p>
                    <h4 className="text-xl font-black tracking-tight">{selectedConsultation.reason || 'Consulta General'}</h4>
                  </div>
                  {prescriptions.find(p => p.consultationId === selectedConsultation.id) && (
                    <button
                      onClick={() => alert('Generando PDF de Receta...')}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-all flex items-center gap-2"
                      title="Descargar Receta"
                    >
                      <Pill size={20}/>
                      <Download size={16}/>
                    </button>
                  )}
               </div>

               <div className="space-y-6">
                  {[
                    { l: '[S] Subjetivo', v: selectedConsultation.soap?.subjective, c: 'blue' },
                    { l: '[O] Objetivo', v: selectedConsultation.soap?.objective, c: 'emerald' },
                    { l: '[A] Análisis', v: selectedConsultation.soap?.analysis, c: 'indigo' },
                    { l: '[P] Plan Médico', v: selectedConsultation.soap?.plan, c: 'amber' }
                  ].map(sec => (
                     <div key={sec.l} className="space-y-2">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{sec.l}</h5>
                        <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px]">
                           <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{sec.v || 'Sin registros'}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <button
                 onClick={() => setSelectedConsultation(null)}
                 className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
               >
                  Cerrar Detalle
               </button>
            </div>
         )}
      </Modal>

      {/* Modal para Editar Información (Mantener el anterior) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Ficha de Identificación">
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editData.birthDate || ''}
                    onChange={e => setEditData({...editData, birthDate: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Edad</label>
                  <input
                    type="number"
                    value={editData.age || ''}
                    onChange={e => setEditData({...editData, age: parseInt(e.target.value)})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Género</label>
                  <select
                    value={editData.gender || ''}
                    onChange={e => setEditData({...editData, gender: e.target.value as any})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  >
                     <option value="">Seleccionar...</option>
                     <option value="M">Masculino</option>
                     <option value="F">Femenino</option>
                     <option value="O">Otro</option>
                  </select>
               </div>
               <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Teléfono</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={e => setEditData({...editData, phone: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Ocupación</label>
                  <input
                    type="text"
                    value={editData.occupation || ''}
                    onChange={e => setEditData({...editData, occupation: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Domicilio</label>
                  <input
                    type="text"
                    value={editData.address || ''}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold"
                  />
               </div>
            </div>
            <div className="flex gap-3 pt-4">
               <button
                 onClick={() => setIsEditModalOpen(false)}
                 className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
               >
                 Cancelar
               </button>
               <button
                 onClick={handleSaveEdit}
                 className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 <Save size={18}/> Guardar Cambios
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
