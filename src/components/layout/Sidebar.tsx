import React from 'react';
import {
  Building2, LayoutDashboard, CalendarDays, Users,
  Settings, CreditCard, BarChart3, Stethoscope, X, Shield, Activity, HeartPulse, ClipboardCheck, ArrowLeftRight, ShieldCheck
} from 'lucide-react';
import { Role } from '../../types';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  current: string;
  onClick: () => void;
  badge?: string;
  color?: string;
}

function SidebarItem({ icon, label, id, current, onClick, badge, color }: SidebarItemProps) {
  const isActive = current === id;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 xl:px-3.5 xl:py-2.5 rounded-xl transition-all active:scale-95 group relative ${
        isActive
        ? `${color || 'bg-indigo-600'} text-white shadow-md shadow-indigo-600/20 font-bold`
        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold'
      }`}
      title={label}
    >
      <div className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      <span className="hidden xl:block text-xs font-bold tracking-tight">{label}</span>
      {badge && <span className={`hidden xl:flex ml-auto px-1.5 py-0.5 text-[9px] font-black rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>{badge}</span>}
      {isActive && <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full"></div>}
    </button>
  );
}

interface SidebarProps {
  currentModule: string;
  navigateTo: (moduleId: string) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  role: Role;
  workMode?: 'clinical' | 'admin';
  onToggleMode?: () => void;
}

export function Sidebar({ currentModule, navigateTo, isMobileMenuOpen, setMobileMenuOpen, role, workMode, onToggleMode }: SidebarProps) {
  const isDoctor = role === 'doctor';
  const isNurse = role === 'nurse';
  const isReception = role === 'reception';
  const isOrgAdmin = role === 'organization_admin';

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0E0E0E] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col
      ${isMobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-20 xl:w-60'}
    `}>
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between xl:justify-start px-4 xl:px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
            <Building2 size={18} className="text-white" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="font-black text-lg tracking-tighter text-zinc-900 dark:text-zinc-50 leading-none">Nalia MedCore</span>
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">SaaS Medical Platform</span>
          </div>
        </div>
        {isMobileMenuOpen && (
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 text-zinc-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={20}/>
          </button>
        )}
      </div>

      {/* Mode Switcher for Admin */}
      {isOrgAdmin && onToggleMode && (
        <div className="p-3 xl:p-4 shrink-0">
           <button
             onClick={onToggleMode}
             className="w-full bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 hover:border-indigo-500/50 transition-all group"
           >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${workMode === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-500'}`}>
                 {workMode === 'admin' ? <ShieldCheck size={16}/> : <Stethoscope size={16}/>}
              </div>
              <div className="hidden xl:flex flex-col items-start leading-none">
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Modo Actual</span>
                 <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{workMode === 'admin' ? 'Administración' : 'Clínico'}</span>
              </div>
              <ArrowLeftRight size={14} className="hidden xl:block ml-auto text-zinc-400 group-hover:text-indigo-500 transition-colors"/>
           </button>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 xl:px-4 space-y-1.5 hide-scrollbar">

        {/* CLINICAL MODE NAV */}
        {(workMode === 'clinical' || !isOrgAdmin) && (
          <>
            <div className="hidden xl:block px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">General</div>
            <SidebarItem icon={<LayoutDashboard size={22}/>} label="Inicio" id="dashboard" current={currentModule} onClick={() => navigateTo('dashboard')} />

            <div className="h-6"></div>
            <div className="hidden xl:block px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              {(isDoctor || isOrgAdmin) ? 'Clínico' : isNurse ? 'Asistencial' : 'Operativo'}
            </div>

            {(isDoctor || isReception || isOrgAdmin) && (
              <SidebarItem icon={<CalendarDays size={22}/>} label="Agenda" id="agenda" current={currentModule} onClick={() => navigateTo('agenda')} />
            )}

            <SidebarItem icon={<Users size={22}/>} label="Pacientes" id="pacientes" current={currentModule} onClick={() => navigateTo('pacientes')} />

            {isNurse && (
              <>
                <SidebarItem icon={<HeartPulse size={22}/>} label="Signos Vitales" id="vitals" current={currentModule} onClick={() => navigateTo('vitals')} />
                <SidebarItem icon={<ClipboardCheck size={22}/>} label="Tareas" id="tasks" current={currentModule} onClick={() => navigateTo('tasks')} />
              </>
            )}

            {(isReception || isOrgAdmin) && (
              <SidebarItem icon={<CreditCard size={22}/>} label="Pagos" id="finanzas" current={currentModule} onClick={() => navigateTo('finanzas')} />
            )}
          </>
        )}

        {/* ADMIN MODE NAV */}
        {isOrgAdmin && workMode === 'admin' && (
          <>
            <div className="hidden xl:block px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Administración</div>
            <SidebarItem icon={<LayoutDashboard size={22}/>} label="Dashboard" id="dashboard" current={currentModule} onClick={() => navigateTo('dashboard')} />
            <SidebarItem icon={<Users size={22}/>} label="Equipo" id="team" current={currentModule} onClick={() => navigateTo('team')} />

            <div className="h-6"></div>
            <div className="hidden xl:block px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estrategia</div>
            <SidebarItem icon={<BarChart3 size={22}/>} label="Reportes" id="reportes" current={currentModule} onClick={() => navigateTo('reportes')} />

            <div className="h-6"></div>
            <div className="hidden xl:block px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trust</div>
            <SidebarItem icon={<Shield size={22}/>} label="Compliance" id="compliance" current={currentModule} onClick={() => navigateTo('compliance')} color="bg-emerald-600" />
          </>
        )}
      </nav>

      {/* Footer Settings */}
      <div className="p-3 xl:p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <SidebarItem icon={<Settings size={22}/>} label="Ajustes" id="settings" current={currentModule} onClick={() => navigateTo('settings')} />
      </div>
    </aside>
  );
}
