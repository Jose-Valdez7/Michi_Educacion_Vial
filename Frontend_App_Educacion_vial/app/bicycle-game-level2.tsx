import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { ProgressApi } from 'src/services/progress';
import { BicycleProgressService } from 'src/services/bicycleProgress';
import { awardBicycleLevel2Completion } from 'src/services/progress2';
import { colors } from 'src/utils/colors';

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type Question = {
  id: number;
  title: string;
  scenario: string;
  options: Option[];
};

type MovingObstacle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'car' | 'truck' | 'stone' | 'animal' | 'bicycle' | 'bus';
  emoji: string;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PLAYER_SIZE = 48;
const ROAD_HEIGHT = SCREEN_HEIGHT * 0.7;

// Preguntas más avanzadas para nivel 2
const QUESTIONS_LEVEL2: Question[] = [
  {
    id: 1,
    title: '¿Qué significa la señal de "PROHIBIDO ADELANTAR"?',
    scenario: 'Ves una señal con dos autos uno detrás del otro en rojo.',
    options: [
      { id: 'a', text: 'Puedes adelantar con cuidado', isCorrect: false, feedback: 'No, esta señal indica que está prohibido adelantar.' },
      { id: 'b', text: 'No puedes adelantar vehículos', isCorrect: true, feedback: '¡Correcto! Esta señal prohíbe adelantar a otros vehículos.' },
      { id: 'c', text: 'Solo puedes adelantar bicicletas', isCorrect: false, feedback: 'No, prohíbe adelantar cualquier vehículo.' },
      { id: 'd', text: 'Significa que hay obras adelante', isCorrect: false, feedback: 'No, esta señal específicamente prohíbe adelantar.' },
    ],
  },
  {
    id: 2,
    title: '¿Cuál es la velocidad máxima en zona urbana?',
    scenario: 'Conduces por una calle de la ciudad con edificios alrededor.',
    options: [
      { id: 'a', text: '30 km/h', isCorrect: false, feedback: 'No, en zona urbana el límite es más alto.' },
      { id: 'b', text: '50 km/h', isCorrect: true, feedback: '¡Correcto! La velocidad máxima en zona urbana es 50 km/h.' },
      { id: 'c', text: '70 km/h', isCorrect: false, feedback: 'No, esa velocidad es para vías rápidas.' },
      { id: 'd', text: 'No hay límite', isCorrect: false, feedback: 'Siempre hay límites de velocidad establecidos.' },
    ],
  },
  {
    id: 3,
    title: '¿Qué debes hacer en una rotonda?',
    scenario: 'Te acercas a una intersección circular con varios autos circulando.',
    options: [
      { id: 'a', text: 'Detenerte completamente', isCorrect: false, feedback: 'No es necesario detenerte si puedes incorporarte.' },
      { id: 'b', text: 'Ceder el paso a quienes ya circulan', isCorrect: true, feedback: '¡Correcto! En una rotonda debes ceder el paso a los vehículos que ya están circulando.' },
      { id: 'c', text: 'Tocar el claxon para entrar', isCorrect: false, feedback: 'No, debes ceder el paso respetuosamente.' },
      { id: 'd', text: 'Acelerar para entrar primero', isCorrect: false, feedback: 'Eso sería peligroso y va contra las normas.' },
    ],
  },
  {
    id: 4,
    title: '¿Qué significa la línea amarilla continua?',
    scenario: 'Ves una línea amarilla sólida en el centro del camino.',
    options: [
      { id: 'a', text: 'Carril de alta velocidad', isCorrect: false, feedback: 'No, indica prohibición de adelantar.' },
      { id: 'b', text: 'Prohibido cruzar o adelantar', isCorrect: true, feedback: '¡Correcto! La línea continua prohíbe cruzar y adelantar.' },
      { id: 'c', text: 'Solo para bicicletas', isCorrect: false, feedback: 'No, aplica a todos los vehículos.' },
      { id: 'd', text: 'Zona de estacionamiento', isCorrect: false, feedback: 'No, indica prohibición de maniobras.' },
    ],
  },
  {
    id: 5,
    title: '¿Qué hacer si ves una ambulancia con sirena?',
    scenario: 'Escuchas la sirena de una ambulancia acercándose por detrás.',
    options: [
      { id: 'a', text: 'Seguir a velocidad normal', isCorrect: false, feedback: 'No, debes facilitar su paso.' },
      { id: 'b', text: 'Detenerte inmediatamente', isCorrect: false, feedback: 'No necesariamente, solo facilitar su paso.' },
      { id: 'c', text: 'Detenerte a un lado del camino', isCorrect: true, feedback: '¡Correcto! Debes detenerte a un lado para dejar pasar vehículos de emergencia.' },
      { id: 'd', text: 'Acelerar para salir del camino', isCorrect: false, feedback: 'No, debes detenerte de forma segura.' },
    ],
  },
];

