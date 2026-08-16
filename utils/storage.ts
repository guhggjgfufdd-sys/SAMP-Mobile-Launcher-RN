import AsyncStorage from '@react-native-async-storage/async-storage';

export const safeGetItem = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item === null || item === '') return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

export const safeSetItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
};

export const safeRemoveItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};
