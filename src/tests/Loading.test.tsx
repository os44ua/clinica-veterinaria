/*
 Pruebas unitarias del componente Loading:
 - Renderiza el texto "Cargando..."
 - Aplica clases básicas de estilo (wrapper y <p>)
 Nota:
 - No requiere i18n ni mocks adicionales.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loading from '../components/Loading'

describe('Loading', () => {
  it('muestra el texto de carga', () => {
    render(<Loading />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('aplica clases de estilo básicas', () => {
    const { container } = render(<Loading />)
    // wrapper <div>
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('text-center')
    expect(wrapper).toHaveClass('text-gray-600')
    expect(wrapper).toHaveClass('py-10')
    // <p> con el texto
    const p = screen.getByText('Cargando...')
    expect(p).toHaveClass('text-xl')
    expect(p).toHaveClass('animate-pulse')
  })
})
