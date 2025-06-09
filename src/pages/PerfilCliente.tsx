import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAuth, useCliente, useMascotas } from '../store/hooks';
import { useAppSelector } from '../store/hooks';
import { 
 fetchClienteData, 
 updateClienteData, 
 clearClienteError,
 type ClienteData 
} from '../redux/clienteSlice';
import { 
 fetchMascotas, 
 addMascota, 
 updateMascota,
 deleteMascota,
 clearMascotaError,
 type MascotaData
} from '../redux/mascotaSlice';
import { 
 fetchCitasCliente, 
 addCita, 
 deleteCita, // Cambiar de updateEstadoCita a deleteCita
 clearCitaError
} from '../redux/citaSlice';
import logger from '../services/logging';
import dogIcon from '../assets/dog.png';

// Importar componentes separados
import FormularioDatosPersonales from '../components/FormularioDatosPersonales';
import InfoMascota from '../components/InfoMascota';
import FormularioMascota from '../components/FormularioMascota';
import FormularioCita from '../components/FormularioCita';
import ListaCitasCliente from '../components/ListaCitasCliente';

// Componente principal del perfil del cliente
const PerfilCliente: React.FC = () => {
 const { t } = useTranslation();
 
 // Hooks de Redux para manejo del estado
 const dispatch = useAppDispatch();
 const { firebaseUser } = useAuth();
 const { data: clienteData, loading: clienteLoading, error: clienteError, updateLoading } = useCliente();
 const { mascotas, loading: mascotasLoading, error: mascotasError, addLoading } = useMascotas();
 const { citas, loading: citasLoading, addLoading: citaAddLoading, error: citasError } = useAppSelector(state => state.cita);
 
 // Estados locales del componente
 const [mostrarFormularioMascota, setMostrarFormularioMascota] = useState(false);
 const [mostrarFormularioCita, setMostrarFormularioCita] = useState(false);
 
 // Variable para obtener la primera (y única) mascota
 const miMascota = mascotas.length > 0 ? mascotas[0] : null;

 // Efecto para cargar datos del cliente, mascota y citas al montar el componente
 useEffect(() => {
   if (firebaseUser?.uid) {
     logger.info('Cargando datos del perfil cliente');
     dispatch(fetchClienteData(firebaseUser.uid));
     dispatch(fetchMascotas(firebaseUser.uid));
     dispatch(fetchCitasCliente(firebaseUser.uid));
   }
 }, [dispatch, firebaseUser]);

 // Funcсión para guardar datos del cliente
 const handleSaveCliente = (data: ClienteData) => {
   if (firebaseUser?.uid) {
     logger.info('Guardando datos del cliente');
     dispatch(updateClienteData({ ...data, uid: firebaseUser.uid }));
   }
 };

 // Funcсión para guardar mascota (nueva o editada)
 const handleSaveMascota = (data: Omit<MascotaData, 'id'>) => {
   if (miMascota) {
     // Si ya existe una mascota, actualizarla
     logger.info('Actualizando mascota existente');
     dispatch(updateMascota({ ...data, id: miMascota.id! }));
   } else {
     // Si no existe mascota, crear nueva
     logger.info('Creando nueva mascota');
     dispatch(addMascota(data));
   }
   // Cerrar el formulario después de guardar
   setMostrarFormularioMascota(false);
 };

 // Funcсión para guardar nueva cita
 const handleSaveCita = (citaData: any) => {
   logger.info('Creando nueva cita para mascota:');
   dispatch(addCita(citaData));
   setMostrarFormularioCita(false);
 };

 // Funcсión para eliminar/cancelar cita (NUEVA FUNCIÓN)
 const handleEliminarCita = (citaId: string) => {
   logger.info('Eliminando cita:');
   dispatch(deleteCita(citaId));
 };

 // Funcсión para mostrar formulario de mascota
 const handleMostrarFormularioMascota = () => {
   setMostrarFormularioMascota(true);
 };

 // Funcсión para mostrar formulario de cita
 const handleMostrarFormularioCita = () => {
   if (!miMascota) {
     alert(t('client.registerPetFirst'));
     return;
   }
   setMostrarFormularioCita(true);
 };

 // Funcсión para eliminar mascota (CRUD completo)
 const handleDeleteMascota = (mascotaId: string) => {
   if (firebaseUser?.uid) {
     logger.info('Eliminando mascota');
     dispatch(deleteMascota({ id: mascotaId, clienteUid: firebaseUser.uid }));
   }
 };

 // Funcсión para cancelar formulario de mascota
 const handleCancelFormMascota = () => {
   setMostrarFormularioMascota(false);
 };

 // Funcсión para cancelar formulario de cita
 const handleCancelFormCita = () => {
   setMostrarFormularioCita(false);
 };

 // Funcсión para limpiar errores
 const clearErrors = () => {
   dispatch(clearClienteError());
   dispatch(clearMascotaError());
   dispatch(clearCitaError());
 };

 // Mostrar loading mientras se cargan los datos principales
 if (clienteLoading) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
       <div className="bg-white rounded-xl shadow-lg p-8">
         <div className="flex items-center space-x-3">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
           <p className="text-gray-600">{t('client.loadingProfile')}</p>
         </div>
       </div>
     </div>
   );
 }

 return (
   <>
     <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-8 px-4">
       <div className="max-w-4xl mx-auto">
       {/* Encabezado del perfil */}
       <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
         <div className="flex items-center mb-4">
           <img 
             src={dogIcon} 
             alt="Client Logo" 
             className="w-12 h-12 object-contain mr-4"
           />
           <div>
             <h1 className="text-3xl font-bold text-gray-800">{t('client.profileTitle')}</h1>
             <p className="text-gray-600">{t('client.profileDescription')}</p>
           </div>
         </div>
       </div>

       {/* Mostrar errores si existen */}
       {(clienteError || mascotasError || citasError) && (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="font-semibold">{t('errors.somethingWrong')}</h3>
               <p className="text-sm mt-1">{clienteError || mascotasError || citasError}</p>
             </div>
             <button 
               onClick={clearErrors}
               className="text-red-500 hover:text-red-700 font-semibold"
             >
               {t('forms.close')}
             </button>
           </div>
         </div>
       )}

       {/* Formulario de datos personales - componente separado */}
       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
         <FormularioDatosPersonales
           data={clienteData}
           onSave={handleSaveCliente}
           loading={updateLoading}
         />
       </div>

       {/* Sección de mascota (simplificada - solo una) */}
       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
         <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('client.myPet')}</h3>

         {mascotasLoading ? (
           <div className="flex items-center justify-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mr-3"></div>
             <p className="text-gray-600">{t('client.loadingPet')}</p>
           </div>
         ) : miMascota ? (
           // Si ya tiene una mascota registrada - componente separado
           <InfoMascota
             mascota={miMascota}
             onEdit={handleMostrarFormularioMascota}
             onDelete={handleDeleteMascota}
           />
         ) : (
           // Si no tiene mascota registrada
           <div className="text-center py-12">
             <div className="text-6xl mb-4">🐾</div>
             <p className="text-gray-600 mb-6 text-lg">{t('client.noPetRegistered')}</p>
             <button 
               onClick={handleMostrarFormularioMascota}
               className="btn-primary text-lg px-6 py-3"
             >
               {t('client.registerPet')}
             </button>
           </div>
         )}
       </div>

       {/* Sección de citas */}
       <div className="bg-white rounded-xl shadow-lg p-6">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-semibold text-gray-800">{t('client.myAppointments')}</h3>
           
           {/* Botón para pedir nueva cita */}
           {miMascota && (
             <button 
               onClick={handleMostrarFormularioCita}
               className="btn-primary"
             >
               {t('client.newAppointment')}
             </button>
           )}
         </div>
         
         {/* Lista de citas existentes - CORREGIDO EL PROP */}
         <ListaCitasCliente
           citas={citas}
           loading={citasLoading}
           onEliminarCita={handleEliminarCita}
         />
       </div>
            </div>
     </div>

     {/* Formulario de mascota - modal */}
     {mostrarFormularioMascota && (
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
         onClick={handleCancelFormMascota}
       >
         <div 
           className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}
         >
           <div className="p-6">
             <FormularioMascota
               mascota={miMascota || undefined}
               onSave={handleSaveMascota}
               onCancel={handleCancelFormMascota}
               loading={addLoading}
               clienteUid={firebaseUser!.uid}
             />
           </div>
         </div>
       </div>
     )}

     {/* Formulario de nueva cita - modal */}
     {mostrarFormularioCita && miMascota && (
       <div 
         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
         onClick={handleCancelFormCita}
       >
         <div 
           className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}
         >
           <div className="p-6">
             <FormularioCita
               clienteUid={firebaseUser!.uid}
               clienteEmail={firebaseUser!.email}
               clienteNombre={clienteData?.nombre || ''}
               clienteApellidos={clienteData?.apellidos || ''}
               mascotaId={miMascota.id!}
               mascotaNombre={miMascota.nombre}
               onSave={handleSaveCita}
               onCancel={handleCancelFormCita}
               loading={citaAddLoading}
             />
           </div>
         </div>
       </div>
     )}
   </>
 );
};

export default PerfilCliente;