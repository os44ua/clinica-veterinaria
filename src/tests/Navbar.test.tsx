/*
 Pruebas unitarias del componente Navbar:
 - Render básico con título y enlace Home
 - Estados según autenticación:
    Invitado: Login y Registro visibles; sin panel ni Logout
    Admin: enlace al panel de admin + saludo + Logout
    Veterinario: enlace al panel de vet
    Usuario/cliente: enlace al panel de cliente por defecto
 - Logout: llama a authService.signOut y redirige a /login
 - Renderiza el conmutador de idioma (LanguageSwitcher)
 Notas:
 - El logger se mockea globalmente en setup.ts (no se repite aquí).
 - Mockeamos i18n con sólo las claves usadas por el componente.
 - Mockeamos useAuth para controlar firebaseUser/roles en cada test.
 - Mockeamos useNavigate y AuthService para aislar la vista.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

// i18n local (sólo claves necesarias)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'navbar.title': 'Clínica Veterinaria',
        'navbar.home': 'Inicio',
        'navbar.login': 'Entrar',
        'navbar.register': 'Registro',
        'navbar.hello': 'Hola',
        'navbar.logout': 'Salir',
        'navbar.adminPanel': 'Panel admin',
        'navbar.vetPanel': 'Panel vet',
        'navbar.clientPanel': 'Panel cliente',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (p: { children: any }) => p.children,
}))

// Mock de LanguageSwitcher (placeholder sencillo)
vi.mock('../components/LanguageSwitcher', () => ({
  default: () => <div data-testid="lang-switcher" />,
}))

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
// Mock del store: useAuth
type MockAuth = {
  firebaseUser: null | { email: string }
  roles: string[]
}
let mockAuthState: MockAuth = { firebaseUser: null, roles: [] }
vi.mock('../store/hooks', () => ({
  useAuth: () => mockAuthState,
}))

// Mock de AuthService.signOut
const mockSignOut = vi.fn().mockResolvedValue(undefined)
vi.mock('../services/AuthService', () => ({
  authService: {
    signOut: (...args: any[]) => mockSignOut(...args),
  },
}))
// Helper de render
const setup = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )

beforeEach(() => {
  vi.clearAllMocks()
  mockNavigate.mockReset()
  mockAuthState = { firebaseUser: null, roles: [] }
})

// TESTS
describe('Navbar', () => {
  it('renderiza título y enlace Home para invitado, con Login/Registro y sin Logout/panel', () => {
    setup()

    expect(screen.getByText('Clínica Veterinaria')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()

    // Invitado: enlaces de auth
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Registro' })).toBeInTheDocument()

    // No debería ver saludo ni botón de salir
    expect(screen.queryByText(/Hola,/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument()

    // Conmutador de idioma presente
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument()
  })

  it('muestra panel de Admin, saludo y Logout cuando está autenticado como ADMIN', async () => {
    mockAuthState = { firebaseUser: { email: 'admin@mail.com' }, roles: ['ADMIN'] }
    setup()

    // Enlace al panel de admin con href correcto
    const adminLink = screen.getByRole('link', { name: 'Panel admin' })
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute('href', '/adminvets')

    // Saludo con email y botón de salir
    expect(screen.getByText(/Hola, admin@mail\.com/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument()
  })

  it('al pulsar "Salir" llama a signOut y navega a /login', async () => {
    mockAuthState = { firebaseUser: { email: 'admin@mail.com' }, roles: ['ADMIN'] }
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('muestra panel de Veterinario cuando el rol es VETERINARIO', () => {
    mockAuthState = { firebaseUser: { email: 'vet@mail.com' }, roles: ['VETERINARIO'] }
    setup()

    const vetLink = screen.getByRole('link', { name: 'Panel vet' })
    expect(vetLink).toBeInTheDocument()
    expect(vetLink).toHaveAttribute('href', '/perfilveterinario')
  })

  it('muestra panel de Cliente por defecto cuando el rol es USER', () => {
    mockAuthState = { firebaseUser: { email: 'user@mail.com' }, roles: ['USER'] }
    setup()

    const clientLink = screen.getByRole('link', { name: 'Panel cliente' })
    expect(clientLink).toBeInTheDocument()
    expect(clientLink).toHaveAttribute('href', '/perfilcliente')
  })
})
