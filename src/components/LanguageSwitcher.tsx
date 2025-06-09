import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng); // Debug log
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'es';

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
          currentLanguage === 'es' 
            ? 'bg-cyan-500 text-white shadow-md' 
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
          currentLanguage === 'en' 
            ? 'bg-cyan-500 text-white shadow-md' 
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;