/*
 Pruebas unitarias de la página PerfilCliente:
 - Despacha cargas iniciales (cliente, mascotas, citas) al montar
 - Guarda datos personales (inyecta uid del usuario actual)
 - Edita una mascota existente y despacha update
 - Elimina una cita desde la lista

 Notas de estilo / consistencia:
 - i18n: mock ligero que devuelve la clave (no hace falta mapa aquí).
 - Logger mockeado localmente (los iconos y assets se mockean globalmente en setup.ts).
 - Slices de Redux mockeados con vi.hoisted para evitar errores de hoisting.
 - Hooks del store devuelven valores mutables que se reajustan en beforeEach.
 - Render con MemoryRouter para alinear el patrón con otros tests.
*/

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PerfilCliente from '../pages/PerfilCliente'

// i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

// logging
vi.mock('../services/logging', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}))

// slices (hoisted)
const clienteSliceMocks = vi.hoisted(() => ({
  fetchClienteData: vi.fn((uid: string) => ({ type: 'cliente/fetch', meta: { uid } })),
  updateClienteData: vi.fn((data: any) => ({ type: 'cliente/update', payload: data })),
  clearClienteError: vi.fn(() => ({ type: 'cliente/clearErr' })),
}))
vi.mock('../redux/clienteSlice', () => clienteSliceMocks)

const mascotaSliceMocks = vi.hoisted(() => ({
  fetchMascotas: vi.fn((uid: string) => ({ type: 'mascota/fetch', meta: { uid } })),
  addMascota: vi.fn((data: any) => ({ type: 'mascota/add', payload: data })),
  updateMascota: vi.fn((data: any) => ({ type: 'mascota/update', payload: data })),
  deleteMascota: vi.fn((data: any) => ({ type: 'mascota/delete', payload: data })), // acepta objeto {id, clienteUid}
  clearMascotaError: vi.fn(() => ({ type: 'mascota/clearErr' })),
}))
vi.mock('../redux/mascotaSlice', () => mascotaSliceMocks)

const citaSliceMocks = vi.hoisted(() => ({
  fetchCitasCliente: vi.fn((uid: string) => ({ type: 'cita/fetch', meta: { uid } })),
  addCita: vi.fn((data: any) => ({ type: 'cita/add', payload: data })),
  deleteCita: vi.fn((id: string) => ({ type: 'cita/delete', payload: id })),
  clearCitaError: vi.fn(() => ({ type: 'cita/clearErr' })),
}))
vi.mock('../redux/citaSlice', () => citaSliceMocks)

// hooks del store
let mockDispatch: ReturnType<typeof vi.fn>
let mockAuth: any
let mockClienteHook: any
let mockMascotasHook: any
let mockCitaSlice: any

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAuth: () => mockAuth,
  useCliente: () => mockClienteHook,
  useMascotas: () => mockMascotasHook,
  useAppSelector: (sel: any) => sel({ cita: mockCitaSlice }),
}))

// stubs de componentes hijos
vi.mock('../components/FormularioDatosPersonales', () => ({
  default: (props: any) => (
    <div data-testid="form-datos">
      <button onClick={() => props.onSave({ nombre: 'Neo', apellidos: 'Mora' })}>
        Guardar datos
      </button>
    </div>
  ),
}))

vi.mock('../components/InfoMascota', () => ({
  default: (props: any) => (
    <div data-testid="info-mascota">
      <button title="editar-mascota" onClick={props.onEdit}>Editar</button>
      <button title="eliminar-mascota" onClick={() => props.onDelete('m1')}>Eliminar</button>
    </div>
  ),
}))

vi.mock('../components/FormularioMascota', () => ({
  default: (props: any) => (
    <div data-testid="form-mascota">
      <button
        onClick={() =>
          props.onSave({
            nombre: 'Kira',
            especie: 'gato',
            raza: 'Siamés',
            edad: 4,
            chip: 'CH-1',
            genero: 'hembra',
            fechaNacimiento: '2021-01-01',
            clienteUid: 'u1',
          } as any)
        }
      >
        Guardar mascota
      </button>
      <button onClick={props.onCancel}>Cancelar</button>
    </div>
  ),
}))

vi.mock('../components/FormularioCita', () => ({
  default: (props: any) => (
    <div data-testid="form-cita">
      <button onClick={() => props.onSave({ motivo: 'Vacuna' })}>Guardar cita</button>
      <button onClick={props.onCancel}>Cancelar</button>
    </div>
  ),
}))

vi.mock('../components/ListaCitasCliente', () => ({
  default: (props: any) => (
    <div data-testid="lista-citas">
      <button onClick={() => props.onEliminarCita('c1')}>Eliminar cita</button>
    </div>
  ),
}))

