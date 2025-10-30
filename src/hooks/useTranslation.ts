import React from 'react';
import { Language, getCurrentLanguage, setLanguage as setGlobalLanguage, t, languages, useTranslation as useTranslationHook } from '../utils/i18n';

// Re-export the useTranslation from utils/i18n
export const useTranslation = useTranslationHook;

// Fallback export in case the main hook doesn't work
export const useTranslationFallback = () => {
  const [language, setCurrentLanguage] = React.useState<Language>(getCurrentLanguage());

  React.useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const translate = React.useCallback((key: string) => t(key, language), [language]);

  return {
    t: translate,
    language,
    setLanguage: setGlobalLanguage,
    languages
  };
};