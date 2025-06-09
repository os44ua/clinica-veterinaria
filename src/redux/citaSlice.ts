import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getDatabase, ref, get, set, push, update, remove } from 'firebase/database';
import logger from '../services/logging';

export interface CitaData {
  id?: string;
  clienteUid: string;
  clienteEmail: string;
  clienteNombre?: string;     
  clienteApellidos?: string;  
  mascotaId: string;
  mascotaNombre: string;
  veterinarioUid?: string;
  veterinarioNombre?: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string;
  creadaEn: string;
  actualizadaEn?: string;
}

interface CitaState {
 citas: CitaData[];
 loading: boolean;
 error: string | null;
 addLoading: boolean;
 updateLoading: boolean;
 deleteLoading: boolean;
 filtros: {
   estado?: string;
   fecha?: string;
   veterinario?: string;
 };
}

const initialState: CitaState = {
 citas: [],
 loading: false,
 error: null,
 addLoading: false,
 updateLoading: false,
 deleteLoading: false,
 filtros: {},
};

// Thunks asíncronos para operaciones CRUD de citas

// Obtener todas las citas de un cliente específico
export const fetchCitasCliente = createAsyncThunk(
 'cita/fetchCitasCliente',
 async (clienteUid: string, { rejectWithValue }) => {
   try {
     logger.info(`Obteniendo citas para cliente UID: ${clienteUid}`);
     const db = getDatabase();
     const citasRef = ref(db, `citas`);
     const snapshot = await get(citasRef);
     
     if (snapshot.exists()) {
       const data = snapshot.val();
       const citas = Object.keys(data)
         .filter(id => data[id].clienteUid === clienteUid)
         .map(id => ({
           id,
           ...data[id]
         })) as CitaData[];
       
       logger.info(`Encontradas ${citas.length} citas para el cliente`);
       return citas;
     } else {
       logger.info('No se encontraron citas');
       return [];
     }
   } catch (error: any) {
     logger.error(`Error al obtener citas:`, error);
     return rejectWithValue(error.message);
   }
 }
);

// Obtener todas las citas asignadas a un veterinario específico
export const fetchCitasVeterinario = createAsyncThunk(
 'cita/fetchCitasVeterinario',
 async (veterinarioUid: string, { rejectWithValue }) => {
   try {
     logger.info(`Obteniendo citas para veterinario UID: ${veterinarioUid}`);
     const db = getDatabase();
     const citasRef = ref(db, `citas`);
     const snapshot = await get(citasRef);
     
     if (snapshot.exists()) {
       const data = snapshot.val();
       const citas = Object.keys(data)
         .filter(id => data[id].veterinarioUid === veterinarioUid)
         .map(id => ({
           id,
           ...data[id]
         })) as CitaData[];
       
       logger.info(`Encontradas ${citas.length} citas para el veterinario`);
       return citas;
     } else {
       logger.info('No se encontraron citas para el veterinario');
       return [];
     }
   } catch (error: any) {
     logger.error(`Error al obtener citas del veterinario:`, error);
     return rejectWithValue(error.message);
   }
 }
);

// Agregar una nueva cita
export const addCita = createAsyncThunk(
 'cita/addCita',
 async (citaData: Omit<CitaData, 'id' | 'creadaEn'>, { rejectWithValue }) => {
   try {
     logger.info(`Añadiendo nueva cita para mascota: ${citaData.mascotaNombre}`);
     const db = getDatabase();
     const citasRef = ref(db, `citas`);
     
     const citaCompleta = {
       ...citaData,
       creadaEn: new Date().toISOString(),
       estado: 'pendiente' as const
     };
     
     const newCitaRef = push(citasRef);
     await set(newCitaRef, citaCompleta);
     
     const newCita: CitaData = {
       id: newCitaRef.key!,
       ...citaCompleta
     };
     
     logger.info(`Cita añadida exitosamente con ID: ${newCita.id}`);
     return newCita;
   } catch (error: any) {
     logger.error(`Error al añadir cita:`, error);
     return rejectWithValue(error.message);
   }
 }
);

// Actualizar una cita completa
export const updateCita = createAsyncThunk(
 'cita/updateCita',
 async (citaData: CitaData, { rejectWithValue }) => {
   try {
     logger.info(`Actualizando cita: ${citaData.id}`);
     const db = getDatabase();
     const citaRef = ref(db, `citas/${citaData.id}`);
     
     const { id, ...dataToSave } = citaData;
     await update(citaRef, {
       ...dataToSave,
       actualizadaEn: new Date().toISOString()
     });
     
     logger.info('Cita actualizada exitosamente');
     return { ...citaData, actualizadaEn: new Date().toISOString() };
   } catch (error: any) {
     logger.error(`Error al actualizar cita:`, error);
     return rejectWithValue(error.message);
   }
 }
);