export default function BicycleGameLevel2() {
  const router = useRouter();

  // Estados del juego
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'question' | 'gameOver' | 'victory'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [obstacles, setObstacles] = useState<MovingObstacle[]>([]);
  const [gameSpeed, setGameSpeed] = useState(2);

  // Refs para animaciones
  const playerX = useRef(new Animated.Value(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2)).current;
  const currentPlayerX = useRef(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
  const roadOffset = useRef(new Animated.Value(0)).current;

  // Configuración del jugador
  const playerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (gameState !== 'playing') return;

        const newX = Math.max(0, Math.min(SCREEN_WIDTH - PLAYER_SIZE, gestureState.x0 + gestureState.dx));
        playerX.setValue(newX);
        currentPlayerX.current = newX;
      },
      onPanResponderRelease: () => {
        // El jugador se mueve automáticamente cuando se suelta
      },
    })
  ).current;

  // Función para generar obstáculos más difíciles (nivel 2)
  const generateObstacle = useCallback((): MovingObstacle => {
    const types: Array<MovingObstacle['type']> = ['car', 'truck', 'bus', 'bicycle', 'stone', 'animal'];
    const type = types[Math.floor(Math.random() * types.length)];

    const emojis = {
      car: '🚗',
      truck: '🚛',
      bus: '🚌',
      bicycle: '🚲',
      stone: '🪨',
      animal: '🐕'
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (SCREEN_WIDTH - 60),
      y: -100,
      width: 60,
      height: 60,
      speed: gameSpeed + Math.random() * 2, // Más velocidad para nivel 2
      type,
      emoji: emojis[type],
    };
  }, [gameSpeed]);

  // Efecto para animar la carretera
  useEffect(() => {
    if (gameState !== 'playing') return;

    const roadAnimation = Animated.loop(
      Animated.timing(roadOffset, {
        toValue: -100,
        duration: 2000 / gameSpeed,
        useNativeDriver: true,
      })
    );
    roadAnimation.start();

    return () => {
      roadAnimation.stop();
    };
  }, [gameState, gameSpeed, roadOffset]);

  // Efecto para generar obstáculos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const obstacleInterval = setInterval(() => {
      setObstacles(prev => [...prev, generateObstacle()]);
    }, 1500 - (gameSpeed * 100)); // Más obstáculos en nivel 2

    return () => clearInterval(obstacleInterval);
  }, [gameState, generateObstacle, gameSpeed]);

  // Efecto para mover obstáculos y detectar colisiones
  useEffect(() => {
    if (gameState !== 'playing' || obstacles.length === 0) return;

    const moveInterval = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev
          .map(obstacle => ({
            ...obstacle,
            y: obstacle.y + obstacle.speed,
          }))
          .filter(obstacle => obstacle.y < SCREEN_HEIGHT);

        // Detectar colisiones
        const playerCurrentX = currentPlayerX.current;
        const collision = newObstacles.some(obstacle => {
          return (
            obstacle.y + obstacle.height > ROAD_HEIGHT &&
            obstacle.y < ROAD_HEIGHT + PLAYER_SIZE &&
            obstacle.x < playerCurrentX + PLAYER_SIZE &&
            obstacle.x + obstacle.width > playerCurrentX
          );
        });

        if (collision) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
            }
            return newLives;
          });
          return newObstacles.filter(obstacle => {
            // Remover el obstáculo que causó la colisión
            return !(
              obstacle.y + obstacle.height > ROAD_HEIGHT &&
              obstacle.y < ROAD_HEIGHT + PLAYER_SIZE &&
              obstacle.x < playerCurrentX + PLAYER_SIZE &&
              obstacle.x + obstacle.width > playerCurrentX
            );
          });
        }

        return newObstacles;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameState, obstacles.length, playerX]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setObstacles([]);
    setGameSpeed(2);

    // Posicionar al jugador en el centro
    playerX.setValue(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
  };

  const showRandomQuestion = () => {
    if (gameState !== 'playing') return;

    const randomQuestion = QUESTIONS_LEVEL2[Math.floor(Math.random() * QUESTIONS_LEVEL2.length)];
    setCurrentQuestion(randomQuestion);
    setGameState('question');
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedAnswer(optionId);
    setShowFeedback(true);

    setTimeout(() => {
      const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
      if (selectedOption?.isCorrect) {
        setScore(prev => prev + 10);
        setGameSpeed(prev => Math.min(prev + 0.5, 4)); // Aumentar velocidad gradualmente
      } else {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
          }
          return newLives;
        });
      }

      setGameState('playing');
      setCurrentQuestion(null);
    }, 2000);
  };

  const endGame = async () => {
    setGameState('gameOver');

    // Guardar progreso si completó el nivel
    if (score >= 50) {
      try {
        await BicycleProgressService.syncWithServer();
        await awardBicycleLevel2Completion();
      } catch (error) {
        console.error('Error saving bicycle level 2 progress:', error);
      }
    }
  };

  // Mostrar pregunta cada 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const questionInterval = setInterval(showRandomQuestion, 15000);
    return () => clearInterval(questionInterval);
  }, [gameState]);

  // Reiniciar juego
  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setLives(3);
    setObstacles([]);
    setGameSpeed(2);
    playerX.setValue(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
  };

  if (gameState === 'menu') {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        <View style={styles.menuContainer}>
          <Text style={styles.title}>🚲 Aventura en Bicicleta - Nivel 2</Text>
          <Text style={styles.subtitle}>¡Desafíos más avanzados te esperan!</Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>🚲 Instrucciones Nivel 2:</Text>
            <Text style={styles.instruction}>• Evita obstáculos más rápidos y complejos</Text>
            <Text style={styles.instruction}>• Responde preguntas avanzadas de educación vial</Text>
            <Text style={styles.instruction}>• Preguntas aparecen cada 15 segundos</Text>
            <Text style={styles.instruction}>• ¡Mayor velocidad = más puntos!</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <LinearGradient colors={colors.gradientSuccess} style={styles.startButtonGradient}>
              <Text style={styles.startButtonText}>▶️ Comenzar Aventura Nivel 2</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/minigames/level2' as Href)}>
            <Text style={styles.backButtonText}>← Volver al Nivel 2</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (gameState === 'question' && currentQuestion) {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        <View style={styles.questionContainer}>
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
            <Text style={styles.questionScenario}>{currentQuestion.scenario}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    selectedAnswer === option.id && styles.selectedOption,
                    showFeedback && option.isCorrect && styles.correctOption,
                    showFeedback && selectedAnswer === option.id && !option.isCorrect && styles.incorrectOption,
                  ]}
                  onPress={() => handleAnswer(option.id)}
                  disabled={showFeedback}
                >
                  <Text style={[
                    styles.optionText,
                    showFeedback && option.isCorrect && styles.correctText,
                    showFeedback && selectedAnswer === option.id && !option.isCorrect && styles.incorrectText,
                  ]}>
                    {option.text}
                  </Text>
                  {showFeedback && selectedAnswer === option.id && (
                    <Text style={styles.feedbackIcon}>
                      {option.isCorrect ? '✓' : '✗'}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>
                  {currentQuestion.options.find(opt => opt.id === selectedAnswer)?.feedback}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.gameContainer}>
      {/* Carretera animada */}
      <Animated.View
        style={[
          styles.road,
          {
            transform: [{ translateY: roadOffset }],
          },
        ]}
      >
        <View style={styles.roadLines}>
          {[...Array(20)].map((_, i) => (
            <View key={i} style={[styles.roadLine, { top: i * 100 }]} />
          ))}
        </View>
      </Animated.View>

      {/* Obstáculos */}
      {obstacles.map((obstacle) => (
        <Animated.View
          key={obstacle.id}
          style={[
            styles.obstacle,
            {
              left: obstacle.x,
              top: obstacle.y,
              transform: [{ translateY: 0 }],
            },
          ]}
        >
          <Text style={styles.obstacleEmoji}>{obstacle.emoji}</Text>
        </Animated.View>
      ))}

      {/* Jugador */}
      <Animated.View
        style={[styles.player, { left: playerX }]}
        {...playerPanResponder.panHandlers}
      >
        <Text style={styles.playerEmoji}>🚲</Text>
      </Animated.View>

      {/* UI del juego */}
      <View style={styles.gameUI}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Puntuación</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Vidas</Text>
            <Text style={styles.statValue}>{'❤️'.repeat(lives)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Velocidad</Text>
            <Text style={styles.statValue}>{gameSpeed.toFixed(1)}x</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.endGameButton} onPress={endGame}>
          <Text style={styles.endGameText}>🏁 Finalizar</Text>
        </TouchableOpacity>
      </View>

      {/* Pantalla de Game Over */}
      {gameState === 'gameOver' && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {score >= 50 ? '🎉 ¡Nivel Completado!' : '💥 ¡Juego Terminado!'}
              </Text>
              <Text style={styles.modalScore}>Puntuación Final: {score}</Text>
              <Text style={styles.modalMessage}>
                {score >= 50
                  ? '¡Excelente! Has completado el nivel 2 de bicicleta.'
                  : 'Sigue practicando para mejorar tu puntuación.'}
              </Text>

              <TouchableOpacity style={styles.modalButton} onPress={resetGame}>
                <LinearGradient colors={colors.gradientSuccess} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonText}>🔄 Jugar de Nuevo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { marginTop: 10 }]}
                onPress={() => router.replace('/minigames/level2' as Href)}
              >
                <LinearGradient colors={colors.gradientSecondary} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonText}>← Volver al Nivel 2</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: colors.shadowDark as any,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  road: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ROAD_HEIGHT,
    backgroundColor: '#696969',
  },
  roadLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  roadLine: {
    position: 'absolute',
    left: '48%',
    width: 4,
    height: 50,
    backgroundColor: '#FFFF00',
    marginLeft: -2,
  },
  obstacle: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
  },
  obstacleEmoji: {
    fontSize: 40,
  },
  player: {
    position: 'absolute',
    top: ROAD_HEIGHT,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
  },
  playerEmoji: {
    fontSize: 32,
  },
  gameUI: {
    position: 'absolute',
    top: ROAD_HEIGHT + 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  endGameButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  endGameText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadowDark as any,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  questionScenario: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  correctOption: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    borderColor: colors.success,
  },
  incorrectOption: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderColor: colors.error || '#dc3545',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  correctText: {
    color: colors.success,
    fontWeight: '600',
  },
  incorrectText: {
    color: colors.error || '#dc3545',
    textDecorationLine: 'line-through',
  },
  feedbackIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.shadowDark as any,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 8,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
