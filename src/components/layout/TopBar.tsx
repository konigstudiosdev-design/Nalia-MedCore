import React, { useState, useEffect } from 'react';
import { Menu, Search, Moon, Sun, ChevronDown, User, Shield, Stethoscope, Activity, LogOut, Bell, Settings } from 'lucide-react';
import { Role } from '../../types';

interface TopBarProps {
  currentModule: string;
  setMobileMenuOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  doctorName?: string;
  role: Role;
  onChangeRole: (role: Role) => void;
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

export function TopBar({ currentModule, setMobileMenuOpen, theme, setTheme, doctorName = 'Usuario', role, onNavigate, onLogout }: TopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Cerrar el menú desplegable automáticamente cuando se cambie de pantalla/módulo
  useEffect(() => {
    setIsProfileOpen(false);
  }, [currentModule]);

  const formatRoleName = (r: Role) => {
    switch (r) {
      case 'doctor': return 'Médico';
      case 'nurse': return 'Enfermería';
      case 'reception': return 'Recepción';
      case 'organization_admin': return 'Administrador';
      case 'super_admin': return 'Super Admin';
      default: return r.replace('_', ' ');
    }
  };

  const getSettingsLabel = (r: Role) => {
    switch (r) {
      case 'doctor': return 'Ajustes del Médico';
      case 'nurse': return 'Ajustes de Enfermería';
      case 'reception': return 'Ajustes de Recepción';
      case 'organization_admin': return 'Ajustes de la Clínica';
      default: return 'Mi Perfil';
    }
  };

  return (
    <header className="h-14 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-6 z-40 shrink-0 relative">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-zinc-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
           <h1 className="text-base md:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 capitalize">
             {currentModule === 'dashboard' ? 'Dashboard' : currentModule === 'team' ? 'Equipo' : currentModule}
           </h1>
           <span className="hidden md:block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[8px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-700">
             {formatRoleName(role)}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Compact */}
        <div className="hidden md:flex relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
          <input type="text" placeholder="Buscar... (⌘K)" className="w-48 xl:w-56 pl-9 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#151515] transition-all shadow-sm font-medium" />
        </div>

        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full active:scale-95 transition-all">
          <Bell size={16} />
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full active:scale-95 transition-all"
        >
          {theme === 'light' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors active:scale-95 bg-white dark:bg-[#151515]"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm shadow-indigo-600/20">
              {doctorName.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
               <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">{doctorName}</span>
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{formatRoleName(role)}</span>
            </div>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <>
              {/* Telón transparente para cerrar al hacer clic afuera */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                 <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                          <User size={20}/>
                       </div>
                       <div>
                          <p className="text-xs font-black">{doctorName}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{formatRoleName(role)}</p>
                       </div>
                    </div>
                    <button
                      onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                       <Settings size={14}/> {getSettingsLabel(role)}
                    </button>
                 </div>
                 <div className="p-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                       <LogOut size={14}/> Cerrar Sesión
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
