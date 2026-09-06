import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, AgendaItem, Transaction, NursingRequest, User, Organization, Consultation, Prescription } from '../types';

// Helper de Fecha Local YYYY-MM-DD (Evita errores de zona horaria UTC en horario nocturno)
export const formatLocalDate = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Users
export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// Organizations
export const updateOrganization = async (orgId: string, data: Partial<Organization>) => {
  const docRef = doc(db, 'organizations', orgId);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// Patients
export const subscribeToPatients = (callback: (patients: Patient[]) => void, orgId: string) => {
  const q = query(collection(db, 'organizations', orgId, 'patients'));
  return onSnapshot(q, (snapshot) => {
    const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    callback(patients);
  });
};

export const savePatient = async (patient: Partial<Patient>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'patients');
  if (patient.id) {
    const docRef = doc(db, 'organizations', orgId, 'patients', patient.id);
    await setDoc(docRef, { ...patient, updatedAt: serverTimestamp() }, { merge: true });
  } else {
    await addDoc(colRef, {
      ...patient,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

export const deletePatient = async (id: string, orgId: string) => {
  const docRef = doc(db, 'organizations', orgId, 'patients', id);
  await deleteDoc(docRef);
};

// Agenda
export const subscribeToAgenda = (callback: (items: AgendaItem[]) => void, orgId: string) => {
  const q = query(collection(db, 'organizations', orgId, 'agenda'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaItem));
    callback(items);
  });
};

export const updateAppointmentStatus = async (id: string, status: string, orgId: string, extraData?: any) => {
  const docRef = doc(db, 'organizations', orgId, 'agenda', id);
  await updateDoc(docRef, {
    status,
    ...extraData,
    updatedAt: serverTimestamp()
  });
};

export const createAppointment = async (item: Partial<AgendaItem>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'agenda');
  await addDoc(colRef, {
    ...item,
    createdAt: serverTimestamp()
  });
};

export const deleteAppointment = async (id: string, orgId: string) => {
  const docRef = doc(db, 'organizations', orgId, 'agenda', id);
  await deleteDoc(docRef);
};

// Transactions
export const subscribeToTransactions = (callback: (txs: Transaction[]) => void, orgId: string) => {
  const q = query(collection(db, 'organizations', orgId, 'transactions'));
  return onSnapshot(q, (snapshot) => {
    const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    callback(txs);
  });
};

export const addTransaction = async (t: Partial<Transaction>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'transactions');
  await addDoc(colRef, {
    ...t,
    date: new Date().toISOString(),
    createdAt: serverTimestamp()
  });
};

// Consultations
export const saveConsultation = async (consultation: Partial<Consultation>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'consultations');
  if (consultation.id) {
    const docRef = doc(db, 'organizations', orgId, 'consultations', consultation.id);
    await updateDoc(docRef, { ...consultation, updatedAt: serverTimestamp() });
    return consultation.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...consultation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
};

export const subscribeToConsultations = (callback: (items: Consultation[]) => void, orgId: string, patientId?: string) => {
  let q = query(collection(db, 'organizations', orgId, 'consultations'), orderBy('date', 'desc'));
  if (patientId) {
    q = query(collection(db, 'organizations', orgId, 'consultations'), where('patientId', '==', patientId), orderBy('date', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
    callback(items);
  });
};

// Prescriptions
export const savePrescription = async (prescription: Partial<Prescription>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'prescriptions');
  if (prescription.id) {
    const docRef = doc(db, 'organizations', orgId, 'prescriptions', prescription.id);
    await updateDoc(docRef, { ...prescription, updatedAt: serverTimestamp() });
    return prescription.id;
  } else {
    const docRef = await addDoc(colRef, {
      ...prescription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
};

export const subscribeToPrescriptions = (callback: (items: Prescription[]) => void, orgId: string, patientId?: string) => {
  let q = query(collection(db, 'organizations', orgId, 'prescriptions'), orderBy('date', 'desc'));
  if (patientId) {
    q = query(collection(db, 'organizations', orgId, 'prescriptions'), where('patientId', '==', patientId), orderBy('date', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
    callback(items);
  });
};

// Nursing Requests
export const createNursingRequest = async (request: Partial<NursingRequest>, orgId: string) => {
  const colRef = collection(db, 'organizations', orgId, 'nursing_requests');
  await addDoc(colRef, {
    ...request,
    status: 'requested',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Marcar en la agenda que hay una solicitud activa
  if (request.appointmentId) {
    const aptRef = doc(db, 'organizations', orgId, 'agenda', request.appointmentId);
    await updateDoc(aptRef, { hasNursingRequest: true });
  }
};

export const subscribeToNursingRequests = (callback: (reqs: NursingRequest[]) => void, orgId: string, statusFilter?: string[]) => {
  let q = query(collection(db, 'organizations', orgId, 'nursing_requests'));

  if (statusFilter && statusFilter.length > 0) {
    q = query(collection(db, 'organizations', orgId, 'nursing_requests'), where('status', 'in', statusFilter));
  }

  return onSnapshot(q, (snapshot) => {
    const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NursingRequest));
    callback(reqs);
  });
};

export const updateNursingRequestStatus = async (id: string, status: string, orgId: string, extraData?: any) => {
  const docRef = doc(db, 'organizations', orgId, 'nursing_requests', id);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
    ...extraData
  };

  if (status === 'accepted') updateData.acceptedAt = serverTimestamp();
  if (status === 'completed') updateData.completedAt = serverTimestamp();

  await updateDoc(docRef, updateData);
};

