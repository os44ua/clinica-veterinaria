import { useAppDispatch, useAuth } from '../store/hooks';
import { authService } from '../services/AuthService';
import type { Role } from '../interfaces/IAuthService';
import logger from '../services/logging';
import { clearCitas } from '../redux/citaSlice';
import { createContext, useEffect, type ReactNode } from 'react';
import { clearUser, setLoading, setUser } from '../redux/userSlice';
import { clearClienteData } from '../redux/clienteSlice';
import { clearMascotas } from '../redux/mascotaSlice';

interface AuthContextProps {
  user: any | null;
  roles: Role[] | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({ 
  user: null, 
  roles: null,
  isAuthenticated: false,
  loading: true
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { firebaseUser, roles, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    logger.info('Setting up auth state listener');
    dispatch(setLoading(true));
    
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      logger.info(`Auth state changed: ${currentUser?.email || 'logged out'}`);
      
      if (currentUser) {
        try {
          const userRoles = await authService.getUserRoles(currentUser);
          dispatch(setUser({ user: currentUser, roles: userRoles }));
          logger.info(`User loaded with roles: ${userRoles.join(', ')}`);
        } catch (error) {
          logger.error('Error loading user roles:', error);
          dispatch(clearUser());
        }
      } else {
        // Limpiar todos los datos cuando el usuario se desloguea
        dispatch(clearUser());
        dispatch(clearClienteData());
        dispatch(clearMascotas());
        dispatch(clearCitas());
        logger.info('User logged out, clearing all data');
      }
    });

    return () => {
      logger.info('Cleaning up auth listener');
      unsubscribe();
    };
  }, [dispatch]);

  // Mostrar loading mientras se determina el estado de autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">🔄 Cargando...</div>
      </div>
    );
  }

  const contextValue: AuthContextProps = {
    user: firebaseUser,
    roles: roles,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};