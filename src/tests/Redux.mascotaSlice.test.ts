/*
 Pruebas unitarias del reducer de mascotaSlice:
 - Estado inicial
 - Acciones síncronas: clearMascotas, clearMascotaError, updateLocalMascota
 - ExtraReducers simulados: fetchMascotas (pending/fulfilled/rejected),
 addMascota.fulfilled, updateMascota.fulfilled, deleteMascota.fulfilled.
 */

import { describe, it, expect } from 'vitest'
import reducer, {
  clearMascotas,
  clearMascotaError,
  updateLocalMascota,
  fetchMascotas,
  addMascota,
  updateMascota,
  deleteMascota,
  type MascotaData,
} from '../redux/mascotaSlice'

const initial = reducer(undefined, { type: '@@INIT' })

describe('mascotaSlice reducer', () => {
  it('estado inicial', () => {
    expect(initial.mascotas).toEqual([])
    expect(initial.loading).toBe(false)
    expect(initial.addLoading).toBe(false)
    expect(initial.updateLoading).toBe(false)
    expect(initial.deleteLoading).toBe(false)
    expect(initial.error).toBeNull()
  })

  it('clearMascotas limpia mascotas y error', () => {
    const pre = { ...initial, mascotas: [{ id: '1', nombre: 'Kira', especie: 'perro', raza: '', edad: 1, genero: 'hembra', clienteUid: 'u' } as MascotaData], error: 'x' }
    const next = reducer(pre, clearMascotas())
    expect(next.mascotas).toEqual([])
    expect(next.error).toBeNull()
  })

  it('clearMascotaError limpia error', () => {
    const pre = { ...initial, error: 'boom' }
    const next = reducer(pre, clearMascotaError())
    expect(next.error).toBeNull()
  })

  it('updateLocalMascota mezcla cambios por id', () => {
    const base: MascotaData = { id: 'm1', nombre: 'Luna', especie: 'gato', raza: 'x', edad: 3, genero: 'hembra', clienteUid: 'u' }
    const pre = { ...initial, mascotas: [base] }
    const next = reducer(pre, updateLocalMascota({ id: 'm1', updates: { raza: 'siamés' } }))
    expect(next.mascotas[0]).toMatchObject({ raza: 'siamés', nombre: 'Luna' })
  })

  it('fetchMascotas.pending/fulfilled/rejected', () => {
    const p = reducer(initial, { type: fetchMascotas.pending.type })
    expect(p.loading).toBe(true)
    const payload: MascotaData[] = [{ id: 'm2', nombre: 'Max', especie: 'perro', raza: '', edad: 2, genero: 'macho', clienteUid: 'u' }]
    const f = reducer(p, { type: fetchMascotas.fulfilled.type, payload })
    expect(f.loading).toBe(false)
    expect(f.mascotas).toEqual(payload)
    const r = reducer(p, { type: fetchMascotas.rejected.type, payload: 'err' })
    expect(r.loading).toBe(false)
    expect(r.error).toBe('err')
  })

  it('addMascota.fulfilled agrega mascota', () => {
    const nueva: MascotaData = { id: 'm3', nombre: 'Paco', especie: 'ave', raza: '', edad: 1, genero: 'macho', clienteUid: 'u' }
    const next = reducer(initial, { type: addMascota.fulfilled.type, payload: nueva })
    expect(next.mascotas).toContainEqual(nueva)
  })

  it('updateMascota.fulfilled sustituye por id', () => {
    const base: MascotaData = { id: 'm4', nombre: 'Rex', especie: 'perro', raza: 'x', edad: 5, genero: 'macho', clienteUid: 'u' }
    const updated = { ...base, raza: 'pastor' }
    const pre = { ...initial, mascotas: [base] }
    const next = reducer(pre, { type: updateMascota.fulfilled.type, payload: updated })
    expect(next.mascotas[0]).toMatchObject({ id: 'm4', raza: 'pastor' })
  })

  it('deleteMascota.fulfilled elimina por id', () => {
    const base1: MascotaData = { id: 'm5', nombre: 'A', especie: 'otro', raza: '', edad: 1, genero: 'macho', clienteUid: 'u' }
    const base2: MascotaData = { id: 'm6', nombre: 'B', especie: 'otro', raza: '', edad: 1, genero: 'macho', clienteUid: 'u' }
    const pre = { ...initial, mascotas: [base1, base2] }
    const next = reducer(pre, { type: deleteMascota.fulfilled.type, payload: 'm5' })
    expect(next.mascotas.map(m => m.id)).toEqual(['m6'])
  })
})
