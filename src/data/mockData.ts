import { Patient, AgendaItem, RevenueData } from '../types';

export const REVENUE_DATA: RevenueData[] = [];

export const PATIENTS: Patient[] = [
  {
    id: 'p1',
    organizationId: 'demo_org',
    name: 'Juan Pérez',
    birthDate: '1985-05-15',
    age: 39,
    gender: 'M',
    id_number: 'ID-45921',
    phone: '555-0123',
    email: 'juan.perez@example.com',
    status: 'active',
    last_visit: '2023-12-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    medicalHistory: {
      allergies: ['Penicilina'],
      currentMedications: ['Metformina 500mg'],
      diagnoses: ['Diabetes Tipo 2'],
    }
  },
  {
    id: 'p2',
    organizationId: 'demo_org',
    name: 'María García',
    birthDate: '1992-08-22',
    age: 31,
    gender: 'F',
    id_number: 'ID-78234',
    phone: '555-0456',
    email: 'maria.g@example.com',
    status: 'active',
    last_visit: '2023-11-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    medicalHistory: {
      allergies: [],
      currentMedications: [],
      diagnoses: ['Hipertensión leve'],
    }
  }
];

export const AGENDA_HOY: AgendaItem[] = [
  {
    id: 'a1',
    organizationId: 'demo_org',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    patientId: 'p1',
    patientName: 'Juan Pérez',
    doctorId: 'Dr. Alejandro Ruiz',
    serviceId: 's1',
    type: 'consulta',
    status: 'confirmed',
  },
  {
    id: 'a2',
    organizationId: 'demo_org',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    duration: 45,
    patientId: 'p2',
    patientName: 'María García',
    doctorId: 'Dr. Alejandro Ruiz',
    serviceId: 's1',
    type: 'consulta',
    status: 'confirmed',
  }
];
