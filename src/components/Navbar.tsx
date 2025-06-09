import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/hooks';
import { authService } from '../services/AuthService';
import { Role } from '../interfaces/IAuthService';
import LanguageSwitcher from './LanguageSwitcher';
import logger from '../services/logging';

// Componente de navegación principal para la clínica veterinaria
const Navbar: React.FC = () => {
  // Usar Redux hooks en lugar de AuthContext
  const { firebaseUser, roles } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Función para cerrar sesión del usuario
  const handleLogout = async () => {
    try {
      logger.info('Cerrando sesión');
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
    }
  };

  // Determinar el panel según el rol con traducciones
  const getPrimaryDashboard = () => {
    if (roles?.includes(Role.ADMIN)) {
      return { link: '/adminvets', text: t('navbar.adminPanel') };
    } else if (roles?.includes(Role.VETERINARIO)) {
      return { link: '/perfilveterinario', text: t('navbar.vetPanel') };
    } else {
      return { link: '/perfilcliente', text: t('navbar.clientPanel') };
    }
  };

  const primaryDashboard = getPrimaryDashboard();

  return (
    <nav className="bg-cyan-200 px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Logo de la clínica */}
        <Link to="/" className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
          {t('navbar.title')}
        </Link>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Lista de navegación */}
          <ul className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-700">
            <li>
              <Link to="/" className="hover:text-cyan-700">
                {t('navbar.home')}
              </Link>
            </li>

            {/* Enlace al panel según rol */}
            {firebaseUser && (
              <li>
                <Link to={primaryDashboard.link} className="hover:text-cyan-700">
                  {primaryDashboard.text}
                </Link>
              </li>
            )}

            {/* Autenticación: login / registro */}
            {!firebaseUser && (
              <>
                <li>
                  <Link to="/login" className="hover:text-cyan-700">
                    {t('navbar.login')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-cyan-700">
                    {t('navbar.register')}
                  </Link>
                </li>
              </>
            )}

            {/* Información del usuario autenticado */}
            {firebaseUser && (
              <>
                <li>
                  <span className="text-gray-600 text-sm">
                    {t('navbar.hello')}, {firebaseUser.email}
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-100 border text-sm"
                  >
                    {t('navbar.logout')}
                  </button>
                </li>
              </>
            )}
          </ul>

           <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;