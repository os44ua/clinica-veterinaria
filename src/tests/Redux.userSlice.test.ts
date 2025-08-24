/*
 Pruebas unitarias del reducer de userSlice:
 - Estado inicial
 - Acciones síncronas: setUser, clearUser, setLoading, clearError, updateRoles
 - ExtraReducers simulados: loginUser / registerUser (pending/fulfilled/rejected),
   logoutUser.fulfilled, loadUserRoles.fulfilled/rejected.
 */

import { describe, it, expect } from 'vitest'
import reducer, {
  setUser,
  clearUser,
  setLoading,
  clearError,
  updateRoles,
  loginUser,
  registerUser,
  logoutUser,
  loadUserRoles,
} from '../redux/userSlice'
import { Role } from '../interfaces/IAuthService'

const initial = reducer(undefined, { type: '@@INIT' })

describe('userSlice reducer', () => {
  it('estado inicial', () => {
    expect(initial.firebaseUser).toBeNull()
    expect(initial.roles).toEqual([])
    expect(initial.isAuthenticated).toBe(false)
    expect(initial.loading).toBe(true)
    expect(initial.error).toBeNull()
    expect(initial.loginLoading).toBe(false)
    expect(initial.registerLoading).toBe(false)
  })

  it('setUser establece usuario y roles; clearUser limpia', () => {
    const u = { uid: '1', email: 'a@a.a' } as any
    const s1 = reducer(initial, setUser({ user: u, roles: [Role.ADMIN] }))
    expect(s1.firebaseUser).toEqual(u)
    expect(s1.roles).toEqual([Role.ADMIN])
    expect(s1.isAuthenticated).toBe(true)
    expect(s1.loading).toBe(false)

    const s2 = reducer(s1, clearUser())
    expect(s2.firebaseUser).toBeNull()
    expect(s2.roles).toEqual([])
    expect(s2.isAuthenticated).toBe(false)
  })

  it('setLoading y clearError funcionan', () => {
    const s1 = reducer(initial, setLoading(false))
    expect(s1.loading).toBe(false)

    const s2 = reducer({ ...initial, error: 'x' }, clearError())
    expect(s2.error).toBeNull()
  })

  it('updateRoles actualiza roles', () => {
    const next = reducer(initial, updateRoles([Role.USER]))
    expect(next.roles).toEqual([Role.USER])
  })

  it('loginUser.pending/fulfilled/rejected', () => {
    const p = reducer(initial, { type: loginUser.pending.type })
    expect(p.loginLoading).toBe(true)

    const payload = { user: { uid: '1' }, roles: [Role.USER] }
    const f = reducer(p, { type: loginUser.fulfilled.type, payload })
    expect(f.loginLoading).toBe(false)
    expect(f.firebaseUser).toEqual({ uid: '1' })
    expect(f.roles).toEqual([Role.USER])
    expect(f.isAuthenticated).toBe(true)

    const r = reducer(p, { type: loginUser.rejected.type, payload: 'bad' })
    expect(r.loginLoading).toBe(false)
    expect(r.error).toBe('bad')
  })

  it('registerUser.pending/fulfilled/rejected', () => {
    const p = reducer(initial, { type: registerUser.pending.type })
    expect(p.registerLoading).toBe(true)

    const payload = { user: { uid: '2' }, roles: [Role.USER] }
    const f = reducer(p, { type: registerUser.fulfilled.type, payload })
    expect(f.registerLoading).toBe(false)
    expect(f.firebaseUser).toEqual({ uid: '2' })
    expect(f.isAuthenticated).toBe(true)

    const r = reducer(p, { type: registerUser.rejected.type, payload: 'oops' })
    expect(r.registerLoading).toBe(false)
    expect(r.error).toBe('oops')
  })

  it('logoutUser.fulfilled limpia estado', () => {
    const pre = {
      ...initial,
      firebaseUser: { uid: '1' } as any,
      roles: [Role.ADMIN],
      isAuthenticated: true,
      loading: true,
    }
    const next = reducer(pre, { type: logoutUser.fulfilled.type })
    expect(next.firebaseUser).toBeNull()
    expect(next.roles).toEqual([])
    expect(next.isAuthenticated).toBe(false)
    expect(next.loading).toBe(false)
  })

  it('loadUserRoles.fulfilled/rejected', () => {
    const f = reducer(initial, { type: loadUserRoles.fulfilled.type, payload: [Role.VETERINARIO] })
    expect(f.roles).toEqual([Role.VETERINARIO])

    const r = reducer(initial, { type: loadUserRoles.rejected.type, payload: 'err' })
    expect(r.error).toBe('err')
  })
})
