import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

import { FirebaseDatabaseService } from './FirebaseDatabaseService';
import { Role, type IAuthService } from '../interfaces/IAuthService';
import { app } from '../firebase/config';

const auth = getAuth(app);

export class FirebaseAuthService implements IAuthService {
  private databaseService: FirebaseDatabaseService;
  
  constructor() {
    this.databaseService = new FirebaseDatabaseService();
  }
  
  signIn(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  signUp(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  
  signOut(): Promise<void> {
    return signOut(auth);
  }
  
  onAuthStateChanged(callback: (user: any) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
  
  getCurrentUser(): any | null {
    return auth.currentUser;
  }
  
 async getUserRoles(user: any): Promise<Role[]> {
  // Para los usuarios admin por defecto
  if (user.email === 'olga.slepova87@gmail.com' || 
      user.email === 'admin@gmail.com') {
    return [Role.ADMIN];
  }
  

    // Delegamos la obtención de roles al servicio de base de datos.
    return this.databaseService.getUserRoles(user.uid);
  }
}