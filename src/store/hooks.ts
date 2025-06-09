import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Typed hooks para Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectores específicos para fácil uso
export const useAuth = () => useAppSelector((state) => state.user);
export const useCliente = () => useAppSelector((state) => state.cliente);
export const useMascotas = () => useAppSelector((state) => state.mascota);

// Selector combinado para verificar si el usuario está completamente cargado
export const useAuthStatus = () => {
  return useAppSelector((state) => ({
    isAuthenticated: state.user.isAuthenticated,
    loading: state.user.loading,
    user: state.user.firebaseUser,
    roles: state.user.roles,
    hasData: !!state.user.firebaseUser
  }));
};


export const useCitas = () => useAppSelector((state) => state.cita);