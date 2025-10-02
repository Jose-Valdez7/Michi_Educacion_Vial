import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressApi } from './progress';

const BICYCLE_PROGRESS_KEY = 'bicycle_progress_completed';
const BICYCLE_PENDING_SYNC_KEY = 'bicycle_pending_sync';

export class BicycleProgressService {
  static async isCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BICYCLE_PROGRESS_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking bicycle completion:', error);
      return false;
    }
  }

  static async markCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(BICYCLE_PROGRESS_KEY, 'true');
      await AsyncStorage.setItem(BICYCLE_PENDING_SYNC_KEY, 'true'); // Marcar para sincronización
    } catch (error) {
      console.error('❌ Error marking bicycle as completed:', error);
    }
  }

  static async syncWithServer(): Promise<boolean> {
    try {
      const isCompleted = await this.isCompleted();
      const needsSync = await AsyncStorage.getItem(BICYCLE_PENDING_SYNC_KEY) === 'true';

      if (isCompleted && needsSync) {
        try {
          // Obtener progreso actual del servidor
          const currentProgress = await ProgressApi.get();

          // Asegurarse de que completedGames es un array
          const currentCompletedGames = Array.isArray(currentProgress.completedGames)
            ? [...currentProgress.completedGames]
            : [];

          // Añadir las claves de bicicletas si no están ya presentes
          const keysToAdd = ['1_paseo_bici', '1_2', 'bicycle_completed'];
          const newCompletedGames = [...currentCompletedGames];
          let hasChanges = false;

          for (const key of keysToAdd) {
            if (!newCompletedGames.includes(key)) {
              newCompletedGames.push(key);
              hasChanges = true;
            }
          }

          if (hasChanges) {
            // Forzar una actualización completa del progreso
            await ProgressApi.update({
              ...currentProgress,
              completedGames: newCompletedGames
            });

            // Verificar que los cambios se hayan guardado
            const updatedProgress = await ProgressApi.get();

            // Marcar como sincronizado solo si la verificación fue exitosa
            if (keysToAdd.every(key => updatedProgress.completedGames.includes(key))) {
              await AsyncStorage.removeItem(BICYCLE_PENDING_SYNC_KEY);
              return true;
            } else {
              console.warn('❌ Verification failed, sync will be retried');
              return false;
            }
          } else {
            await AsyncStorage.removeItem(BICYCLE_PENDING_SYNC_KEY);
            return true;
          }
        } catch (apiError) {
          console.error('❌ API Error during sync:', apiError);
          throw apiError; // Relanzar para manejo externo
        }
      }

      return !needsSync; // Retorna true si no necesita sincronización
    } catch (error) {
      console.error('❌ Error syncing bicycle progress:', error);
      return false;
    }
  }

  static async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BICYCLE_PROGRESS_KEY);
      await AsyncStorage.removeItem(BICYCLE_PENDING_SYNC_KEY);
    } catch (error) {
      console.error('❌ Error resetting bicycle progress:', error);
    }
  }
}
