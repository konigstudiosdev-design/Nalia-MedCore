import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle,
  Eye, EyeOff, HeartPulse, Building2
} from 'lucide-react';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export function RegisterView({ onSwitchToLogin }: RegisterViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Crear perfil de usuario inicial (Admin de Organización)
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: cleanEmail,
        role: 'organization_admin',
        isOwner: true,
        status: 'pending_activation',
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        organizationId: `org_${user.uid.substring(0, 8)}`
      });

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError('Ocurrió un error al crear la cuenta. Intente de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060608] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans select-none">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '36px 36px' }}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-5 shadow-2xl p-2.5 overflow-hidden hover:scale-105 transition-transform duration-300">
            <img src="/logonaliamedcore.png" alt="Nalia MedCore" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Registrar mi Clínica</h1>
          <p className="text-zinc-400 text-xs font-medium">Configura la cuenta de médico propietario en 1 minuto</p>
        </div>

        {/* Card */}
        <div className="bg-[#101014]/90 backdrop-blur-2xl border border-zinc-800/80 rounded-[36px] p-7 md:p-9 shadow-2xl shadow-black/80 relative">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">
                Correo Profesional
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@tuclinica.com"
                  className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 transition-all font-medium placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 transition-all font-medium placeholder:text-zinc-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 transition-all font-medium placeholder:text-zinc-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl flex items-start gap-3 animate-in shake-in duration-300">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creando Cuenta Clínica...
                </>
              ) : (
                <>
                  Registrar mi Clínica
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-center border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                ¿Ya tienes una cuenta registrada? <span className="text-indigo-400 font-extrabold hover:underline">Inicia Sesión</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-6">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              HIPAA & NOM-004 Ready
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <HeartPulse size={14} className="text-indigo-400" />
              Encriptación 256-bit
           </div>
        </div>

        <div className="mt-4 text-center">
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Nalia Technologies © 2026</p>
        </div>
      </div>
    </div>
  );
}
