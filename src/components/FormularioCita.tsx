import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDatabase, ref, get } from 'firebase/database';
import logger from '../services/logging';

interface FormularioCitaProps {
 clienteUid: string;
  clienteEmail: string;
  clienteNombre: string;
  clienteApellidos: string;
  mascotaId: string;
  mascotaNombre: string;
  onSave: (citaData: any) => void;
  onCancel: () => void;
  loading: boolean;
}

interface Veterinario {
  uid: string;
  nombre: string;
  apellidos: string;
  especialidad: string;
}

const FormularioCita: React.FC<FormularioCitaProps> = ({
  clienteUid,
  clienteEmail,
  clienteNombre,
  clienteApellidos,
  mascotaId,
  mascotaNombre,
  onSave,
  onCancel,
  loading
}) => {
  const { t } = useTranslation();
  
  // Estados del formulario
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [selectedVet, setSelectedVet] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [loadingVets, setLoadingVets] = useState(true);

  // Cargar lista de veterinarios al montar el componente
  useEffect(() => {
    cargarVeterinarios();
  }, []);

  const cargarVeterinarios = async () => {
    try {
      logger.info('Cargando lista de veterinarios');
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const vets: Veterinario[] = [];
        
        // Filtrar solo usuarios con rol veterinario
        Object.keys(users).forEach(uid => {
          const user = users[uid];
          if (user.roles?.veterinario) {
            vets.push({
              uid,
              nombre: user.perfil?.nombre || 'Dr',
              apellidos: user.perfil?.apellidos || t('appointment.defaultVet'),
              especialidad: user.perfil?.especialidad || t('vet.generalMedicine')
            });
          }
        });
        
        setVeterinarios(vets);
        logger.info(`Encontrados ${vets.length} veterinarios`);
      }
    } catch (error) {
      logger.error('Error al cargar veterinarios:', error);
    } finally {
      setLoadingVets(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVet || !fecha || !hora || !motivo.trim()) {
      alert(t('appointment.completeAllFields'));
      return;
    }

    const selectedVetData = veterinarios.find(v => v.uid === selectedVet);
    
    const citaData = {
      clienteUid,
      clienteEmail,
      clienteNombre,
      clienteApellidos,
      mascotaId,
      mascotaNombre,
      veterinarioUid: selectedVet,
      veterinarioNombre: `${selectedVetData?.nombre} ${selectedVetData?.apellidos}`,
      fecha,
      hora,
      motivo
    };

    logger.info('Enviando nueva cita con datos completos');
    onSave(citaData);
  };

  if (loadingVets) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mr-3"></div>
        <p className="text-gray-600">{t('appointment.loadingVets')}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón de cerrar */}
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
        title={t('forms.close')}
      >
        ×
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">📅</div>
        <h3 className="text-xl font-semibold text-gray-800">
          {t('appointment.newAppointmentFor')} {mascotaNombre}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de veterinario */}
        <div>
          <label className="form-label">{t('appointment.specialist')}</label>
          <select
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            required
            className="form-input"
          >
            <option value="">{t('appointment.selectVet')}</option>
            {veterinarios.map(vet => (
              <option key={vet.uid} value={vet.uid}>
                {vet.nombre} {vet.apellidos} - {vet.especialidad}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Fecha */}
          <div>
            <label className="form-label">{t('appointment.date')}</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="form-input"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="form-label">{t('appointment.time')}</label>
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="form-input"
            >
              <option value="">{t('appointment.selectTime')}</option>
              <option value="09:00">09:00</option>
              <option value="09:30">09:30</option>
              <option value="10:00">10:00</option>
              <option value="10:30">10:30</option>
              <option value="11:00">11:00</option>
              <option value="11:30">11:30</option>
              <option value="12:00">12:00</option>
              <option value="16:00">16:00</option>
              <option value="16:30">16:30</option>
              <option value="17:00">17:00</option>
              <option value="17:30">17:30</option>
              <option value="18:00">18:00</option>
            </select>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="form-label">{t('appointment.reason')}</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={t('appointment.reasonPlaceholder')}
            rows={4}
            required
            className="form-input resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            {t('forms.cancel')}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? t('appointment.scheduling') : t('appointment.confirmAppointment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCita;