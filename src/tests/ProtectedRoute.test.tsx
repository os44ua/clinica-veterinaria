/*
 Pruebas unitarias de ProtectedRoute:
 - Si NO hay usuario en AuthContext ⇒ redirige a /login
 - Si hay usuario ⇒ renderiza los children
 Notas:
 - No dependemos de Firebase; inyectamos AuthContext a mano.
 - Montamos un MemoryRouter con dos rutas mínimas: /private y /login.
 */

import { describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../routes/ProtectedRoute'
import { AuthContext } from '../contexts/AuthContext'

function renderWithAuth(value: any, initialPath = '/private') {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Área Privada</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Página Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay usuario', () => {
    renderWithAuth({ user: null, roles: [] })
    expect(screen.getByText('Página Login')).toBeInTheDocument()
  })

  it('renderiza el contenido cuando hay usuario', () => {
    renderWithAuth({ user: { email: 'u@test.com' }, roles: [] })
    expect(screen.getByText('Área Privada')).toBeInTheDocument()
  })
})
