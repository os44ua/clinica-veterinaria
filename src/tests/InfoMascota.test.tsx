/*
 Pruebas unitarias de InfoMascota:
 - Render básico con traducciones: especie y género se muestran traducidos
 - Campos opcionales: chip y fechaNacimiento sólo cuando existen
 - Botón Editar dispara onEdit
 - Botón Eliminar (si existe onDelete):
    · pide confirmación y llama a onDelete(id) si el usuario confirma
    · no llama a onDelete si el usuario cancela
 - Si no se pasa onDelete, el botón de eliminar no se renderiza
 Notas:
 - i18n se mockea localmente con las claves mínimas usadas por el componente.
 - El logger se mockea globalmente en setup.ts (no hace falta tocarlo aquí).
*/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InfoMascota from '../components/InfoMascota'
import type { MascotaData } from '../redux/mascotaSlice'

// Mock de i18n (claves usadas por InfoMascota)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'pet.myPet': 'Mi mascota',
        'pet.species': 'Especie',
        'pet.breed': 'Raza',
        'pet.age': 'Edad',
        'pet.years': 'años',
        'pet.gender': 'Género',
        'pet.chip': 'Chip',
        'forms.birthDate': 'Fecha de nacimiento',
        // mapas de especie
        'pet.dog': 'Perro',
        'pet.cat': 'Gato',
        'pet.bird': 'Ave',
        'pet.reptile': 'Reptil',
        'pet.other': 'Otro',
        // mapas de género
        'pet.male': 'Macho',
        'pet.female': 'Hembra',
        // acciones
        'pet.editInfo': 'Editar ficha',
        'forms.edit': 'Editar',
        'pet.deletePet': 'Eliminar mascota',
        'forms.delete': 'Eliminar',
        'pet.confirmDelete': '¿Seguro que deseas eliminar esta mascota?',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (p: { children: any }) => p.children,
}))

const baseMascota: MascotaData = {
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('InfoMascota', () => {
  it('renderiza la información con textos traducidos', () => {
    const onEdit = vi.fn()
    render(<InfoMascota mascota={baseMascota} onEdit={onEdit} onDelete={vi.fn()} />)

    // Título + nombre
    expect(screen.getByText(/Mi mascota/i)).toBeInTheDocument()
    expect(screen.getByText(/Kira/)).toBeInTheDocument()

    // Etiquetas con posible ":" y espacios
    expect(screen.getByText(/Especie\s*:/i)).toBeInTheDocument()
    expect(screen.getByText('Gato')).toBeInTheDocument()
    expect(screen.getByText(/Género\s*:/i)).toBeInTheDocument()
    expect(screen.getByText('Hembra')).toBeInTheDocument()

    // Edad + años
    expect(screen.getByText(/Edad\s*:/i)).toBeInTheDocument()
    expect(screen.getByText(/4/)).toBeInTheDocument()
    expect(screen.getByText(/años/)).toBeInTheDocument()
  })

  it('muestra chip y fecha de nacimiento sólo si existen', () => {
    const onEdit = vi.fn()
    // Con valores presentes (los de baseMascota)
    const { rerender } = render(
      <InfoMascota mascota={baseMascota} onEdit={onEdit} onDelete={vi.fn()} />
    )
    expect(screen.getByText(/Chip\s*:/i)).toBeInTheDocument()
    expect(screen.getByText('CH-123')).toBeInTheDocument()
    expect(screen.getByText(/Fecha de nacimiento\s*:/i)).toBeInTheDocument()
    expect(screen.getByText('2021-01-01')).toBeInTheDocument()

    // Sin valores opcionales
    rerender(
      <InfoMascota
        mascota={{ ...baseMascota, chip: '', fechaNacimiento: '' }}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )
    expect(screen.queryByText('CH-123')).toBeNull()
    expect(screen.queryByText('2021-01-01')).toBeNull()
  })

  it('el botón Editar llama a onEdit', () => {
    const onEdit = vi.fn()
    render(<InfoMascota mascota={baseMascota} onEdit={onEdit} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('si hay onDelete: confirma y llama a onDelete(id) cuando el usuario acepta', () => {
    const onDelete = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<InfoMascota mascota={baseMascota} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(confirmSpy).toHaveBeenCalledWith('¿Seguro que deseas eliminar esta mascota?')
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('m1')

    confirmSpy.mockRestore()
  })

  it('si el usuario cancela la confirmación, no llama a onDelete', () => {
    const onDelete = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<InfoMascota mascota={baseMascota} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onDelete).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('si no se pasa onDelete, no aparece el botón de eliminar', () => {
    render(<InfoMascota mascota={baseMascota} onEdit={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
  })
})
