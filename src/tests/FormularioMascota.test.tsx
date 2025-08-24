/*
 Pruebas unitarias de FormularioMascota:
 - Render: título de alta vs. edición según props.mascota
 - Completar formulario y enviar: onSave recibe el objeto correcto (sin id)
 - Botones: "×" (Cerrar) y "Cancelar" llaman a onCancel
 - Estado de carga: botón deshabilitado y texto "Guardando..."
 - En edición: los campos se precargan con la mascota recibida
 Notas:
 - i18n se mockea localmente con las claves mínimas usadas por el componente.
 - El logger global (services/logging) se mockea en setup.ts; aquí sólo comprobamos llamadas.
*/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormularioMascota from '../components/FormularioMascota'
import logger from '../services/logging'
import type { MascotaData } from '../redux/mascotaSlice'

// Mock de i18n (claves mínimas de este componente)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'forms.close': 'Cerrar',
        'forms.birthDate': 'Fecha de nacimiento',
        'forms.cancel': 'Cancelar',
        'forms.save': 'Guardar',
        'forms.saving': 'Guardando...',
        'pet.registerPet': 'Registrar mascota',
        'pet.editPet': 'Editar mascota',
        'pet.name': 'Nombre',
        'pet.namePlaceholder': 'Nombre de la mascota',
        'pet.species': 'Especie',
        'pet.dog': 'Perro',
        'pet.cat': 'Gato',
        'pet.bird': 'Ave',
        'pet.reptile': 'Reptil',
        'pet.other': 'Otro',
        'pet.breed': 'Raza',
        'pet.breedPlaceholder': 'Raza de la mascota',
        'pet.age': 'Edad',
        'pet.gender': 'Género',
        'pet.male': 'Macho',
        'pet.female': 'Hembra',
        'pet.chip': 'Chip',
        'pet.optional': 'opcional',
        'pet.chipPlaceholder': 'Código de chip',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (p: { children: any }) => p.children,
}))

const baseProps = {
  onSave: vi.fn(),
  onCancel: vi.fn(),
  loading: false,
  clienteUid: 'cli-1',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FormularioMascota', () => {
  it('muestra el título de registro por defecto', () => {
    render(<FormularioMascota {...baseProps} />)
    expect(screen.getByText('Registrar mascota')).toBeInTheDocument()
  })

  it('muestra el título de edición y precarga valores cuando llega mascota', () => {
    const mascota: MascotaData = {
      id: 'm1',
      nombre: 'Kira',
      especie: 'gato',
      raza: 'Siamés',
      edad: 4,
      chip: 'CH-123',
      genero: 'hembra',
      fechaNacimiento: '2021-01-01',
      clienteUid: 'cli-1',
    }

    render(<FormularioMascota {...baseProps} mascota={mascota} />)

    expect(screen.getByText('Editar mascota')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nombre de la mascota')).toHaveValue('Kira')
    expect(screen.getByPlaceholderText('Raza de la mascota')).toHaveValue('Siamés')
    expect(screen.getByPlaceholderText('Código de chip')).toHaveValue('CH-123')
    expect(screen.getByRole('spinbutton')).toHaveValue(4)
  })

  it('envía los datos correctos en onSave al enviar el formulario', () => {
    render(<FormularioMascota {...baseProps} />)

    // Rellenar campos
    fireEvent.change(screen.getByPlaceholderText('Nombre de la mascota'), {
      target: { value: 'Luna' },
    })
    fireEvent.change(screen.getByPlaceholderText('Raza de la mascota'), {
      target: { value: 'Labrador' },
    })
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '5' },
    })
    // Dos <select>: [0] especie, [1] género
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'gato' } })
    fireEvent.change(selects[1], { target: { value: 'hembra' } })
    fireEvent.change(screen.getByPlaceholderText('Código de chip'), {
      target: { value: 'XYZ-999' },
    })
    // Enviar
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(baseProps.onSave).toHaveBeenCalledTimes(1)
    expect(baseProps.onSave).toHaveBeenCalledWith({
      nombre: 'Luna',
      especie: 'gato',
      raza: 'Labrador',
      edad: 5,
      chip: 'XYZ-999',
      genero: 'hembra',
      fechaNacimiento: '',
      clienteUid: 'cli-1',
    })
    // Comprobamos que el logger informa del envío (sin atarnos al texto exacto)
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Enviando formulario mascota')
    )
  })

  it('botón Cerrar (×) y Cancelar llaman a onCancel', () => {
    render(<FormularioMascota {...baseProps} />)
    fireEvent.click(screen.getByTitle('Cerrar')) // botón ×
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(baseProps.onCancel).toHaveBeenCalledTimes(2)
  })

  it('cuando loading=true deshabilita el botón y muestra "Guardando..."', () => {
    render(<FormularioMascota {...baseProps} loading />)
    const saveBtn = screen.getByRole('button', { name: 'Guardando...' })
    expect(saveBtn).toBeDisabled()
    fireEvent.click(saveBtn)
    expect(baseProps.onSave).not.toHaveBeenCalled()
  })
})

