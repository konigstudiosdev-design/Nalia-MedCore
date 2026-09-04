import React, { useState } from 'react';
import { ChevronLeft, HeartPulse, Thermometer, Activity, Scale, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { AgendaItem, VitalSigns } from '../../types';

interface PatientPrepProps {
  appointment: AgendaItem;
  onSaveVitals: (id: string, vitals: VitalSigns) => void;
  onBack: () => void;
  nurseName?: string;
}

export function PatientPrep({ appointment, onSaveVitals, onBack, nurseName = 'Enfermería' }: PatientPrepProps) {
  const [vitals, setVitals] = useState<VitalSigns>({
    weight: undefined,
    height: undefined,
    temp: undefined,
    bloodPressure: '',
    heartRate: undefined,
    oxygenSaturation: undefined,
    respiratoryRate: undefined,
    recordedAt: new Date().toISOString(),
    recordedBy: nurseName
  });

  const handleFinish = () => {
    onSaveVitals(appointment.id, vitals);
    onBack();
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 bg-zinc-50/50 dark:bg-[#0A0A0A]">
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft size={20}/>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {appointment.patientName.charAt(0)}
             </div>
             <h2 className="text-lg font-black tracking-tight">Preparación: {appointment.patientName}</h2>
          </div>
        </div>
        <button
          onClick={handleFinish}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <CheckCircle2 size={18}/> Finalizar Preparación
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
        <div className="space-y-10">
           {/* Patient Safety Alert */}
           <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 p-6 rounded-3xl flex items-start gap-5">
              <AlertCircle size={24} className="text-amber-600 shrink-0"/>
              <div>
                 <h4 className="font-black text-amber-900 dark:text-amber-400 mb-1">Confirmación de Identidad</h4>
                 <p className="text-sm text-amber-700 dark:text-amber-500 font-medium">Por favor, verifique el nombre completo y fecha de nacimiento antes de registrar signos vitales.</p>
              </div>
           </div>

           {/* Vitals Form */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm space-y-6">
                 <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-500"/> Signos Vitales
                 </h3>

                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Tensión Arterial (mmHg)</label>
                       <input
                         type="text"
                         placeholder="120/80"
                         value={vitals.bloodPressure}
                         onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                         className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Frecuencia Cardiaca</label>
                          <div className="relative">
                             <input
                               type="number"
                               placeholder="72"
                               value={vitals.heartRate || ''}
                               onChange={(e) => setVitals({...vitals, heartRate: parseInt(e.target.value)})}
                               className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">BPM</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Saturación O2</label>
                          <div className="relative">
                             <input
                               type="number"
                               placeholder="98"
                               value={vitals.oxygenSaturation || ''}
                               onChange={(e) => setVitals({...vitals, oxygenSaturation: parseInt(e.target.value)})}
                               className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">%</span>
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Temperatura</label>
                       <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="36.5"
                            value={vitals.temp || ''}
                            onChange={(e) => setVitals({...vitals, temp: parseFloat(e.target.value)})}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">°C</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm space-y-6">
                 <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Scale size={18} className="text-indigo-500"/> Somatometría
                 </h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Peso Actual</label>
                       <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="70.0"
                            value={vitals.weight || ''}
                            onChange={(e) => setVitals({...vitals, weight: parseFloat(e.target.value)})}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">KG</span>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Estatura</label>
                       <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1.70"
                            value={vitals.height || ''}
                            onChange={(e) => setVitals({...vitals, height: parseFloat(e.target.value)})}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-5 pr-12 py-3 text-lg font-black font-mono outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase">MTS</span>
                       </div>
                    </div>
                    <div className="pt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">IMC Calculado</span>
                       <span className="text-xl font-black font-mono text-indigo-600">
                          {vitals.weight && vitals.height ? (vitals.weight / (vitals.height * vitals.height)).toFixed(1) : '--.-'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Observaciones de Enfermería</h3>
              <textarea
                placeholder="Estado general del paciente, alergias confirmadas o comentarios para el médico..."
                className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
           </div>
        </div>
      </div>
    </div>
  );
}
