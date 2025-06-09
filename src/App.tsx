import { BrowserRouter } from 'react-router-dom';
import { ReduxProvider } from './providers/ReduxProvider';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import './i18n'; // Importar configuración de i18n

// Componente principal de la aplicación de la clínica veterinaria
function App() {
  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">¡Algo salió mal!</h2>
            <p className="text-gray-700 mb-4">
              Ha ocurrido un error inesperado en la aplicación.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Recargar página
            </button>
          </div>
        </div>
      }
    >
      <ReduxProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              {/* Barra de navegación - ahora dentro del Router */}
              <Navbar />
              
              {/* Contenido principal con rutas */}
              <main>
                <AppRouter />
              </main>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
