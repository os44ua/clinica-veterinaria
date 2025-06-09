import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Role } from '../interfaces/IAuthService';
//import { Role } from '../services/IAuthService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, roles } = useContext(AuthContext);

  // Permite el acceso solo si el usuario está autenticado y tiene el rol ADMIN
  if (!user || !roles || !roles.includes(Role.ADMIN)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;