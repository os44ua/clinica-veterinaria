/*
 Pruebas unitarias de AdminRoute:
 - Si el usuario NO es ADMIN ⇒ redirige a "/"
 - Si el usuario es ADMIN ⇒ renderiza los children
 Notas:
 - Usamos AuthContext.Provider para simular usuario/roles.
 - Evitamos i18n y Firebase para mantener el test puro y rápido.
 */

import { describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import AdminRoute from '../routes/AdminRoute'
import { AuthContext } from '../contexts/AuthContext'
import { Role } from '../interfaces/IAuthService'

function renderAdmin(value: any, initialPath = '/admin') {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Panel Admin</div>
              </AdminRoute>
            }
          />
          <Route path="/" element={<div>Home Pública</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('AdminRoute', () => {
  it('bloquea acceso cuando no es ADMIN (redirige a /)', () => {
    renderAdmin({ user: { email: 'u@test.com' }, roles: [Role.USER] })
    expect(screen.getByText('Home Pública')).toBeInTheDocument()
  })

  it('permite acceso cuando el rol incluye ADMIN', () => {
    renderAdmin({ user: { email: 'admin@test.com' }, roles: [Role.ADMIN] })
    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
  })
})
