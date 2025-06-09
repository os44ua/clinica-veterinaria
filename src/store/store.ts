import { configureStore } from '@reduxjs/toolkit';
import logger from '../services/logging';
import userSlice from '../redux/userSlice';
import clienteSlice from '../redux/clienteSlice';
import mascotaSlice from '../redux/mascotaSlice';
import citaSlice from '../redux/citaSlice';

// Middleware personalizado para logging
const loggingMiddleware = (store: any) => (next: any) => (action: any) => {
  logger.info(`Dispatching action: ${action.type}`);
  
  const result = next(action);
  
  logger.debug(`New state keys: ${Object.keys(store.getState()).join(', ')}`);
  return result;
};

export const store = configureStore({
  reducer: {
    user: userSlice,
    cliente: clienteSlice,
    mascota: mascotaSlice,
    cita: citaSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
       serializableCheck: false,
    }).concat(loggingMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;