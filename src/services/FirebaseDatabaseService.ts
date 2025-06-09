import { getDatabase, ref, get, set } from 'firebase/database';
import type { IUserDatabaseService } from '../interfaces/IUserDatabaseService';
import { Role } from '../interfaces/IAuthService';
import { app } from '../firebase/config';



export class FirebaseDatabaseService implements IUserDatabaseService {
  async getUserRoles(uid: string): Promise<Role[]> {
    const db = getDatabase(app);
    const rolesRef = ref(db, `users/${uid}/roles`);
    const snapshot = await get(rolesRef);
    
    if (snapshot.exists()) {
      const rolesData = snapshot.val();
      const roles: Role[] = [];
      if (rolesData.admin === true) {
        roles.push(Role.ADMIN);
      }
      if (rolesData.veterinario === true) {
      roles.push(Role.VETERINARIO);
         }
      // Aquí se pueden agregar otros roles según se requiera.
      if (roles.length === 0) {
        // Si no se ha asignado ningún rol, se asume el rol de usuario.
        roles.push(Role.USER);
      }
      return roles;
    }
    return [Role.USER];
  }

  // Método para establecer roles de usuario (usado en registro)
  async setUserRoles(uid: string, userData: { email: string; roles: { admin: boolean } }): Promise<void> {
    try {
      const db = getDatabase(app);
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, userData);
    } catch (error) {
      console.error('Error al establecer roles del usuario:', error);
      throw error;
    }
  }

  // Método para obtener todos los usuarios (para panel de administración)
  async getAllUsers(): Promise<any[]> {
    try {
      const db = getDatabase(app);
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const users: any[] = [];
        
        // Convertir objeto a array con UIDs
        Object.keys(usersData).forEach(uid => {
          users.push({
            uid,
            ...usersData[uid]
          });
        });
        
        return users;
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      return [];
    }
  }

  // Método para actualizar estado de administrador
  async updateUserAdminStatus(uid: string, isAdmin: boolean): Promise<void> {
    try {
      const db = getDatabase(app);
      const adminRef = ref(db, `users/${uid}/roles/admin`);
      await set(adminRef, isAdmin);
    } catch (error) {
      console.error('Error al actualizar estado de admin:', error);
      throw error;
    }
  }
}