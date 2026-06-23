import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import lv from '@/locales/lv.json';
import { isAppLocale, type AppLocale } from '@/types/locale';

export function getDeviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return isAppLocale(code) ? code : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lv: { translation: lv },
  },
  lng: getDeviceLocale(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
