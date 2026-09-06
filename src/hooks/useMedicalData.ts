import { useState, useEffect, useCallback, useMemo } from 'react';
import { Patient, AgendaItem, Transaction, User, VitalSigns, NursingRequest, Consultation, Prescription } from '../types';
import * as dbService from '../lib/db';
import { googleCalendarService } from '../lib/googleCalendar';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';

export function useMedicalData() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [workMode, setWorkMode] = useState<'clinical' | 'admin'>('clinical');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nursingRequests, setNursingRequests] = useState<NursingRequest[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Sistema de Notificaciones (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const [settings, setSettings] = useState({
    doctorName: '',
    specialty: '',
    licenseNumber: '',
    dgp: '',
    specialtyLicense: '',
    clinicName: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    organizationId: '',
    branchId: ''
  });

  // Listener Maestro de Autenticación y Perfil
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubOrg: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
      if (unsubOrg) { unsubOrg(); unsubOrg = null; }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setCurrentUser(userData);

            // Suscripción a la Organización para obtener el nombre de la clínica y datos institucionales
            if (userData.organizationId && !unsubOrg) {
              unsubOrg = onSnapshot(doc(db, 'organizations', userData.organizationId), (orgSnap) => {
                if (orgSnap.exists()) {
                  const orgData = orgSnap.data();
                  setSettings(prev => ({
                    ...prev,
                    clinicName: orgData.name || '',
                    phone: orgData.phone || '',
                    address: typeof orgData.address === 'object'
                      ? (orgData.address.street || '')
                      : (orgData.address || ''),
                    logo: orgData.logo || ''
                  }));
                }
              });
            }

            setSettings(prev => ({
              ...prev,
              doctorName: (userData.name || '') + (userData.lastName ? ` ${userData.lastName}` : ''),
              specialty: userData.specialty || '',
              licenseNumber: userData.licenseNumber || '',
              dgp: userData.dgp || '',
              specialtyLicense: userData.specialtyLicense || '',
              email: userData.email || '',
              organizationId: userData.organizationId
            }));
          } else {
            setCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.email?.split('@')[0] || 'Nuevo Usuario',
              role: 'organization_admin',
              isOwner: true,
              status: 'pending_activation',
              onboardingCompleted: false,
              organizationId: `org_${firebaseUser.uid.substring(0, 8)}`,
              createdAt: new Date().toISOString()
            } as User);
          }
          setAuthLoading(false);
        }, (error) => {
          console.error('[DB] Error en suscripción de perfil:', error);
          setAuthLoading(false);
        });
      } else {
        console.log('[AUTH] Sesión cerrada');
        if (unsubProfile) (unsubProfile as () => void)();
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    const safetyTimeout = setTimeout(() => {
      if (authLoading) setAuthLoading(false);
    }, 8000);

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Suscripciones a Datos Clínicos
  useEffect(() => {
    if (!currentUser?.organizationId) return;
    const q = query(collection(db, 'users'), where('organizationId', '==', currentUser.organizationId));
    const unsubTeam = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setTeamMembers(users);
    });
    return () => unsubTeam();
  }, [currentUser?.organizationId]);

  const doctors = useMemo(() => {
    const docList = teamMembers.filter(m => m.role === 'doctor' || m.role === 'organization_admin');
    if (docList.length > 0) return docList;
    if (currentUser) return [currentUser];
    return [];
  }, [teamMembers, currentUser]);

  useEffect(() => {
    if (!currentUser?.organizationId) return;

    const unsubPatients = dbService.subscribeToPatients(setPatients, currentUser.organizationId);
    const unsubAgenda = dbService.subscribeToAgenda(setAgenda, currentUser.organizationId);
    const unsubTx = dbService.subscribeToTransactions(setTransactions, currentUser.organizationId);
    const unsubNursing = dbService.subscribeToNursingRequests(setNursingRequests, currentUser.organizationId);
    const unsubConsultations = dbService.subscribeToConsultations(setConsultations, currentUser.organizationId);
    const unsubPrescriptions = dbService.subscribeToPrescriptions(setPrescriptions, currentUser.organizationId);

    return () => {
      unsubPatients();
      unsubAgenda();
      unsubTx();
      unsubNursing();
      unsubConsultations();
      unsubPrescriptions();
    };
  }, [currentUser?.organizationId, currentUser?.onboardingCompleted]);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const toggleWorkMode = () => setWorkMode(prev => prev === 'clinical' ? 'admin' : 'clinical');

  const addPatient = async (data: Partial<Patient>) => {
    if (!currentUser) return;
    try {
      await dbService.savePatient({
        ...data,
        organizationId: currentUser.organizationId,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'P')}&background=005f73&color=fff&bold=true`
      }, currentUser.organizationId);
      showToast('Paciente registrado correctamente');
    } catch (e) {
      showToast('Error al registrar paciente', 'error');
    }
  };

  const addAgendaItem = async (data: Partial<AgendaItem>) => {
    if (!currentUser || !currentUser.organizationId) throw new Error("No hay sesión activa");
    try {
      let finalPatientId = data.patientId;
      if (data.patientId === 'unregistered' && data.patientName) {
        const newPatientRef = doc(collection(db, 'organizations', currentUser.organizationId, 'patients'));
        const newId = newPatientRef.id;
        await dbService.savePatient({
          id: newId,
          name: data.patientName,
          organizationId: currentUser.organizationId,
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.patientName)}&background=005f73&color=fff&bold=true`,
          birthDate: '', age: 0, gender: '', id_number: 'NUEVO', phone: '', email: '', address: '', occupation: '',
          last_visit: new Date().toISOString()
        }, currentUser.organizationId);
        finalPatientId = newId;
      }
      await dbService.createAppointment({
        ...data,
        date: data.date || dbService.formatLocalDate(),
        patientId: finalPatientId,
        organizationId: currentUser.organizationId,
        doctorId: currentUser.id || 'owner',
        status: data.status || 'confirmed',
        duration: Number(data.duration) || 30
      }, currentUser.organizationId);
      showToast('Cita agendada correctamente');
    } catch (e) {
      showToast('Error al agendar cita', 'error');
      throw e;
    }
  };

  return {
    currentUser, authLoading, workMode, toggleWorkMode,
    patients, agenda, transactions, nursingRequests, consultations, prescriptions, settings, googleEvents, isGoogleConnected, doctors, teamMembers,
    toast, hideToast, logout,
    addPatient,
    updatePatient: async (data: Partial<Patient>) => {
      try {
        const updateData = { ...data };
        if (data.name) {
          updateData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=005f73&color=fff&bold=true`;
        }
        await dbService.savePatient(updateData, currentUser!.organizationId);
        showToast('Expediente actualizado');
      } catch (e) {
        showToast('Error al actualizar expediente', 'error');
      }
    },
    addAgendaItem,
    confirmArrival: async (id: string, assignedDoctorId?: string, assignedDoctorName?: string) => {
      try {
        const extraData: any = { arrivalTimestamp: new Date().toISOString() };
        if (assignedDoctorId) extraData.doctorId = assignedDoctorId;
        if (assignedDoctorName) extraData.doctorId_name = assignedDoctorName;

        await dbService.updateAppointmentStatus(id, 'waiting', currentUser!.organizationId, extraData);
        showToast('Llegada confirmada' + (assignedDoctorName ? ` con Dr(a). ${assignedDoctorName}` : ''));
      } catch (e) {
        showToast('Error al confirmar llegada', 'error');
      }
    },
    updateAppointment: async (id: string, status: string, extraData?: any) => {
      try {
        await dbService.updateAppointmentStatus(id, status, currentUser!.organizationId, extraData);
        showToast('Estado actualizado');
      } catch (e) {
        showToast('Error al actualizar estado', 'error');
      }
    },
    deleteAppointment: async (id: string) => {
      try {
        await dbService.deleteAppointment(id, currentUser!.organizationId);
        showToast('Cita eliminada');
      } catch (e) {
        showToast('Error al eliminar cita', 'error');
      }
    },
    deletePatient: async (id: string) => {
      try {
        await dbService.deletePatient(id, currentUser!.organizationId);
        showToast('Expediente eliminado correctamente');
      } catch (e) {
        showToast('Error al eliminar expediente', 'error');
      }
    },
    startConsultation: (id: string) => dbService.updateAppointmentStatus(id, 'in_consultation', currentUser!.organizationId),
    finalizeConsultation: async (id: string, consultationData?: Partial<Consultation>, prescriptionData?: Partial<Prescription>, amount: number = 0) => {
      try {
        let consultationId = '';

        // Función para limpiar objetos de valores undefined (Firestore no los acepta)
        const cleanData = (obj: any) => {
          const newObj = { ...obj };
          Object.keys(newObj).forEach(key => {
            if (newObj[key] === undefined) delete newObj[key];
            else if (newObj[key] !== null && typeof newObj[key] === 'object' && !Array.isArray(newObj[key])) {
              newObj[key] = cleanData(newObj[key]);
            }
          });
          return newObj;
        };

        if (consultationData) {
          const cleanedConsultation = cleanData({
            ...consultationData,
            organizationId: currentUser!.organizationId,
            doctorId: currentUser!.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            status: 'finalized'
          });

          consultationId = await dbService.saveConsultation(cleanedConsultation, currentUser!.organizationId);
        }

        if (prescriptionData && prescriptionData.medications && prescriptionData.medications.length > 0) {
          const cleanedPrescription = cleanData({
            ...prescriptionData,
            organizationId: currentUser!.organizationId,
            consultationId: consultationId,
            doctorId: currentUser!.id,
            date: new Date().toISOString(),
            status: 'finalized'
          });

          await dbService.savePrescription(cleanedPrescription, currentUser!.organizationId);
        }

        // Solo actualizamos la cita si el ID es válido
        if (id && id.trim() !== '') {
          await dbService.updateAppointmentStatus(id, 'finished', currentUser!.organizationId);
          // Un pequeño delay para asegurar la transición de estados en Firestore
          setTimeout(async () => {
            try {
              await dbService.updateAppointmentStatus(id, 'pending_payment', currentUser!.organizationId, {
                chargeAmount: amount
              });
            } catch (err) {
              console.warn("[DB] Error al pasar a pendiente de pago:", err);
            }
          }, 800);
        }

        showToast('Consulta finalizada y enviada a recepción');
      } catch (e: any) {
        console.error('Error finalizing consultation:', e);
        showToast(`Error: ${e.message || 'No se pudo guardar la consulta'}`, 'error');
      }
    },
    requestNursingSupport: async (request: Partial<NursingRequest>) => {
      if (!currentUser) return;
      try {
        await dbService.createNursingRequest({
          ...request,
          organizationId: currentUser.organizationId,
          doctorId: currentUser.id,
          doctorName: currentUser.name + (currentUser.lastName ? ` ${currentUser.lastName}` : ''),
        }, currentUser.organizationId);
        showToast('Solicitud enviada a enfermería', 'info');
      } catch (e) {
        showToast('Error al enviar solicitud', 'error');
      }
    },
    updateNursingRequest: async (id: string, status: string, data?: any) => {
       const extra: any = { ...data };
       if (status === 'accepted') {
         extra.nurseId = currentUser!.id;
         extra.nurseName = currentUser!.name;
       }
       try {
         await dbService.updateNursingRequestStatus(id, status, currentUser!.organizationId, extra);
         showToast(`Tarea ${status === 'completed' ? 'completada' : 'actualizada'}`);
       } catch (e) {
         showToast('Error al actualizar tarea', 'error');
       }
    },
    connectGoogle: async () => {
      try {
        const token = await googleCalendarService.connectAccount();
        if (token) {
          setIsGoogleConnected(true);
          const events = await googleCalendarService.fetchEvents(token);
          setGoogleEvents(events);
          showToast('Google Calendar conectado');
        }
      } catch (error: any) {
        showToast('Fallo al conectar con Google', 'error');
        throw error;
      }
    },
    disconnectGoogle: async () => {
      await googleCalendarService.disconnect();
      setIsGoogleConnected(false);
      setGoogleEvents([]);
      showToast('Google Calendar desvinculado');
    },
    updateSettings: async (newSettings: any) => {
      if (!currentUser) return;
      try {
        // La imagen ya viene comprimida desde el componente, pero validamos que no exceda el límite final de Firestore
        if (newSettings.logo && newSettings.logo.length > 1000000) {
          showToast('La imagen procesada sigue siendo muy grande. Intente con un logo más simple.', 'error');
          return;
        }

        // Actualizamos el perfil del usuario
        await dbService.updateUserProfile(currentUser.id, {
          name: newSettings.doctorName.split(' ')[0] || '',
          lastName: newSettings.doctorName.split(' ').slice(1).join(' ') || '',
          specialty: newSettings.specialty,
          licenseNumber: newSettings.dgp,
          dgp: newSettings.dgp,
          specialtyLicense: newSettings.specialtyLicense
        });

        // Actualizamos la organización
        if (currentUser.organizationId) {
          await dbService.updateOrganization(currentUser.organizationId, {
            name: newSettings.clinicName,
            address: newSettings.address,
            phone: newSettings.phone,
            logo: newSettings.logo,
            email: newSettings.email
          });
        }

        showToast('Perfil y clínica actualizados');
      } catch (e: any) {
        console.error('Error updating settings:', e);
        showToast(`Error al guardar: ${e.message || 'Error de red'}`, 'error');
      }
    },
    processPayment: async (aptId: string, amount: number) => {
      const apt = agenda.find(a => a.id === aptId);
      if (apt) {
        try {
          await dbService.addTransaction({
            description: `Consulta: ${apt.patientName}`,
            amount, type: 'ingreso', patientId: apt.patientId,
            organizationId: currentUser!.organizationId, method: 'cash', status: 'paid', category: 'Consulta'
          }, currentUser!.organizationId);
          await dbService.updateAppointmentStatus(aptId, 'paid', currentUser!.organizationId);
          showToast('Pago registrado y cita pagada');
        } catch (e) {
          showToast('Error al procesar pago', 'error');
        }
      }
    }
  };
}
