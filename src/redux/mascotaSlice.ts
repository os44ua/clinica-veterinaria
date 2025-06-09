import { createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import { getDatabase, ref, get, set, push, remove } from 'firebase/database';
import logger from '../services/logging';

export interface MascotaData {
  id?: string;
  nombre: string;
  especie: 'perro' | 'gato' | 'ave' | 'reptil' | 'otro';
  raza: string;
  edad: number;
  peso?: number;
  color?: string;
  chip?: string;
  genero: 'macho' | 'hembra';
  esterilizado?: boolean;
  observaciones?: string;
  fechaNacimiento?: string;
  clienteUid: string;
}

interface MascotaState {
  mascotas: MascotaData[];
  loading: boolean;
  error: string | null;
  addLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: MascotaState = {
  mascotas: [],
  loading: false,
  error: null,
  addLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// Async thunks
export const fetchMascotas = createAsyncThunk(
  'mascota/fetchMascotas',
  async (clienteUid: string, { rejectWithValue }) => {
    try {
      logger.info(`Fetching mascotas for cliente UID: ${clienteUid}`);
      const db = getDatabase();
      const mascotasRef = ref(db, `users/${clienteUid}/mascotas`);
      const snapshot = await get(mascotasRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const mascotas = Object.keys(data).map(id => ({
          id,
          ...data[id],
          clienteUid
        })) as MascotaData[];
        
        logger.info(`Found ${mascotas.length} mascotas`);
        return mascotas;
      } else {
        logger.info('No mascotas found');
        return [];
      }
    } catch (error: any) {
      logger.error(`Error fetching mascotas: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

export const addMascota = createAsyncThunk(
  'mascota/addMascota',
  async (mascotaData: Omit<MascotaData, 'id'>, { rejectWithValue }) => {
    try {
      logger.info(`Adding new mascota: ${mascotaData.nombre}`);
      const db = getDatabase();
      const mascotasRef = ref(db, `users/${mascotaData.clienteUid}/mascotas`);
      
      // Crear nuevo registro con ID automático
      const newMascotaRef = push(mascotasRef);
      const { clienteUid, ...dataToSave } = mascotaData;
      await set(newMascotaRef, dataToSave);
      
      const newMascota: MascotaData = {
        id: newMascotaRef.key!,
        ...mascotaData
      };
      
      logger.info(`Mascota added successfully with ID: ${newMascota.id}`);
      return newMascota;
    } catch (error: any) {
      logger.error(`Error adding mascota: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

export const updateMascota = createAsyncThunk(
  'mascota/updateMascota',
  async (mascotaData: MascotaData, { rejectWithValue }) => {
    try {
      logger.info(`Updating mascota: ${mascotaData.id}`);
      const db = getDatabase();
      const mascotaRef = ref(db, `users/${mascotaData.clienteUid}/mascotas/${mascotaData.id}`);
      
      // Excluir id y clienteUid del objeto que se guarda
      const { id, clienteUid, ...dataToSave } = mascotaData;
      await set(mascotaRef, dataToSave);
      
      logger.info('Mascota updated successfully');
      return mascotaData;
    } catch (error: any) {
      logger.error(`Error updating mascota: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMascota = createAsyncThunk(
  'mascota/deleteMascota',
  async ({ id, clienteUid }: { id: string; clienteUid: string }, { rejectWithValue }) => {
    try {
      logger.info(`Deleting mascota: ${id}`);
      const db = getDatabase();
      const mascotaRef = ref(db, `users/${clienteUid}/mascotas/${id}`);
      
      await remove(mascotaRef);
      
      logger.info('Mascota deleted successfully');
      return id;
    } catch (error: any) {
      logger.error(`Error deleting mascota: ${error.message}`);
      return rejectWithValue(error.message);
    }
  }
);

const mascotaSlice = createSlice({
  name: 'mascota',
  initialState,
  reducers: {
    clearMascotas: (state) => {
      logger.info('Clearing mascotas data');
      state.mascotas = [];
      state.error = null;
    },
    clearMascotaError: (state) => {
      state.error = null;
    },
    updateLocalMascota: (state, action: PayloadAction<{ id: string; updates: Partial<MascotaData> }>) => {
      const { id, updates } = action.payload;
      const index = state.mascotas.findIndex(m => m.id === id);
      if (index !== -1) {
        state.mascotas[index] = { ...state.mascotas[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch mascotas
      .addCase(fetchMascotas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMascotas.fulfilled, (state, action) => {
        state.loading = false;
        state.mascotas = action.payload;
        state.error = null;
      })
      .addCase(fetchMascotas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add mascota
      .addCase(addMascota.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addMascota.fulfilled, (state, action) => {
        state.addLoading = false;
        state.mascotas.push(action.payload);
        state.error = null;
      })
      .addCase(addMascota.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload as string;
      })
      
      // Update mascota
      .addCase(updateMascota.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateMascota.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.mascotas.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.mascotas[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMascota.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete mascota
      .addCase(deleteMascota.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteMascota.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.mascotas = state.mascotas.filter(m => m.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteMascota.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMascotas, clearMascotaError, updateLocalMascota } = mascotaSlice.actions;
export default mascotaSlice.reducer;