/*
 Pruebas unitarias del componente FormularioCita:
 - Estado de carga inicial mientras se obtiene la lista de veterinarios
 - Render de campos y opciones fijas (horarios)
 - Validación: alerta si faltan campos requeridos
 - Envío correcto: onSave recibe el objeto completo de la cita
 - Botones: Cancelar y el botón de cierre (×) llaman a onCancel
 - Botón de confirmar: deshabilitado y texto de “programando” durante loading
 Notas:
 - Firebase (getDatabase/ref/get) se mockea localmente aquí.
 - i18n se mockea localmente con claves mínimas necesarias.
 - El logger se mockea globalmente en setup.ts (no lo repetimos).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FormularioCita from '../components/FormularioCita'
import { get } from 'firebase/database'
import logger from '../services/logging'

// Mock de Firebase Realtime Database (solo lo necesario)
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => 'mock-ref'),
  get: vi.fn(),
}))

// Mock de i18n (claves mínimas que usa el componente)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'vet.generalMedicine': 'Medicina general',
        'appointment.defaultVet': 'Veterinario',
        'appointment.loadingVets': 'Cargando veterinarios...',
        'appointment.newAppointmentFor': 'Nueva cita para',
        'appointment.specialist': 'Especialista',
        'appointment.selectVet': 'Selecciona un veterinario',
        'appointment.date': 'Fecha',
        'appointment.time': 'Hora',
        'appointment.selectTime': 'Selecciona una hora',
        'appointment.reason': 'Motivo',
        'appointment.reasonPlaceholder': 'Describe brevemente el motivo',
        'appointment.confirmAppointment': 'Confirmar cita',
        'appointment.scheduling': 'Programando...',
        'appointment.completeAllFields': 'Completa todos los campos, por favor',
        'forms.cancel': 'Cancelar',
        'forms.close': 'Cerrar',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (props: { children: any }) => props.children,
}))

// Helper para props base
const baseProps = {
  clienteUid: 'cli-1',
  clienteEmail: 'cliente@test.com',
  clienteNombre: 'Ana',
  clienteApellidos: 'López',
  mascotaId: 'pet-1',
  mascotaNombre: 'Kira',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FormularioCita', () => {
  it('muestra el estado de carga mientras se obtienen los veterinarios', () => {
    // Devolvemos una promesa pendiente para mantener el loading visible
    vi.mocked(get).mockImplementation(() => new Promise(() => {}))
    render(
      <FormularioCita
        {...baseProps}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByText('Cargando veterinarios...')).toBeInTheDocument()
  })

  it('renderiza campos y opciones de horario cuando hay veterinarios', async () => {
    // Snapshot con dos veterinarios
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => ({
        u1: { roles: { veterinario: true }, perfil: { nombre: 'Laura', apellidos: 'García', especialidad: 'Dermatología' } },
        u2: { roles: { veterinario: true }, perfil: { nombre: 'Mario', apellidos: 'Pérez', especialidad: 'Traumatología' } },
        u3: { roles: { cliente: true }, perfil: { nombre: 'Cliente', apellidos: 'X' } }, // no debe aparecer
      }),
    } as any)

    render(
      <FormularioCita
        {...baseProps}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    )

    // Esperamos a que deje de estar en loading y se vean las opciones
    await waitFor(() => {
      expect(screen.getByText(/Nueva cita para/i)).toBeInTheDocument()
      expect(screen.getByText(/Kira/)).toBeInTheDocument()
    })

    expect(screen.getByText('Selecciona un veterinario')).toBeInTheDocument()
    // Horarios fijos visibles (ej: 10:00)
    expect(screen.getByRole('option', { name: '10:00' })).toBeInTheDocument()
    // Dos opciones de veterinario
    const options = screen.getAllByRole('option')
    // options[0] es el placeholder; el resto son vets + horas (otro select)
    expect(options.some(o => /Laura García/.test(o.textContent || ''))).toBe(true)
    expect(options.some(o => /Mario Pérez/.test(o.textContent || ''))).toBe(true)

    // logger.info fue llamado al cargar y al contar veterinarios
    expect(logger.info).toHaveBeenCalled()
  })

  it('valida y alerta si faltan campos requeridos', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => ({
        u1: { roles: { veterinario: true }, perfil: { nombre: 'Laura', apellidos: 'García' } },
      }),
    } as any)

    const onSave = vi.fn()
    const onCancel = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(
      <FormularioCita
        {...baseProps}
        onSave={onSave}
        onCancel={onCancel}
        loading={false}
      />
    )

    // Esperar a que cargue vets
    await waitFor(() => expect(screen.queryByText('Cargando veterinarios...')).not.toBeInTheDocument())
    const submitBtn = screen.getByRole('button', { name: 'Confirmar cita' })
    const form = submitBtn.closest('form') as HTMLFormElement
    fireEvent.submit(form)
    // Esperar alert con el texto correcto
    await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Completa todos los campos, por favor')
    })
    expect(onSave).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('envía datos correctos en onSave cuando el formulario es válido', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => ({
        vetA: { roles: { veterinario: true }, perfil: { nombre: 'Laura', apellidos: 'García', especialidad: 'Dermatología' } },
      }),
    } as any)
    const onSave = vi.fn()
    render(
      <FormularioCita
        {...baseProps}
        onSave={onSave}
        onCancel={vi.fn()}
        loading={false}
      />
    )

    await waitFor(() => expect(screen.queryByText('Cargando veterinarios...')).not.toBeInTheDocument())

    // Seleccionar vet (primer combobox)
    const [vetSelect, timeSelect] = screen.getAllByRole('combobox')
    fireEvent.change(vetSelect, { target: { value: 'vetA' } })
    // Fecha (+1 día)
    const today = new Date()
    const plus1 = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const ymd = plus1.toISOString().split('T')[0]
    // Nota: el <label> no está asociado al <input>, así que buscamos por tipo.
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toBeTruthy()
    fireEvent.change(dateInput, { target: { value: ymd } })
    // Hora (segundo combobox)
    fireEvent.change(timeSelect, { target: { value: '10:00' } })
    // Motivo
    const motivoArea = screen.getByPlaceholderText('Describe brevemente el motivo')
    fireEvent.change(motivoArea, { target: { value: 'Consulta general' } })
    // Enviar
    const submitBtn = screen.getByRole('button', { name: 'Confirmar cita' })
    const form = submitBtn.closest('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
        veterinarioUid: 'vetA',
        fecha: ymd,
        hora: '10:00',
        motivo: 'Consulta general',
        })
    )
    })
  })

  it('el botón Cancelar y el botón de cierre (x) llaman a onCancel', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => ({
        v1: { roles: { veterinario: true }, perfil: { nombre: 'L', apellidos: 'G' } },
      }),
    } as any)

    const onCancel = vi.fn()

    render(
      <FormularioCita
        {...baseProps}
        onSave={vi.fn()}
        onCancel={onCancel}
        loading={false}
      />
    )

    await waitFor(() => expect(screen.queryByText('Cargando veterinarios...')).not.toBeInTheDocument())
    // Botón Cancelar
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    // Botón de cierre (×)
    fireEvent.click(screen.getByRole('button', { name: '×' }))

    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('el botón confirmar muestra "Programando..." y está deshabilitado cuando loading=true', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => false,
      val: () => ({}),
    } as any)

    render(
      <FormularioCita
        {...baseProps}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />
    )

    await waitFor(() => expect(screen.queryByText('Cargando veterinarios...')).not.toBeInTheDocument())

    const submitBtn = screen.getByRole('button', { name: 'Programando...' })
    expect(submitBtn).toBeDisabled()
  })
})
