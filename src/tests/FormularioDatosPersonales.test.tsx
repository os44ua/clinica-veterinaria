import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ClienteData } from '../redux/clienteSlice';
import FormularioDatosPersonales from '../components/FormularioDatosPersonales';

/*
 Test unitario del componente FormularioDatosPersonales.
 Verifica renderizado, estados de carga y edición de campos usando mocks del logger y datos ficticios.
 Los mocks aíslan el componente de dependencias externas para pruebas estables.
 */


// Mock del logger
vi.mock('../../services/logging', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('FormularioDatosPersonales', () => {
  const mockData: ClienteData = {
    nombre: 'Juan',
    apellidos: 'Pérez', 
    dni: '12345678A',
    telefono: '+34 666 777 888',
    direccion: 'Calle Ejemplo 123',
    fechaNacimiento: '1990-01-01'
  };

  it('debe renderizar el formulario correctamente', () => {
    const mockOnSave = vi.fn();
    
    render(
      <FormularioDatosPersonales 
        data={mockData} 
        onSave={mockOnSave} 
        loading={false} 
      />
    );

    // Verificar que se muestran los elementos del formulario
    expect(screen.getByText('Mis Datos Personales')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
  });

  it('debe mostrar el botón de guardar', () => {
    const mockOnSave = vi.fn();
    
    render(
      <FormularioDatosPersonales 
        data={mockData} 
        onSave={mockOnSave} 
        loading={false} 
      />
    );

    // CAMBIADO: Buscar por el texto exacto que devuelve el mock
    const saveButton = screen.getByRole('button', { name: 'Guardar' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('debe mostrar estado de carga cuando loading es true', () => {
    const mockOnSave = vi.fn();
    
    render(
      <FormularioDatosPersonales 
        data={mockData} 
        onSave={mockOnSave} 
        loading={true} 
      />
    );

    // CAMBIADO: Buscar por el texto exacto que devuelve el mock
    const loadingButton = screen.getByRole('button', { name: 'Guardando...' });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();
  });

  it('debe permitir editar los campos del formulario', () => {
    const mockOnSave = vi.fn();
    
    render(
      <FormularioDatosPersonales 
        data={null} 
        onSave={mockOnSave} 
        loading={false} 
      />
    );

    // CAMBIADO: Buscar por el placeholder exacto que devuelve el mock
    const nombreInput = screen.getByPlaceholderText('Tu nombre');
    fireEvent.change(nombreInput, { target: { value: 'Pedro' } });
    
    expect(nombreInput).toHaveValue('Pedro');
  });
});