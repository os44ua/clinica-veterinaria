// Roles como string 
export type Role = "ADMIN" | "USER" | "VETERINARIO";

export const Role = {
  ADMIN: "ADMIN" as const,
  USER: "USER" as const,
  VETERINARIO: "VETERINARIO" as const
};


export interface IAuthService {
  signIn(email: string, password: string): Promise<any>;
  signUp(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: any) => void): () => void;
  getCurrentUser(): any | null;
  getUserRoles(user: any): Promise<Role[]>;
}

