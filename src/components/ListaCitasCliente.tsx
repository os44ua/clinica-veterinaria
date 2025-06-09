import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CitaData } from '../redux/citaSlice';

interface ListaCitasClienteProps {
  citas: CitaData[];
  loading: boolean;
  onEliminarCita?: (citaId: string) => void; // Solo necesitamos eliminar para cancelar
}

const ListaCitasCliente: React.FC<ListaCitasClienteProps> = ({
  citas,
  loading,
  onEliminarCita
}) => {
  const { t } = useTranslation();
  
  // Estado para el buscador
  const [buscarCita, setBuscarCita] = useState('');

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
      cita.veterinarioNombre?.toLowerCase().includes(terminoBusqueda) ||
      cita.fecha.includes(terminoBusqueda) ||
      cita.motivo.toLowerCase().includes(terminoBusqueda) ||
      getEstadoTexto(cita.estado).toLowerCase().includes(terminoBusqueda)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-cyan-500 mr-3"></div>
        <p className="text-gray-600 text-lg">{t('appointment.loadingAppointments')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header con buscador */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
            📅 {t('client.myAppointments')}
          </h3>
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
      {citasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-8xl mb-6">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {buscarCita.trim() 
              ? t('appointment.noAppointmentsFound')
              : t('appointment.noAppointments')
            }
          </h3>
          <p className="text-gray-500">
            {buscarCita.trim() 
              ? 'Intenta buscar con otros términos'
              : 'Solicita una nueva cita para comenzar'
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
                     {t('appointment.vet')}
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
                      <div className="text-gray-900 font-medium">
                        {cita.veterinarioNombre || 'Sin asignar'}
                      </div>
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
                      <div className="flex justify-center">
                        {/* Cancelar - para citas pendientes y confirmadas */}
                        {(cita.estado === 'pendiente' || cita.estado === 'confirmada') && (
                          <button 
                            onClick={() => {
                              console.log('Cancelando cita:', cita.id, 'Estado:', cita.estado);
                              const confirmar = window.confirm(t('appointment.confirmCancel'));
                              if (confirmar && onEliminarCita) {
                                onEliminarCita(cita.id!);
                              }
                            }} 
                            className="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            title={t('appointment.cancelAppointment')}
                          >
                             {t('appointment.cancel')}
                          </button>
                        )}

                        {/* Mostrar estado para citas ya canceladas */}
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
  );
};

export default ListaCitasCliente;