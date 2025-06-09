export interface Usuario {
  uid: string;
  email: string;
  roles: {
    cliente?: boolean;
    veterinario?: boolean;
    admin?: boolean; 
  };
}
