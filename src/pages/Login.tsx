import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAuth } from '../store/hooks';
import { loginUser, clearError } from '../redux/userSlice';
import { Role } from '../interfaces/IAuthService';
import logger from '../services/logging';
import dogIcon from '../assets/dog.png';

// Página de inicio de sesión para la clínica veterinaria
const Login: React.FC = () => {
  const { t } = useTranslation();
  
  // Estados locales del formulario
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  // Hooks de Redux para el manejo del estado
  const dispatch = useAppDispatch();
  const { 
    loginLoading,
    error, 
    isAuthenticated, 
    roles 
  } = useAuth();
  const navigate = useNavigate();

  // Función para redireccionar según el rol del usuario
  const redirectBasedOnRole = (userRoles: Role[]) => {
    logger.info(`Redirigiendo usuario con roles: ${userRoles.join(', ')}`);
    
    if (userRoles.includes(Role.ADMIN)) {
      logger.info('Redirigiendo a panel admin');
      navigate('/adminvets');
    } else if (userRoles.includes(Role.VETERINARIO)) {
      logger.info('Redirigiendo a panel veterinario');
      navigate('/perfilveterinario');
    } else {
      logger.info('Redirigiendo a panel cliente');
      navigate('/perfilcliente');
    }
  };

  // Efecto para redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && roles && roles.length > 0) {
      logger.info('Usuario ya autenticado, redirigiendo automáticamente');
      redirectBasedOnRole(roles);
    }
  }, [isAuthenticated, roles]);

  // Efecto para limpiar errores cuando se desmonte el componente
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Función para validar el formulario antes del envío
  const validateForm = (): boolean => {
    setValidationError('');
    
    if (!email.trim()) {
      setValidationError(t('auth.emailRequired'));
      return false;
    }
    
    if (!email.includes('@')) {
      setValidationError(t('auth.emailInvalid'));
      return false;
    }
    
    if (!password.trim()) {
      setValidationError(t('auth.passwordRequired'));
      return false;
    }
    
    if (password.length < 6) {
      setValidationError(t('auth.passwordMinLength'));
      return false;
    }
    
    return true;
  };

  // Función para manejar el envío del formulario
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setValidationError('');
    dispatch(clearError());
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      logger.warn('Validación de formulario falló');
      return;
    }

    logger.info(`Intentando login para: ${email}`);
    
    try {
      // Ejecutar acción de login con Redux
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      logger.info('Login exitoso');
      logger.info('Resultado del login:');
      
      // Verificar que tenemos roles válidos
      if (result && result.roles && result.roles.length > 0) {
        logger.info('Redirigiendo según roles obtenidos');
        redirectBasedOnRole(result.roles);
      } else {
        logger.error('No se obtuvieron roles válidos del login');
        setValidationError('Error: No se pudieron cargar los roles del usuario');
      }
      
    } catch (error: any) {
      logger.error(`Login falló con error: ${error}`);
      // El error ya se maneja automáticamente en el slice de Redux
      // No redirigir en caso de error
    }
  };

  // Función para limpiar todos los errores
  const clearAllErrors = () => {
    setValidationError('');
    dispatch(clearError());
  };

  // Función para ir a registro (solo si no estamos logueando)
  const goToRegister = () => {
    if (!loginLoading) {
      logger.info('Navegando a página de registro');
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Logo de la clínica */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src={dogIcon} 
              alt="Veterinary Clinic Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t('auth.loginTitle')}</h2>
          <p className="text-gray-600 mt-2">{t('auth.loginSubtitle')}</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Mostrar errores si existen */}
          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{t('auth.loginError')}</h3>
                  <p className="text-sm mt-1">{validationError || error}</p>
                </div>
                <button 
                  type="button" 
                  onClick={clearAllErrors}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="form-label">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.emailPlaceholder')}
              disabled={loginLoading}
              className="form-input"
            />
          </div>
          
          {/* Campo de contraseña */}
          <div>
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.passwordPlaceholder')}
              disabled={loginLoading}
              className="form-input"
            />
          </div>
          
          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loginLoading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loginLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                {t('auth.logging')}
              </div>
            ) : (
              t('auth.loginButton')
            )}
          </button>
          
          {/* Enlace para registro */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <button 
                type="button" 
                onClick={goToRegister}
                disabled={loginLoading}
                className="text-cyan-500 hover:text-cyan-600 underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.registerLink')}
              </button>
            </p>
          </div>
        </form>

       </div>
    </div>
  );
};

export default Login;