import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, MoreHorizontal, CheckCircle2, Clock, XCircle, Search, Filter, Stethoscope, Activity, User as UserIcon } from 'lucide-react';
import { User, Role } from '../../types';
import { db, firebaseConfig } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Modal } from '../shared/Modal';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

interface TeamManagementProps {
  organizationId: string;
}

export function TeamManagement({ organizationId }: TeamManagementProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    role: 'doctor' as Role
  });

  useEffect(() => {
    if (!organizationId) return;

    // Suscribirse a miembros de la misma organización
    const q = query(collection(db, 'users'), where('organizationId', '==', organizationId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setMembers(users);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.password || !newMember.name) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsCreating(true);
    setError(null);

    let secondaryApp;
    try {
      // Verificar si la app ya existe para evitar errores de inicialización duplicada
      const apps = (await import('firebase/app')).getApps();
      secondaryApp = apps.find(app => app.name === 'SecondaryAuth');

      if (!secondaryApp) {
        secondaryApp = initializeApp(firebaseConfig, 'SecondaryAuth');
      }

      const secondaryAuth = getAuth(secondaryApp);
      let uid = '';

      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newMember.email, newMember.password);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // Si ya existe en Auth, intentamos loguearnos para obtener el UID y re-intentar el registro en DB
          try {
            const loginRes = await (await import('firebase/auth')).signInWithEmailAndPassword(secondaryAuth, newMember.email, newMember.password);
            uid = loginRes.user.uid;
          } catch (loginErr) {
            throw new Error('El correo ya está registrado con una contraseña diferente.');
          }
        } else {
          throw authErr;
        }
      }

      // Intentar crear el documento en Firestore usando la sesión del NUEVO usuario (secondaryApp)
      // Esto evita el error permission-denied ya que request.auth.uid == uid
      try {
        const secondaryDb = getFirestore(secondaryApp);
        await setDoc(doc(secondaryDb, 'users', uid), {
          id: uid,
          name: newMember.name,
          lastName: newMember.lastName,
          email: newMember.email,
          role: newMember.role,
          organizationId,
          status: 'active',
          createdAt: new Date().toISOString()
        });
      } catch (fsErr: any) {
        console.error('Firestore Error:', fsErr);
        // Fallback al db principal por si acaso las reglas de Firestore permiten escritura por Admin
        try {
          await setDoc(doc(db, 'users', uid), {
            id: uid,
            name: newMember.name,
            lastName: newMember.lastName,
            email: newMember.email,
            role: newMember.role,
            organizationId,
            status: 'active',
            createdAt: new Date().toISOString()
          });
        } catch (fallbackErr: any) {
          throw new Error(`Error en Base de Datos (${fsErr.code || fsErr.message}). Verifica tus reglas en Firebase.`);
        }
      }

      // Limpiar y cerrar
      await signOut(secondaryAuth);

      setIsAddModalOpen(false);
      setNewMember({ name: '', lastName: '', email: '', password: '', role: 'doctor' });
    } catch (err: any) {
      console.error('Final Error:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    await updateDoc(doc(db, 'users', user.id), { status: newStatus });
  };

  const getRoleIcon = (role: Role) => {
    switch(role) {
      case 'doctor': return <Stethoscope size={14}/>;
      case 'nurse': return <Activity size={14}/>;
      case 'reception': return <UserIcon size={14}/>;
      default: return <Shield size={14}/>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Gestión de Equipo</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Control de accesos, roles y permisos de tu organización</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <UserPlus size={18} /> Agregar Miembro
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><Users size={20}/></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Miembros</span>
            </div>
            <div className="text-3xl font-black">{members.length}</div>
         </div>
         <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600"><CheckCircle2 size={20}/></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Activos</span>
            </div>
            <div className="text-3xl font-black">{members.filter(m => m.status === 'active').length}</div>
         </div>
         <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600"><Clock size={20}/></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invitaciones</span>
            </div>
            <div className="text-3xl font-black">{members.filter(m => m.status === 'invited').length}</div>
         </div>
      </div>

      {/* Team Table */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
           <div className="relative w-80 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <input type="text" placeholder="Buscar por nombre o correo..." className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
           </div>
           <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"><Filter size={20}/></button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Usuario</th>
                  <th className="px-8 py-4">Rol</th>
                  <th className="px-8 py-4">Estado</th>
                  <th className="px-8 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                 {members.map(member => (
                   <tr key={member.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900 dark:to-indigo-950 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 shadow-inner">
                               {member.name.charAt(0)}
                            </div>
                            <div>
                               <div className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                  {member.name} {member.lastName}
                                  {member.isOwner && <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[7px] uppercase tracking-widest rounded">Owner</span>}
                               </div>
                               <div className="text-[10px] font-bold text-zinc-400">{member.email}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
                            <span className="text-zinc-500">{getRoleIcon(member.role)}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{member.role}</span>
                         </div>
                      </td>

                      <td className="px-8 py-5">
                         <div className={`flex items-center gap-2 ${member.status === 'active' ? 'text-emerald-500' : member.status === 'invited' ? 'text-amber-500' : 'text-zinc-400'}`}>
                            {member.status === 'active' ? <CheckCircle2 size={14}/> : member.status === 'invited' ? <Mail size={14}/> : <XCircle size={14}/>}
                            <span className="text-[10px] font-black uppercase tracking-widest">{member.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button
                           disabled={member.isOwner}
                           onClick={() => toggleUserStatus(member)}
                           className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors disabled:opacity-0"
                         >
                            <MoreHorizontal size={20}/>
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Invitar Miembro al Equipo">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Nombre</label>
                  <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold"/>
               </div>
               <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Apellidos</label>
                  <input type="text" value={newMember.lastName} onChange={e => setNewMember({...newMember, lastName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold"/>
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
               <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold" placeholder="colaborador@tuclinica.com"/>
            </div>
            <div>
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block text-indigo-400">Contraseña de Acceso</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/>
                  <input
                    type="password"
                    value={newMember.password}
                    onChange={e => setNewMember({...newMember, password: e.target.value})}
                    className="w-full bg-zinc-900 border border-indigo-500/30 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold"
                    placeholder="Mínimo 6 caracteres"
                  />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Rol en la Organización</label>
               <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as Role})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold">
                  <option value="doctor">Médico / Especialista</option>
                  <option value="nurse">Enfermería</option>
                  <option value="reception">Recepción / Caja</option>
               </select>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake-in duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-400 font-bold leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Limpiar Error y Editar
                </button>
              </div>
            )}

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
               <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Al crear este usuario, se activará su cuenta inmediatamente con la contraseña proporcionada. Asegúrese de compartir las credenciales de forma segura.
               </p>
            </div>
            <button
              onClick={handleAddMember}
              disabled={isCreating}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
               {isCreating ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   Creando Usuario...
                 </>
               ) : (
                 'Crear Cuenta de Miembro'
               )}
            </button>
         </div>
      </Modal>
    </div>
  );
}
