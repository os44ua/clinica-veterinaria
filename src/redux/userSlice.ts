import logger from '../services/logging';
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../interfaces/IAuthService';
import { authService } from '../services/AuthService';

// Interfaz para el estado del usuario en la aplicación
interface UserState {
  firebaseUser: any | null; // Usuario de Firebase
  roles: Role[]; // Roles asignados al usuario
  isAuthenticated: boolean; // Si el usuario está autenticado
  loading: boolean; // Si se está cargando información
  error: string | null; // Mensaje de error si existe
  loginLoading: boolean; // Si se está procesando el login
  registerLoading: boolean; // Si se está procesando el registro
}

// Estado inicial del slice de usuario
const initialState: UserState = {
  firebaseUser: null,
  roles: [],
  isAuthenticated: false,
  loading: true,
  error: null,
  loginLoading: false,
  registerLoading: false,
};

// Thunk asíncrono para hacer login del usuario
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      logger.info(`Intentando login para email: ${email}`);
      
      // Hacer login con el servicio de autenticación
      const userCredential = await authService.signIn(email, password);
      
      // Obtener los roles del usuario
      const roles = await authService.getUserRoles(userCredential.user);
      
      logger.info(`Login exitoso para usuario: ${email} con roles: ${roles.join(', ')}`);
      
      return {
        user: userCredential.user,
        roles
      };
    } catch (error: any) {
      logger.error(`Login falló para email ${email}: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asíncrono para registrar un nuevo usuario
export const registerUser = createAsyncThunk(
  'user/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      logger.info(`Intentando registro para email: ${email}`);
      
      // Crear nuevo usuario con Firebase
      const userCredential = await authService.signUp(email, password);
      
      // Importar dinámicamente el servicio de usuario para evitar dependencias circulares
      const userService = (await import('../services/AuthService')).userService;
      
      // Establecer roles iniciales (cliente por defecto)
      await userService.setUserRoles(userCredential.user.uid, {
        email: userCredential.user.email,
        roles: { admin: false }
      });
      
      // Obtener los roles asignados
      const roles = await authService.getUserRoles(userCredential.user);
      
      logger.info(`Registro exitoso para usuario: ${email}`);
      
      return {
        user: userCredential.user,
        roles
      };
    } catch (error: any) {
      logger.error(`Registro falló para email ${email}: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asíncrono para cerrar sesión del usuario
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('Intentando cerrar sesión');
      await authService.signOut();
      logger.info('Cierre de sesión exitoso');
      return true;
    } catch (error: any) {
      logger.error(`Fallo al cerrar sesión: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asíncrono para cargar roles del usuario
export const loadUserRoles = createAsyncThunk(
  'user/loadRoles',
  async (user: any, { rejectWithValue }) => {
    try {
      logger.info(`Cargando roles para usuario: ${user.email}`);
      const roles = await authService.getUserRoles(user);
      logger.info(`Roles cargados: ${roles.join(', ')}`);
      return roles;
    } catch (error: any) {
      logger.error(`Fallo al cargar roles: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Slice de Redux para manejar el estado del usuario
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Acción para establecer usuario y roles
    setUser: (state, action: PayloadAction<{ user: any; roles: Role[] }>) => {
      state.firebaseUser = action.payload.user;
      state.roles = action.payload.roles;
      state.isAuthenticated = !!action.payload.user;
      state.loading = false;
      state.error = null;
    },
    
    // Acción para limpiar datos del usuario
    clearUser: (state) => {
      logger.info('Limpiando estado del usuario');
      state.firebaseUser = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    
    // Acción para establecer estado de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Acción para limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Acción para actualizar roles del usuario
    updateRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Casos para login de usuario
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.firebaseUser = action.payload.user;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload as string;
      })
      
      // Casos para registro de usuario
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.firebaseUser = action.payload.user;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload as string;
      })
      
      // Casos para cierre de sesión
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.firebaseUser = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para carga de roles
      .addCase(loadUserRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      .addCase(loadUserRoles.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Exportar acciones del slice
export const { setUser, clearUser, setLoading, clearError, updateRoles } = userSlice.actions;

// Exportar el reducer por defecto
export default userSlice.reducer;