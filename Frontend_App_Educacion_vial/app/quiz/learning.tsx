import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/utils/colors';
import { useRouter, type Href } from 'expo-router';

const { width } = Dimensions.get('window');

export default function QuizLearning() {
  const router = useRouter();
  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      {/* Back Button - Top Left */}
      <TouchableOpacity 
        onPress={() => router.push('/quiz/main' as Href)} 
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
        <Text style={styles.title}>Aprende antes del Quiz</Text>
        <Text style={styles.subtitle}>Repasa estas ideas clave de educación vial.</Text>
      </View>
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.item}>• Cruza por el paso cebra, mirando a ambos lados.</Text>
          <Text style={styles.item}>• Respeta el semáforo: rojo detenerse, verde avanzar, amarillo precaución.</Text>
          <Text style={styles.item}>• Usa casco al ir en bicicleta y circula por la derecha.</Text>
          <Text style={styles.item}>• No juegues en la vía y usa siempre aceras.</Text>
          <Text style={styles.item}>• Señales de tránsito guían y protegen a peatones y conductores.</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => router.push('/quiz/play' as Href)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={colors.gradientSuccess} style={styles.btnGradient}>
          <Text style={styles.btnText}>¡Listo! Empezar Quiz</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60, // More padding at the top for the back button
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
  // Header content
  header: { 
    alignItems: 'center', 
    marginBottom: 24,
    marginTop: 12,
  },
  image: { 
    width: width < 400 ? 140 : 160, 
    height: width < 400 ? 100 : 120, 
    marginBottom: 12 
  },
  title: { 
    fontSize: width < 400 ? 22 : 24, 
    fontWeight: 'bold', 
    color: colors.white, 
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: { 
    textAlign: 'center', 
    color: colors.white, 
    opacity: 0.9,
    fontSize: width < 400 ? 14 : 15,
    paddingHorizontal: 20,
  },
  // Scroll content
  scrollContent: { 
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  item: { 
    fontSize: 16, 
    color: colors.white, 
    marginBottom: 12,
    lineHeight: 24,
  },
  // Buttons
  btn: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginTop: 16,
    marginBottom: 8,
    shadowColor: colors.shadowDark as any, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4.65, 
    elevation: 8,
    marginHorizontal: 20,
  },
  btnGradient: { 
    paddingVertical: 16, 
    alignItems: 'center' 
  },
  btnText: { 
    color: colors.white, 
    fontWeight: '700',
    fontSize: 16,
  },
});
