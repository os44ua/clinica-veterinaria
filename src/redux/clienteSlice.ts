import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import logger from '../services/logging';

// Interfaz para los datos del cliente
export interface ClienteData {
  uid?: string; // ID único del cliente
  nombre: string; // Nombre del cliente
  apellidos: string; // Apellidos del cliente
  dni: string; // Documento de identidad
  telefono: string; // Número de teléfono
  email?: string; // Correo electrónico
  direccion?: string; // Dirección completa
  fechaNacimiento?: string; // Fecha de nacimiento
}

// Interfaz para el estado del slice de cliente
interface ClienteState {
  data: ClienteData | null; // Datos del cliente actual
  loading: boolean; // Si se están cargando datos
  error: string | null; // Mensaje de error si existe
  updateLoading: boolean; // Si se está actualizando información
}

// Estado inicial del slice de cliente
const initialState: ClienteState = {
  data: null,
  loading: false,
  error: null,
  updateLoading: false,
};

// Thunk asíncrono para obtener datos del cliente desde Firebase
export const fetchClienteData = createAsyncThunk(
  'cliente/fetchData',
  async (uid: string, { rejectWithValue }) => {
    try {
      logger.info(`Obteniendo datos del cliente para UID: ${uid}`);
      
      const db = getDatabase();
      const clienteRef = ref(db, `users/${uid}/perfil`);
      const snapshot = await get(clienteRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        logger.info('Datos del cliente obtenidos exitosamente');
        return { uid, ...data } as ClienteData;
      } else {
        // Si no hay datos, retornar perfil vacío
        logger.warn('No se encontraron datos del cliente, retornando perfil vacío');
        return {
          uid,
          nombre: '',
          apellidos: '',
          dni: '',
          telefono: '',
          direccion: '',
          fechaNacimiento: ''
        } as ClienteData;
      }
    } catch (error: any) {
      logger.error(`Error al obtener datos del cliente: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asíncrono para actualizar datos completos del cliente
export const updateClienteData = createAsyncThunk(
  'cliente/updateData',
  async (clienteData: ClienteData, { rejectWithValue }) => {
    try {
      logger.info(`Actualizando datos del cliente para UID: ${clienteData.uid}`);
      
      const db = getDatabase();
      const clienteRef = ref(db, `users/${clienteData.uid}/perfil`);
      
      // Excluir uid del objeto que se guarda en Firebase
      const { uid, ...dataToSave } = clienteData;
      await set(clienteRef, dataToSave);
      
      logger.info('Datos del cliente actualizados exitosamente');
      return clienteData;
    } catch (error: any) {
      logger.error(`Error al actualizar datos del cliente: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Thunk asíncrono para actualización parcial del cliente
export const partialUpdateCliente = createAsyncThunk(
  'cliente/partialUpdate',
  async ({ uid, updates }: { uid: string; updates: Partial<ClienteData> }, { rejectWithValue }) => {
    try {
      logger.info(`Actualización parcial para cliente UID: ${uid}`);
      
      const db = getDatabase();
      const clienteRef = ref(db, `users/${uid}/perfil`);
      
      await update(clienteRef, updates);
      
      logger.info('Datos del cliente actualizados parcialmente con éxito');
      return { uid, ...updates };
    } catch (error: any) {
      logger.error(`Error en actualización parcial: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

// Slice de Redux para manejar el estado del cliente
const clienteSlice = createSlice({
  name: 'cliente',
  initialState,
  reducers: {
    // Acción para limpiar datos del cliente
    clearClienteData: (state) => {
      logger.info('Limpiando datos del cliente');
      state.data = null;
      state.error = null;
    },
    
    // Acción para limpiar errores del cliente
    clearClienteError: (state) => {
      state.error = null;
    },
    
    // Acción para actualizar datos locales del cliente sin persistir
    updateLocalClienteData: (state, action: PayloadAction<Partial<ClienteData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Casos para obtener datos del cliente
      .addCase(fetchClienteData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClienteData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchClienteData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Casos para actualizar datos del cliente
      .addCase(updateClienteData.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateClienteData.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateClienteData.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      
      // Casos para actualización parcial
      .addCase(partialUpdateCliente.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(partialUpdateCliente.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.data) {
          state.data = { ...state.data, ...action.payload };
        }
      })
      .addCase(partialUpdateCliente.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Exportar acciones del slice
export const { clearClienteData, clearClienteError, updateLocalClienteData } = clienteSlice.actions;

// Exportar el reducer por defecto
export default clienteSlice.reducer;