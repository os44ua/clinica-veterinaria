import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global de i18n para unit tests
// Devuelve traducciones básicas y, si falta, la clave.
// Los tests pueden sobreescribir este mock con vi.mock en el propio archivo.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const es: Record<string, string> = {
        // Forms
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

        // Client
        'client.personalData': 'Mis Datos Personales',
        'client.namePlaceholder': 'Tu nombre',
        'client.surnamePlaceholder': 'Tus apellidos',
        'client.addressPlaceholder': 'Tu dirección completa',
        'client.dni': 'DNI',

        // Pet
        'pet.name': 'Nombre de la mascota',
        'pet.species': 'Especie',
        'pet.breed': 'Raza',
        'pet.age': 'Edad (años)',
        'pet.gender': 'Género',
        'pet.chip': 'Número de chip',
        'pet.namePlaceholder': 'Nombre de tu mascota',
        'pet.breedPlaceholder': 'Raza de tu mascota',
        'pet.chipPlaceholder': 'Número de identificación del chip',

        // Appointment
        'appointment.date': 'Fecha',
        'appointment.time': 'Hora',
        'appointment.pet': 'Mascota',
        'appointment.vet': 'Veterinario',
        'appointment.reason': 'Motivo',
        'appointment.status': 'Estado',
        'appointment.pending': 'Pendiente',
        'appointment.confirmed': 'Confirmada',
        'appointment.cancelled': 'Cancelada',

        // Errors
        'errors.somethingWrong': '¡Algo salió mal!',
        'errors.tryAgain': 'Por favor, intenta de nuevo',
      }
      return es[key] ?? key
    },
  }),
  // Componente Trans no-op
  Trans: (props: { children: any }) => props.children,
}))

// Mock global del logger: misma API pública que el real
vi.mock('../services/logging', () => {
  return {
    default: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn<(message: string, error?: unknown) => void>(),
      setLevel: vi.fn<(level: 'debug' | 'info' | 'warn' | 'error') => void>(),
    },
  }
})

// Mock global de assets (icono usado en varias páginas)
vi.mock('../assets/dog.png', () => ({ default: 'mocked-dog-icon.png' }))