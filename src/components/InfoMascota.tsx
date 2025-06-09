import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MascotaData } from '../redux/mascotaSlice';

// Propiedades que recibe el componente de información de mascota
interface InfoMascotaProps {
  mascota: MascotaData; // Datos de la mascota
  onEdit: () => void; // Función para editar la mascota
  onDelete?: (id: string) => void; // Función para eliminar la mascota (CRUD completo)
}

// Componente simple para mostrar información de la mascota
const InfoMascota: React.FC<InfoMascotaProps> = ({ mascota, onEdit, onDelete }) => {
  const { t } = useTranslation();

  // Función para manejar la eliminación con confirmación
  const handleDelete = () => {
    if (onDelete && mascota.id) {
      const confirmed = window.confirm(t('pet.confirmDelete'));
      if (confirmed) {
        onDelete(mascota.id);
      }
    }
  };

  // Función para traducir la especie
  const getSpeciesText = (especie: string) => {
    switch (especie) {
      case 'perro': return t('pet.dog');
      case 'gato': return t('pet.cat');
      case 'ave': return t('pet.bird');
      case 'reptil': return t('pet.reptile');
      case 'otro': return t('pet.other');
      default: return especie;
    }
  };

  // Función para traducir el género
  const getGenderText = (genero: string) => {
    switch (genero) {
      case 'macho': return t('pet.male');
      case 'hembra': return t('pet.female');
      default: return genero;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          {t('pet.myPet')}: {mascota.nombre}
        </h4>
      </div>
      
      {/* Información básica de la mascota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700">{t('pet.species')}:</span>
            <span className="ml-2 text-gray-600">{getSpeciesText(mascota.especie)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">{t('pet.breed')}:</span>
            <span className="ml-2 text-gray-600">{mascota.raza}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">{t('pet.age')}:</span>
            <span className="ml-2 text-gray-600">{mascota.edad} {t('pet.years')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700">{t('pet.gender')}:</span>
            <span className="ml-2 text-gray-600">{getGenderText(mascota.genero)}</span>
          </div>
          
          {/* Información opcional - solo si existe */}
          {mascota.chip && (
            <div>
              <span className="font-semibold text-gray-700">{t('pet.chip')}:</span>
              <span className="ml-2 text-gray-600 font-mono text-sm">{mascota.chip}</span>
            </div>
          )}
          
          {mascota.fechaNacimiento && (
            <div>
              <span className="font-semibold text-gray-700">{t('forms.birthDate')}:</span>
              <span className="ml-2 text-gray-600">{mascota.fechaNacimiento}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex space-x-3">
        <button 
          onClick={onEdit} 
          className="btn-primary flex items-center space-x-2"
          title={t('pet.editInfo')}
        >
          <span></span>
          <span>{t('forms.edit')}</span>
        </button>
        
        {/* Botón de eliminar - CRUD completo */}
        {onDelete && (
          <button 
            onClick={handleDelete}
            className="btn-danger flex items-center space-x-2"
            title={t('pet.deletePet')}
          >
            <span></span>
            <span>{t('forms.delete')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoMascota;