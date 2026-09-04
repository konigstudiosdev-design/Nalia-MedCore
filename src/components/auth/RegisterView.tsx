import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle, User as UserIcon } from 'lucide-react';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export function RegisterView({ onSwitchToLogin }: RegisterViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear perfil de usuario inicial (Admin de Organización)
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        role: 'organization_admin',
        isOwner: true,
        status: 'pending_activation',
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        organizationId: `org_${user.uid.substring(0, 8)}` // ID temporal hasta onboarding
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
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005f73 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/30">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Nalia MedCore</h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">Registro de Médico Propietario</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-[40px] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block ml-1">Correo Profesional</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@tuclinica.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block ml-1">Confirmar Contraseña</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in shake-in duration-300">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Registrar mi Clínica
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              ¿Ya tienes una cuenta? <span className="text-indigo-500">Inicia Sesión</span>
            </button>
          </div>
        </div>

        <div className="mt-10 pt-8 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-600" />
              Multi-tenant Isolated
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-600" />
              HIPAA Ready
           </div>
        </div>
      </div>
    </div>
  );
}
