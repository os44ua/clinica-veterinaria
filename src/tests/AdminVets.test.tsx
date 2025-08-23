import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// --- Мок Firebase Realtime Database ---
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(() => 'mock-ref'),
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
}));

// --- Мок i18n 
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const tr: Record<string, string> = {
        'admin.title': 'Administración de Veterinarios',
        'admin.description': 'Gestiona usuarios y roles del sistema',
        'admin.loading': 'Cargando usuarios...',
        'admin.loadError': 'Error al cargar usuarios',
        'admin.noUsers': 'No hay usuarios registrados',
        'admin.usersList': 'Lista de usuarios',
        'admin.refresh': 'Actualizar',
        'admin.updating': 'Actualizando...',
        'admin.pendingChanges': `Cambios pendientes (${options?.count ?? 0})`,
        'admin.pendingChangesDesc': 'Los cambios no se han guardado aún',
        'admin.saveChanges': 'Guardar cambios',
        'admin.changesSaved': `Se guardaron ${options?.count ?? 0} cambios correctamente`,
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
        'errors.somethingWrong': '¡Algo salió mal!',
      };
      return tr[key] ?? key;
    },
  }),
}));


vi.mock('../assets/dog.png', () => ({ default: 'mocked-dog-icon.png' }));

vi.mock('../interfaces/IUsuario', () => ({}));

import AdminVets from '../pages/AdminVets';
import { get, set } from 'firebase/database';

const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', { writable: true, value: mockConfirm });

describe('AdminVets', () => {
  const mockUsers = {
    user1: { email: 'cliente@test.com', roles: { cliente: true } },
    user2: { email: 'vet@test.com', roles: { cliente: true, veterinario: true } },
    user3: { email: 'admin@test.com', roles: { cliente: true, admin: true } },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('muestra el estado de carga inicialmente', async () => {
   
    vi.mocked(get).mockResolvedValue({ exists: () => false, val: () => null } as any);

    render(<AdminVets />);
   
    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();

  
    await waitFor(() => {
      expect(screen.getByText('Administración de Veterinarios')).toBeInTheDocument();
    });
  });

  it('muestra mensaje cuando no hay usuarios', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => false, val: () => null } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
    });
  });

  it('muestra la lista de usuarios', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Lista de usuarios (3)')).toBeInTheDocument();
      expect(screen.getByText('cliente@test.com')).toBeInTheDocument();
      expect(screen.getByText('vet@test.com')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });
  });

  it('muestra headers de la tabla', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Usuario')).toBeInTheDocument();
      expect(screen.getByText('Rol actual')).toBeInTheDocument();
      expect(screen.getByText('Cambiar rol')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  it('tiene selects para cambiar roles', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(3);
    });
  });

  it('muestra botones de eliminar', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons).toHaveLength(3);
    });
  });

  it('muestra panel de cambios pendientes al modificar un rol', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

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

  it('permite cancelar cambios pendientes', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'VETERINARIO' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Cambios pendientes (1)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Cambios pendientes (1)')).not.toBeInTheDocument();
    });
  });

  it('confirma la eliminación de usuarios', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Eliminar')[0]);
    });

    expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining('cliente@test.com'));
  });

  it('maneja errores de carga', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Error de red'));

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
    });
  });

  it('muestra botón de actualizar', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });
  });

  it('muestra la sección de información de roles', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => false, val: () => null } as any);

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Información de roles')).toBeInTheDocument();
      expect(screen.getByText('Puede agendar citas y gestionar mascotas')).toBeInTheDocument();
      expect(screen.getByText('Puede gestionar citas y consultas médicas')).toBeInTheDocument();
      expect(screen.getByText('Acceso completo al sistema')).toBeInTheDocument();
    });
  });

  it('cierra mensajes de error', async () => {
    vi.mocked(get).mockRejectedValue(new Error('Error'));

    render(<AdminVets />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cerrar'));

    await waitFor(() => {
      expect(screen.queryByText('Error al cargar usuarios')).not.toBeInTheDocument();
    });
  });

  it('guarda cambios cuando hay pendientes', async () => {
    vi.mocked(get).mockResolvedValue({ exists: () => true, val: () => mockUsers } as any);
    vi.mocked(set).mockResolvedValue(undefined as any);

    render(<AdminVets />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'VETERINARIO' } });
    });

    fireEvent.click(await screen.findByText('Guardar cambios'));

    await waitFor(() => {
      expect(vi.mocked(set)).toHaveBeenCalled();
    });
  });
});
