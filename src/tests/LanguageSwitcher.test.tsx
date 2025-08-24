/*
 Pruebas unitarias de LanguageSwitcher:
 - Renderiza dos botones (ES, EN)
 - Resalta el idioma actual (bg-cyan-500) según i18n.language
 - Llama a i18n.changeLanguage('en' | 'es') al hacer click
 Notas:
 - i18n se mockea localmente con un objeto mutable para cambiar el idioma entre tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../components/LanguageSwitcher'

// Mock de i18n (react-i18next)
const mockChangeLanguage = vi.fn()
const i18nMock: { language?: string; changeLanguage: (lng: string) => void } = {
  language: 'es',
  changeLanguage: mockChangeLanguage,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: i18nMock }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  i18nMock.language = 'es'
})

describe('LanguageSwitcher', () => {
  it('renderiza botones y marca ES como activo por defecto (fallback)', () => {
    // si language es undefined, el componente cae a 'es' por defecto
    i18nMock.language = undefined
    render(<LanguageSwitcher />)

    const btnES = screen.getByRole('button', { name: 'ES' })
    const btnEN = screen.getByRole('button', { name: 'EN' })

    expect(btnES).toBeInTheDocument()
    expect(btnEN).toBeInTheDocument()

    expect(btnES).toHaveClass('bg-cyan-500')
    expect(btnEN).not.toHaveClass('bg-cyan-500')
  })

  it('llama a changeLanguage("en") al pulsar EN', () => {
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })

  it('llama a changeLanguage("es") al pulsar ES', () => {
    // empezamos en inglés para variar
    i18nMock.language = 'en'
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('es')
  })

  it('resalta EN cuando i18n.language = "en"', () => {
    i18nMock.language = 'en'
    render(<LanguageSwitcher />)

    const btnES = screen.getByRole('button', { name: 'ES' })
    const btnEN = screen.getByRole('button', { name: 'EN' })

    expect(btnEN).toHaveClass('bg-cyan-500')
    expect(btnES).not.toHaveClass('bg-cyan-500')
  })
})
