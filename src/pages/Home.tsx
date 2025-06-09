import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { Role } from '../interfaces/IAuthService';
import dogIcon from '../assets/dog.png';

// Página de inicio de la clínica veterinaria
const Home: React.FC = () => {
  const { user, roles } = useContext(AuthContext);
  const { t } = useTranslation();

  // Si el usuario está autenticado, mostrar panel personalizado
  if (user) {
    let panelLink = '';
    let panelText = '';
    let panelDescription = '';

    // Determinar el panel según el rol del usuario con traducciones
    if (roles?.includes(Role.ADMIN)) {
      panelLink = '/adminvets';
      panelText = t('home.adminPanel');
      panelDescription = t('home.adminDescription');
    } else if (roles?.includes(Role.VETERINARIO)) {
      panelLink = '/perfilveterinario';
      panelText = t('home.vetPanel');
      panelDescription = t('home.vetDescription');
    } else {
      panelLink = '/perfilcliente';
      panelText = t('home.clientPanel');
      panelDescription = t('home.clientDescription');
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl transform hover:scale-105 transition-transform duration-300">
          {/* Bienvenida al usuario autenticado */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <img 
                src={dogIcon} 
                alt="Veterinary Clinic Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t('home.welcomeBack', { email: user.email })}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('home.whatToDo')}
            </p>
          </div>

          {/* Información del panel disponible según el rol */}
          <div className="bg-cyan-500 rounded-lg p-6 text-white mb-6">
            <h2 className="text-2xl font-semibold mb-2">{panelText}</h2>
            <p className="text-cyan-100 mb-4">{panelDescription}</p>

            {/* Enlace al panel */}
            <Link
              to={panelLink}
              className="inline-flex items-center bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {t('home.goToPanel')}
            </Link>
          </div>

          {/* Rol actual */}
          <div className="text-center">
            <div className="inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-gray-600 text-sm mr-2">{t('home.currentRole')}:</span>
              <span className="font-semibold text-gray-800">{roles?.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario no está autenticado
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <img 
                src={dogIcon} 
                alt="Veterinary Clinic Logo" 
                className="w-28 h-28 object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Título y presentación */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('home.welcome')}
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>

            {/* Enlaces para iniciar sesión o registrarse */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center bg-cyan-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('navbar.login')}
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 transform hover:-translate-y-1"
              >
                {t('navbar.register')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;