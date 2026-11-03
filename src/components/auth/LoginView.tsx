import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, KeyRound, Eye, EyeOff, ShieldCheck, Sparkles, HeartPulse
} from 'lucide-react';

export function LoginView({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para recuperación de contraseña
  const [isResetView, setIsResetView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error(err);
      setError('Credenciales inválidas. Por favor verifique su correo y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Por favor ingrese su correo electrónico.');
      return;
    }

    setResetLoading(true);
    setError(null);
    setResetSuccess(null);

    try {
      let isRegistered = false;
      try {
        const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
        isRegistered = methods.length > 0;
      } catch (authErr: any) {
        isRegistered = true;
      }

      if (!isRegistered) {
        setError('El correo electrónico no se encuentra registrado ni vinculado a ninguna cuenta.');
        setResetLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSuccess(`Correo de confirmación enviado exitosamente a ${cleanEmail}. Revisa tu bandeja de entrada o carpeta de spam.`);

    } catch (err: any) {
      console.error('[RESET PASSWORD]', err);
      if (err.code === 'auth/user-not-found') {
        setError('El correo electrónico no se encuentra registrado ni vinculado a ninguna cuenta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico ingresado no es válido.');
      } else {
        setError('No se pudo enviar el correo de recuperación. Verifique e intente nuevamente.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060608] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans select-none">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '36px 36px' }}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-5 shadow-2xl p-2.5 overflow-hidden hover:scale-105 transition-transform duration-300">
            {isResetView ? (
              <KeyRound size={40} className="text-indigo-600" />
            ) : (
              <img src="/logonaliamedcore.png" alt="Nalia MedCore" className="w-full h-full object-contain mix-blend-multiply" />
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            {isResetView ? 'Recuperar Contraseña' : 'Bienvenido de Nuevo'}
          </h1>
          <p className="text-zinc-400 text-xs font-medium">
            {isResetView ? 'Ingresa tu correo para recibir el enlace de acceso' : 'Accede a tu plataforma médica centralizada'}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-[#101014]/90 backdrop-blur-2xl border border-zinc-800/80 rounded-[36px] p-7 md:p-9 shadow-2xl shadow-black/80 relative">

          {!isResetView ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">
                  Correo Electrónico
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

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setError(null);
                      setResetSuccess(null);
                      setIsResetView(true);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
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
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    Entrar al Sistema
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  ¿No tienes una cuenta médica? <span className="text-indigo-400 font-extrabold hover:underline">Registrar mi Clínica</span>
                </button>
              </div>
            </form>
          ) : (
            /* FORMULARIO DE RESTABLECIMIENTO DE CONTRASEÑA POR CORREO */
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-5">
                  Ingresa tu correo profesional registrado. Te enviaremos un correo con el enlace seguro para restablecer tu contraseña.
                </p>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">
                  Correo Profesional
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="doctor@tuclinica.com"
                    className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60 transition-all font-medium placeholder:text-zinc-600"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl flex items-start gap-3 animate-in shake-in duration-300">
                  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-300 font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 font-semibold leading-relaxed">{resetSuccess}</p>
                </div>
              )}

              <button
                disabled={resetLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {resetLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  <>
                    Enviar Correo de Confirmación
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetView(false);
                    setError(null);
                    setResetSuccess(null);
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft size={16} /> Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-6">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              Multi-tenant Isolated
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <HeartPulse size={14} className="text-indigo-400" />
              NOM-004-SSA3 Compliant
           </div>
        </div>

        <div className="mt-4 text-center">
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Nalia Technologies © 2026</p>
        </div>
      </div>
    </div>
  );
}
