/*
 Pruebas unitarias de la página Home:
 - Render del título y la descripción traducidos
 - Presencia del logotipo
 - CTA: enlaces a Login y Registro con textos y href correctos
Notas:
 - El icono (dog.png) y el logger se mockean globalmente en setup.ts.
 - Aquí mockeamos i18n localmente con las claves mínimas que usa la vista.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

// i18n local — solo las claves que usa Home
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        'home.welcome': 'Bienvenido',
        'home.description': 'Descripción',
        'navbar.login': 'Iniciar sesión',
        'navbar.register': 'Registrarse',
      }
      return tr[key] ?? key
    },
  }),
  // Componente Trans no-op (sin tipos de React para evitar imports innecesarios)
  Trans: (props: { children: any }) => props.children,
}))

// Helper simple para renderizar con Router
const setup = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

describe('Home page', () => {
  it('muestra el título de bienvenida', () => {
    setup()
    // Usamos regex para no acoplarlo a la frase exacta
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument()
  })

  it('muestra la descripción', () => {
    setup()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
  })

  it('muestra el logotipo', () => {
    setup()
    // Alt según el componente Home
    expect(screen.getByAltText('Veterinary Clinic Logo')).toBeInTheDocument()
  })

  it('tiene enlaces a Login y Registro con href correctos', () => {
    setup()
    const loginLink = screen.getByRole('link', { name: 'Iniciar sesión' })
    const registerLink = screen.getByRole('link', { name: 'Registrarse' })

    expect(loginLink).toBeInTheDocument()
    expect(registerLink).toBeInTheDocument()

    expect(loginLink).toHaveAttribute('href', '/login')
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})
