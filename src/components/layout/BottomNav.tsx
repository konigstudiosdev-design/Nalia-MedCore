import React from 'react';
import { LayoutDashboard, CalendarDays, Plus, Users } from 'lucide-react';

interface BottomTabProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  current: string;
  set: (id: string) => void;
  badge?: string;
}

function BottomTab({ id, icon, label, current, set, badge }: BottomTabProps) {
  const isActive = current === id;
  return (
    <button
      onClick={() => set(id)}
      className={`flex flex-col items-center justify-center w-16 gap-1 relative transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
    >
      <div className={`p-1.5 rounded-2xl transition-all active:scale-90 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
        {icon}
        {badge && <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212]">{badge}</span>}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

import { Role } from '../../types';

interface BottomNavProps {
  currentModule: string;
  navigateTo: (moduleId: string) => void;
  userRole?: Role;
  onAddPatientClick?: () => void;
}

export function BottomNav({ currentModule, navigateTo, userRole, onAddPatientClick }: BottomNavProps) {
  const handleCenterPlusClick = () => {
    if (userRole === 'reception') {
      if (onAddPatientClick) onAddPatientClick();
      else navigateTo('pacientes');
    } else if (userRole === 'nurse') {
      navigateTo('vitals');
    } else {
      navigateTo('consulta');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[84px] bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe pt-2 px-6 flex justify-between items-start z-50">
      <BottomTab id="dashboard" icon={<LayoutDashboard size={24}/>} label="Inicio" current={currentModule} set={navigateTo} />
      <BottomTab id="agenda" icon={<CalendarDays size={24}/>} label="Agenda" current={currentModule} set={navigateTo} />
      <div className="relative -top-6">
        <button onClick={handleCenterPlusClick} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-90 transition-transform">
          <Plus size={28} />
        </button>
      </div>
      <BottomTab id="pacientes" icon={<Users size={24}/>} label="Pacientes" current={currentModule} set={navigateTo} />
    </nav>
  );
}
