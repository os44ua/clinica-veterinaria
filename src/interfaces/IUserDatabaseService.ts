import { Role } from './IAuthService';

export interface IUserDatabaseService {
  getUserRoles(uid: string): Promise<Role[]>;
  
  // Método para establecer roles de usuario (usado en registro)
  setUserRoles(uid: string, userData: { email: string; roles: { admin: boolean } }): Promise<void>;
  
  // Método para obtener todos los usuarios (para panel de administración)
  getAllUsers(): Promise<any[]>;
  
  // Método para actualizar estado de administrador
  updateUserAdminStatus(uid: string, isAdmin: boolean): Promise<void>;
}