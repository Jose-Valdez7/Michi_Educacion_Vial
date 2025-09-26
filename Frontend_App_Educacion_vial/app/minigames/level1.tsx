import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/utils/colors';
import { useRouter, type Href, useFocusEffect } from 'expo-router';
import { ProgressApi } from '@/services/progress';
import { ImagesApi } from '@/services/images';
import { QuizProgressService } from '@/services/quizProgress';
import { BicycleProgressService } from '@/services/bicycleProgress';

const { width } = Dimensions.get('window');

export default function MinigamesLevel1() {
  const router = useRouter();
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({
    coloring: false,
    quiz: false,
    bicycle: false
  });

  const loadProgress = useCallback(async () => {
    try {
      const [progress, images, quizProgress, bicycleCompleted] = await Promise.all([
        ProgressApi.get(),
        ImagesApi.list(),
        QuizProgressService.getProgress(),
        BicycleProgressService.isCompleted()
      ]);
      const list: string[] = Array.isArray(progress.completedGames) ? progress.completedGames : [];

      const hasCat = images.some((image) => image.data?.baseImage === 'cat');
      const hasPatrol = images.some((image) => image.data?.baseImage === 'patrol');
      const hasSemaforo = images.some((image) => image.data?.baseImage === 'semaforo');

      const coloringCompleted = (hasCat && hasPatrol && hasSemaforo) || list.includes('1_coloring') || list.includes('1_6');
      const quizCompleted =
        quizProgress.hard?.completed === true ||
        quizProgress.level1Completed === true ||
        list.includes('1_quiz_vial') ||
        list.includes('1_1');

      setCompletedActivities({
        coloring: coloringCompleted,
        quiz: quizCompleted,
        bicycle: bicycleCompleted || list.includes('1_bicycle') || list.includes('1_2')
      });
    } catch (e) {
      // Error loading completed activities
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      <Text style={styles.title}>Nivel 1 </Text>
      <Text style={styles.title}>Minijuegos</Text>
      <Text style={styles.subtitle}>Elige una actividad para continuar y diviertete aprendiendo</Text>

      {/* Sistema de estrellas del nivel */}
      <StarsRow completed={completedActivities} />

      <View style={{ height: 12 }} />

      <TouchableOpacity style={styles.card} onPress={() => router.push('/images' as Href)}>
        <LinearGradient colors={colors.gradientWarning} style={styles.cardGradient}>
          <Image 
            source={require('../../assets/images/pintor.png')} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
          <Text style={styles.cardTitle}>Colorear divertidamente</Text>
          <Text style={styles.cardDesc}>Colorea y aprende</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/quiz/main' as Href)}>
        <LinearGradient colors={colors.gradientSuccess} style={styles.cardGradient}>
          <Image 
            source={require('../../assets/images/quizVial.png')} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
          <Text style={styles.cardTitle}>Quiz Vial</Text>
          <Text style={styles.cardDesc}>Pon a prueba tus conocimientos</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/bicycle-game' as Href)}>
        <LinearGradient colors={colors.gradientAccent} style={styles.cardGradient}>
          <Image 
            source={require('../../assets/images/bici.png')} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
          <Text style={styles.cardTitle}>Aventura en Bicicleta</Text>
          <Text style={styles.cardDesc}>Evita obstáculos y responde preguntas</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/welcome' as Href)} style={styles.backBtn} activeOpacity={0.85}>
        <LinearGradient colors={colors.gradientSecondary} style={styles.backGradient}>
          <Text style={styles.backText}>← Volver a Niveles</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.white, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.white, opacity: 0.9, marginTop: 4, fontSize: width < 400 ? 14 : 16 },
  // Cards
  card: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginTop: 12, 
    shadowColor: colors.shadowDark as any, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4.65, 
    elevation: 8 
  },
  cardGradient: { 
    paddingVertical: 20, 
    alignItems: 'center',
    paddingHorizontal: 16
  },
  cardImage: { 
    width: width < 400 ? 80 : 100, 
    height: width < 400 ? 80 : 100, 
    marginBottom: 8 
  },
  cardTitle: { 
    color: colors.white, 
    fontWeight: 'bold', 
    fontSize: 18, 
    textAlign: 'center',
    marginTop: 8
  },
  cardDesc: { 
    color: colors.white, 
    opacity: 0.9, 
    marginTop: 4, 
    textAlign: 'center',
    fontSize: 14
  },
  // Back button
  backBtn: { 
    marginTop: 20, 
    borderRadius: 16, 
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 200
  },
  backGradient: { 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  backText: { 
    color: colors.white, 
    fontWeight: '700',
    fontSize: 16
  },
});

// ✅ Componente de estrellas para mostrar progreso del nivel 1
function StarsRow({ completed }: { completed: Record<string, boolean> }) {
  const count = (completed.coloring ? 1 : 0) + (completed.quiz ? 1 : 0) + (completed.bicycle ? 1 : 0);
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 8, marginVertical: 8 }}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: 24 }}>{i <= count ? '⭐' : '☆'}</Text>
      ))}
    </View>
  );
}
