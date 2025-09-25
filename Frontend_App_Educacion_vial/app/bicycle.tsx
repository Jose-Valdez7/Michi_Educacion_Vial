import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { colors } from '@/utils/colors';

type Option = {
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type Obstacle = {
  id: number;
  title: string;
  scenario: string;
  options: Option[];
};

const MAX_MISTAKES = 3;

const OBSTACLES: Obstacle[] = [
  {
    id: 1,
    title: 'Cruce peatonal',
    scenario:
      'Te acercas a un cruce y hay un semáforo en rojo. ¿Qué haces antes de continuar con tu bici?',
    options: [
      {
        text: 'Disminuyo la velocidad y respeto la luz roja hasta que cambie.',
        isCorrect: true,
        feedback: '¡Bien! Siempre hay que detenerse y respetar las señales luminosas.',
      },
      {
        text: 'Acelero para pasar rápido antes de que alguien me vea.',
        isCorrect: false,
        feedback: 'No es seguro. Saltarse el semáforo puede causar accidentes.',
      },
      {
        text: 'Bebo agua mientras espero que alguien me diga si puedo pasar.',
        isCorrect: false,
        feedback: 'Es mejor prestar atención a las señales y tomar la decisión correcta.',
      },
    ],
  },
  {
    id: 2,
    title: 'Cebra en la vía',
    scenario:
      'Ves a una persona esperando cruzar en el paso cebrado. ¿Qué debes hacer?',
    options: [
      {
        text: 'Detenerme y darle paso al peatón que ya está esperando.',
        isCorrect: true,
        feedback: 'Correcto, los peatones tienen prioridad en el paso cebrado.',
      },
      {
        text: 'Sigo mi camino porque voy en bicicleta y no soy un carro.',
        isCorrect: false,
        feedback: 'Todos debemos respetar la prioridad de paso del peatón.',
      },
      {
        text: 'Le digo que espere a que termine mi camino.',
        isCorrect: false,
        feedback: 'Debes detenerte y cederle el paso a la persona.',
      },
    ],
  },
  {
    id: 3,
    title: 'Piedra en el camino',
    scenario:
      'Aparece una piedra grande en la ciclovía. ¿Cuál es la mejor acción?',
    options: [
      {
        text: 'Me detengo con cuidado, bajo de la bici y retiro la piedra del camino.',
        isCorrect: true,
        feedback: 'Muy bien, así evitas caídas y ayudas a otras personas ciclistas.',
      },
      {
        text: 'Paso por encima a toda velocidad para quitarla rápido.',
        isCorrect: false,
        feedback: 'Podrías chocar y lastimarte. Mejor asegúrate y retírala con calma.',
      },
      {
        text: 'Ignoro la piedra y sigo por la mitad de la calle.',
        isCorrect: false,
        feedback: 'Salir a la calle puede ser peligroso. Mejor despeja el camino seguro.',
      },
    ],
  },
  {
    id: 4,
    title: 'Claxon inesperado',
    scenario:
      'Un auto detrás de ti toca la bocina varias veces. ¿Qué debes hacer?',
    options: [
      {
        text: 'Mantenerme en la ciclovía y no perder la calma.',
        isCorrect: true,
        feedback:
          'Exacto. Mantén tu carril, respira y no te salgas al tráfico vehicular innecesariamente.',
      },
      {
        text: 'Asustarme, frenar de golpe y salirme a la mitad de la calle.',
        isCorrect: false,
        feedback: 'Podrías causar un accidente. Mantén tu posición con seguridad.',
      },
      {
        text: 'Pegarle a la puerta del auto para que se aleje.',
        isCorrect: false,
        feedback: 'Nunca respondas con violencia. Mantén la calma y sigue tu camino con precaución.',
      },
    ],
  },
  {
    id: 5,
    title: 'Rotonda final',
    scenario:
      'Llegas a una rotonda. ¿Cuál es la forma correcta de cruzarla en bicicleta?',
    options: [
      {
        text: 'Entrada con señalización, cediendo el paso a quienes ya están dentro.',
        isCorrect: true,
        feedback: 'Excelente. Ceder el paso y señalizar tus movimientos es la manera segura de cruzar.',
      },
      {
        text: 'Cruzar en diagonal a toda velocidad para terminar rápido.',
        isCorrect: false,
        feedback: 'Podrías ser atropellado. Mejor hazlo siguiendo el sentido de la rotonda.',
      },
      {
        text: 'Ir por la acera a toda velocidad porque es más corto.',
        isCorrect: false,
        feedback: 'La acera es para peatones. Permanece en la vía adecuada y sigue las reglas.',
      },
    ],
  },
];

export default function BicycleScreen() {
  const router = useRouter();
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'gameOver'>('playing');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentObstacle = OBSTACLES[currentObstacleIndex];

  const progress = useMemo(() => {
    if (gameState === 'completed') {
      return 100;
    }

    return (currentObstacleIndex / OBSTACLES.length) * 100;
  }, [currentObstacleIndex, gameState]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    setFeedbackStatus('neutral');
  }, [currentObstacleIndex]);

  const handleAnswer = (option: Option) => {
    if (gameState !== 'playing') return;

    setSelectedOption(option.text);

    if (option.isCorrect) {
      setFeedback(option.feedback);
      setFeedbackStatus('success');

      const nextIndex = currentObstacleIndex + 1;
      if (nextIndex >= OBSTACLES.length) {
        setGameState('completed');
      } else {
        setCurrentObstacleIndex(nextIndex);
      }
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setFeedback(option.feedback);
      setFeedbackStatus('error');

      if (nextMistakes >= MAX_MISTAKES) {
        setGameState('gameOver');
      }
    }
  };

  const resetGame = () => {
    setCurrentObstacleIndex(0);
    setMistakes(0);
    setFeedback(null);
    setFeedbackStatus('neutral');
    setSelectedOption(null);
    setGameState('playing');
  };

  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🚴 Recorrer en Bicicleta</Text>
        <Text style={styles.subtitle}>Supera los obstáculos respondiendo correctamente. ¡No falles más de tres veces!</Text>

        <View style={styles.statusRow}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentObstacleIndex}/{OBSTACLES.length} obstáculos</Text>
          </View>

          <View style={styles.mistakesWrapper}>
            <Text style={styles.mistakesLabel}>Errores</Text>
            <View style={styles.mistakesHearts}>
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <Text key={i} style={[styles.heart, mistakes > i ? styles.heartUsed : undefined]}>
                  ❤
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.roadWrapper}>
          <View style={styles.sidewalk}>
            <Text style={styles.sidewalkLabel}>Acera</Text>
          </View>
          <View style={styles.road}>
            {OBSTACLES.map((obstacle, idx) => {
              const reached = idx <= currentObstacleIndex;
              const isCurrent = idx === currentObstacleIndex;
              return (
                <View key={obstacle.id} style={styles.roadSegment}>
                  {isCurrent && <Text style={styles.bicycleIcon}>🚴</Text>}
                  <View
                    style={[
                      styles.obstacleMarker,
                      reached && styles.obstacleMarkerReached,
                      isCurrent && styles.obstacleMarkerCurrent,
                    ]}
                  >
                    <Text style={styles.obstacleMarkerText}>{idx + 1}</Text>
                  </View>
                  {idx < OBSTACLES.length - 1 && <View style={styles.roadLine} />}
                </View>
              );
            })}
          </View>
        </View>

        {gameState === 'playing' && (
          <View style={styles.card}>
            <Text style={styles.obstacleTitle}>{currentObstacle.title}</Text>
            <Text style={styles.obstacleScenario}>{currentObstacle.scenario}</Text>

            <View style={styles.optionsContainer}>
              {currentObstacle.options.map((option) => {
                const isSelected = selectedOption === option.text;
                return (
                  <TouchableOpacity
                    key={option.text}
                    style={[
                      styles.optionButton,
                      isSelected && feedbackStatus === 'success' && styles.optionCorrect,
                      isSelected && feedbackStatus === 'error' && styles.optionIncorrect,
                    ]}
                    onPress={() => handleAnswer(option)}
                    disabled={gameState !== 'playing'}
                  >
                    <Text style={styles.optionText}>{option.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {feedback && (
              <View
                style={[
                  styles.feedbackContainer,
                  feedbackStatus === 'success' ? styles.feedbackSuccess : styles.feedbackError,
                ]}
              >
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            )}
          </View>
        )}

        {gameState === 'completed' && (
          <View style={styles.cardSuccess}>
            <Text style={styles.cardTitle}>🎉 ¡Meta alcanzada!</Text>
            <Text style={styles.cardParagraph}>Superaste los 5 obstáculos respetando las normas de tránsito. ¡Buen trabajo ciclista!</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
              <Text style={styles.primaryButtonText}>Jugar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/minigames/level1' as Href)}>
              <Text style={styles.secondaryButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'gameOver' && (
          <View style={styles.cardError}>
            <Text style={styles.cardTitle}>😢 Juego terminado</Text>
            <Text style={styles.cardParagraph}>Acumulaste 3 errores. Puedes volver a intentarlo y mejorar tu recorrido.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
              <Text style={styles.primaryButtonText}>Intentar nuevamente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/minigames/level1' as Href)}>
              <Text style={styles.secondaryButtonText}>Salir</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.white, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.white, marginTop: 8, marginBottom: 24 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 },
  progressBarWrapper: { flex: 1 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.buttonSuccess, borderRadius: 999 },
  progressText: { marginTop: 6, color: colors.white, fontSize: 12, textAlign: 'right' },
  mistakesWrapper: { alignItems: 'flex-end' },
  mistakesLabel: { color: colors.white, fontWeight: '600', marginBottom: 4 },
  mistakesHearts: { flexDirection: 'row', gap: 4 },
  heart: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  heartUsed: { color: colors.error },
  roadWrapper: { marginBottom: 24, gap: 8 },
  road: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roadSegment: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sidewalk: {
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  sidewalkLabel: { color: colors.white, fontWeight: '600', fontSize: 12, letterSpacing: 1 },
  obstacleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  obstacleMarkerReached: { backgroundColor: 'rgba(99, 102, 241, 0.8)', borderColor: colors.white },
  obstacleMarkerCurrent: { transform: [{ scale: 1.1 }], borderColor: colors.buttonWarning },
  obstacleMarkerText: { color: colors.white, fontWeight: 'bold' },
  roadLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  bicycleIcon: { position: 'absolute', top: -28, fontSize: 22 },
  card: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20, gap: 12 },
  cardSuccess: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderRadius: 20, padding: 24, gap: 16, marginTop: 16 },
  cardError: { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderRadius: 20, padding: 24, gap: 16, marginTop: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center' },
  cardParagraph: { color: colors.white, textAlign: 'center' },
  obstacleTitle: { fontSize: 20, fontWeight: '700', color: colors.primary },
  obstacleScenario: { color: colors.textPrimary },
  optionsContainer: { gap: 12, marginTop: 8 },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  optionText: { color: colors.textPrimary, fontWeight: '600' },
  optionCorrect: { borderColor: colors.buttonSuccess, backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  optionIncorrect: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  feedbackContainer: { padding: 12, borderRadius: 16 },
  feedbackSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.25)' },
  feedbackError: { backgroundColor: 'rgba(239, 68, 68, 0.25)' },
  feedbackText: { color: colors.textPrimary, fontWeight: '600' },
  primaryButton: {
    backgroundColor: colors.buttonSuccess,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.white, fontWeight: 'bold' },
  secondaryButton: {
    borderColor: colors.white,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.white, fontWeight: '600' },
});
