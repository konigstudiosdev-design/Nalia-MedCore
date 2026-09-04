import React, { useState, useEffect } from 'react';
import { User, Organization } from '../../types';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  User as UserIcon, Building2, MapPin, Settings2, Users,
  ArrowRight, ArrowLeft, Check, Loader2, Sparkles, Globe, Shield, CreditCard, AlertCircle, RefreshCw, LogOut, X
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface OnboardingViewProps {
  user: User;
  onComplete: () => void;
}

export function OnboardingView({ user, onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profInfo, setProfInfo] = useState({
    name: user.name || '',
    lastName: user.lastName || '',
    specialty: user.specialty || '',
    licenseNumber: user.licenseNumber || ''
  });

  const [orgInfo, setOrgInfo] = useState({
    name: '',
    type: 'consultorio',
    primarySpecialty: '',
    logo: ''
  });

  const [location, setLocation] = useState({
    street: '',
    city: '',
    state: '',
    country: 'México',
    phone: ''
  });

  const [config, setOrgConfig] = useState({
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    locale: 'es-MX'
  });

  const handleFinish = async () => {
    if (!orgInfo.name) {
      setError('El nombre de la clínica es obligatorio (Paso 2).');
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Timeout de seguridad: Si Firestore no responde en 10s, permitimos avanzar manualmente
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[ONBOARDING] El guardado está tardando demasiado. Posible éxito silencioso.');
        setIsLoading(false);
        setError('La respuesta de la nube es lenta, pero es posible que se haya guardado. Intenta dar clic en "Finalizar y Entrar" una vez más.');
      }
    }, 10000);

    try {
      const orgId = user.organizationId || `org_${user.id.substring(0, 8)}`;

      console.log('[ONBOARDING] Iniciando secuencia de guardado...');

      // 1. Guardar Organización
      console.log('[ONBOARDING] 1/3 Guardando Organización...');
      await setDoc(doc(db, 'organizations', orgId), {
        id: orgId,
        name: orgInfo.name,
        type: orgInfo.type,
        primarySpecialty: orgInfo.primarySpecialty || 'General',
        email: user.email,
        phone: location.phone || '',
        address: {
          street: location.street || '',
          city: location.city || '',
          state: location.state || '',
          country: location.country || 'México'
        },
        settings: { ...config, workingHours: {} },
        status: 'active',
        ownerId: user.id,
        createdAt: new Date().toISOString()
      });

      // 2. Guardar Perfil de Usuario
      console.log('[ONBOARDING] 2/2 Actualizando Perfil de Usuario...');
      await setDoc(doc(db, 'users', user.id), {
        id: user.id,
        name: profInfo.name || user.name,
        lastName: profInfo.lastName || '',
        email: user.email,
        role: 'organization_admin',
        isOwner: true,
        specialty: profInfo.specialty || '',
        licenseNumber: profInfo.licenseNumber || '',
        organizationId: orgId,
        onboardingCompleted: true,
        status: 'active',
        createdAt: user.createdAt || new Date().toISOString()
      }, { merge: true });

      console.log('[ONBOARDING] ¡Éxito total!');
      clearTimeout(timeout);
      onComplete();

    } catch (err: any) {
      clearTimeout(timeout);
      console.error('[ONBOARDING] Error detectado:', err);
      setError(`Error (${err.code || 'unknown'}): ${err.message || 'Error de red o permisos'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 md:p-8 font-sans relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005f73 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>

      {/* Botón Cancelar/Cerrar Sesión */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
         <button
           onClick={() => signOut(auth)}
           className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
         >
           <X size={14} /> Cancelar Registro
         </button>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Pasos */}
        <div className="mb-12 flex justify-between items-center px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}>
                {step > s ? <Check size={18} strokeWidth={4}/> : s}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-indigo-500' : 'text-zinc-700'}`}>
                {s === 1 ? 'Perfil' : s === 2 ? 'Clínica' : s === 3 ? 'Ubicación' : s === 4 ? 'Ajustes' : 'Equipo'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-[48px] p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500">

          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-start gap-4 animate-in shake-in duration-300">
              <AlertCircle size={24} className="text-red-500 shrink-0" />
              <div className="flex-1">
                 <p className="text-sm text-red-400 font-bold leading-tight">{error}</p>
                 <p className="text-[10px] text-red-500/50 mt-1 uppercase tracking-widest font-black">Por favor revise su conexión e intente de nuevo</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/5 rounded-lg transition-colors"><Check size={16} className="text-red-500"/></button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                   <UserIcon size={32} className="text-indigo-500"/> Información Profesional
                </h2>
                <p className="text-zinc-500 font-medium text-sm">Configura tu perfil como médico responsable.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Nombre(s)</label>
                  <input type="text" value={profInfo.name} onChange={e => setProfInfo({...profInfo, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ej. Alejandro"/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Apellidos</label>
                  <input type="text" value={profInfo.lastName} onChange={e => setProfInfo({...profInfo, lastName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ej. Ruiz"/>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Especialidad Principal</label>
                  <input type="text" value={profInfo.specialty} onChange={e => setProfInfo({...profInfo, specialty: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ej. Medicina Interna"/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Cédula Profesional</label>
                  <input type="text" value={profInfo.licenseNumber} onChange={e => setProfInfo({...profInfo, licenseNumber: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="12345678"/>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                   <Building2 size={32} className="text-indigo-500"/> Tu Organización
                </h2>
                <p className="text-zinc-500 font-medium text-sm">Define la identidad de tu clínica o consultorio.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Nombre de la Clínica</label>
                  <input type="text" value={orgInfo.name} onChange={e => setOrgInfo({...orgInfo, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold" placeholder="Ej. MedCore Central"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Tipo de Centro</label>
                    <select value={orgInfo.type} onChange={e => setOrgInfo({...orgInfo, type: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                      <option value="consultorio">Consultorio Privado</option>
                      <option value="clinica">Clínica / Centro Médico</option>
                      <option value="hospital">Hospital</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Giro / Especialidad</label>
                    <input type="text" value={orgInfo.primarySpecialty} onChange={e => setOrgInfo({...orgInfo, primarySpecialty: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ej. Multinivel / Dental"/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                   <MapPin size={32} className="text-indigo-500"/> Ubicación y Contacto
                </h2>
                <p className="text-zinc-500 font-medium text-sm">¿Dónde se encuentra tu sucursal principal?</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Dirección Completa</label>
                  <input type="text" value={location.street} onChange={e => setLocation({...location, street: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Calle, Número, Colonia"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Ciudad</label>
                    <input type="text" value={location.city} onChange={e => setLocation({...location, city: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Estado</label>
                    <input type="text" value={location.state} onChange={e => setLocation({...location, state: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"/>
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Teléfono de Atención</label>
                   <input type="tel" value={location.phone} onChange={e => setLocation({...location, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="55 1234 5678"/>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 flex items-center gap-3">
                   <Settings2 size={32} className="text-indigo-500"/> Configuración Regional
                </h2>
                <p className="text-zinc-500 font-medium text-sm">Ajustes de moneda y zona horaria.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Zona Horaria</label>
                  <select value={config.timezone} onChange={e => setOrgConfig({...config, timezone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <option value="America/Mexico_City">CDMX / México (GMT-6)</option>
                    <option value="America/Bogota">Bogotá / Colombia (GMT-5)</option>
                    <option value="America/Santiago">Santiago / Chile (GMT-4)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Moneda</label>
                  <select value={config.currency} onChange={e => setOrgConfig({...config, currency: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold">
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="COP">Peso Colombiano (COP)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 text-center">
              <div className="py-6">
                <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/40 relative">
                   <Users size={48} className="text-white"/>
                   <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#121212] flex items-center justify-center">
                      <Check size={16} className="text-white" strokeWidth={4}/>
                   </div>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter mb-4">¡Todo listo para comenzar!</h2>
                <p className="text-zinc-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">Has completado la configuración base de <strong>{orgInfo.name || 'tu clínica'}</strong>. Al finalizar, entrarás a tu nuevo entorno clínico.</p>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between gap-4">
            {step > 1 && !isLoading && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-8 py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18}/> Atrás
              </button>
            )}

            <div className="flex-1"></div>

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full md:w-auto px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Continuar <ArrowRight size={18}/>
              </button>
            ) : (
              <button
                disabled={isLoading}
                onClick={handleFinish}
                className={`w-full px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${isLoading ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'}`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18}/> Guardando en la nube...
                  </>
                ) : 'Finalizar y Entrar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
