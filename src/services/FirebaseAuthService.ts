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

const raw = import.meta.env.VITE_ADMIN_EMAILS ?? "";
const ADMIN_EMAILS = raw ? raw.split(",").map((s:string)=>s.trim().toLowerCase()).filter(Boolean) : [];

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
  if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return [Role.ADMIN];
  }
  

    // Delegamos la obtención de roles al servicio de base de datos.
    return this.databaseService.getUserRoles(user.uid);
  }
}