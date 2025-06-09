import { FirebaseAuthService } from './FirebaseAuthService';
import { FirebaseDatabaseService } from './FirebaseDatabaseService';

// Instancia singleton del servicio de autenticación
export const authService = new FirebaseAuthService();

// Instancia singleton del servicio de base de datos de usuarios
export const userService = new FirebaseDatabaseService();