import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from '../services/logging';
import type { ClienteData } from '../redux/clienteSlice';

// Propiedades que recibe el componente del formulario de datos personales
interface FormularioDatosPersonalesProps {
  data: ClienteData | null; // Datos actuales del cliente
  onSave: (data: ClienteData) => void; // Función para guardar los datos
  loading: boolean; // Si se están guardando los datos
}

// Componente para el formulario de datos personales del cliente
const FormularioDatosPersonales: React.FC<FormularioDatosPersonalesProps> = ({ 
  data, 
  onSave, 
  loading 
}) => {
  const { t } = useTranslation();
  
  // Estado local del formulario con valores por defecto
  const [formData, setFormData] = useState<ClienteData>({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: ''
  });

  // Efecto para cargar datos cuando cambie la prop data
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Enviando datos del formulario cliente');
    onSave(formData);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('client.personalData')}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo nombre */}
          <div>
            <label className="form-label">{t('forms.name')}</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder={t('client.namePlaceholder')}
              className="form-input"
            />
          </div>
          
          {/* Campo apellidos */}
          <div>
            <label className="form-label">{t('forms.surname')}</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder={t('client.surnamePlaceholder')}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo DNI */}
          <div>
            <label className="form-label">{t('client.dni')}</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="12345678A"
              className="form-input"
            />
          </div>
          
          {/* Campo teléfono */}
          <div>
            <label className="form-label">{t('forms.phone')}</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+34 666 777 888"
              className="form-input"
            />
          </div>
        </div>
        
        {/* Campo fecha de nacimiento */}
        <div>
          <label className="form-label">{t('forms.birthDate')}</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        {/* Campo dirección */}
        <div>
          <label className="form-label">{t('forms.address')}</label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows={3}
            placeholder={t('client.addressPlaceholder')}
            className="form-input resize-none"
          />
        </div>
        
        {/* Botón de guardar */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full md:w-auto px-8 py-3"
          >
            {loading ? t('forms.saving') : t('forms.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioDatosPersonales;