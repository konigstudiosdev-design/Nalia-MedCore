import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, Clock, FileText, Activity, ShieldAlert, LogOut, ChevronRight, Loader2
} from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { PatientList } from './components/pacientes/PatientList';
import { PatientDetail } from './components/pacientes/PatientDetail';
import { ConsultaEditor } from './components/consulta/ConsultaEditor';
import { AgendaView } from './components/agenda/AgendaView';
import { FinanceView } from './components/finanzas/FinanceView';
import { ReportsView } from './components/reportes/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ComplianceCenter } from './components/compliance/ComplianceCenter';
import { Modal } from './components/shared/Modal';
import { Toast } from './components/shared/Toast';
import { TrialBanner } from './components/shared/TrialBanner';
import { checkOrStartTrial, TrialStatus } from './lib/trialService';
import { AddPatientForm } from './components/pacientes/AddPatientForm';
import { useMedicalData } from './hooks/useMedicalData';
import { DoctorDashboard } from './components/dashboard/role-specific/DoctorDashboard';
import { NurseDashboard } from './components/dashboard/role-specific/NurseDashboard';
import { ReceptionDashboard } from './components/dashboard/role-specific/ReceptionDashboard';
import { PatientPrep } from './components/enfermeria/PatientPrep';
import { NurseVitalsView } from './components/enfermeria/NurseVitalsView';
import { NurseTasksView } from './components/enfermeria/NurseTasksView';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { OnboardingView } from './components/auth/OnboardingView';
import { TeamManagement } from './components/settings/TeamManagement';

