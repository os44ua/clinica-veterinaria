import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { getDatabase, ref, get, set, remove } from "firebase/database";
import type { Usuario } from "../interfaces/IUsuario";
import dogIcon from '../assets/dog.png';

// Definimos los roles posibles en el sistema
const ROLES = {
  CLIENTE: 'CLIENTE',
  VETERINARIO: 'VETERINARIO', 
  ADMIN: 'ADMIN'
} as const;

// Tipo para los roles del sistema
type RoleType = typeof ROLES[keyof typeof ROLES];

// Interfaz para cambios pendientes
interface PendingChange {
  uid: string;
  newRole: RoleType;
  currentRole: RoleType;
}

// Página de administración para gestionar usuarios y roles
export default function AdminVets() {
  const { t } = useTranslation();
  
  // Estados locales del componente
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]); // Cambios pendientes
  const [savingChanges, setSavingChanges] = useState(false); // Estado de guardado
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set()); // Usuarios siendo eliminados
  
  // Instancia de la base de datos
  const db = getDatabase();

  // Efecto para cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cargar todos los usuarios desde Firebase
  const cargarUsuarios = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const snapshot = await get(ref(db, "users"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convertir objeto de Firebase a array de usuarios
        const listaUsuarios = Object.keys(data).map((uid) => ({
          uid,
          email: data[uid].email || "(sin email)",
          roles: data[uid].roles || {}
        }));
        setUsuarios(listaUsuarios);
      } else {
        setUsuarios([]);
      }
      
      // Limpiar cambios pendientes al recargar
      setPendingChanges([]);
      setError("");
      
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para manejar el refresh manual
  const handleRefresh = () => {
    cargarUsuarios(true);
  };

  // Función para determinar el rol actual del usuario
  const getCurrentRole = (roles: any): RoleType => {
    if (roles?.admin) return ROLES.ADMIN;
    if (roles?.veterinario) return ROLES.VETERINARIO;
    return ROLES.CLIENTE;
  };

  // Función para manejar cambio de rol (sin guardar inmediatamente)
  const handleRoleChange = (uid: string, newRole: RoleType) => {
    const user = usuarios.find(u => u.uid === uid);
    if (!user) return;
    
    const currentRole = getCurrentRole(user.roles);
    
    // Si el rol es el mismo, remover de cambios pendientes
    if (newRole === currentRole) {
      setPendingChanges(prev => prev.filter(change => change.uid !== uid));
      return;
    }
    
    // Agregar o actualizar cambio pendiente
    setPendingChanges(prev => {
      const existingIndex = prev.findIndex(change => change.uid === uid);
      const newChange: PendingChange = { uid, newRole, currentRole };
      
      if (existingIndex >= 0) {
        // Actualizar cambio existente
        const updated = [...prev];
        updated[existingIndex] = newChange;
        return updated;
      } else {
        // Agregar nuevo cambio
        return [...prev, newChange];
      }
    });
  };

  // Función para guardar todos los cambios pendientes
  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;
    
    setSavingChanges(true);
    let savedCount = 0;
    
    try {
      // Guardar cada cambio
      for (const change of pendingChanges) {
        const newRoles = {
          admin: change.newRole === ROLES.ADMIN,
          veterinario: change.newRole === ROLES.VETERINARIO,
          cliente: true // Todos son clientes por defecto
        };

        await set(ref(db, `users/${change.uid}/roles`), newRoles);
        
        // Actualizar estado local
        setUsuarios(prev =>
          prev.map(user =>
            user.uid === change.uid
              ? { ...user, roles: newRoles }
              : user
          )
        );
        
        savedCount++;
      }
      
      // Limpiar cambios pendientes y mostrar mensaje de éxito
      setPendingChanges([]);
      setSuccessMessage(t('admin.changesSaved', { count: savedCount }));
      
      // Limpiar mensaje después de 4 segundos
      setTimeout(() => setSuccessMessage(""), 4000);
      
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setError(t('admin.saveChangesError'));
    } finally {
      setSavingChanges(false);
    }
  };

  // Función para cancelar cambios pendientes
  const cancelChanges = () => {
    setPendingChanges([]);
  };

  // Función para eliminar usuario
  const deleteUser = async (uid: string, email: string) => {
    const confirmDelete = window.confirm(
      `${t('admin.confirmDelete', { email })}?`
    );
    
    if (!confirmDelete) return;
    
    setDeletingUsers(prev => new Set(prev).add(uid));
    
    try {
      // Eliminar usuario de Firebase
      await remove(ref(db, `users/${uid}`));
      
      // Actualizar estado local
      setUsuarios(prev => prev.filter(user => user.uid !== uid));
      
      // Remover de cambios pendientes si existía
      setPendingChanges(prev => prev.filter(change => change.uid !== uid));
      
      setSuccessMessage(t('admin.userDeleted', { email }));
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(t('admin.deleteError', { email }));
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(uid);
        return newSet;
      });
    }
  };

  // Función para obtener el rol que se mostraría (actual o pendiente)
  const getDisplayRole = (uid: string): RoleType => {
    const pendingChange = pendingChanges.find(change => change.uid === uid);
    if (pendingChange) {
      return pendingChange.newRole;
    }
    
    const user = usuarios.find(u => u.uid === uid);
    return user ? getCurrentRole(user.roles) : ROLES.CLIENTE;
  };

  // Función para obtener el texto del rol traducido
  const getRoleText = (role: RoleType) => {
    switch (role) {
      case ROLES.ADMIN:
        return t('admin.roles.admin');
      case ROLES.VETERINARIO:
        return t('admin.roles.vet');
      case ROLES.CLIENTE:
        return t('admin.roles.client');
      default:
        return t('admin.roles.unknown');
    }
  };

  // Función para limpiar mensajes
  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado de la página */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <img 
              src={dogIcon} 
              alt="Admin Logo" 
              className="w-12 h-12 object-contain mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t('admin.title')}</h1>
              <p className="text-gray-600">{t('admin.description')}</p>
            </div>
          </div>
        </div>

        {/* Mostrar mensaje de éxito */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm">{successMessage}</p>
              </div>
              <button 
                onClick={clearMessages}
                className="text-green-500 hover:text-green-700 font-semibold"
              >
                {t('forms.close')}
              </button>
            </div>
          </div>
        )}

        {/* Mostrar errores si existen */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{t('errors.somethingWrong')}</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={clearMessages}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                {t('forms.close')}
              </button>
            </div>
          </div>
        )}

        {/* Panel de cambios pendientes */}
        {pendingChanges.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{t('admin.pendingChanges', { count: pendingChanges.length })}</h3>
                <p className="text-sm mt-1">
                  {t('admin.pendingChangesDesc')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={cancelChanges}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  {t('forms.cancel')}
                </button>
                <button
                  onClick={saveAllChanges}
                  disabled={savingChanges}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  {savingChanges && (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  )}
                  <span>{savingChanges ? t('forms.saving') : t('admin.saveChanges')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de usuarios */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t('admin.usersList')} ({usuarios.length})
            </h2>
            
            {/* Botón de refresh */}
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary flex items-center space-x-2"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <span>{refreshing ? t('admin.updating') : t('admin.refresh')}</span>
            </button>
          </div>
          
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('admin.noUsers')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-2/5">
                      {t('admin.table.user')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-1/5">
                      {t('admin.table.currentRole')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-1/5">
                      {t('admin.table.changeRole')}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 w-1/5">
                      {t('admin.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {usuarios.map((user, index) => {
                    const currentRole = getCurrentRole(user.roles);
                    const displayRole = getDisplayRole(user.uid);
                    const hasPendingChange = pendingChanges.some(change => change.uid === user.uid);
                    const isDeleting = deletingUsers.has(user.uid);
                    
                    return (
                      <tr key={user.uid} className="hover:bg-gray-50 transition-colors duration-150" style={{ animationDelay: `${index * 0.1}s` }}>
                        {/* Información del usuario */}
                        <td className="px-6 py-4 border-r border-gray-100">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 text-base">{user.email}</p>
                            <p className="text-sm text-gray-500">
                              <strong>ID:</strong> {user.uid.substring(0, 8)}...
                            </p>
                          </div>
                        </td>
                        
                        {/* Rol actual con indicador de cambio */}
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                              currentRole === ROLES.ADMIN 
                                ? 'bg-red-100 text-red-800'
                                : currentRole === ROLES.VETERINARIO
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {getRoleText(currentRole)}
                            </span>
                            {hasPendingChange && (
                              <div className="flex items-center text-xs text-yellow-600 font-medium">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {getRoleText(displayRole)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Selector de nuevo rol */}
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <select
                            value={displayRole}
                            onChange={(e) => handleRoleChange(user.uid, e.target.value as RoleType)}
                            disabled={isDeleting}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              hasPendingChange ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'bg-white shadow-sm'
                            }`}
                          >
                            <option value={ROLES.CLIENTE}>{t('admin.roles.client')}</option>
                            <option value={ROLES.VETERINARIO}>{t('admin.roles.vet')}</option>
                            <option value={ROLES.ADMIN}>{t('admin.roles.admin')}</option>
                          </select>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deleteUser(user.uid, user.email)}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            <span>{isDeleting ? t('forms.deleting') : t('forms.delete')}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('admin.rolesInfo.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">{t('admin.roles.client')}</h4>
              <p className="text-sm text-green-700">{t('admin.rolesInfo.clientDesc')}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">{t('admin.roles.vet')}</h4>
              <p className="text-sm text-blue-700">{t('admin.rolesInfo.vetDesc')}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">{t('admin.roles.admin')}</h4>
              <p className="text-sm text-red-700">{t('admin.rolesInfo.adminDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}