// estado base
const usuarioBase = { uid: 'u1', email: 'user@mail.com' }

beforeEach(() => {
  mockDispatch = vi.fn()
  mockAuth = { firebaseUser: usuarioBase }
  mockClienteHook = { data: { nombre: 'Ana' }, loading: false, error: null, updateLoading: false }
  mockMascotasHook = { mascotas: [], loading: false, error: null, addLoading: false }
  mockCitaSlice = { citas: [], loading: false, addLoading: false, error: null }
  vi.clearAllMocks()
})

// helper
const renderConRouter = (ui: any) => render(<MemoryRouter>{ui}</MemoryRouter>)

// tests
describe('PerfilCliente', () => {
  it('despacha cargas iniciales al montar', () => {
    renderConRouter(<PerfilCliente />)

    expect(clienteSliceMocks.fetchClienteData).toHaveBeenCalledWith('u1')
    expect(mascotaSliceMocks.fetchMascotas).toHaveBeenCalledWith('u1')
    expect(citaSliceMocks.fetchCitasCliente).toHaveBeenCalledWith('u1')

    expect(mockDispatch).toHaveBeenCalledTimes(3)
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cliente/fetch' }))
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'mascota/fetch' }))
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cita/fetch' }))
  })

  it('guarda datos personales inyectando uid del usuario', () => {
    renderConRouter(<PerfilCliente />)

    fireEvent.click(screen.getByText('Guardar datos'))

    expect(clienteSliceMocks.updateClienteData).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Neo', uid: 'u1' })
    )
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cliente/update' }))
  })

  it('edita una mascota existente y despacha update', () => {
    mockMascotasHook = {
      mascotas: [{ id: 'm1', nombre: 'Kira', clienteUid: 'u1' }],
      loading: false, error: null, addLoading: false,
    }

    renderConRouter(<PerfilCliente />)

    fireEvent.click(screen.getByTitle('editar-mascota'))
    expect(screen.getByTestId('form-mascota')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Guardar mascota'))
    expect(mascotaSliceMocks.updateMascota).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm1' })
    )
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'mascota/update' }))
  })

  it('elimina una cita desde la lista', () => {
    mockCitaSlice = { citas: [{ id: 'c1' }], loading: false, addLoading: false, error: null }

    renderConRouter(<PerfilCliente />)
    fireEvent.click(screen.getByText('Eliminar cita'))

    expect(citaSliceMocks.deleteCita).toHaveBeenCalledWith('c1')
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cita/delete' }))
  })

  it('elimina una mascota', () => {
    mockMascotasHook = {
      mascotas: [{ id: 'm1', nombre: 'Kira', clienteUid: 'u1' }],
      loading: false, error: null, addLoading: false,
    }

    renderConRouter(<PerfilCliente />)
    fireEvent.click(screen.getByTitle('eliminar-mascota'))

    expect(mascotaSliceMocks.deleteMascota).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'm1', clienteUid: 'u1' })
    )
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'mascota/delete' }))
  })

  it('cierra el formulario de mascota al pulsar “Cancelar”', () => {
    mockMascotasHook = {
      mascotas: [{ id: 'm1', nombre: 'Kira', clienteUid: 'u1' }],
      loading: false, error: null, addLoading: false,
    }

    renderConRouter(<PerfilCliente />)

    fireEvent.click(screen.getByTitle('editar-mascota'))
    expect(screen.getByTestId('form-mascota')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByTestId('form-mascota')).not.toBeInTheDocument()
  })

  it('muestra el mensaje de error y lo limpia con “forms.close”', () => {
    mockClienteHook = {
      data: { nombre: 'Ana' },
      loading: false,
      error: 'boom',
      updateLoading: false,
    }

    renderConRouter(<PerfilCliente />)

    expect(screen.getByText('errors.somethingWrong')).toBeInTheDocument()
    fireEvent.click(screen.getByText('forms.close'))

    expect(clienteSliceMocks.clearClienteError).toHaveBeenCalled()
    expect(mascotaSliceMocks.clearMascotaError).toHaveBeenCalled()
    expect(citaSliceMocks.clearCitaError).toHaveBeenCalled()

    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cliente/clearErr' }))
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'mascota/clearErr' }))
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'cita/clearErr' }))
  })

  it('no carga datos cuando no hay usuario autenticado', () => {
    mockAuth = { firebaseUser: null }

    renderConRouter(<PerfilCliente />)

    expect(clienteSliceMocks.fetchClienteData).not.toHaveBeenCalled()
    expect(mascotaSliceMocks.fetchMascotas).not.toHaveBeenCalled()
    expect(citaSliceMocks.fetchCitasCliente).not.toHaveBeenCalled()
  })
})
