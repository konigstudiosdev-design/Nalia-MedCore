export type Role =
  | 'super_admin'
  | 'organization_admin'
  | 'clinic_admin'
  | 'doctor'
  | 'nurse'
  | 'reception'
  | 'billing'
  | 'lab'
  | 'auditor'
  | 'patient'
  | 'administration';

export type UserStatus = 'invited' | 'pending_activation' | 'active' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  role: Role;
  organizationId: string;
  avatar?: string;
  specialty?: string;
  licenseNumber?: string; // Mantener por compatibilidad
  dgp?: string;
  specialtyLicense?: string;
  status: UserStatus;
  isOwner?: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  primarySpecialty: string;
  taxId?: string;
  logo?: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  settings: {
    workingHours?: any;
    timezone: string;
    currency: string;
    locale: string;
  };
  status: 'active' | 'inactive';
  ownerId: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  organizationId: string;
  name: string;
  birthDate: string;
  age: number;
  gender: 'M' | 'F' | 'O' | '';
  id_number: string;
  phone: string;
  email: string;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'En Sala' | 'En Consulta';
  last_visit: string;

  // Clinical Info
  medicalHistory?: {
    pathological?: string;
    nonPathological?: string;
    familyHistory?: string;
    surgical?: string;
    allergies: string[];
    currentMedications: string[];
    diagnoses: string[];
  };
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'arrived' // El paciente está en recepción
  | 'waiting' // En sala de espera para el médico
  | 'in_consultation' // Siendo atendido por el médico
  | 'finished'
  | 'pending_payment'
  | 'paid'
  | 'cancelled'
  | 'no_show';

export interface AgendaItem {
  id: string;
  organizationId: string;
  date: string; // ISO Date YYYY-MM-DD
  time: string;
  duration: number;
  patientId: string;
  patientName: string;
  doctorId: string;
  serviceId: string;
  type: 'consulta' | 'procedimiento' | 'seguimiento';
  status: AppointmentStatus;
  arrivalTimestamp?: string;
  vitalSigns?: VitalSigns;
  hasNursingRequest?: boolean;
}

export type NursingRequestType =
  | 'vitals'
  | 'preparation'
  | 'procedure'
  | 'medication'
  | 'wound_care'
  | 'follow_up'
  | 'sample_collection'
  | 'assistance'
  | 'other';

export type NursingRequestStatus =
  | 'requested' // SOLICITADA
  | 'pending'   // PENDIENTE
  | 'accepted'  // ACEPTADA
  | 'in_progress' // EN PROCESO
  | 'completed' // COMPLETADA
  | 'cancelled'; // CANCELADA

export interface NursingRequest {
  id: string;
  organizationId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  type: NursingRequestType;
  priority: 'normal' | 'priority' | 'urgent';
  notes?: string;
  status: NursingRequestStatus;
  nurseId?: string;
  nurseName?: string;
  resultData?: any; // Para signos vitales u otros datos registrados
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface VitalSigns {
  weight?: number;
  height?: number;
  temp?: number;
  bloodPressure?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface NursingNote {
  id: string;
  content: string;
  recordedAt: string;
  recordedBy: string;
}

export interface Consultation {
  id: string;
  organizationId: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;

  // SOAP Notes
  soap: {
    subjective: string;
    objective: string;
    analysis: string;
    plan: string;
  };

  vitalSigns?: VitalSigns;

  diagnoses: string[];
  status: 'draft' | 'pending_review' | 'finalized' | 'corrected';
  version: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface Prescription {
  id: string;
  organizationId: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
  }[];
  notes?: string;
  status: 'draft' | 'finalized';
}

export interface Consent {
  id: string;
  organizationId: string;
  templateId: string;
  version: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'revoked';
  signatureData?: string;
  signedAt?: string;
}

export interface Transaction {
  id: string;
  organizationId: string;
  date: string;
  patientId?: string;
  consultationId?: string;
  description: string;
  amount: number;
  type: 'ingreso' | 'egreso';
  method: 'cash' | 'card' | 'transfer' | 'insurance' | 'other';
  status: 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
  category: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  result: 'success' | 'failure';
  category: 'operational' | 'security' | 'compliance';
}

export interface AIInteraction {
  id: string;
  organizationId: string;
  timestamp: string;
  userId: string;
  patientId?: string;
  consultationId?: string;
  action: 'summary' | 'soap_draft' | 'instructions' | 'transcription';
  input: string;
  output: string;
  status: 'generated' | 'reviewed' | 'edited' | 'approved';
  reviewedBy?: string;
}

export interface ComplianceItem {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  module: string;
  control: string;
  evidencePath?: string;
  responsibleId: string;
  nextReviewDate: string;
  status: 'not_evaluated' | 'pending' | 'designed' | 'implemented' | 'validating' | 'validated_internal' | 'validated_external' | 'not_applicable';
}

export interface RevenueData {
  name: string;
  ingresos: number;
}
