import React, { useState, useEffect, useMemo } from 'react';
import {
  Save, CheckCircle2, Pill, Plus, User, Sparkles, Zap, Clock, Activity,
  AlertCircle, X, ChevronRight, ClipboardList, Phone, MapPin, Briefcase,
  Calendar, HeartPulse, Microscope, FileText, Search, ShieldCheck, Thermometer,
  Wind, Droplets, Gauge, Users, Trash2, ChevronDown, Download, Printer
} from 'lucide-react';
import { Patient, AgendaItem, NursingRequest, NursingRequestType, Consultation, Prescription, User as UserType } from '../../types';
import { AIAssistant } from '../shared/AIAssistant';
import { PrescriptionEditor } from './PrescriptionEditor';
import { Modal } from '../shared/Modal';

// Catálogo Profesional de Órdenes Médicas
const ORDER_TEMPLATES: Record<string, string[]> = {
  'Laboratorio (Hematología)': [
    'Biometría Hemática Completa',
    'Tiempos de Coagulación (TP, TPT, INR)',
    'Grupo Sanguíneo y Factor Rh',
    'VSG (Velocidad de Sedimentación Globular)'
  ],
  'Laboratorio (Bioquímica)': [
    'Química Sanguínea (6 elementos)',
    'Química Sanguínea (27 elementos)',
    'Perfil de Lípidos Completo',
    'Perfil Hepático (Pruebas de Función Hepática)',
    'Electrolitos Séricos (Na, K, Cl, Ca, Mg)',
    'Hemoglobina Glucosilada (HbA1c)',
    'Examen General de Orina (EGO)',
    'Perfil Tiroideo Completo (TSH, T3, T4)',
    'Perfil Hormonal Femenino'
  ],
  'Imagenología (Rayos X)': [
    'Radiografía de Tórax (PA)',
    'Radiografía de Abdomen Simple',
    'RX de Columna Lumbar (AP y Lateral)',
    'RX de Extremidad (Especifique en descripción)'
  ],
  'Imagenología (Ultrasonido)': [
    'Ultrasonido Abdominal Superior',
    'Ultrasonido Renal y Vías Urinarias',
    'Ultrasonido Pélvico / Endovaginal',
    'Ultrasonido de Cuello / Tiroides',
    'Ultrasonido Doppler (Especifique región)'
  ],
  'Imagenología (Avanzada)': [
    'TAC de Cráneo Simple',
    'TAC de Abdomen y Pelvis Contrastada',
    'Resonancia Magnética de Cerebro',
    'Resonancia Magnética de Columna',
    'Mastografía Bilateral'
  ],
  'Cardiología': [
    'Electrocardiograma de 12 derivaciones',
    'Ecocardiograma Doppler Color',
    'Holter de Ritmo (24 horas)',
    'MAPA (Monitoreo Ambulatorio de Presión)',
    'Prueba de Esfuerzo'
  ],
  'Interconsulta / Otros': [
    'Valoración por Nutrición Clínica',
    'Valoración por Psicología / Psiquiatría',
    'Valoración por Terapia Física y Rehabilitación',
    'Valoración por Oftalmología',
    'Valoración por Odontología'
  ]
};

interface ConsultaEditorProps {
  patient: Patient | null;
  appointment?: AgendaItem;
  nursingRequests: NursingRequest[];
  user: UserType | null;
  settings: any;
  onRequestNursing: (req: Partial<NursingRequest>) => void;
  onUpdatePatient: (data: Partial<Patient>) => void;
  finalizeConsultation: (id: string, data: Partial<Consultation>, prescription?: Partial<Prescription>, amount?: number) => void;
  navigateTo: (moduleId: string) => void;
}

