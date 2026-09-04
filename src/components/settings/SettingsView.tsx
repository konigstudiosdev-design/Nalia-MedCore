import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Building, Save, Mail, Phone, MapPin, Award,
  Stethoscope, Image as ImageIcon, Upload, X
} from 'lucide-react';

import { Role } from '../../types';

interface SettingsViewProps {
  settings: any;
  onSave: (s: any) => void;
  workMode?: 'clinical' | 'admin';
  userRole?: Role;
}

export function SettingsView({ settings, onSave, workMode = 'clinical', userRole }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'clinic'>(workMode === 'admin' ? 'clinic' : 'profile');
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    dgp: '',
    specialtyLicense: '',
    clinicName: '',
    address: '',
    email: '',
    phone: '',
    logo: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        doctorName: settings.doctorName || '',
        specialty: settings.specialty || '',
        dgp: settings.dgp || settings.licenseNumber || '',
        specialtyLicense: settings.specialtyLicense || '',
        clinicName: settings.clinicName || '',
        address: settings.address || '',
        email: settings.email || '',
        phone: settings.phone || '',
        logo: settings.logo || ''
      });
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo excede los 5MB permitidos.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL('image/png', 0.7);
            setFormData({ ...formData, logo: compressedBase64 });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isNurse = userRole === 'nurse';
  const isReception = userRole === 'reception';

  const sectionTitle = isNurse
    ? 'Información de Enfermería'
    : isReception
      ? 'Información del Colaborador'
      : 'Información del Médico';

  const nameLabel = isNurse
    ? 'Nombre del Enfermero(a)'
    : isReception
      ? 'Nombre Completo'
      : 'Nombre del Médico';

  const specialtyLabel = isNurse
    ? 'Área / Especialidad'
    : isReception
      ? 'Puesto / Turno'
      : 'Especialidad';

  const specialtyPlaceholder = isNurse
    ? 'Ej. Enfermería General / Cuidados Intensivos'
    : isReception
      ? 'Ej. Recepción / Caja Turno Matutino'
      : 'Ej. Cardiólogo';

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Configuración</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestión de identidad profesional y clínica institucional</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navegación lateral de ajustes con Cambio de Pestaña */}
        <div className="w-full lg:w-72 space-y-2 shrink-0">
          <SettingsTab
            icon={<UserIcon size={20}/>}
            label="Perfil Profesional"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          {workMode === 'admin' && (
            <SettingsTab
              icon={<Building size={20}/>}
              label="Datos de la Clínica"
              active={activeTab === 'clinic'}
              onClick={() => setActiveTab('clinic')}
            />
          )}
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PESTAÑA: PERFIL PROFESIONAL */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-50 dark:border-zinc-800 pb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <UserIcon size={24} />
                  </div>
                  <h3 className="font-black text-xl">{sectionTitle}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label={nameLabel} icon={UserIcon} value={formData.doctorName} onChange={(v: string) => setFormData({...formData, doctorName: v})} placeholder="Nombre y Apellidos" />
                  <InputGroup label={specialtyLabel} icon={Stethoscope} value={formData.specialty} onChange={(v: string) => setFormData({...formData, specialty: v})} placeholder={specialtyPlaceholder} />
                  <InputGroup label="Cédula Profesional" icon={Award} value={formData.dgp} onChange={(v: string) => setFormData({...formData, dgp: v})} placeholder="Cédula o Folio" />
                  {!isReception && (
                    <InputGroup label="Cédula de Especialidad" icon={Award} value={formData.specialtyLicense} onChange={(v: string) => setFormData({...formData, specialtyLicense: v})} placeholder="Cédula ESP (Opcional)" />
                  )}
                  <InputGroup label="Correo Institucional" icon={Mail} value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="correo@ejemplo.com" disabled />
                </div>
              </div>
            )}

            {/* PESTAÑA: DATOS DE LA CLÍNICA */}
            {activeTab === 'clinic' && (
              <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 border-b border-zinc-50 dark:border-zinc-800 pb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Building size={24} />
                  </div>
                  <h3 className="font-black text-xl">Detalles de la Clínica</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group shrink-0">
                        {formData.logo ? (
                          <>
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, logo: ''})}
                              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={14}/>
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-zinc-300">
                            <ImageIcon size={32} strokeWidth={1.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest mt-2">Sin Logo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cargar Logotipo Institucional</label>
                        <div className="relative group">
                          <div className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border-dashed">
                            <Upload size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                            <span className="text-xs font-bold text-zinc-500">Seleccionar archivo (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <InputGroup label="Nombre Comercial" icon={Building} value={formData.clinicName} onChange={(v: string) => setFormData({...formData, clinicName: v})} placeholder="Nombre de tu consultorio" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Teléfonos de Contacto" icon={Phone} value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="Ej. 55 1234 5678" />
                        <InputGroup label="Dirección Completa" icon={MapPin} value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} placeholder="Calle, Número, Col, Ciudad" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <Save size={20} strokeWidth={3}/> Actualizar {activeTab === 'profile' ? 'Perfil Profesional' : 'Datos de Clínica'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, value, onChange, placeholder, disabled }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          disabled={disabled}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'}`}
    >
      {icon}
      {label}
    </button>
  );
}
