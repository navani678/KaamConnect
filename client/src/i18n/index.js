import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import hi from './hi.json';
import te from './te.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kaamconnect_language',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
