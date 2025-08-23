/*
 Pruebas unitarias del componente FormularioDatosPersonales:
 - Render básico con datos pre-cargados (prefill)
 - Botón de guardar habilitado / deshabilitado según loading
 - Estado de carga: texto "Guardando..." y disabled
 - Edición de campos y envío: onSave recibe los valores actuales
Notas:
 - El logger y el icono se mockean globalmente en setup.ts (no se repiten aquí).
 - i18n: se usan las traducciones mínimas definidas en el mock global (setup.ts).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ClienteData } from '../redux/clienteSlice'
import FormularioDatosPersonales from '../components/FormularioDatosPersonales'

describe('FormularioDatosPersonales', () => {
  const mockData: ClienteData = {
    nombre: 'Juan',
    apellidos: 'Pérez',
    dni: '12345678A',
    telefono: '+34 666 777 888',
    direccion: 'Calle Ejemplo 123',
    fechaNacimiento: '1990-01-01',
  }

  const renderWith = (props: {
    data: ClienteData | null
    loading?: boolean
    onSave?: (data: ClienteData) => void
  }) => {
    const onSave = props.onSave ?? vi.fn()
    const loading = props.loading ?? false
    render(
      <FormularioDatosPersonales
        data={props.data}
        onSave={onSave}
        loading={loading}
      />
    )
    return { onSave }
  }

  it('renderiza el formulario con datos pre-cargados', () => {
    renderWith({ data: mockData })
    expect(screen.getByText('Mis Datos Personales')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12345678A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+34 666 777 888')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Calle Ejemplo 123')).toBeInTheDocument()
  })

  it('muestra el botón de guardar habilitado cuando loading = false', () => {
    renderWith({ data: mockData, loading: false })
    const saveButton = screen.getByRole('button', { name: 'Guardar' })
    expect(saveButton).toBeInTheDocument()
    expect(saveButton).not.toBeDisabled()
  })

  it('muestra estado de carga cuando loading = true', () => {
    renderWith({ data: mockData, loading: true })
    const loadingButton = screen.getByRole('button', { name: 'Guardando...' })
    expect(loadingButton).toBeInTheDocument()
    expect(loadingButton).toBeDisabled()
  })

  it('permite editar campos cuando no hay datos iniciales y envía valores actuales en onSave', () => {
    const { onSave } = renderWith({ data: null })
    // placeholders/labels según mock global de i18n (setup.ts)
    const nombreInput = screen.getByPlaceholderText('Tu nombre')
    const apellidosInput = screen.getByPlaceholderText('Tus apellidos')
    const direccionInput = screen.getByPlaceholderText('Tu dirección completa')
    const dniInput = screen.getByPlaceholderText('12345678A')
    // Algunos formularios usan "Fecha de Nacimiento" como label
    // Si el componente la incluye, la rellenamos; si no, este bloque no falla.
    const birthLabel = screen.queryByLabelText('Fecha de Nacimiento') as HTMLInputElement | null
    fireEvent.change(nombreInput, { target: { value: 'Pedro' } })
    fireEvent.change(apellidosInput, { target: { value: 'Gómez' } })
    fireEvent.change(direccionInput, { target: { value: 'Calle Nueva 45' } })
    fireEvent.change(dniInput, { target: { value: 'X1234567' } })
    if (birthLabel) {
      fireEvent.change(birthLabel, { target: { value: '1995-05-20' } })
      expect(birthLabel.value).toBe('1995-05-20')
    }
    expect(nombreInput).toHaveValue('Pedro')
    expect(apellidosInput).toHaveValue('Gómez')
    expect(direccionInput).toHaveValue('Calle Nueva 45')
    expect(dniInput).toHaveValue('X1234567')

    // Enviar
    const saveButton = screen.getByRole('button', { name: 'Guardar' })
    fireEvent.click(saveButton)

    // onSave debe recibir el objeto con los valores actuales (parcial o completo, según implementación)
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Pedro',
        apellidos: 'Gómez',
        direccion: 'Calle Nueva 45',
        dni: 'X1234567',
      })
    )
  })

  it('permite modificar un campo con datos iniciales y envía el cambio', () => {
    const { onSave } = renderWith({ data: mockData })
    const apellidosInput = screen.getByDisplayValue('Pérez')
    fireEvent.change(apellidosInput, { target: { value: 'López' } })
    expect(apellidosInput).toHaveValue('López')
    const saveButton = screen.getByRole('button', { name: 'Guardar' })
    fireEvent.click(saveButton)
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ apellidos: 'López' }))
  })
})
