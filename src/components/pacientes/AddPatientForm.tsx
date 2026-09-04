import React, { useState } from 'react';
import { Patient } from '../../types';
import { User, Calendar, Hash } from 'lucide-react';

interface AddPatientFormProps {
  onAdd: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

export function AddPatientForm({ onAdd, onCancel }: AddPatientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    age: '',
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length > 8) value = value.slice(0, 8);

    // Aplicar máscara DD/MM/AAAA
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setFormData(prev => {
      const newData = { ...prev, birthDate: formatted };

      // Calcular edad automáticamente si la fecha está completa
      if (formatted.length === 10) {
        const [day, month, year] = formatted.split('/').map(Number);
        if (day > 0 && month > 0 && month <= 12 && year > 1900) {
          const birth = new Date(year, month - 1, day);
          const now = new Date();
          let age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
          }
          if (age >= 0) newData.age = age.toString();
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      birthDate: formData.birthDate,
      age: parseInt(formData.age) || 0,
      status: 'active',
      last_visit: new Date().toISOString(),
      id_number: 'PENDIENTE',
      gender: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=005f73&color=fff&bold=true`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl mb-2">
        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-widest text-center">
          Registro rápido de paciente
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Nombre Completo</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-xs placeholder:text-[11px]"
              placeholder="Ej. Alejandro Ruiz"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Fecha de Nacimiento</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                required
                type="text"
                maxLength={10}
                value={formData.birthDate}
                onChange={handleDateChange}
                placeholder="DD/MM/AAAA"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-xs placeholder:text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block ml-1">Edad</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-3.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-xs placeholder:text-[11px]"
                placeholder="Años"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          Crear Expediente
        </button>
      </div>
    </form>
  );
}
