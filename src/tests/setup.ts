import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Traducciones completas basadas en es.json
      const translations: Record<string, string> = {
        // Client translations
        'client.personalData': 'Mis Datos Personales',
        'client.namePlaceholder': 'Tu nombre',
        'client.surnamePlaceholder': 'Tus apellidos',
        'client.addressPlaceholder': 'Tu dirección completa',
        'client.dni': 'DNI',
        
        // Forms translations
        'forms.name': 'Nombre',
        'forms.surname': 'Apellidos',
        'forms.phone': 'Teléfono',
        'forms.address': 'Dirección',
        'forms.birthDate': 'Fecha de Nacimiento',
        'forms.save': 'Guardar',
        'forms.saving': 'Guardando...',
        'forms.cancel': 'Cancelar',
        'forms.edit': 'Editar',
        'forms.delete': 'Eliminar',
        'forms.loading': 'Cargando...',
        
        // Pet translations
        'pet.name': 'Nombre de la mascota',
        'pet.species': 'Especie',
        'pet.breed': 'Raza',
        'pet.age': 'Edad (años)',
        'pet.gender': 'Género',
        'pet.chip': 'Número de chip',
        'pet.namePlaceholder': 'Nombre de tu mascota',
        'pet.breedPlaceholder': 'Raza de tu mascota',
        'pet.chipPlaceholder': 'Número de identificación del chip',
        
        // Appointment translations
        'appointment.date': 'Fecha',
        'appointment.time': 'Hora',
        'appointment.pet': 'Mascota',
        'appointment.vet': 'Veterinario',
        'appointment.reason': 'Motivo',
        'appointment.status': 'Estado',
        'appointment.pending': 'Pendiente',
        'appointment.confirmed': 'Confirmada',
        'appointment.cancelled': 'Cancelada',
        
        // Error translations
        'errors.somethingWrong': '¡Algo salió mal!',
        'errors.tryAgain': 'Por favor, intenta de nuevo'
      };
      
      return translations[key] || key;
    }
  }),
  
  // Mock adicional para Trans component si lo usas
  Trans: ({ children }: { children: React.ReactNode }) => children
}));

// Mock del logger para todos los tests
vi.mock('../services/logging', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));