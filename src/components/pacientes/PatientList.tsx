import React from 'react';
import { Plus } from 'lucide-react';
import { Patient, Role } from '../../types';
import { Avatar } from '../shared/Avatar';

interface PatientListProps {
  patients: Patient[];
  activePatient: Patient;
  setActivePatient: (patient: Patient) => void;
  onAddClick: () => void;
  userRole?: Role;
}

export function PatientList({ patients, activePatient, setActivePatient, onAddClick, userRole }: PatientListProps) {
  const canAddPatient = userRole !== 'nurse';

  return (
    <div className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-[#0A0A0A]">
        <h2 className="font-bold text-lg">Directorio</h2>
        {canAddPatient && (
          <button
            onClick={onAddClick}
            title="Agregar Nuevo Paciente"
            className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            <Plus size={18}/>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {patients.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-zinc-500">No hay pacientes registrados.</p>
          </div>
        ) : patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePatient(p)}
            className={`w-full text-left p-3 rounded-xl transition-all border active:scale-[0.98] ${
              activePatient?.id === p.id
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
              : 'bg-white dark:bg-[#151515] border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar src={p.avatar} name={p.name} gender={p.gender} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate text-zinc-900 dark:text-zinc-100">{p.name}</div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Expediente Activo</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
