import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isAppLocale,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from '@/types/locale';

export async function loadSavedLocale(): Promise<AppLocale | null> {
  const raw = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  if (!raw || !isAppLocale(raw)) return null;
  return raw;
}

export async function saveLocale(locale: AppLocale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