// Actualizar solo el estado de una cita
export const updateEstadoCita = createAsyncThunk(
 'cita/updateEstado',
 async ({ id, estado, observaciones }: { id: string; estado: CitaData['estado']; observaciones?: string }, { rejectWithValue }) => {
   try {
     logger.info(`Actualizando estado de cita: ${id} a ${estado}`);
     const db = getDatabase();
     const citaRef = ref(db, `citas/${id}`);
     
     const updates: any = {
       estado,
       actualizadaEn: new Date().toISOString()
     };
     
     if (observaciones) {
       updates.observaciones = observaciones;
     }
     
     await update(citaRef, updates);
     
     logger.info('Estado de cita actualizado exitosamente');
     return { id, estado, observaciones, actualizadaEn: updates.actualizadaEn };
   } catch (error: any) {
     logger.error(`Error al actualizar estado de cita:`, error);
     return rejectWithValue(error.message);
   }
 }
);

// Eliminar una cita
export const deleteCita = createAsyncThunk(
 'cita/deleteCita',
 async (citaId: string, { rejectWithValue }) => {
   try {
     logger.info(`Eliminando cita: ${citaId}`);
     const db = getDatabase();
     const citaRef = ref(db, `citas/${citaId}`);
     
     await remove(citaRef);
     
     logger.info('Cita eliminada exitosamente');
     return citaId;
   } catch (error: any) {
     logger.error(`Error al eliminar cita:`, error);
     return rejectWithValue(error.message);
   }
 }
);

const citaSlice = createSlice({
 name: 'cita',
 initialState,
 reducers: {
   // Limpiar todas las citas del estado
   clearCitas: (state) => {
     logger.info('Limpiando datos de citas');
     state.citas = [];
     state.error = null;
   },
   
   // Limpiar errores de citas
   clearCitaError: (state) => {
     state.error = null;
   },
   
   // Establecer filtros para las citas
   setFiltros: (state, action: PayloadAction<Partial<CitaState['filtros']>>) => {
     state.filtros = { ...state.filtros, ...action.payload };
   },
   
   // Limpiar todos los filtros
   clearFiltros: (state) => {
     state.filtros = {};
   },
 },
 extraReducers: (builder) => {
   builder
     // Casos para obtener citas de cliente
     .addCase(fetchCitasCliente.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchCitasCliente.fulfilled, (state, action) => {
       state.loading = false;
       state.citas = action.payload;
       state.error = null;
     })
     .addCase(fetchCitasCliente.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload as string;
     })
     
     // Casos para obtener citas de veterinario
     .addCase(fetchCitasVeterinario.pending, (state) => {
       state.loading = true;
       state.error = null;
     })
     .addCase(fetchCitasVeterinario.fulfilled, (state, action) => {
       state.loading = false;
       state.citas = action.payload;
       state.error = null;
     })
     .addCase(fetchCitasVeterinario.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload as string;
     })
     
     // Casos para añadir cita
     .addCase(addCita.pending, (state) => {
       state.addLoading = true;
       state.error = null;
     })
     .addCase(addCita.fulfilled, (state, action) => {
       state.addLoading = false;
       state.citas.push(action.payload);
       state.error = null;
     })
     .addCase(addCita.rejected, (state, action) => {
       state.addLoading = false;
       state.error = action.payload as string;
     })
     
     // Casos para actualizar cita completa
     .addCase(updateCita.pending, (state) => {
       state.updateLoading = true;
       state.error = null;
     })
     .addCase(updateCita.fulfilled, (state, action) => {
       state.updateLoading = false;
       const index = state.citas.findIndex(c => c.id === action.payload.id);
       if (index !== -1) {
         state.citas[index] = action.payload;
       }
       state.error = null;
     })
     .addCase(updateCita.rejected, (state, action) => {
       state.updateLoading = false;
       state.error = action.payload as string;
     })
     
     // Casos para actualizar estado de cita
     .addCase(updateEstadoCita.pending, (state) => {
       state.updateLoading = true;
       state.error = null;
     })
     .addCase(updateEstadoCita.fulfilled, (state, action) => {
       state.updateLoading = false;
       const { id, estado, observaciones, actualizadaEn } = action.payload;
       const index = state.citas.findIndex(c => c.id === id);
       if (index !== -1) {
         state.citas[index] = {
           ...state.citas[index],
           estado,
           observaciones: observaciones || state.citas[index].observaciones,
           actualizadaEn
         };
       }
       state.error = null;
     })
     .addCase(updateEstadoCita.rejected, (state, action) => {
       state.updateLoading = false;
       state.error = action.payload as string;
     })
     
     // Casos para eliminar cita
     .addCase(deleteCita.pending, (state) => {
       state.deleteLoading = true;
       state.error = null;
     })
     .addCase(deleteCita.fulfilled, (state, action) => {
       state.deleteLoading = false;
       state.citas = state.citas.filter(c => c.id !== action.payload);
       state.error = null;
     })
     .addCase(deleteCita.rejected, (state, action) => {
       state.deleteLoading = false;
       state.error = action.payload as string;
     });
 },
});

// Exportar acciones del slice
export const { 
 clearCitas, 
 clearCitaError, 
 setFiltros, 
 clearFiltros 
} = citaSlice.actions;

// Exportar el reducer por defecto
export default citaSlice.reducer;