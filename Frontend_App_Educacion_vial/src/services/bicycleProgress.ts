import AsyncStorage from '@react-native-async-storage/async-storage';

const BICYCLE_PROGRESS_KEY = 'bicycle_progress_completed';

export class BicycleProgressService {
  static async isCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BICYCLE_PROGRESS_KEY);
      return value === 'true';
    } catch (error) {

      return false;
    }
  }

  static async markCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(BICYCLE_PROGRESS_KEY, 'true');
    } catch (error) {

    }
  }

  static async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BICYCLE_PROGRESS_KEY);
    } catch (error) {

    }
  }
}
