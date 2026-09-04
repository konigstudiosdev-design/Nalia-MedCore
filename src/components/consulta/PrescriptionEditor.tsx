import React, { useState } from 'react';
import { Plus, Trash2, Printer, Download, Eye, CheckCircle2, ChevronLeft, X, Pill, ShieldCheck } from 'lucide-react';
import { Patient, Prescription } from '../../types';

interface PrescriptionEditorProps {
  patient: Patient;
  doctor: {
    name: string;
    specialty: string;
    license: string;
    dgp?: string;
    specialtyLicense?: string;
    clinicName?: string;
    address?: string | any;
    phone?: string;
    logo?: string;
    email?: string;
  };
  onSave: (prescription: Partial<Prescription>) => void;
  onBack: () => void;
}

export function PrescriptionEditor({ patient, doctor, onSave, onBack }: PrescriptionEditorProps) {
  const [medications, setMedications] = useState<any[]>([
    { name: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleFinalize = () => {
    onSave({
      patientId: patient?.id,
      medications,
      notes,
      status: 'finalized',
      date: new Date().toISOString()
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatAddress = (addr: any) => {
    if (!addr) return 'Consultorio Médico';
    if (typeof addr === 'object') return addr.street || 'Dirección por completar';
    return addr;
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#0A0A0A] flex flex-col h-full animate-in fade-in duration-300 overflow-hidden">
      {/* Header Interactivo */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 z-20 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft size={20}/>
          </button>
          <h2 className="text-lg font-bold">Nueva Receta Digital</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-2 transition-all"
          >
            <Eye size={18}/> Vista Previa
          </button>
          <button
            onClick={handleFinalize}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <CheckCircle2 size={18}/> Emitir Receta
          </button>
        </div>
      </header>

      {/* Editor Principal */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8 pb-20 print:hidden">
        <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-50 dark:border-zinc-800/50">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Paciente</p>
              <h3 className="text-2xl font-black">{patient?.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Fecha de Emisión</p>
              <p className="font-bold">{new Date().toLocaleDateString('es-MX')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Tratamiento</h4>
              <button onClick={addMedication} className="p-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-90 transition-all"><Plus size={18}/></button>
            </div>

            {medications.map((med, idx) => (
              <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl relative group">
                <button onClick={() => removeMedication(idx)} className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 shadow-sm transition-opacity">
                  <X size={14}/>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Medicamento (Marca o Genérico)</label>
                    <input type="text" value={med.name} onChange={e => updateMedication(idx, 'name', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Dosis / Presentación</label>
                    <input type="text" value={med.dosage} onChange={e => updateMedication(idx, 'dosage', e.target.value)} placeholder="Ej. 500mg tableta" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Frecuencia</label>
                    <input type="text" value={med.frequency} onChange={e => updateMedication(idx, 'frequency', e.target.value)} placeholder="Ej. Cada 8 horas" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Duración del Tratamiento</label>
                    <input type="text" value={med.duration} onChange={e => updateMedication(idx, 'duration', e.target.value)} placeholder="Ej. 7 días" className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Vía de Adm.</label>
                    <select value={med.route} onChange={e => updateMedication(idx, 'route', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm">
                      <option>Oral</option><option>Intramuscular</option><option>Intravenosa</option><option>Oftálmica</option><option>Tópica</option><option>Inhalada</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-50 dark:border-zinc-800/50">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Indicaciones, Dieta o Recomendaciones Generales</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full min-h-[120px] p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/5 font-medium resize-none transition-all"></textarea>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA Y MODAL DE IMPRESIÓN */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4 print:p-0 print:bg-white">
          <div className="bg-zinc-100 dark:bg-zinc-900 w-full max-w-5xl h-screen md:h-[95vh] rounded-none md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden border-none md:border md:border-white/10 print:h-auto print:rounded-none print:shadow-none print:border-none">

            {/* Header Modal (Oculto en Impresión) */}
            <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#121212] shrink-0 print:hidden">
               <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-500"/> Validación Documental
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Asegúrese de que toda la información legal sea correcta</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={handlePrint} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95">
                    <Printer size={18}/> Imprimir / PDF
                  </button>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white rounded-2xl transition-all">
                    <X size={20}/>
                  </button>
               </div>
            </div>

            {/* ZONA DE PAPEL (Lo que se imprime) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 flex justify-center bg-zinc-950/50 print:bg-white print:p-0 print:overflow-visible">
               <div className="bg-white text-zinc-900 font-serif w-[210mm] min-h-[297mm] shadow-2xl p-12 md:p-20 flex flex-col relative print:shadow-none print:w-full print:p-8">

                  {/* Logo sutil en marca de agua */}
                  {doctor?.logo && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.03] pointer-events-none grayscale">
                      <img src={doctor.logo} alt="Watermark" className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* ENCABEZADO LEGAL - Más Compacto */}
                  <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-zinc-900">
                    <div className="space-y-0.5">
                      <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Dr. {doctor?.name}</h1>
                      <p className="text-xs font-black text-zinc-700 uppercase tracking-widest">{doctor?.specialty}</p>
                      <div className="pt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                        <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">DGP: {doctor?.dgp || doctor?.license}</p>
                        {doctor?.specialtyLicense && (
                          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">CED. ESP: {doctor?.specialtyLicense}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1 max-w-[250px]">
                      <h2 className="text-lg font-black leading-none mb-0.5">{doctor?.clinicName || 'Nalia MedCore'}</h2>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-tighter font-sans leading-tight font-bold">{formatAddress(doctor?.address)}</p>
                      <div className="flex flex-col items-end gap-0.5">
                        <p className="text-[10px] font-black font-sans text-zinc-800">Tels: {doctor?.phone}</p>
                        <p className="text-[9px] font-bold font-sans text-indigo-600 underline">{doctor?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* DATOS DEL PACIENTE */}
                  <div className="grid grid-cols-3 gap-6 mb-12 py-6 border-b border-zinc-100 bg-zinc-50/50 px-4 rounded-2xl print:bg-transparent print:border-zinc-200">
                    <div>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Paciente</p>
                      <p className="text-sm font-black uppercase">{patient?.name}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Edad</p>
                      <p className="text-sm font-black">{patient?.age} años</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Fecha</p>
                      <p className="text-sm font-black">{new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Rx Y TRATAMIENTO */}
                  <div className="flex-1 px-4">
                    <div className="text-6xl font-serif opacity-10 mb-6 select-none italic font-black">Rx</div>
                    <div className="space-y-8">
                      {medications.map((med, i) => med.name && (
                        <div key={i} className="space-y-1.5">
                          <p className="text-xl font-black leading-tight border-b border-zinc-100 pb-1">{med.name} <span className="text-zinc-500 font-bold ml-2 text-base">({med.dosage})</span></p>
                          <div className="flex items-center gap-4 text-sm font-bold text-zinc-700 italic">
                            <span>{med.frequency}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span>Durante {med.duration}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span className="uppercase text-[11px] font-black not-italic bg-zinc-100 px-2 py-0.5 rounded">Vía: {med.route}</span>
                          </div>
                          {med.instructions && (
                            <p className="text-[12px] text-zinc-500 mt-2 font-sans leading-relaxed pl-4 border-l-2 border-zinc-100">
                              <strong className="text-zinc-900 uppercase text-[9px] tracking-widest mr-2">Instrucciones:</strong>
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {notes && (
                      <div className="mt-16 pt-10 border-t-2 border-zinc-100 border-dashed">
                        <h4 className="text-[10px] font-black uppercase mb-4 tracking-[0.2em] text-zinc-400 font-sans">Indicaciones y Medidas Generales:</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">{notes}</p>
                      </div>
                    )}
                  </div>

                  {/* PIE DE PÁGINA Y FIRMA */}
                  <div className="mt-20 pt-10 grid grid-cols-2 gap-12 items-end">
                    <div className="text-[9px] text-zinc-400 space-y-2 font-sans leading-tight">
                      <p className="font-bold text-zinc-500">IMPORTANTE:</p>
                      <p>Este documento no tiene validez si presenta tachaduras o enmendaduras. En caso de reacción adversa suspenda el uso y contacte a su médico.</p>
                      <p className="italic">Documento oficial generado por Nalia MedCore Platform v4.0</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-56 h-px bg-zinc-900 mx-auto"></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest font-sans">Firma del Médico</p>
                        <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold">{doctor?.name}</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Footer Modal Unificado (Oculto en Impresión) */}
            <div className="p-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0A0A0A] flex justify-center items-center shrink-0 print:hidden">
               <button
                 onClick={handlePrint}
                 className="w-full max-w-md py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
               >
                 <Download size={20}/> Guardar Receta (PDF)
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS DE IMPRESIÓN FORZADOS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 0; }
          body { background: white !important; }
          nav, aside, header, button, .print\\:hidden { display: none !important; }
          .fixed { position: relative !important; z-index: auto !important; background: white !important; padding: 0 !important; }
          .overflow-hidden, .overflow-y-auto { overflow: visible !important; }
          .shadow-2xl, .shadow-sm { shadow: none !important; box-shadow: none !important; }
          .bg-zinc-950\\/50, .bg-black\\/90 { background: white !important; backdrop-filter: none !important; }
          .h-screen, .h-\\[95vh\\] { height: auto !important; }
          .max-w-5xl, .max-w-4xl { max-width: none !important; width: 100% !important; }
          .p-12, .p-20 { padding: 40px !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
}