export function ConsultaEditor({
  patient, appointment, nursingRequests = [], user, settings, onRequestNursing, onUpdatePatient, finalizeConsultation, navigateTo
}: ConsultaEditorProps) {
  const [view, setView] = useState<'editor' | 'prescription'>('editor');
  const [activeTab, setActiveTab] = useState<'soap' | 'physical' | 'orders'>('soap');

  // SOAP State
  const [soap, setSoap] = useState({ subjective: '', objective: '', analysis: '', plan: '' });

  // Obtener signos vitales más recientes de las solicitudes de enfermería
  const latestVitals = useMemo(() => {
    const vitalsRequest = [...(nursingRequests || [])]
      .filter(r => r.type === 'vitals' && r.status === 'completed' && r.resultData)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0];
    return vitalsRequest?.resultData;
  }, [nursingRequests]);

  // Vitals State
  const [vitals, setVitals] = useState({
    weight: '',
    height: '',
    temp: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: ''
  });

  // Pre-llenar signos vitales si enfermería ya los tomó
  useEffect(() => {
    if (latestVitals) {
      setVitals(prev => ({
        weight: prev.weight || latestVitals.weight?.toString() || '',
        height: prev.height || latestVitals.height?.toString() || '',
        temp: prev.temp || latestVitals.temp?.toString() || '',
        bloodPressure: prev.bloodPressure || latestVitals.bloodPressure || '',
        heartRate: prev.heartRate || latestVitals.heartRate?.toString() || '',
        respiratoryRate: prev.respiratoryRate || latestVitals.respiratoryRate?.toString() || '',
        oxygenSaturation: prev.oxygenSaturation || latestVitals.oxygenSaturation?.toString() || ''
      }));
    }
  }, [latestVitals]);

  const imc = useMemo(() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return '--';
  }, [vitals.weight, vitals.height]);

  // Detailed Clinical State
  const [clinicalDetail, setClinicalDetail] = useState({
    reason: '',
    physicalExam: { general: '', head: '', neck: '', chest: '', abdomen: '', extremities: '', neurological: '' },
    diagnoses: [] as string[],
    orders: [] as { id: string, type: string, description: string, category: string }[]
  });

  const [currentOrder, setCurrentOrder] = useState({ category: Object.keys(ORDER_TEMPLATES)[0], template: '', custom: '' });
  const [prescriptionData, setPrescriptionData] = useState<Partial<Prescription> | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNursingModalOpen, setIsNursingModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');

  const [newRequest, setNewRequest] = useState<Partial<NursingRequest>>({ type: 'vitals', priority: 'normal', notes: '' });

  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 bg-zinc-50/30 dark:bg-[#0A0A0A]">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-inner">
          <User size={32} className="text-zinc-400" />
        </div>
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Consulta sin Paciente</h3>
        <p className="max-w-xs mt-1 text-sm font-medium">Por favor, seleccione un paciente desde el Directorio o la Agenda para iniciar la atención clínica.</p>
        <button
          onClick={() => navigateTo('pacientes')}
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          Abrir Directorio
        </button>
      </div>
    );
  }

  const handleAddOrder = () => {
    const description = currentOrder.template === 'Otro' ? currentOrder.custom : currentOrder.template;
    if (!description && !currentOrder.custom) return;

    setClinicalDetail(prev => ({
      ...prev,
      orders: [...prev.orders, {
        id: Date.now().toString(),
        type: description || currentOrder.custom,
        category: currentOrder.category,
        description: currentOrder.custom
      }]
    }));
    setCurrentOrder({ ...currentOrder, template: '', custom: '' });
  };

  const handleSendRequest = () => {
    onRequestNursing({ ...newRequest, appointmentId: appointment?.id, patientId: patient.id, patientName: patient.name });
    setIsNursingModalOpen(false);
    setNewRequest({ type: 'vitals', priority: 'normal', notes: '' });
  };

  const handleFinishClick = () => {
    setIsChargeModalOpen(true);
  };

  const confirmFinalize = () => {
    // Construir nota SOAP extendida para especialistas
    const currentVitals = {
      ...latestVitals,
      weight: vitals.weight || latestVitals?.weight,
      height: vitals.height || latestVitals?.height,
      temp: vitals.temp || latestVitals?.temp,
      bloodPressure: vitals.bloodPressure || latestVitals?.bloodPressure,
      heartRate: vitals.heartRate || latestVitals?.heartRate,
      respiratoryRate: vitals.respiratoryRate || latestVitals?.respiratoryRate,
      oxygenSaturation: vitals.oxygenSaturation || latestVitals?.oxygenSaturation,
      imc: imc !== '--' ? imc : (latestVitals?.imc || '--')
    };

    const extendedObjective = `SIGNOS VITALES:
- Peso: ${currentVitals.weight || '--'} kg
- Talla: ${currentVitals.height || '--'} cm
- IMC: ${currentVitals.imc || '--'}
- Temp: ${currentVitals.temp || '--'} °C
- Tensión: ${currentVitals.bloodPressure || '--'} mmHg
- FC: ${currentVitals.heartRate || '--'} bpm
- FR: ${currentVitals.respiratoryRate || '--'} rpm
- SpO2: ${currentVitals.oxygenSaturation || '--'} %

EXPLORACIÓN FÍSICA:
- General: ${clinicalDetail.physicalExam.general || 'Sin hallazgos'}
- Cabeza: ${clinicalDetail.physicalExam.head}
- Cuello: ${clinicalDetail.physicalExam.neck}
- Tórax: ${clinicalDetail.physicalExam.chest}
- Abdomen: ${clinicalDetail.physicalExam.abdomen}
- Extremidades: ${clinicalDetail.physicalExam.extremities}
- Neurológico: ${clinicalDetail.physicalExam.neurological}

NOTAS OBJETIVAS ADICIONALES:
${soap.objective}`;

    const extendedPlan = `ÓRDENES MÉDICAS:\n${clinicalDetail.orders.map(o => `[${o.category}] ${o.type} ${o.description ? `(${o.description})` : ''}`).join('\n')}\nPLAN DE MANEJO:\n${soap.plan}`;

    finalizeConsultation(appointment?.id || '', {
      patientId: patient.id,
      reason: clinicalDetail.reason || soap.subjective.substring(0, 100),
      soap: { ...soap, objective: extendedObjective, plan: extendedPlan },
      diagnoses: clinicalDetail.diagnoses,
      vitalSigns: currentVitals as any,
      lastModifiedBy: 'doctor',
      lastModifiedAt: new Date().toISOString(),
      version: 1
    }, prescriptionData || undefined, parseFloat(chargeAmount) || 0);

    setIsChargeModalOpen(false);
    navigateTo('pacientes');
  };

  if (view === 'prescription') {
    return (
      <PrescriptionEditor
        patient={patient}
        doctor={{ name: user?.name + (user?.lastName ? ` ${user.lastName}` : ''), specialty: user?.specialty || 'Médico General', license: user?.licenseNumber || 'Pendiente de registro', dgp: settings.dgp, specialtyLicense: settings.specialtyLicense, clinicName: settings.clinicName, address: settings.address, phone: settings.phone, logo: settings.logo, email: settings.email }}
        onSave={(data) => { setPrescriptionData(data); setView('editor'); }}
        onBack={() => setView('editor')}
      />
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 relative bg-zinc-50/50 dark:bg-[#050505]">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 z-30 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">{patient.name.charAt(0)}</div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">{patient.name} <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] uppercase font-black">Exp: {patient.id.substring(0,8)}</span></h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-bold text-zinc-500 uppercase"><Clock size={10}/> Consulta Activa</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNursingModalOpen(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"><Zap size={16}/> Apoyo Vital</button>
          <button onClick={handleFinishClick} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">Finalizar Atenticón</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR CONTEXT */}
        <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] overflow-y-auto hidden lg:flex flex-col shrink-0">
          <div className="p-6 space-y-8">
            <section className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
               <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle size={14}/> Alertas Críticas</h3>
               <div className="space-y-1">{patient.medicalHistory?.allergies?.length ? patient.medicalHistory.allergies.map(a => <span key={a} className="inline-block px-2 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase mr-1">{a}</span>) : <p className="text-[10px] font-bold text-zinc-400 italic">Sin alergias</p>}</div>
            </section>
            <section>
              <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HeartPulse size={14} className="text-emerald-500"/> Signos Vitales</h3>
              <div className="grid grid-cols-2 gap-3">
                 <VitalsCard icon={<Thermometer size={12}/>} label="Temp" value={latestVitals?.temp ? `${latestVitals.temp}°C` : '--'} color="amber" />
                 <VitalsCard icon={<Gauge size={12}/>} label="Tensión" value={latestVitals?.bloodPressure || '--'} color="indigo" />
                 <VitalsCard icon={<Activity size={12}/>} label="FC" value={latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : '--'} color="rose" />
                 <VitalsCard icon={<Wind size={12}/>} label="SpO2" value={latestVitals?.oxygenSaturation ? `${latestVitals.oxygenSaturation}%` : '--'} color="blue" />
              </div>
            </section>
          </div>
        </aside>

        {/* WORKSTATION */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#050505] relative flex flex-col">
          <div className="flex bg-zinc-100/50 dark:bg-[#0A0A0A] p-1 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
            {[{ id: 'soap', label: 'Evolución SOAP', icon: <ClipboardList size={14}/> }, { id: 'physical', label: 'Sistemas', icon: <User size={14}/> }, { id: 'orders', label: 'Órdenes Médicas', icon: <Microscope size={14}/> }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-900'}`}>{t.icon} {t.label}</button>
            ))}
          </div>

          <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-12">
            {activeTab === 'soap' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* APARTADO DE SIGNOS VITALES */}
                <section className="bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <HeartPulse size={20} />
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">Signos Vitales y Somatometría</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <VitalsInput label="Peso (kg)" value={vitals.weight} onChange={v => setVitals({...vitals, weight: v})} placeholder="00.0" />
                    <VitalsInput label="Talla (cm)" value={vitals.height} onChange={v => setVitals({...vitals, height: v})} placeholder="000" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">IMC</label>
                      <div className="h-[42px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold text-sm text-indigo-500">
                        {imc}
                      </div>
                    </div>
                    <VitalsInput label="Temp (°C)" value={vitals.temp} onChange={v => setVitals({...vitals, temp: v})} placeholder="36.5" />
                    <VitalsInput label="Tensión" value={vitals.bloodPressure} onChange={v => setVitals({...vitals, bloodPressure: v})} placeholder="120/80" />
                    <VitalsInput label="FC (bpm)" value={vitals.heartRate} onChange={v => setVitals({...vitals, heartRate: v})} placeholder="70" />
                    <VitalsInput label="FR (rpm)" value={vitals.respiratoryRate} onChange={v => setVitals({...vitals, respiratoryRate: v})} placeholder="16" />
                    <VitalsInput label="SpO2 (%)" value={vitals.oxygenSaturation} onChange={v => setVitals({...vitals, oxygenSaturation: v})} placeholder="98" />
                  </div>
                </section>

                <section><label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block ml-1">Subjetivo (Anamnesis)</label><textarea value={soap.subjective} onChange={e => setSoap({...soap, subjective: e.target.value})} className="w-full min-h-[160px] p-6 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-base outline-none focus:ring-4 focus:ring-indigo-500/5 resize-none transition-all placeholder:text-zinc-300 font-medium"></textarea></section>
                <section>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block ml-1">Objetivo (Hallazgos)</label>
                  <textarea
                    value={soap.objective}
                    onChange={e => setSoap({...soap, objective: e.target.value})}
                    className="w-full min-h-[160px] p-6 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-base outline-none focus:ring-4 focus:ring-indigo-500/5 resize-none transition-all placeholder:text-zinc-300 font-medium"
                    placeholder="Exploración física y hallazgos observados..."
                  ></textarea>
                </section>
                <section><label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block ml-1">Análisis (Diagnósticos)</label><textarea value={soap.analysis} onChange={e => setSoap({...soap, analysis: e.target.value})} className="w-full min-h-[120px] p-6 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-base outline-none focus:ring-4 focus:ring-indigo-500/5 resize-none transition-all placeholder:text-zinc-300 font-medium"></textarea></section>
                <section><div className="flex items-center justify-between mb-4"><label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1">Plan de Manejo</label><button onClick={() => setView('prescription')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><Pill size={14}/> Receta</button></div><textarea value={soap.plan} onChange={e => setSoap({...soap, plan: e.target.value})} className="w-full min-h-[160px] p-6 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-base outline-none focus:ring-4 focus:ring-indigo-500/5 resize-none transition-all placeholder:text-zinc-300 font-medium"></textarea></section>
              </div>
            )}

            {activeTab === 'physical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {['General', 'Cabeza', 'Cuello', 'Tórax', 'Abdomen', 'Extremidades', 'Neurológico'].map(s => <SystemInput key={s} label={s} value={(clinicalDetail.physicalExam as any)[s.toLowerCase()]} onChange={v => setClinicalDetail({...clinicalDetail, physicalExam: {...clinicalDetail.physicalExam, [s.toLowerCase()]: v}})} />)}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Formulario de Órdenes */}
                <div className="flex-1 space-y-6">
                  <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Microscope size={20} className="text-indigo-600"/> Generar Órdenes</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Categoría</label>
                        <select
                          value={currentOrder.category}
                          onChange={e => setCurrentOrder({...currentOrder, category: e.target.value, template: ''})}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                           {Object.keys(ORDER_TEMPLATES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Estudio Sugerido</label>
                        <select
                          value={currentOrder.template}
                          onChange={e => setCurrentOrder({...currentOrder, template: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                           <option value="">Seleccione un estudio...</option>
                           {ORDER_TEMPLATES[currentOrder.category].map(t => <option key={t} value={t}>{t}</option>)}
                           <option value="Otro">Otro (Especificar)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block ml-1">Indicaciones o Detalles</label>
                        <textarea
                          value={currentOrder.custom}
                          onChange={e => setCurrentOrder({...currentOrder, custom: e.target.value})}
                          placeholder="Notas adicionales para el laboratorio o centro de imagen..."
                          className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium h-24 resize-none"
                        ></textarea>
                      </div>

                      <button
                        onClick={handleAddOrder}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Plus size={20}/> Agregar a la Lista
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vista Previa Estilo Receta - Letra mas pequeña y datos completos */}
                <div className="w-full lg:w-[420px] shrink-0 print:fixed print:inset-0 print:z-[1000] print:bg-white print:m-0 print:p-0">
                  <div className="bg-white text-zinc-900 font-serif border border-zinc-200 shadow-2xl rounded-sm p-6 min-h-[600px] flex flex-col relative overflow-hidden print:shadow-none print:border-none print:w-[210mm] print:min-h-[297mm] print:p-12 print:mx-auto">
                    {/* Header Receta en Orden - Versión Ultra Compacta */}
                    <div className="border-b-[1.5px] border-zinc-900 pb-2 mb-3">
                      <h2 className="text-sm font-black uppercase tracking-tight leading-none">Dr. {user?.name} {user?.lastName}</h2>
                      <p className="text-[7px] font-bold italic text-zinc-600 uppercase mt-0.5">{user?.specialty || 'Médico'}</p>
                      <div className="mt-1 flex gap-3">
                        <p className="text-[6.5px] text-indigo-600 font-black uppercase tracking-widest">DGP: {settings.dgp || '---'}</p>
                        {settings.specialtyLicense && <p className="text-[6.5px] text-indigo-600 font-black uppercase tracking-widest">CED. ESP: {settings.specialtyLicense}</p>}
                      </div>
                    </div>

                    {/* Logo sutil en marca de agua */}
                    {settings.logo && (
                      <div className="absolute top-4 right-4 w-12 h-12 opacity-10">
                        <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="text-2xl opacity-5 mb-3 italic font-black">Órdenes</div>

                      <div className="mb-4 pb-2 border-b border-zinc-100 grid grid-cols-2 gap-2 text-[8px] font-sans font-bold uppercase text-zinc-400">
                        <p>Paciente: <span className="text-zinc-900">{patient.name}</span></p>
                        <p className="text-right">Fecha: <span className="text-zinc-900">{new Date().toLocaleDateString('es-MX')}</span></p>
                      </div>

                      <div className="space-y-6">
                        {clinicalDetail.orders.length === 0 ? (
                          <div className="py-20 text-center text-zinc-300 italic text-[9px] font-sans uppercase tracking-widest">No hay órdenes agregadas</div>
                        ) : (
                          [...clinicalDetail.orders]
                            .sort((a, b) => a.category.localeCompare(b.category))
                            .reduce((acc, order, idx, arr) => {
                              const showCategory = idx === 0 || order.category !== arr[idx - 1].category;

                              if (showCategory) {
                                acc.push(
                                  <div key={`cat-${order.category}`} className="mt-4 first:mt-0">
                                    <p className="text-[9px] font-black uppercase text-indigo-600 leading-none mb-2 font-sans tracking-wider">{order.category}</p>
                                    <div className="space-y-1.5 ml-1">
                                      {arr.filter(o => o.category === order.category).map(o => (
                                        <div key={o.id} className="relative group flex items-start gap-2">
                                          <button
                                            onClick={() => setClinicalDetail({...clinicalDetail, orders: clinicalDetail.orders.filter(item => item.id !== o.id)})}
                                            className="absolute -right-4 top-0 p-1 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                                          >
                                            <Trash2 size={10}/>
                                          </button>
                                          <span className="text-zinc-400 mt-1 font-sans text-[10px]">•</span>
                                          <div className="flex-1">
                                            <p className="text-[10.5px] font-bold leading-tight text-zinc-900 font-sans">{o.type}</p>
                                            {o.description && <p className="text-[8.5px] text-zinc-500 mt-0.5 italic font-sans leading-snug">{o.description}</p>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return acc;
                            }, [] as React.ReactNode[])
                        )}
                      </div>
                    </div>

                    {/* Footer Receta */}
                    <div className="mt-6 pt-3 border-t border-zinc-200 flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <div className="text-[7px] text-zinc-400 font-sans uppercase space-y-0.5">
                          <p className="font-bold text-zinc-500">{settings.clinicName || 'Nalia MedCore'}</p>
                          <p className="max-w-[180px] leading-tight">{settings.address}</p>
                          <p>Tel: {settings.phone}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-px bg-zinc-300 mx-auto mb-1"></div>
                          <p className="text-[7px] font-black uppercase font-sans">Firma del Médico</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all active:scale-95"
                    >
                       <Download size={18}/> Descargar Orden (PDF)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      <Modal isOpen={isNursingModalOpen} onClose={() => setIsNursingModalOpen(false)} title="Apoyo Vital">
         <div className="space-y-6">
            <select value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value as NursingRequestType})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white font-bold"><option value="vitals">Toma de Signos Vitales</option><option value="medication">Administración de Medicamento</option><option value="wound_care">Curación</option></select>
            <textarea value={newRequest.notes} onChange={e => setNewRequest({...newRequest, notes: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white min-h-[100px]" placeholder="Instrucciones..."></textarea>
            <button onClick={handleSendRequest} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase">Enviar a Enfermería</button>
         </div>
      </Modal>

      {/* MODAL: CARGO A RECEPCIÓN */}
      <Modal isOpen={isChargeModalOpen} onClose={() => setIsChargeModalOpen(false)} title="Finalizar y Notificar Cobro">
         <div className="space-y-6">
            <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Paciente</p>
               <h4 className="text-xl font-black">{patient.name}</h4>
               <p className="text-xs mt-2 font-medium opacity-90">Indique el monto total de la consulta para enviar a recepción.</p>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Monto a Cobrar ($)</label>
               <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-500">$</div>
                  <input
                    type="number"
                    autoFocus
                    value={chargeAmount}
                    onChange={e => setChargeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] pl-12 pr-6 py-5 text-3xl font-black font-mono text-white outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
               </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex gap-3">
               <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
               <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  Al confirmar, se guardará el expediente clínico y se enviará una notificación inmediata a la recepcionista para procesar el pago de <strong>{patient.name}</strong>.
               </p>
            </div>

            <div className="flex gap-3">
               <button
                 onClick={() => setIsChargeModalOpen(false)}
                 className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
               >
                 Regresar
               </button>
               <button
                 onClick={confirmFinalize}
                 disabled={!chargeAmount}
                 className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={18}/> Finalizar y Notificar
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
}

function SystemInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full min-h-[80px] p-4 bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none font-medium transition-all" placeholder={`Hallazgos...`}></textarea>
    </div>
  );
}

function VitalsInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[42px] px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm transition-all"
      />
    </div>
  );
}

function VitalsCard({ icon, label, value, color }: any) {
  const colorMap: any = { amber: 'text-amber-500 bg-amber-500/10', indigo: 'text-indigo-500 bg-indigo-500/10', rose: 'text-rose-500 bg-rose-500/10', blue: 'text-blue-500 bg-blue-500/10' };
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>{icon}</div>
        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-xs font-black tracking-tight">{value}</div>
    </div>
  );
}
