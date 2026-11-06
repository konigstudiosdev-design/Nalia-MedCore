import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download, Share, PlusSquare, X, Monitor, Smartphone, ShieldCheck } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isIOS, isDismissed, promptInstall, dismissInstall } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, dismissed, or unsupported, do not render
  if (isInstalled || isDismissed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0F172A]/95 backdrop-blur-2xl border-2 border-indigo-500/60 rounded-3xl p-5 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] text-white relative space-y-4">

        {/* Dismiss Button */}
        <button
          onClick={dismissInstall}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
          title="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-12 h-12 bg-indigo-600/30 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/40 shrink-0 shadow-lg shadow-indigo-600/20">
            <Download className="w-6 h-6 text-indigo-400 animate-bounce" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">
              PWA Instalable
            </span>
            <h3 className="text-base font-black text-white mt-1">Instala Nalia MedCore</h3>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-0.5">
              Ten tu consultorio disponible desde tu computadora, tablet o celular sin descargas tradicionales.
            </p>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 pt-1 border-t border-zinc-800">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> NOM-004
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-sky-400">
            <Monitor className="w-3.5 h-3.5" /> Escritorio
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-indigo-400">
            <Smartphone className="w-3.5 h-3.5" /> Móvil
          </span>
        </div>

        {/* Action Button */}
        {canInstall ? (
          <button
            onClick={promptInstall}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>INSTALAR APLICACIÓN</span>
          </button>
        ) : isIOS ? (
          <div className="space-y-2">
            <button
              onClick={() => setShowIOSGuide(!showIOSGuide)}
              className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share className="w-4 h-4" />
              <span>Ver cómo instalar en iPhone/iPad</span>
            </button>

            {showIOSGuide && (
              <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs text-zinc-300 space-y-2 animate-in fade-in duration-200">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-sky-400" /> Pasos para Safari iOS:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.</li>
                  <li>Desplázate y selecciona <strong>"Añadir a pantalla de inicio" <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" /></strong>.</li>
                  <li>Confirma en <strong>"Añadir"</strong> para abrir Nalia como app nativa.</li>
                </ol>
              </div>
            )}
          </div>
        ) : null}

      </div>
    </div>
  );
};
