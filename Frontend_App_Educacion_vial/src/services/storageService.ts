import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static KEYS = {
    USER_DATA: 'user_data',
    PROGRESS: 'progress',
    ALBUM: 'album',
    POINTS: 'points',
    UNLOCKED_LEVELS: 'unlocked_levels',
    COINS: 'coins',
    SHOP_ITEMS: 'shop_items',
    REGISTERED_USERS: 'registered_users',
    CURRENT_USER: 'current_user',
    COLORED_IMAGES: 'colored_images',
  } as const;

  static async saveUserData<T = unknown>(userData: T) {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      // Error guardando datos del usuario
    }
  }

  static async getUserData<T = unknown>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_DATA);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      return null;
    }
  }

  static async saveProgress<T = unknown>(progress: T) {
    try {
      await AsyncStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      // Error guardando progreso
    }
  }

  static async getProgress<T = unknown>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PROGRESS);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      return null;
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.USER_DATA,
        this.KEYS.PROGRESS,
        this.KEYS.ALBUM,
        this.KEYS.COINS,
        this.KEYS.SHOP_ITEMS,
        this.KEYS.CURRENT_USER,
        this.KEYS.COLORED_IMAGES,
      ]);
    } catch (error) {
      // Error limpiando datos
    }
  }
}
