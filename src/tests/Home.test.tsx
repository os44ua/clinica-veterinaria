/**
 * Pruebas unitarias de la página Home:
 * - Vista pública (no autenticado): título, descripción y enlaces Login/Register
 * - Vista autenticada por rol:
 *    ADMIN  -> link /adminvets y textos del panel de admin
 *    VETERINARIO -> link /perfilveterinario y textos del panel de vet
 *    USER   -> link /perfilcliente y textos del panel de cliente
 * - Muestra el rol actual (join de roles)
 *
 * Notas:
 * - Iconos/imágenes están mockeados globalmente en setup.ts.
 * - i18n se mockea localmente con las claves mínimas usadas aquí.
 */

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Home from '../pages/Home'
import { AuthContext } from '../contexts/AuthContext'
import { Role } from '../interfaces/IAuthService'

// ─────────────────────────────────────────────
// Mock de i18n con traducciones mínimas
// ─────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    // t admite opts para home.welcomeBack
    t: (key: string, opts: any = {}) => {
      const tr: Record<string, string> = {
        // pública
        'home.welcome': 'Bienvenido a Clínica Veterinaria',
        'home.description': 'Cuidamos de tus mascotas con cariño',
        'navbar.login': 'Entrar',
        'navbar.register': 'Regístrate',

        // autenticado (comunes)
        'home.welcomeBack': `¡Bienvenido de nuevo, ${opts.email}!`,
        'home.whatToDo': '¿Qué te gustaría hacer hoy?',
        'home.goToPanel': 'Ir al panel',
        'home.currentRole': 'Rol actual',

        // paneles por rol
        'home.adminPanel': 'Panel de administración',
        'home.adminDescription': 'Gestiona usuarios y veterinarios',
        'home.vetPanel': 'Panel del veterinario',
        'home.vetDescription': 'Gestiona tus citas y tu perfil',
        'home.clientPanel': 'Panel del cliente',
        'home.clientDescription': 'Revisa tus citas y mascotas',
      }
      return tr[key] ?? key
    },
  }),
  Trans: (p: { children: any }) => p.children,
}))

// Helper para renderizar Home con un AuthContext dado
const renderWithAuth = (ctxValue: Partial<React.ContextType<typeof AuthContext>>) =>
  render(
    <MemoryRouter>
      {/* el componente sólo usa user y roles; el resto lo tipamos como any */}
      <AuthContext.Provider value={ctxValue as any}>
        <Home />
      </AuthContext.Provider>
    </MemoryRouter>
  )

describe('Home', () => {
  it('muestra la vista pública cuando no hay usuario', () => {
    renderWithAuth({ user: null, roles: [] })

    // Título y descripción
    expect(
      screen.getByText('Bienvenido a Clínica Veterinaria')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Cuidamos de tus mascotas con cariño')
    ).toBeInTheDocument()

    // Enlaces "Entrar" y "Regístrate" con href correctos
    const login = screen.getByRole('link', { name: 'Entrar' })
    expect(login).toHaveAttribute('href', '/login')

    const register = screen.getByRole('link', { name: 'Regístrate' })
    expect(register).toHaveAttribute('href', '/register')
  })

  it('muestra panel y enlaces para ADMIN', () => {
    renderWithAuth({
      user: { email: 'admin@mail.com' } as any,
      roles: [Role.ADMIN],
    })

    // Bienvenida personalizada
    expect(
      screen.getByText('¡Bienvenido de nuevo, admin@mail.com!')
    ).toBeInTheDocument()

    // Panel admin
    expect(screen.getByText('Panel de administración')).toBeInTheDocument()
    expect(screen.getByText('Gestiona usuarios y veterinarios')).toBeInTheDocument()

    // Link al panel correcto
    const goLink = screen.getByRole('link', { name: 'Ir al panel' })
    expect(goLink).toHaveAttribute('href', '/adminvets')

    // Rol actual
    expect(screen.getByText(/Rol actual/i)).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('muestra panel y enlaces para VETERINARIO', () => {
    renderWithAuth({
      user: { email: 'vet@mail.com' } as any,
      roles: [Role.VETERINARIO],
    })

    expect(
      screen.getByText('¡Bienvenido de nuevo, vet@mail.com!')
    ).toBeInTheDocument()

    expect(screen.getByText('Panel del veterinario')).toBeInTheDocument()
    expect(screen.getByText('Gestiona tus citas y tu perfil')).toBeInTheDocument()

    const goLink = screen.getByRole('link', { name: 'Ir al panel' })
    expect(goLink).toHaveAttribute('href', '/perfilveterinario')

    expect(screen.getByText(/Rol actual/i)).toBeInTheDocument()
    expect(screen.getByText('VETERINARIO')).toBeInTheDocument()
  })

  it('muestra panel y enlaces para USER (cliente)', () => {
    renderWithAuth({
      user: { email: 'user@mail.com' } as any,
      roles: [Role.USER],
    })

    expect(
      screen.getByText('¡Bienvenido de nuevo, user@mail.com!')
    ).toBeInTheDocument()

    expect(screen.getByText('Panel del cliente')).toBeInTheDocument()
    expect(screen.getByText('Revisa tus citas y mascotas')).toBeInTheDocument()

    const goLink = screen.getByRole('link', { name: 'Ir al panel' })
    expect(goLink).toHaveAttribute('href', '/perfilcliente')

    expect(screen.getByText(/Rol actual/i)).toBeInTheDocument()
    expect(screen.getByText('USER')).toBeInTheDocument()
  })

  it('muestra múltiples roles unidos por coma', () => {
    renderWithAuth({
      user: { email: 'mix@mail.com' } as any,
      roles: [Role.ADMIN, Role.VETERINARIO],
    })

    // etiqueta de rol y contenido con join(", ")
   expect(screen.getByText(/Rol actual/i)).toBeInTheDocument()
   expect(screen.getByText('ADMIN, VETERINARIO')).toBeInTheDocument()
  })
})

