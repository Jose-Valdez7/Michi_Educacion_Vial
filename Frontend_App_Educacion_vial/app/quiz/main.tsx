import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/utils/colors';
import { useRouter, type Href } from 'expo-router';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function QuizMain() {
  const router = useRouter();
  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      {/* Back Button - Top Left */}
      <TouchableOpacity 
        onPress={() => router.push('/minigames/level1' as Href)} 
        style={styles.backBtn} 
        activeOpacity={0.85}
      >
        <LinearGradient colors={colors.gradientSecondary} style={styles.backGradient}>
          <Text style={styles.backText}>← Volver</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.header}> 
        <Image 
          source={require('../../assets/images/quizVial.png')} 
          style={styles.image} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>🧠 Quiz Vial - Nivel 1</Text>
        
        {/* Content Card */}
        <View style={styles.contentCard}>
          <LinearGradient 
            colors={['rgba(100, 170, 220, 0.9)', 'rgba(70, 140, 190, 0.95)']} 
            style={styles.cardGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <Text style={styles.cardTitle}>Vamos a poner a prueba tus conocimientos</Text>
            <View style={styles.divider} />
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Demuestra tus conocimientos sobre educación vial y señales de tránsito. Elije tu modo de juego y comienza a aprender</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/quiz/learning' as Href)}>
        <LinearGradient colors={colors.gradientSecondary} style={styles.btnGradient}>
          <Text style={styles.btnText}>📘 Aprender</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/quiz/play' as Href)}>
        <LinearGradient colors={colors.gradientSuccess} style={styles.btnGradient}>
          <Text style={styles.btnText}>▶️ Empezar Quiz</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, { marginBottom: 24 }]} 
        onPress={() => router.push('/quiz/competition' as Href)}
      >
        <LinearGradient 
          colors={['#FF6B6B', '#FF8E53']} 
          style={styles.btnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.btnText}>🏆 Competencia en Vivo</Text>
        </LinearGradient>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    paddingTop: 50, // More padding at the top for the back button
    alignItems: 'center',
  },
  // Back button styles
  backBtn: { 
    position: 'absolute',
    top: 40,
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
  // Header content
  header: { 
    alignItems: 'center', 
    marginBottom: 24,
    marginTop: 12,
    width: '100%',
  },
  image: { 
    width: width < 400 ? 140 : 160, 
    height: width < 400 ? 100 : 120, 
    marginBottom: 16,
  },
  title: { 
    fontSize: width < 400 ? 22 : 24, 
    fontWeight: 'bold', 
    color: colors.white, 
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: { 
    textAlign: 'center', 
    color: colors.white, 
    opacity: 0.9,
    fontSize: width < 400 ? 14 : 15,
    paddingHorizontal: 20,
  },
  // Content Card Styles
  contentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 500, // Ancho máximo para pantallas grandes
    marginTop: 8,
    shadowColor: colors.shadowDark as any,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 14,
    width: '35%',
    alignSelf: 'center',
    borderRadius: 2,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardText: {
    textAlign: 'center',
    color: '#ffffff',
    opacity: 0.95,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  // Buttons
  btn: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginTop: 16,
    shadowColor: colors.shadowDark as any, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4.65, 
    elevation: 8,
    width: '100%',
    maxWidth: 500, // Mismo ancho máximo que la tarjeta
  },
  btnGradient: { 
    paddingVertical: 16, 
    alignItems: 'center',
    width: '100%',
  },
  btnText: { 
    color: colors.white, 
    fontWeight: '700',
    fontSize: 16,
  },
});
