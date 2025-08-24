/*
 Pruebas unitarias para AuthContext:
 - Muestra loader mientras loading=true
 - Montaje: despacha setLoading(true) y registra el listener
 - Con usuario: obtiene roles y despacha setUser
 - Sin usuario (logout): limpia slices (clearUser/cliente/mascotas/citas)
 - Cleanup: llama al unsubscribe del listener
 - Expone valores correctos vía el contexto
 Notas:
 - authService (onAuthStateChanged/getUserRoles) se mockea localmente aquí.
 - useAppDispatch / useAuth del store se mockean para controlar el estado.
 - Las actions de los slices se mockean para poder hacer aserciones.
 */

import React, { useContext } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, AuthContext } from '../contexts/AuthContext'

// Mocks de store (hooks)
const mockDispatch = vi.fn()
let mockAuthState: any = {
  firebaseUser: null,
  roles: [],
  isAuthenticated: false,
  loading: false,
}
vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAuth: () => mockAuthState,
}))

// Mocks de actions de Redux
export const setLoading = vi.fn((v: boolean) => ({ type: 'user/setLoading', payload: v }))
export const setUser = vi.fn((p: any) => ({ type: 'user/setUser', payload: p }))
export const clearUser = vi.fn(() => ({ type: 'user/clearUser' }))
vi.mock('../redux/userSlice', () => ({
  setLoading: (v: boolean) => setLoading(v),
  setUser: (p: any) => setUser(p),
  clearUser: () => clearUser(),
}))
export const clearClienteData = vi.fn(() => ({ type: 'cliente/clear' }))
vi.mock('../redux/clienteSlice', () => ({
  clearClienteData: () => clearClienteData(),
}))
export const clearMascotas = vi.fn(() => ({ type: 'mascota/clear' }))
vi.mock('../redux/mascotaSlice', () => ({
  clearMascotas: () => clearMascotas(),
}))
export const clearCitas = vi.fn(() => ({ type: 'cita/clear' }))
vi.mock('../redux/citaSlice', () => ({
  clearCitas: () => clearCitas(),
}))

// Mock de AuthService
let capturedListener: ((u: any) => unknown) | null = null
const unsubscribe = vi.fn()
export const getUserRoles = vi.fn(async (_u: any) => ['USER'])
const onAuthStateChanged = vi.fn((cb: (u: any) => unknown) => {
  capturedListener = cb
  return unsubscribe
})
vi.mock('../services/AuthService', () => ({
  authService: {
    onAuthStateChanged: (cb: any) => onAuthStateChanged(cb),
    getUserRoles: (u: any) => getUserRoles(u),
  },
}))

// Utilidad: consumidor de contexto para validar valores
const Probe: React.FC = () => {
  const ctx = useContext(AuthContext)
  return (
    <div data-testid="probe">
      {`${ctx.user?.email ?? 'anon'}|${(ctx.roles ?? []).join(',') || 'none'}|${
        ctx.isAuthenticated ? 'yes' : 'no'
      }`}
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuthState = {
    firebaseUser: null,
    roles: [],
    isAuthenticated: false,
    loading: false,
  }
  capturedListener = null
})

describe('AuthContext', () => {
  it('muestra loader mientras loading=true', () => {
    mockAuthState.loading = true
    render(
      <AuthProvider>
        <div>child</div>
      </AuthProvider>
    )
    expect(screen.getByText('🔄 Cargando...')).toBeInTheDocument()
    expect(setLoading).toHaveBeenCalledWith(true)
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1)
  })

  it('con usuario: obtiene roles y despacha setUser', async () => {
    render(
      <AuthProvider>
        <div>ok</div>
      </AuthProvider>
    )

    expect(onAuthStateChanged).toHaveBeenCalledTimes(1)
    // Simulamos callback de Firebase con usuario
    const currentUser = { uid: 'u1', email: 'a@b.com' }
    capturedListener?.(currentUser)
    await waitFor(() => {
      expect(getUserRoles).toHaveBeenCalledWith(currentUser)
      expect(setUser).toHaveBeenCalledWith({
        user: currentUser,
        roles: ['USER'],
      })
    })
  })

  it('sin usuario (logout): limpia slices correspondientes', async () => {
    render(
      <AuthProvider>
        <div>ok</div>
      </AuthProvider>
    )
    capturedListener?.(null)
    await waitFor(() => {
      expect(clearUser).toHaveBeenCalledTimes(1)
      expect(clearClienteData).toHaveBeenCalledTimes(1)
      expect(clearMascotas).toHaveBeenCalledTimes(1)
      expect(clearCitas).toHaveBeenCalledTimes(1)
      expect(getUserRoles).not.toHaveBeenCalled()
    })
  })

  it('cleanup: llama al unsubscribe del listener al desmontar', () => {
    const { unmount } = render(
      <AuthProvider>
        <div>ok</div>
      </AuthProvider>
    )
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1)
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('expone valores correctos vía el contexto', () => {
    mockAuthState = {
      firebaseUser: { email: 'x@y.com' },
      roles: ['ADMIN'],
      isAuthenticated: true,
      loading: false,
    }
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByTestId('probe').textContent).toBe('x@y.com|ADMIN|yes')
  })
})
