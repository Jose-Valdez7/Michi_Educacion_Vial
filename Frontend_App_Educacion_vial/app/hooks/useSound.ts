import { useCallback, useRef } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";

export const useSound = () => {
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = useCallback(async (soundFile: string) => {
    try {
      // En una implementación real, aquí cargarías archivos de sonido
      // Por ahora, usaremos sonidos del sistema o generaremos sonidos programáticamente
      
      // Para sonidos simples, podemos usar frecuencias del sistema
      if (Platform.OS === "ios") {
        // En iOS podríamos usar AudioServicesPlaySystemSound
        console.log(`Playing sound: ${soundFile}`);
      } else if (Platform.OS === "android") {
        // En Android podríamos usar Ringtone o MediaPlayer
        console.log(`Playing sound: ${soundFile}`);
      }
      
      // Para desarrollo, simplemente logueamos el sonido que se reproduciría
      console.log(`🔊 Sound: ${soundFile}`);
      
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, []);

  const playCorrectSound = useCallback(() => {
    playSound("correct");
  }, [playSound]);

  const playIncorrectSound = useCallback(() => {
    playSound("incorrect");
  }, [playSound]);

  const playTimeUpSound = useCallback(() => {
    playSound("timeUp");
  }, [playSound]);

  const playGameStartSound = useCallback(() => {
    playSound("gameStart");
  }, [playSound]);

  const playGameEndSound = useCallback(() => {
    playSound("gameEnd");
  }, [playSound]);

  return {
    playCorrectSound,
    playIncorrectSound,
    playTimeUpSound,
    playGameStartSound,
    playGameEndSound,
    playSound
  };
};
