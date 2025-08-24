/*
 Pruebas unitarias de ErrorBoundary:
 - Renderiza los children cuando no hay error
 - Si un hijo lanza un error: muestra el fallback y registra logs (error y debug)
 - Al "remontar" (cambiando la key) vuelve a renderizar los children

 Notas:
 - El logger se mockea globalmente en setup.ts (no repetimos mocks aquí).
 - Silenciamos console.error en el test que provoca el error para evitar ruido.
*/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'
import logger from '../services/logging'

// Componente auxiliar que lanza en render cuando shouldThrow=true
function Boom({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Boom!')
  return <div>Contenido OK</div>
}

const Fallback = <div>Fallback UI</div>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ErrorBoundary', () => {
  it('renderiza los children cuando no hay error', () => {
    render(
      <ErrorBoundary fallback={Fallback}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Contenido OK')).toBeInTheDocument()
  })

  it('muestra el fallback y registra logs cuando un hijo lanza', () => {
    // Silenciamos el aviso de React para no ensuciar la salida del test
    const spyConsole = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={Fallback}>
        <Boom />
      </ErrorBoundary>
    )

    expect(screen.getByText('Fallback UI')).toBeInTheDocument()
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error capturado por ErrorBoundary')
    )
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Detalles del error')
    )

    spyConsole.mockRestore()
  })

  it('al cambiar la key se remonta y vuelve a mostrar los children', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={Fallback}>
        <Boom />
      </ErrorBoundary>
    )
    // Primera pasada: lanza ⇒ fallback visible
    expect(screen.getByText('Fallback UI')).toBeInTheDocument()

    // En vez de unmount()+rerender(), cambiamos la key para forzar un "remontaje"
    rerender(
      <ErrorBoundary key="reset" fallback={Fallback}>
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Contenido OK')).toBeInTheDocument()
  })
})

