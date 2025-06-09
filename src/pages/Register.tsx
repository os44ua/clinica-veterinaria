import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/AuthService';
import { userService } from '../services/AuthService';
import { Role } from '../interfaces/IAuthService';
import logger from '../services/logging';
import dogIcon from '../assets/dog.png';

// Página de registro para nuevos usuarios de la clínica veterinaria
const Register: React.FC = () => {
  const { t } = useTranslation();
  
  // Estados locales del formulario
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Función para validar el formulario
  const validateForm = (): boolean => {
    setError('');

    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return false;
    }

    if (!email.includes('@')) {
      setError(t('auth.emailInvalid'));
      return false;
    }

    if (!password.trim()) {
      setError(t('auth.passwordRequired'));
      return false;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return false;
    }

    return true;
  };

  // Función para manejar el envío del formulario de registro
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.info(`Registrando nuevo usuario: ${email}`);
      
      // Crear nuevo usuario con Firebase Auth
      const userCredential = await authService.signUp(email, password);
      logger.info('Usuario registrado exitosamente');

      // Crear registro en la base de datos con roles iniciales
      await userService.setUserRoles(userCredential.user.uid, {
        email: userCredential.user.email,
        roles: { admin: false } // Por defecto todos los nuevos usuarios son clientes
      });

      // Obtener los roles del usuario después del registro
      const roles = await authService.getUserRoles(userCredential.user);
      
      setSuccess(t('auth.registerSuccess'));
      
      // Esperar 2 segundos antes de redireccionar
      setTimeout(() => {
        // Redireccionar según el rol del usuario
        if (roles.includes(Role.ADMIN)) {
          navigate('/adminvets');
        } else if (roles.includes(Role.VETERINARIO)) {
          navigate('/perfilveterinario');
        } else {
          navigate('/perfilcliente');
        }
      }, 2000);

    } catch (error: any) {
      logger.error(`Error en registro: ${error.message}`);
      setError(error.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    setError('');
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
          <h2 className="text-2xl font-bold text-gray-800">{t('auth.registerTitle')}</h2>
          <p className="text-gray-600 mt-2">{t('auth.registerSubtitle')}</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Mostrar errores si existen */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{t('auth.registerError')}</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button 
                  type="button" 
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Mostrar mensaje de éxito */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-sm">{t('auth.registerSuccessTitle')}</h3>
                  <p className="text-sm mt-1">{success}</p>
                </div>
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
              disabled={loading}
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
              disabled={loading}
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">{t('auth.passwordMinLengthHint')}</p>
          </div>

          {/* Campo de confirmación de contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t('auth.passwordPlaceholder')}
              disabled={loading}
              className="form-input"
            />
          </div>
          
          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? t('auth.registering') : t('auth.registerButton')}
          </button>
          
          {/* Enlace para login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.hasAccount')}{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="text-cyan-500 hover:text-cyan-600 underline font-medium"
                disabled={loading}
              >
                {t('auth.loginLink')}
              </button>
            </p>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">{t('auth.importantInfo')}</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {t('auth.defaultClientRole')}
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {t('auth.canManagePets')}
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {t('auth.adminCanChangeRole')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;