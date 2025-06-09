import { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getDatabase, ref, get } from "firebase/database";
import { AuthContext } from "../contexts/AuthContext";
import { fetchCitasVeterinario, updateEstadoCita } from "../redux/citaSlice";
import logger from "../services/logging";
import type { CitaData } from "../redux/citaSlice";
import dogIcon from '../assets/dog.png';

// Interfaz para los datos del veterinario
interface VeterinarioData {
  nombre?: string;
  apellidos?: string;
  especialidad?: string;
  telefono?: string;
  licencia?: string;
}

// Componente del perfil del veterinario
export default function PerfilVeterinario() {
  const { t } = useTranslation();
  
  // Obtener el usuario actual del contexto de autenticación
  const { user } = useContext(AuthContext);

  // Hook de Redux para disparar acciones y obtener estado
  const dispatch = useAppDispatch();
  const { citas, loading: citasLoading, error: citasError } = useAppSelector(state => state.cita);

  // Estados locales del componente
  const [data, setData] = useState<VeterinarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buscarCita, setBuscarCita] = useState('');

  // Función para confirmar una cita
  const confirmarCita = (id: string) => {
    const confirmar = window.confirm(t('vet.confirmAppointment'));
    if (confirmar) {
      dispatch(updateEstadoCita({ 
        id, 
        estado: 'confirmada',
        observaciones: t('vet.confirmedByVet')
      }));
      logger.info(`Cita ${id} confirmada por el veterinario`);
    }
  };

  // Función para rechazar una cita
  const cancelarCita = (id: string) => {
    const cancelar = window.confirm(t('vet.cancelAppointment'));
    if (cancelar) {
      dispatch(updateEstadoCita({ 
        id, 
        estado: 'cancelada',
        observaciones: t('vet.cancelledByVet')
      }));
      logger.info(`Cita ${id} cancelada por el veterinario`);
    }
  };

  // Función para obtener el texto del estado traducido
  const getEstadoTexto = (estado: CitaData['estado']) => {
    switch (estado) {
      case 'pendiente': return t('appointment.pending');
      case 'confirmada': return t('appointment.confirmed');
      case 'cancelada': return t('appointment.cancelled');
      default: return t('admin.roles.unknown');
    }
  };

  // Función para obtener el badge del estado usando solo clases Tailwind
  const getEstadoBadge = (estado: CitaData['estado']) => {
    const texto = getEstadoTexto(estado);
    
    switch (estado) {
      case 'pendiente': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
            {texto}
          </span>
        );
      case 'confirmada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            {texto}
          </span>
        );
      case 'cancelada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
            {texto}
          </span>
        );
      default: 
        return <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{texto}</span>;
    }
  };

  // Filtrar citas según la búsqueda
  const citasFiltradas = citas.filter(cita => {
    if (!buscarCita.trim()) return true;
    
    const terminoBusqueda = buscarCita.toLowerCase();
    return (
      cita.mascotaNombre.toLowerCase().includes(terminoBusqueda) ||
      cita.clienteEmail.toLowerCase().includes(terminoBusqueda) ||
      cita.fecha.includes(terminoBusqueda) ||
      cita.motivo.toLowerCase().includes(terminoBusqueda) ||
      getEstadoTexto(cita.estado).toLowerCase().includes(terminoBusqueda)
    );
  });

  // useEffect para cargar los datos al montar el componente
  useEffect(() => {
    if (!user) return;

    const db = getDatabase();

    // Cargar información del veterinario
    const cargarDatosVeterinario = async () => {
      try {
        logger.info("Cargando datos del veterinario...");
        const vetRef = ref(db, `veterinarios/${user.uid}`);
        const snapshot = await get(vetRef);

        if (snapshot.exists()) {
          setData(snapshot.val());
          logger.info("Datos del veterinario cargados");
        } else {
          // Perfil básico si no hay datos guardados
          setData({
            nombre: "Veterinario",
            apellidos: "Apellido",
            especialidad: t('vet.generalMedicine'),
            telefono: t('vet.notSpecified'),
            licencia: t('vet.notSpecified')
          });
          logger.warn("No se encontraron datos, se usó perfil por defecto");
        }
      } catch (err) {
        logger.error("Error al cargar datos del veterinario", err);
        setError(t('vet.loadError'));
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos del veterinario
    cargarDatosVeterinario();

    // Cargar citas usando Redux
    if (user.uid) {
      logger.info("Cargando citas del veterinario con Redux...");
      dispatch(fetchCitasVeterinario(user.uid));
    }

  }, [user, dispatch, t]);

  // Mostrar mensaje mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="text-gray-600">{t('vet.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado del panel */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <img 
              src={dogIcon} 
              alt="Vet Logo" 
              className="w-12 h-12 object-contain mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t('vet.title')}</h1>
              <p className="text-gray-600">
                {t('vet.welcome')}, Dr. {data?.nombre} {data?.apellidos}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {(error || citasError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{t('errors.somethingWrong')}</h3>
                <p className="text-sm mt-1">{error || citasError}</p>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                {t('forms.close')}
              </button>
            </div>
          </div>
        )}

        {/* Información personal - ahora arriba */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('vet.personalInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('forms.name')}</label>
              <p className="text-gray-900 font-medium">{data?.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('forms.surname')}</label>
              <p className="text-gray-900 font-medium">{data?.apellidos}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('vet.specialty')}</label>
              <p className="text-gray-900 font-medium">{data?.especialidad}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('forms.phone')}</label>
              <p className="text-gray-900 font-medium">{data?.telefono}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('auth.email')}</label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('vet.license')}</label>
              <p className="text-gray-900 font-medium">{data?.licencia}</p>
            </div>
          </div>
        </div>

        {/* Tabla de citas - ahora abajo con nuevo estilo */}
        <div className="animate-fadeIn">
          {/* Header con buscador */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                {t('vet.appointmentsList')}
              </h2>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {citasFiltradas.length} {citasFiltradas.length === 1 ? 'cita' : 'citas'}
              </div>
            </div>
            
            {/* Buscador con icono */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={buscarCita}
                onChange={(e) => setBuscarCita(e.target.value)}
                placeholder={t('appointment.searchPlaceholder')}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Contenido principal */}
          {citasLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-cyan-500 mr-3"></div>
              <p className="text-gray-600 text-lg">{t('vet.loadingAppointments')}</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-8xl mb-6">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {buscarCita.trim() 
                  ? t('appointment.noAppointmentsFound')
                  : t('vet.noAppointments')
                }
              </h3>
              <p className="text-gray-500">
                {buscarCita.trim() 
                  ? 'Intenta buscar con otros términos'
                  : 'No hay citas programadas en este momento'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('appointment.date')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('appointment.time')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('appointment.pet')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('vet.client')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('appointment.status')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('appointment.reason')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {t('admin.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {citasFiltradas.map((cita, index) => (
                      <tr key={cita.id} className="hover:bg-gray-50 transition-colors duration-150 animate-slideIn" style={{ animationDelay: `${index * 0.1}s` }}>
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <div className="font-semibold text-gray-900">
                            {new Date(cita.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'long' })}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {cita.hora}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <div className="font-semibold text-blue-600">{cita.mascotaNombre}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <div className="text-gray-900 font-medium">{cita.clienteEmail}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          {getEstadoBadge(cita.estado)}
                        </td>
                        
                        <td className="px-6 py-4 text-center border-r border-gray-100">
                          <div 
                            className="max-w-xs mx-auto truncate cursor-help" 
                            title={cita.motivo}
                          >
                            {cita.motivo}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {/* Confirmar y Cancelar - solo para citas pendientes */}
                            {cita.estado === 'pendiente' && (
                              <>
                                <button 
                                  onClick={() => confirmarCita(cita.id!)}
                                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-500 text-white hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                  title={t('vet.confirmAppointment')}
                                >
                                  {t('vet.confirm')}
                                </button>
                                <button 
                                  onClick={() => cancelarCita(cita.id!)}
                                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                  title={t('vet.cancelAppointment')}
                                >
                                  {t('vet.cancel')}
                                </button>
                              </>
                            )}

                            {/* Mostrar estado para otros estados */}
                            {cita.estado === 'confirmada' && (
                              <span className="text-sm text-gray-500">
                                {t('appointment.confirmed')}
                              </span>
                            )}

                            {cita.estado === 'cancelada' && (
                              <span className="text-sm text-gray-500">
                                {t('appointment.cancelled')}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}