export default function MedIOSApp() {
  const {
    currentUser, authLoading, workMode, toggleWorkMode,
    patients, agenda, transactions, nursingRequests, consultations, prescriptions, settings, googleEvents, isGoogleConnected, doctors,
    toast, hideToast, logout,
    addPatient, updatePatient, deletePatient, addAgendaItem, confirmArrival, updateAppointment, deleteAppointment,
    requestNursingSupport, updateNursingRequest, connectGoogle, disconnectGoogle,
    startConsultation, finalizeConsultation, processPayment, updateSettings
  } = useMedicalData();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nalia_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nalia_theme', theme);
  }, [theme]);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    checkOrStartTrial().then(status => setTrialStatus(status));
  }, []);

  // Paciente activo derivado de la lista (para asegurar datos frescos)
  const activePatient = patients.find(p => p.id === activePatientId) || (patients.length > 0 ? patients[0] : null);

  useEffect(() => {
    if (patients.length > 0 && !activePatientId) {
      setActivePatientId(patients[0].id);
    }
  }, [patients]);

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#080808] flex flex-col items-center justify-center">
         <Loader2 className="text-indigo-500 animate-spin mb-4" size={40} />
         <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-xs">Cargando Nalia MedCore...</p>
      </div>
    );
  }

  if (!currentUser) {
    return authView === 'login'
      ? <LoginView onSwitchToRegister={() => setAuthView('register')} />
      : <RegisterView onSwitchToLogin={() => setAuthView('login')} />;
  }

  // Si es el propietario y no ha terminado el onboarding
  if (currentUser && currentUser.isOwner && !currentUser.onboardingCompleted) {
    return <OnboardingView user={currentUser} onComplete={() => navigateTo('dashboard')} />;
  }

  const navigateTo = (moduleId: string) => {
    setCurrentModule(moduleId);
    setMobileMenuOpen(false);
  };

  const handleAddPatient = (patientData: any) => {
    addPatient(patientData);
    setAddPatientModalOpen(false);
  };

  const handleStartConsultation = (id: string) => {
    const apt = agenda.find(a => a.id === id);
    if (apt) {
      startConsultation(id);
      const patient = patients.find(p => p.id === apt.patientId);
      if (patient) setActivePatientId(patient.id);
    }
    navigateTo('consulta');
  };

  const handleStartPatientConsultation = (patient: any) => {
    setActivePatientId(patient.id);
    // Intentar vincular con cita de hoy si existe (en cualquier estado que no sea finalizado)
    const today = new Date().toISOString().split('T')[0];
    const todayApt = agenda.find(a =>
      a.patientId === patient.id &&
      a.date === today &&
      !['finished', 'paid', 'cancelled'].includes(a.status)
    );

    if (todayApt) {
      handleStartConsultation(todayApt.id);
    } else {
      // Si no hay cita hoy, abrimos el editor directo para el paciente
      navigateTo('consulta');
    }
  };

  const renderDashboard = () => {
    if (currentUser.role === 'organization_admin' && workMode === 'admin') {
      return (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-[#121212] p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Ingresos Mes</p>
                 <div className="text-3xl font-black">$0.00</div>
              </div>
              <div className="bg-white dark:bg-[#121212] p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Nuevos Pacientes</p>
                 <div className="text-3xl font-black">0</div>
              </div>
              <div className="bg-white dark:bg-[#121212] p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Tasa de Asistencia</p>
                 <div className="text-3xl font-black">0%</div>
              </div>
              <div className="bg-white dark:bg-[#121212] p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Ticket Promedio</p>
                 <div className="text-3xl font-black">$0</div>
              </div>
           </div>
           {/* Vista de reporte rápido para Admin */}
        </div>
      );
    }

    switch (currentUser.role) {
      case 'doctor':
      case 'organization_admin': // Admin en modo clínico se comporta como médico
        return <DoctorDashboard agenda={agenda} patients={patients} nursingRequests={nursingRequests} user={currentUser} onStartConsultation={handleStartConsultation} navigateTo={navigateTo} />;
      case 'nurse':
        return (
          <NurseDashboard
            requests={nursingRequests}
            onUpdateStatus={updateNursingRequest}
            onSaveVitals={async (appointmentId, vitals) => {
              await updateAppointment(appointmentId, 'waiting', { vitalSigns: vitals, hasNursingRequest: false });
            }}
            navigateTo={navigateTo}
          />
        );
      case 'reception':
        return <ReceptionDashboard agenda={agenda} patients={patients} transactions={transactions} doctors={doctors} onRegisterArrival={confirmArrival} navigateTo={navigateTo} />;
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className={`h-screen w-full bg-zinc-50 dark:bg-[#080808] text-zinc-900 dark:text-zinc-50 font-sans flex flex-col md:flex-row overflow-hidden ${theme}`}>

      <Sidebar
        currentModule={currentModule}
        navigateTo={navigateTo}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        role={currentUser.role}
        workMode={workMode}
        onToggleMode={toggleWorkMode}
      />

      <BottomNav
        currentModule={currentModule}
        navigateTo={navigateTo}
        userRole={currentUser.role}
        onAddPatientClick={() => setAddPatientModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen md:ml-20 xl:ml-60 transition-all duration-300 pb-[84px] md:pb-0">
        
        <TopBar
          currentModule={currentModule}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          setTheme={setTheme}
          doctorName={currentUser.name}
          role={currentUser.role}
          onChangeRole={() => {}} // Ya no se cambia rol manualmente, es por Auth
          onNavigate={navigateTo}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-[#050505] relative scroll-smooth">
          
          {currentModule === 'consulta' ? (
             <ConsultaEditor
               patient={activePatient}
               user={currentUser}
               settings={settings}
               appointment={agenda.find(a => a.patientId === activePatient?.id && (a.status === 'in_consultation' || a.status === 'waiting'))}
               nursingRequests={nursingRequests.filter(r => r.appointmentId === agenda.find(a => a.patientId === activePatient?.id)?.id)}
               onRequestNursing={requestNursingSupport}
               onUpdatePatient={updatePatient}
               finalizeConsultation={finalizeConsultation}
               navigateTo={navigateTo}
             />
          ) : (
            <>
              {/* MODULE: DASHBOARD */}
              {currentModule === 'dashboard' && (
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                  <header className="mb-10">
                     <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        {currentUser.role === 'organization_admin' && workMode === 'admin'
                          ? 'Administración Global'
                          : `Bienvenido, ${currentUser.name}`}
                     </h1>
                     <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                        {currentUser.role === 'organization_admin' && workMode === 'admin' ? 'Clínica Nalia MedCore Central' : 'Control Clínico y Operativo'}
                     </p>
                  </header>
                  {renderDashboard()}
                </div>
              )}

              {/* MODULE: VITALS (Nurse) */}
              {currentModule === 'vitals' && (
                <NurseVitalsView
                  agenda={agenda}
                  patients={patients}
                  nursingRequests={nursingRequests}
                  onSaveVitals={async (appointmentId, vitals) => {
                    await updateAppointment(appointmentId, 'waiting', { vitalSigns: vitals, hasNursingRequest: false });
                  }}
                  onUpdateNursingRequest={updateNursingRequest}
                />
              )}

              {/* MODULE: TASKS (Nurse) */}
              {currentModule === 'tasks' && (
                <NurseTasksView
                  requests={nursingRequests}
                  onUpdateStatus={updateNursingRequest}
                />
              )}

              {/* MODULE: TEAM (Admin Only) */}
              {currentModule === 'team' && (
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                   <TeamManagement organizationId={currentUser.organizationId} />
                </div>
              )}

              {/* MODULE: PACIENTES */}
              {currentModule === 'pacientes' && (
                <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
                  <PatientList
                    patients={patients}
                    activePatient={activePatient}
                    setActivePatient={(p) => setActivePatientId(p.id)}
                    onAddClick={() => setAddPatientModalOpen(true)}
                    userRole={currentUser.role}
                  />
                  <PatientDetail
                    patient={activePatient}
                    consultations={consultations.filter(c => c.patientId === activePatient?.id)}
                    prescriptions={prescriptions.filter(p => p.patientId === activePatient?.id)}
                    onUpdatePatient={updatePatient}
                    onDeletePatient={deletePatient}
                    onStartPatientConsultation={handleStartPatientConsultation}
                    userRole={currentUser.role}
                    navigateTo={navigateTo}
                  />
                </div>
              )}

              {/* MODULE: AGENDA */}
              {currentModule === 'agenda' && (
                <AgendaView
                  agenda={agenda}
                  patients={patients}
                  doctors={doctors}
                  onAddAppointment={addAgendaItem}
                  onUpdateAppointment={updateAppointment}
                  onDeleteAppointment={deleteAppointment}
                  onStartConsultation={handleStartConsultation}
                  googleEvents={googleEvents}
                  isGoogleConnected={isGoogleConnected}
                  onConnectGoogle={connectGoogle}
                  onDisconnectGoogle={disconnectGoogle}
                  userRole={currentUser.role}
                />
              )}



              {/* MODULE: FINANZAS */}
              {currentModule === 'finanzas' && (
                <FinanceView
                  transactions={transactions}
                  agenda={agenda}
                  userRole={currentUser.role}
                  onAddTransaction={processPayment as any}
                  onUpdateAppointment={updateAppointment}
                />
              )}

              {/* MODULE: REPORTES */}
              {currentModule === 'reportes' && (
                <ReportsView />
              )}

              {/* MODULE: COMPLIANCE */}
              {currentModule === 'compliance' && (
                <ComplianceCenter />
              )}

              {/* MODULE: SETTINGS */}
              {(currentModule === 'settings' || currentModule === 'org-settings') && (
                <SettingsView settings={settings} onSave={updateSettings} workMode={workMode} userRole={currentUser.role} />
              )}
            </>
          )}

        </main>
      </div>

      <Modal
        isOpen={isAddPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        title="Nuevo Paciente"
      >
        <AddPatientForm
          onAdd={handleAddPatient}
          onCancel={() => setAddPatientModalOpen(false)}
        />
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <TrialBanner trialStatus={trialStatus} />

      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.woff2) format('woff2');
        }
      `}} />
    </div>
  );
}
