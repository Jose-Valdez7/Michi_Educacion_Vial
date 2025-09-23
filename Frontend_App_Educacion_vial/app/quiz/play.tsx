import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/utils/colors';
import { useRouter, type Href } from 'expo-router';
import { awardQuizLevel1Completion } from '../../src/services/progress2';

const { width } = Dimensions.get('window');

 type Q = { q: string; options: string[]; answer: number };

const QUESTIONS: Q[] = [
  {
    q: '¿Por dónde debe cruzar un peatón de forma segura?',
    options: ['Por cualquier parte', 'Por el paso cebra', 'Corriendo entre los autos'],
    answer: 1,
  },
  {
    q: '¿Qué debes hacer con la luz roja del semáforo?',
    options: ['Acelerar', 'Detenerse', 'Tocar la bocina'],
    answer: 1,
  },
  {
    q: 'Al ir en bicicleta, ¿qué es obligatorio?',
    options: ['Casco', 'Ir por la izquierda', 'Ir por la vereda'],
    answer: 0,
  },
];

export default function QuizPlay() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const current = useMemo(() => QUESTIONS[index], [index]);

  const handleOptionSelect = (i: number) => {
    if (showFeedback) return;
    
    const correct = i === current.answer;
    setSelectedOption(i);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(s => s + 1);
    }
    
    // Show feedback for 1.5 seconds before moving to next question
    setTimeout(() => {
      if (index + 1 < QUESTIONS.length) {
        setIndex(index + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        const points = correct ? 10 : 8;
        awardQuizLevel1Completion(points)
          .then(() => {
            Alert.alert(
              '¡Quiz Finalizado!',
              `Puntuación: ${score + (correct ? 1 : 0)} de ${QUESTIONS.length}`,
              [
                {
                  text: 'Volver',
                  onPress: () => router.replace('/minigames/level1' as Href),
                },
              ]
            );
          });
      }
    }, 1500);
  };

  // Calculate progress percentage
  const progress = ((index) / QUESTIONS.length) * 100;

  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      {/* Back Button - Top Left */}
      <TouchableOpacity 
        onPress={() => router.push('/quiz/learning' as Href)} 
        style={styles.backBtn} 
        activeOpacity={0.85}
      >
        <LinearGradient colors={colors.gradientSecondary} style={styles.backGradient}>
          <Text style={styles.backText}>← Volver</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          Pregunta {index + 1} de {QUESTIONS.length}
        </Text>
      </View>

      {/* Question Card */}
      <View style={styles.card}>
        <Text style={styles.question}>{current.q}</Text>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {current.options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isAnswer = i === current.answer;
            let optionStyle = styles.option;
            
            if (showFeedback) {
              if (isAnswer) {
                optionStyle = {...styles.option, ...styles.correctOption};
              } else if (isSelected && !isCorrect) {
                optionStyle = {...styles.option, ...styles.incorrectOption};
              }
            }
            
            return (
              <TouchableOpacity
                key={i}
                style={[
                  optionStyle,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(i)}
                disabled={showFeedback}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.optionText,
                  (showFeedback && isAnswer) && styles.correctText,
                  (isSelected && !isCorrect && showFeedback) && styles.incorrectText
                ]}>
                  {option}
                </Text>
                {showFeedback && isAnswer && (
                  <Text style={styles.feedbackIcon}>✓</Text>
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <Text style={styles.feedbackIcon}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>Puntuación: {score}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 80, // More padding at the top for the back button
  },
  // Back button styles
  backBtn: { 
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
    width: 110,
  },
  backGradient: { 
    paddingVertical: 8, 
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  backText: { 
    color: colors.white, 
    fontWeight: '700',
    fontSize: 14,
  },
  // Progress Bar
  progressBarContainer: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginBottom: 24,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: colors.white,
    fontWeight: '600',
    lineHeight: 24,
  },
  // Question Card
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: colors.shadowDark as any, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 8, 
    elevation: 6,
    marginBottom: 20,
  },
  question: { 
    fontSize: width < 400 ? 18 : 20, 
    marginBottom: 24, 
    color: colors.white, 
    fontWeight: '600',
    lineHeight: 28,
  },
  // Options
  optionsContainer: {
    marginTop: 8,
  },
  option: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: { 
    fontSize: 16, 
    color: colors.white, 
    flex: 1,
    marginRight: 8,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  correctOption: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    borderColor: colors.success,
  },
  incorrectOption: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderColor: colors.error || '#dc3545',
  },
  correctText: {
    color: colors.success || '#28a745',
    fontWeight: '600',
  },
  incorrectText: {
    color: colors.error || '#dc3545',
    textDecorationLine: 'line-through',
  },
  feedbackIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Score
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  score: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colors.white,
  },
});
