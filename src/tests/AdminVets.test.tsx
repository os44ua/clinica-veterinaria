import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/*
 Tests unitarios del componente AdminVets.
 Verifica renderizado, carga de usuarios, cambio de roles, eliminación y estados de carga.
 */

// Mock de Firebase Database
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => 'mock-ref'),
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn()
}));

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'admin.title': 'Administración de Veterinarios',
        'admin.description': 'Gestiona usuarios y roles del sistema',
        'admin.loading': 'Cargando usuarios...',
        'admin.loadError': 'Error al cargar usuarios',
        'admin.noUsers': 'No hay usuarios registrados',
        'admin.usersList': 'Lista de usuarios',
        'admin.refresh': 'Actualizar',
        'admin.updating': 'Actualizando...',
        'admin.pendingChanges': `Cambios pendientes (${options?.count || 0})`,
        'admin.pendingChangesDesc': 'Los cambios no se han guardado aún',
        'admin.saveChanges': 'Guardar cambios',
        'admin.changesSaved': `Se guardaron ${options?.count || 0} cambios correctamente`,
        'admin.saveChangesError': 'Error al guardar los cambios',
        'admin.confirmDelete': `¿Estás seguro de eliminar a ${options?.email}`,
        'admin.userDeleted': `Usuario ${options?.email} eliminado correctamente`,
        'admin.deleteError': `Error al eliminar usuario ${options?.email}`,
        'admin.table.user': 'Usuario',
        'admin.table.currentRole': 'Rol actual',
        'admin.table.changeRole': 'Cambiar rol',
        'admin.table.actions': 'Acciones',
        'admin.roles.client': 'Cliente',
        'admin.roles.vet': 'Veterinario', 
        'admin.roles.admin': 'Administrador',
        'admin.roles.unknown': 'Desconocido',
        'admin.rolesInfo.title': 'Información de roles',
        'admin.rolesInfo.clientDesc': 'Puede agendar citas y gestionar mascotas',
        'admin.rolesInfo.vetDesc': 'Puede gestionar citas y consultas médicas',
        'admin.rolesInfo.adminDesc': 'Acceso completo al sistema',
        'forms.save': 'Guardar',
        'forms.saving': 'Guardando...',
        'forms.cancel': 'Cancelar',
        'forms.delete': 'Eliminar',
        'forms.deleting': 'Eliminando...',
        'forms.close': 'Cerrar',
        'errors.somethingWrong': '¡Algo salió mal!'
      };
      
      return translations[key] || key;
    }
  })
}));

// Mock del dogIcon
vi.mock('../assets/dog.png', () => ({
  default: 'mocked-dog-icon.png'
}));

// Mock del interface Usuario
vi.mock('../interfaces/IUsuario', () => ({}));

import AdminVets from '../pages/AdminVets';
import { getDatabase, ref, get, set, remove } from 'firebase/database';

// Mock de window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm
});

describe('AdminVets', () => {
  const mockUsers = {
    'user1': {
      email: 'cliente@test.com',
      roles: { cliente: true }
    },
    'user2': {
      email: 'vet@test.com', 
      roles: { cliente: true, veterinario: true }
    },
    'user3': {
      email: 'admin@test.com',
      roles: { cliente: true, admin: true }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('debe mostrar estado de carga inicialmente', () => {
    // Mock que retorna una promesa que no se resuelve inmediatamente
    vi.mocked(get).mockReturnValue(new Promise(() => {}));

    render(<AdminVets />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  it('debe renderizar el título después de cargar', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => false,
      val: () => null
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Administración de Veterinarios')).toBeInTheDocument();
      expect(screen.getByText('Gestiona usuarios y roles del sistema')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay usuarios', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => false,
      val: () => null
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
    });
  });

  it('debe mostrar la lista de usuarios', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Lista de usuarios (3)')).toBeInTheDocument();
      expect(screen.getByText('cliente@test.com')).toBeInTheDocument();
      expect(screen.getByText('vet@test.com')).toBeInTheDocument(); 
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });
  });

  it('debe mostrar los roles en la tabla', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      // Verificar headers de la tabla
      expect(screen.getByText('Usuario')).toBeInTheDocument();
      expect(screen.getByText('Rol actual')).toBeInTheDocument();
      expect(screen.getByText('Cambiar rol')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  it('debe tener selectores para cambiar roles', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(3); // Un select por cada usuario
    });
  });

  it('debe mostrar botones de eliminar', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons).toHaveLength(3); // Un botón por cada usuario
    });
  });

  it('debe mostrar cambios pendientes al modificar un rol', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'VETERINARIO' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Cambios pendientes (1)')).toBeInTheDocument();
      expect(screen.getByText('Guardar cambios')).toBeInTheDocument();
    });
  });

  it('debe poder cancelar cambios pendientes', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    // Hacer un cambio
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'VETERINARIO' } });
    });

    // Verificar que aparece el panel
    await waitFor(() => {
      expect(screen.getByText('Cambios pendientes (1)')).toBeInTheDocument();
    });

    // Cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Verificar que desaparece
    await waitFor(() => {
      expect(screen.queryByText('Cambios pendientes (1)')).not.toBeInTheDocument();
    });
  });

  it('debe confirmar eliminación de usuarios', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('cliente@test.com')
    );
  });

  it('debe manejar errores de carga', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Error de red'));

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
    });
  });

  it('debe permitir refrescar la lista', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Actualizar');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('debe mostrar información de roles', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => false,
      val: () => null
    } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Información de roles')).toBeInTheDocument();
      expect(screen.getByText('Puede agendar citas y gestionar mascotas')).toBeInTheDocument();
      expect(screen.getByText('Puede gestionar citas y consultas médicas')).toBeInTheDocument();
      expect(screen.getByText('Acceso completo al sistema')).toBeInTheDocument();
    });
  });

  it('debe cerrar mensajes de error', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Error'));

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Error al cargar usuarios')).not.toBeInTheDocument();
    });
  });

  it('debe guardar cambios cuando hay cambios pendientes', async () => {
    vi.mocked(get).mockResolvedValue({
      exists: () => true,
      val: () => mockUsers
    } as any);
    vi.mocked(set).mockResolvedValue(undefined as any);

    render(<AdminVets />);

    // Hacer un cambio
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'VETERINARIO' } });
    });

    // Guardar cambios
    await waitFor(() => {
      const saveButton = screen.getByText('Guardar cambios');
      fireEvent.click(saveButton);
    });

    // Verificar que se llamó a set
    await waitFor(() => {
      expect(vi.mocked(set)).toHaveBeenCalled();
    });
  });
});