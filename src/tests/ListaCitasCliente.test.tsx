/*
 Pruebas unitarias de ListaCitasCliente:
 - Render básico: título, buscador, contador de citas
 - Filtro por texto
 - Badges de estado (pendiente/cancelada)
 - Botón "Cancelar": confirma y llama onEliminarCita
 - No muestra botón "Cancelar" si la cita está cancelada
 - Loading y vacío
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ListaCitasCliente from '../components/ListaCitasCliente'

// Mock i18n (claves usadas)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'client.myAppointments': 'Mis citas',
        'appointment.loadingAppointments': 'Cargando citas...',
        'appointment.searchPlaceholder': 'Busca por mascota, veterinario o motivo',
        'appointment.date': 'Fecha',
        'appointment.time': 'Hora',
        'appointment.pet': 'Mascota',
        'appointment.vet': 'Veterinario',
        'appointment.status': 'Estado',
        'appointment.reason': 'Motivo',
        'admin.table.actions': 'Acciones',

        'appointment.pending': 'Pendiente',
        'appointment.confirmed': 'Confirmada',
        'appointment.cancelled': 'Cancelada',

        'appointment.cancelAppointment': 'Cancelar',
        'appointment.confirmCancel': '¿Deseas cancelar esta cita?',
        'appointment.cancel': 'Cancelar',

        'appointment.noAppointments': 'Aún no tienes citas',
        'appointment.noAppointmentsFound': 'No se han encontrado citas para tu búsqueda',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (p: { children: any }) => p.children,
}))

// Datos base
const baseCitas = [
  {
    id: 'c1',
    fecha: '2025-09-01',
    hora: '10:00',
    mascotaNombre: 'Kira',
    veterinarioNombre: 'Laura García',
    motivo: 'Vacuna',
    estado: 'pendiente',
  },
  {
    id: 'c2',
    fecha: '2025-09-02',
    hora: '12:30',
    mascotaNombre: 'Toby',
    veterinarioNombre: 'Mario Pérez',
    motivo: 'Revisión',
    estado: 'cancelada',
  },
] as any[]

const setup = (opts?: {
  citas?: any[]
  loading?: boolean
  onEliminarCita?: (id: string) => void
}) => {
  const onEliminar = opts?.onEliminarCita ?? vi.fn()
  render(
    <ListaCitasCliente
      citas={opts?.citas ?? baseCitas}
      loading={opts?.loading ?? false}
      onEliminarCita={onEliminar}
    />
  )
  return { onEliminar }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ListaCitasCliente', () => {
  it('renderiza título, buscador y contador', () => {
    setup()
    // Título con emoji/espacios → regex flexible
    expect(screen.getByText(/mis citas/i)).toBeInTheDocument()
    // Contador con posible salto de línea
    expect(screen.getByText(/2\s*citas/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Busca por mascota, veterinario o motivo')
    ).toBeInTheDocument()
  })

  it('filtra por texto y actualiza el contador', () => {
    setup()
    const input = screen.getByPlaceholderText(
      'Busca por mascota, veterinario o motivo'
    )
    fireEvent.change(input, { target: { value: 'Kira' } })
    expect(screen.getByText(/1\s*cita/i)).toBeInTheDocument()
    expect(screen.getByText('Kira')).toBeInTheDocument()
    expect(screen.queryByText('Toby')).not.toBeInTheDocument()
  })

  it('muestra los badges de estado traducidos', () => {
    setup()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    // En la fila cancelada aparece "Cancelada" como badge y también en la celda de acciones.
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThanOrEqual(1)
  })

  it('al pulsar "Cancelar" confirma y llama onEliminarCita', () => {
    const onEliminar = vi.fn()
    setup({ onEliminarCita: onEliminar })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const cancelarBtn = screen.getAllByRole('button', { name: 'Cancelar' })[0]
    fireEvent.click(cancelarBtn)
    expect(window.confirm).toHaveBeenCalledWith('¿Deseas cancelar esta cita?')
    expect(onEliminar).toHaveBeenCalledTimes(1)
    expect(onEliminar).toHaveBeenCalledWith('c1')
  })

  it('no muestra botón "Cancelar" cuando la cita está cancelada', () => {
    setup()
    const filas = screen.getAllByRole('row')
    const filaCancelada = filas.find((tr) =>
      /Toby/.test(tr.textContent || '')
    )
    expect(filaCancelada).toBeTruthy()
    // jsdom no soporta :has / :contains; usamos Testing Library `within`
    expect(
      within(filaCancelada!).queryByRole('button', { name: 'Cancelar' })
    ).toBeNull()
    // En total sólo debe existir el botón de la cita pendiente
    expect(screen.getAllByRole('button', { name: 'Cancelar' }).length).toBe(1)
  })

  it('muestra loading cuando loading=true', () => {
    setup({ loading: true, citas: [] })
    expect(screen.getByText('Cargando citas...')).toBeInTheDocument()
  })

  it('muestra vacío cuando no hay citas', () => {
    setup({ citas: [] })
    expect(screen.getByText('Aún no tienes citas')).toBeInTheDocument()
    // Texto real del componente
    expect(
      screen.getByText('Solicita una nueva cita para comenzar')
    ).toBeInTheDocument()
  })

  it('muestra mensaje de “no hay resultados” cuando el filtro no coincide', () => {
    setup()
    fireEvent.change(
      screen.getByPlaceholderText('Busca por mascota, veterinario o motivo'),
      { target: { value: 'no-coincide' } }
    )
    expect(
      screen.getByText('No se han encontrado citas para tu búsqueda')
    ).toBeInTheDocument()
  })
})
