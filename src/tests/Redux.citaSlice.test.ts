/*
 Pruebas unitarias del reducer de citaSlice:
 - Estado inicial
 - Acciones síncronas: clearCitas, clearCitaError, setFiltros, clearFiltros
 - ExtraReducers (acciones de thunks) simuladas con objetos de acción:
   - fetchCitasCliente.pending / fulfilled / rejected
   - addCita.pending / fulfilled
   - updateEstadoCita.fulfilled
   - deleteCita.fulfilled
 Nota: no llamamos a Firebase; sólo probamos la lógica del reducer.
 */

import { describe, it, expect } from 'vitest'
import reducer, {
  clearCitas,
  clearCitaError,
  setFiltros,
  clearFiltros,
  fetchCitasCliente,
  addCita,
  updateEstadoCita,
  deleteCita,
  type CitaData,
} from '../redux/citaSlice'

const initial = reducer(undefined, { type: '@@INIT' })

describe('citaSlice reducer', () => {
  it('estado inicial', () => {
    expect(initial.citas).toEqual([])
    expect(initial.loading).toBe(false)
    expect(initial.addLoading).toBe(false)
    expect(initial.updateLoading).toBe(false)
    expect(initial.deleteLoading).toBe(false)
    expect(initial.error).toBeNull()
    expect(initial.filtros).toEqual({})
  })

  it('clearCitas limpia citas y error', () => {
    const pre = { ...initial, citas: [{ id: '1' } as CitaData], error: 'x' }
    const next = reducer(pre, clearCitas())
    expect(next.citas).toEqual([])
    expect(next.error).toBeNull()
  })

  it('clearCitaError limpia error', () => {
    const pre = { ...initial, error: 'boom' }
    const next = reducer(pre, clearCitaError())
    expect(next.error).toBeNull()
  })

  it('setFiltros mezcla filtros y clearFiltros los resetea', () => {
    const s1 = reducer(initial, setFiltros({ estado: 'pendiente' }))
    expect(s1.filtros).toEqual({ estado: 'pendiente' })
    const s2 = reducer(s1, setFiltros({ fecha: '2025-01-01' }))
    expect(s2.filtros).toEqual({ estado: 'pendiente', fecha: '2025-01-01' })
    const s3 = reducer(s2, clearFiltros())
    expect(s3.filtros).toEqual({})
  })

  it('fetchCitasCliente.pending marca loading', () => {
    const next = reducer(initial, { type: fetchCitasCliente.pending.type })
    expect(next.loading).toBe(true)
    expect(next.error).toBeNull()
  })

  it('fetchCitasCliente.fulfilled coloca citas', () => {
    const payload: CitaData[] = [
      {
        id: 'c1',
        clienteUid: 'u1',
        clienteEmail: 'a@a.a',
        mascotaId: 'm1',
        mascotaNombre: 'Kira',
        fecha: '2025-01-01',
        hora: '10:00',
        motivo: 'Consulta',
        estado: 'pendiente',
        creadaEn: '2025-01-01T00:00:00Z',
      },
    ]
    const next = reducer(
      { ...initial, loading: true },
      { type: fetchCitasCliente.fulfilled.type, payload }
    )
    expect(next.loading).toBe(false)
    expect(next.citas).toEqual(payload)
    expect(next.error).toBeNull()
  })

  it('fetchCitasCliente.rejected coloca error', () => {
    const next = reducer(
      { ...initial, loading: true },
      { type: fetchCitasCliente.rejected.type, payload: 'falló' }
    )
    expect(next.loading).toBe(false)
    expect(next.error).toBe('falló')
  })

  it('addCita.pending/fulfilled controla addLoading y agrega cita', () => {
    const s1 = reducer(initial, { type: addCita.pending.type })
    expect(s1.addLoading).toBe(true)
    const nueva: CitaData = {
      id: 'c2',
      clienteUid: 'u1',
      clienteEmail: 'a@a.a',
      mascotaId: 'm2',
      mascotaNombre: 'Luna',
      fecha: '2025-02-02',
      hora: '12:00',
      motivo: 'Vacuna',
      estado: 'pendiente',
      creadaEn: '2025-02-02T00:00:00Z',
    }
    const s2 = reducer(s1, { type: addCita.fulfilled.type, payload: nueva })
    expect(s2.addLoading).toBe(false)
    expect(s2.citas).toContainEqual(nueva)
  })

  it('updateEstadoCita.fulfilled actualiza estado y observaciones', () => {
    const base: CitaData = {
      id: 'c3',
      clienteUid: 'u',
      clienteEmail: 'u@u.u',
      mascotaId: 'm',
      mascotaNombre: 'Max',
      fecha: '2025-01-10',
      hora: '09:00',
      motivo: 'Chequeo',
      estado: 'pendiente',
      creadaEn: 'Z',
    }
    const pre = { ...initial, citas: [base] }
    const payload = {
      id: 'c3',
      estado: 'confirmada' as const,
      observaciones: 'ok',
      actualizadaEn: 'Z2',
    }
    const next = reducer(pre, {
      type: updateEstadoCita.fulfilled.type,
      payload,
    })
    expect(next.citas[0].estado).toBe('confirmada')
    expect(next.citas[0].observaciones).toBe('ok')
    expect(next.citas[0].actualizadaEn).toBe('Z2')
  })

  it('deleteCita.fulfilled elimina por id', () => {
    const pre = {
      ...initial,
      citas: [{ id: 'x' } as CitaData, { id: 'y' } as CitaData],
    }
    const next = reducer(pre, {
      type: deleteCita.fulfilled.type,
      payload: 'x',
    })
    expect(next.citas.map(c => c.id)).toEqual(['y'])
  })
})
