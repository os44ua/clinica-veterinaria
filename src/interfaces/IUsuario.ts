export interface Usuario {
  uid: string;
  email: string;
  roles: {
    cliente?: boolean;
    veterinario?: boolean;
    admin?: boolean; 
  };

  nombre?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  dni?: string;
  fechaNacimiento?: string; // "YYYY-MM-DD"
  especialidad?: string;  
}
