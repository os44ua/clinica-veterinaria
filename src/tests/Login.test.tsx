/*
 Pruebas unitarias de la página Login:
 - Render básico (título, campos, botones)
 - Validaciones de email/contraseña
 - Flujo de login correcto con redirección por rol (ADMIN, VETERINARIO, USER)
 - Manejo y limpieza de errores del store (clearError)
 - Estado de carga (deshabilitar UI)
 - Redirección si ya está autenticado
 - Limpieza en unmount (cleanup useEffect)
 Notas:
 - El logger y el icono se mockean globalmente en setup.ts (no se repiten aquí).
 - i18n se mockea localmente con las claves mínimas necesarias para este componente.
 - Los hooks del store, las actions y useNavigate están mockeados para aislar la vista.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

const ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  VETERINARIO: 'VETERINARIO',
} as const

// Mocks específicos de este archivo
// i18n local — sólo claves usadas en Login
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'auth.loginTitle': 'Iniciar sesión',
        'auth.loginSubtitle': 'Accede a tu cuenta',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'tu@email.com',
        'auth.password': 'Contraseña',
        'auth.passwordPlaceholder': '••••••',
        'auth.loginButton': 'Entrar',
        'auth.logging': 'Entrando...',
        'auth.noAccount': '¿No tienes cuenta?',
        'auth.registerLink': 'Regístrate',
        'auth.loginError': 'Error en el inicio de sesión',
        'auth.emailRequired': 'El email es obligatorio',
        'auth.emailInvalid': 'El email no es válido',
        'auth.passwordRequired': 'La contraseña es obligatoria',
        'auth.passwordMinLength': 'La contraseña debe tener al menos 6 caracteres',
      }
      return tr[key] ?? key
    },
  }),
  // Componente Trans no-op (sin tipos de React para evitar imports innecesarios)
  Trans: (props: { children: any }) => props.children,
}))

// mockNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (orig) => {
  const actual = (await orig()) as any
  return { ...actual, useNavigate: () => mockNavigate }
})

// mock del módulo de roles para mantener coherencia con el código real
vi.mock('../interfaces/IAuthService', () => {
  const Role = {
    ADMIN: 'ADMIN' as const,
    USER: 'USER' as const,
    VETERINARIO: 'VETERINARIO' as const,
  }
  return { Role }
})

// Hooks del store
const mockDispatch = vi.fn()
let mockUnwrapResult: any = null
mockDispatch.mockImplementation(() => ({
  unwrap: () => Promise.resolve(mockUnwrapResult),
}))
const authState = {
  loginLoading: false,
  error: '',
  isAuthenticated: false,
  roles: [] as string[],
}
vi.mock('../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAuth: () => authState,
}))

// Actions (Redux)
const mockLoginUser = vi.fn((payload: any) => ({ type: 'user/login', payload }))
const mockClearError = vi.fn(() => ({ type: 'user/clearError' }))
vi.mock('../redux/userSlice', () => ({
  loginUser: (payload: any) => mockLoginUser(payload),
  clearError: () => mockClearError(),
}))

// Helper de render
const setup = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

beforeEach(() => {
  vi.clearAllMocks()
  authState.loginLoading = false
  authState.error = ''
  authState.isAuthenticated = false
  authState.roles = []
  mockUnwrapResult = null
  mockNavigate.mockReset()
})

// TESTS
describe('Login page', () => {
  it('renderiza título, campos y botones', () => {
    setup()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByText('Accede a tu cuenta')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regístrate' })).toBeInTheDocument()
  })

  it('valida: email requerido', async () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => {
      expect(mockLoginUser).not.toHaveBeenCalled()
    })
  })

  it('valida: email inválido', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sin-arroba' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => {
      expect(mockLoginUser).not.toHaveBeenCalled()
    })
  })

  it('valida: password requerida', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@mail.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => {
      expect(mockLoginUser).not.toHaveBeenCalled()
    })
  }) // ← cierre del test que faltaba

  it('valida: longitud mínima de password', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@mail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
  })

  it('login OK y redirección a ADMIN', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@mail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } })
    mockUnwrapResult = { roles: [ROLE.ADMIN] }

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({ email: 'admin@mail.com', password: '123456' })
    })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/adminvets'))
  })

  it('login OK y redirección a VETERINARIO', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'vet@mail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '654321' } })
    mockUnwrapResult = { roles: [ROLE.VETERINARIO] }

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/perfilveterinario'))
  })

  it('login OK y redirección por defecto a CLIENTE/USER', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'cli@mail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'abcdef' } })
    mockUnwrapResult = { roles: [ROLE.USER] }

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/perfilcliente'))
  })

  it('muestra error del store y permite cerrarlo (clearError)', () => {
    authState.error = 'Boom error'
    setup()
    expect(screen.getByText('Error en el inicio de sesión')).toBeInTheDocument()
    expect(screen.getByText('Boom error')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(mockClearError).toHaveBeenCalledTimes(1) // se limpia al cerrar
  })

  it('deshabilita UI en loading', () => {
    authState.loginLoading = true
    setup()
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Regístrate' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Regístrate' }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirige si ya está autenticado (useEffect inicial)', () => {
    authState.isAuthenticated = true
    authState.roles = [ROLE.ADMIN]
    setup()
    expect(mockNavigate).toHaveBeenCalledWith('/adminvets')
  })

  it('limpia errores al desmontar (cleanup useEffect)', () => {
    const { unmount } = setup()
    vi.clearAllMocks()
    unmount()
    expect(mockClearError).toHaveBeenCalledTimes(1) // se limpia al desmontar
  })

  it('si login devuelve roles vacíos, muestra error de roles', async () => {
    setup()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@mail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } })
    mockUnwrapResult = { roles: [] }

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText(/No se pudieron cargar los roles del usuario/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

