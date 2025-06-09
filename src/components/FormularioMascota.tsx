import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logger from '../services/logging';
import type { MascotaData } from '../redux/mascotaSlice';

// Propiedades que recibe el componente del formulario de mascota
interface FormularioMascotaProps {
  mascota?: MascotaData; // Datos de la mascota (opcional, para edición)
  onSave: (data: Omit<MascotaData, 'id'>) => void; // Función para guardar la mascota
  onCancel: () => void; // Función para cancelar el formulario
  loading: boolean; // Si se están guardando los datos
  clienteUid: string; // ID del cliente propietario
}

// Componente para el formulario de mascota (registro/edición)
const FormularioMascota: React.FC<FormularioMascotaProps> = ({ 
  mascota, 
  onSave, 
  onCancel, 
  loading, 
  clienteUid 
}) => {
  const { t } = useTranslation();
  
  // Estado local del formulario con valores por defecto
  const [formData, setFormData] = useState<Omit<MascotaData, 'id'>>({
    nombre: '',
    especie: 'perro',
    raza: '',
    edad: 0,
    chip: '',
    genero: 'macho',
    fechaNacimiento: '',
    clienteUid
  });

  // Efecto para cargar datos de mascota si estamos editando
  useEffect(() => {
    if (mascota) {
      // Excluir el ID y usar el resto de datos
      const { id, ...data } = mascota;
      setFormData(data);
    }
  }, [mascota]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info(`Enviando formulario mascota: ${formData.nombre}`);
    onSave(formData);
  };

  return (
    <div className="relative">
      {/* Кнопка закрытия */}
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
        title={t('forms.close')}
      >
        ×
      </button>
      
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🐾</div>
        <h3 className="text-xl font-semibold text-gray-800">
          {mascota ? t('pet.editPet') : t('pet.registerPet')}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre de la mascota */}
        <div>
          <label className="form-label">{t('pet.name')}</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder={t('pet.namePlaceholder')}
            className="form-input"
          />
        </div>
        
        {/* Especie */}
        <div>
          <label className="form-label">{t('pet.species')}</label>
          <select
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="perro">{t('pet.dog')}</option>
            <option value="gato">{t('pet.cat')}</option>
            <option value="ave">{t('pet.bird')}</option>
            <option value="reptil">{t('pet.reptile')}</option>
            <option value="otro">{t('pet.other')}</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Raza */}
          <div>
            <label className="form-label">{t('pet.breed')}</label>
            <input
              type="text"
              name="raza"
              value={formData.raza}
              onChange={handleChange}
              required
              placeholder={t('pet.breedPlaceholder')}
              className="form-input"
            />
          </div>
          
          {/* Edad */}
          <div>
            <label className="form-label">{t('pet.age')}</label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              required
              min="0"
              max="30"
              className="form-input"
            />
          </div>
        </div>
        
        {/* Género */}
        <div>
          <label className="form-label">{t('pet.gender')}</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="macho">{t('pet.male')}</option>
            <option value="hembra">{t('pet.female')}</option>
          </select>
        </div>
        
        {/* Chip (opcional) */}
        <div>
          <label className="form-label">
            {t('pet.chip')} <span className="text-gray-400 text-sm">({t('pet.optional')})</span>
          </label>
          <input
            type="text"
            name="chip"
            value={formData.chip}
            onChange={handleChange}
            placeholder={t('pet.chipPlaceholder')}
            className="form-input"
          />
        </div>
        
        {/* Fecha de nacimiento (opcional) */}
        <div>
          <label className="form-label">
            {t('forms.birthDate')} <span className="text-gray-400 text-sm">({t('pet.optional')})</span>
          </label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        {/* Botones de acción */}
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
            {loading ? t('forms.saving') : t('forms.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioMascota;