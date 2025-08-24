/*
 Pruebas unitarias del reducer de clienteSlice:
 - Estado inicial
 - Acciones síncronas: clearClienteData, clearClienteError, updateLocalClienteData
 - ExtraReducers simulados: fetchClienteData (pending/fulfilled/rejected), 
 updateClienteData.fulfilled y partialUpdateCliente.fulfilled.
 */

import { describe, it, expect } from 'vitest'
import reducer, {
  clearClienteData,
  clearClienteError,
  updateLocalClienteData,
  fetchClienteData,
  updateClienteData,
  partialUpdateCliente,
  type ClienteData,
} from '../redux/clienteSlice'

const initial = reducer(undefined, { type: '@@INIT' })

describe('clienteSlice reducer', () => {
  it('estado inicial', () => {
    expect(initial.data).toBeNull()
    expect(initial.loading).toBe(false)
    expect(initial.updateLoading).toBe(false)
    expect(initial.error).toBeNull()
  })

  it('clearClienteData limpia data y error', () => {
    const pre = { ...initial, data: { uid: '1', nombre: 'A', apellidos: 'B', dni: '', telefono: '' } as ClienteData, error: 'e' }
    const next = reducer(pre, clearClienteData())
    expect(next.data).toBeNull()
    expect(next.error).toBeNull()
  })

  it('clearClienteError limpia error', () => {
    const pre = { ...initial, error: 'boom' }
    const next = reducer(pre, clearClienteError())
    expect(next.error).toBeNull()
  })

  it('updateLocalClienteData mezcla parciales en state.data', () => {
    const pre = { ...initial, data: { uid: '1', nombre: 'Ana', apellidos: 'López', dni: 'X', telefono: '123' } as ClienteData }
    const next = reducer(pre, updateLocalClienteData({ telefono: '999', direccion: 'Calle 1' }))
    expect(next.data).toMatchObject({ telefono: '999', direccion: 'Calle 1', nombre: 'Ana' })
  })

  it('fetchClienteData.pending/fulfilled/rejected', () => {
    const p = reducer(initial, { type: fetchClienteData.pending.type })
    expect(p.loading).toBe(true)
    const payload: ClienteData = { uid: '1', nombre: 'A', apellidos: 'B', dni: 'D', telefono: 'T' }
    const f = reducer(p, { type: fetchClienteData.fulfilled.type, payload })
    expect(f.loading).toBe(false)
    expect(f.data).toEqual(payload)
    const r = reducer(p, { type: fetchClienteData.rejected.type, payload: 'err' })
    expect(r.loading).toBe(false)
    expect(r.error).toBe('err')
  })

  it('updateClienteData.fulfilled sustituye data', () => {
    const payload: ClienteData = { uid: '2', nombre: 'Lu', apellidos: 'Pe', dni: 'D', telefono: 'T' }
    const next = reducer(initial, { type: updateClienteData.fulfilled.type, payload })
    expect(next.data).toEqual(payload)
  })

  it('partialUpdateCliente.fulfilled mezcla en data existente', () => {
    const pre = { ...initial, data: { uid: '3', nombre: 'N', apellidos: 'A', dni: '1', telefono: '2' } as ClienteData }
    const payload = { uid: '3', telefono: '777' }
    const next = reducer(pre, { type: partialUpdateCliente.fulfilled.type, payload })
    expect(next.data).toMatchObject({ uid: '3', telefono: '777', nombre: 'N' })
  })
})
