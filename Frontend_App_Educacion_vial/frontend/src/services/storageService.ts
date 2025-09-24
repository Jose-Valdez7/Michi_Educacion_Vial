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
  };

  static async saveUserData(userData: any) {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error guardando datos del usuario:', error);
    }
  }

  static async getUserData<T = any>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  static async saveProgress(progress: any) {
    try {
      await AsyncStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error guardando progreso:', error);
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
      ]);
    } catch (error) {
      console.error('Error limpiando datos:', error);
    }
  }
}
