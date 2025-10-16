/**
 * i18n Configuration
 * Sets up i18next for internationalization
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en';
import tr from './locales/tr';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
    tr: {
      translation: tr,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

